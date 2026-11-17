
"""Phase 8: synthetic AFP form persistence against PostgreSQL afp_test.

Requires migration 0002_local_full_payload and the local API flag.
"""

from copy import deepcopy
from datetime import date, datetime, timedelta
from uuid import UUID
from zoneinfo import ZoneInfo

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete

from app.core.config import get_settings
from app.db.session import AsyncSessionLocal
from app.main import app
from app.models.afp import AFPInvestigation
from app.services import local_complete
from app.services.afp import (
    AFPIntegrationPending,
    AFPValidationFailure,
)
from app.utils.owned_response import to_owned_read
from tests.conftest import make_payload


pytestmark = pytest.mark.asyncio

BASE = "/api/v1/afp/investigations"
HEADERS = {"X-AFP-Local-Dev": "true"}


@pytest.fixture(autouse=True)
def test_database_only():
    settings = get_settings()

    assert settings.afp_db_name == "afp_test", (
        "Refusing writes outside afp_test"
    )
    assert settings.afp_local_api_enabled is True
    assert settings.afp_db_host in {
        "127.0.0.1", "localhost", "::1"
    }


@pytest_asyncio.fixture
async def saved_ids():
    ids: list[UUID] = []

    try:
        yield ids

    finally:
        if ids:
            async with AsyncSessionLocal() as session:
                async with session.begin():
                    await session.execute(
                        delete(AFPInvestigation).where(
                            AFPInvestigation.id.in_(ids)
                        )
                    )


def full_payload(today: date) -> dict:
    """Build a fully validated synthetic AFP frontend payload."""

    data = make_payload(today)

    fmt = lambda d: d.strftime("%d-%m-%Y")

    vac = data["vaccinationHistory"]

    vac["available"] = True

    vac["opvCampaignDoses"] = {
        "recordSource": "card",
        "numberOfDoses": 2,
    }

    vac["opvRoutineDoses"] = {
        "recordSource": "history",
        "numberOfDoses": 0,
    }

    vac["ipvDoses"] = {
        "recordSource": "card",
        "numberOfDoses": 1,
    }

    vac["lastOpvDoseBeforeParalysisDate"] = fmt(
        today - timedelta(days=8)
    )

    vac["lastIpvDoseBeforeParalysisDate"] = fmt(
        today - timedelta(days=9)
    )

    vac["opvGivenAfterParalysis"] = "yes"

    vac["opvAfterParalysisDate"] = fmt(
        today - timedelta(days=1)
    )

    travel = data["travelHistory"]

    travel["travelOutsideAreaLast30Days"] = True
    travel["notifiedToConcernedDsfpSimo"] = True
    travel["notificationDate"] = fmt(today)

    return data


async def test_all_eight_sections_roundtrip(saved_ids):
    today = date(2026, 11, 16)
    data = full_payload(today)

    async with AsyncSessionLocal() as session:
        record = await local_complete.create_local_full_afp(
            session,
            data,
            local_dev_mode=True,
            today=today,
        )

        saved_ids.append(record.id)

        assert record.examination is not None
        assert record.examination.upper_flex_wrist_right == 0
        assert len(record.contacts) == 1
        assert record.frontend_payload == data

        result = to_owned_read(record).model_dump(
            mode="json",
            by_alias=True,
        )

        assert result["data"] == data
        assert result["persistenceScope"] == "local_full_form"
        assert result["notPersistedSections"] == []

    async with AsyncSessionLocal() as session:
        record = await local_complete.get_local_full_afp(
            session,
            saved_ids[0],
            local_dev_mode=True,
        )

        assert record is not None

        assert (
            record.frontend_payload["travelHistory"]
            ["notificationDate"]
            == today.strftime("%d-%m-%Y")
        )


async def test_contact_reorder_and_snapshot_atomic(saved_ids):
    today = date(2026, 11, 16)
    data = full_payload(today)

    contacts = data["previousHealthcareContacts"]["contacts"]

    other = deepcopy(contacts[0])
    other["id"] = "phase8-contact-second"
    contacts.append(other)

    async with AsyncSessionLocal() as session:
        record = await local_complete.create_local_full_afp(
            session,
            data,
            local_dev_mode=True,
            today=today,
        )

        saved_ids.append(record.id)

        original = {
            row.client_id: row.id
            for row in record.contacts
        }

    contacts.reverse()

    data["vaccinationHistory"]["opvCampaignDoses"][
        "numberOfDoses"
    ] = 3

    async with AsyncSessionLocal() as session:
        record = await local_complete.update_local_full_afp(
            session,
            saved_ids[0],
            data,
            local_dev_mode=True,
            today=today,
        )

        assert record.frontend_payload == data

        assert [
            row.client_id for row in record.contacts
        ] == [
            row["id"] for row in contacts
        ]

        assert {
            row.client_id: row.id
            for row in record.contacts
        } == original


async def test_screened_out_snapshot_and_no_active_child_rows(
    saved_ids,
):
    today = date(2026, 11, 16)
    data = full_payload(today)

    data["clinicalInformation"]["paralysisPresent"] = "no"

    async with AsyncSessionLocal() as session:
        record = await local_complete.create_local_full_afp(
            session,
            data,
            local_dev_mode=True,
            today=today,
        )

        saved_ids.append(record.id)

        assert record.frontend_payload == data
        assert record.examination is None
        assert record.contacts == []
        assert record.site_of_paralysis == []

        response_data = to_owned_read(record).model_dump(
            mode="json",
            by_alias=True,
        )["data"]

        assert response_data == data


async def test_eligible_to_screened_out_transition(saved_ids):
    today = date(2026, 11, 16)
    data = full_payload(today)

    async with AsyncSessionLocal() as session:
        record = await local_complete.create_local_full_afp(
            session,
            data,
            local_dev_mode=True,
            today=today,
        )

        saved_ids.append(record.id)

    changed = deepcopy(data)
    changed["clinicalInformation"]["paralysisPresent"] = "no"

    async with AsyncSessionLocal() as session:
        record = await local_complete.update_local_full_afp(
            session,
            saved_ids[0],
            changed,
            local_dev_mode=True,
            today=today,
        )

        assert record.examination is None
        assert record.contacts == []
        assert record.frontend_payload == changed

    # Returning to eligible screening restores active relational rows.
    async with AsyncSessionLocal() as session:
        record = await local_complete.update_local_full_afp(
            session,
            saved_ids[0],
            data,
            local_dev_mode=True,
            today=today,
        )

        assert record.examination is not None
        assert len(record.contacts) == 1
        assert record.frontend_payload == data


async def test_validation_rejects_before_write():
    today = date(2026, 11, 16)
    data = full_payload(today)

    data["vaccinationHistory"]["opvCampaignDoses"][
        "numberOfDoses"
    ] = 11

    async with AsyncSessionLocal() as session:
        with pytest.raises(AFPValidationFailure) as failure:
            await local_complete.create_local_full_afp(
                session,
                data,
                local_dev_mode=True,
                today=today,
            )

    assert (
        "vaccinationHistory.opvCampaignDoses.numberOfDoses"
        in failure.value.errors
    )


async def test_http_post_get_put_complete_json_and_422(saved_ids):
    today = datetime.now(ZoneInfo("Asia/Dhaka")).date()
    data = full_payload(today)

    transport = ASGITransport(
        app=app,
        client=("127.0.0.1", 43210),
        raise_app_exceptions=False,
    )

    async with AsyncClient(
        transport=transport,
        base_url="http://127.0.0.1",
    ) as http:

        created = await http.post(
            BASE,
            json=data,
            headers=HEADERS,
        )

        assert created.status_code == 201, created.text

        uid = UUID(created.json()["id"])
        saved_ids.append(uid)

        assert created.json()["data"] == data

        fetched = await http.get(
            f"{BASE}/{uid}",
            headers=HEADERS,
        )

        assert fetched.status_code == 200
        assert fetched.json()["data"] == data

        changed = deepcopy(data)

        changed["vaccinationHistory"]["ipvDoses"][
            "numberOfDoses"
        ] = 2

        changed["travelHistory"][
            "notifiedToConcernedDsfpSimo"
        ] = False

        changed["travelHistory"]["notificationDate"] = ""

        updated = await http.put(
            f"{BASE}/{uid}",
            json=changed,
            headers=HEADERS,
        )

        assert updated.status_code == 200, updated.text
        assert updated.json()["data"] == changed

        # The notification date becomes required again.
        bad = deepcopy(changed)

        bad["travelHistory"][
            "notifiedToConcernedDsfpSimo"
        ] = True

        invalid = await http.put(
            f"{BASE}/{uid}",
            json=bad,
            headers=HEADERS,
        )

        assert invalid.status_code == 422

        assert (
            "travelHistory.notificationDate"
            in invalid.json()["errors"]
        )

        # The rejected update must not overwrite the saved record.
        after = await http.get(
            f"{BASE}/{uid}",
            headers=HEADERS,
        )

        assert after.json()["data"] == changed


async def test_legacy_without_snapshot_is_not_fabricated(
    saved_ids,
):
    # Earlier Phase 3 records remain in PostgreSQL but cannot be
    # represented as complete forms without their missing fields.

    async with AsyncSessionLocal() as session:
        async with session.begin():
            row = AFPInvestigation(
                site_of_paralysis=[],
            )

            session.add(row)
            await session.flush()

            saved_ids.append(row.id)

    async with AsyncSessionLocal() as session:
        with pytest.raises(AFPIntegrationPending):
            await local_complete.get_local_full_afp(
                session,
                saved_ids[-1],
                local_dev_mode=True,
            )
