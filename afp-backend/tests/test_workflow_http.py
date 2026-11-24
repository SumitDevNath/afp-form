
"""Revised AFP + independent ORI API tests.

Requires:
- PostgreSQL afp_test
- Alembic revision 0004_afp_workflow_ori
- Local development API enabled

Synthetic records only.
"""

from copy import deepcopy
from datetime import datetime, timedelta
from uuid import UUID, uuid4
from zoneinfo import ZoneInfo

import pytest
import pytest_asyncio

from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete

from app.core.config import get_settings
from app.db.session import AsyncSessionLocal
from app.main import app

from app.models.afp import (
    AFPClinicalExamination,
    AFPInvestigation,
    ORIRecord,
)

from tests.conftest import make_payload


pytestmark = pytest.mark.asyncio

HEADERS = {"X-AFP-Local-Dev": "true"}

AFP = "/api/v1/afp/investigations"
ORI = "/api/v1/ori/records"


@pytest.fixture(autouse=True)
def test_database_only():
    settings = get_settings()

    assert settings.afp_db_name == "afp_test"
    assert settings.afp_local_api_enabled is True

    assert settings.afp_db_host in {
        "127.0.0.1",
        "localhost",
        "::1",
    }


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(
        app=app,
        client=("127.0.0.1", 55110),
        raise_app_exceptions=False,
    )

    async with AsyncClient(
        transport=transport,
        base_url="http://127.0.0.1",
    ) as value:
        yield value


@pytest_asyncio.fixture
async def saved_ids():
    investigations: list[UUID] = []
    ori_records: list[UUID] = []

    try:
        yield investigations, ori_records

    finally:
        async with AsyncSessionLocal() as session:
            async with session.begin():
                if investigations:
                    await session.execute(
                        delete(AFPInvestigation).where(
                            AFPInvestigation.id.in_(investigations)
                        )
                    )

                if ori_records:
                    await session.execute(
                        delete(ORIRecord).where(
                            ORIRecord.id.in_(ori_records)
                        )
                    )


def investigation(days: int = 91) -> dict:
    today = datetime.now(
        ZoneInfo("Asia/Dhaka")
    ).date()

    data = make_payload(today)

    data["clinicalInformation"]["paralysisOnsetDate"] = (
        today - timedelta(days=days)
    ).strftime("%d-%m-%Y")

    history = data["previousHealthcareContacts"]

    history["contacts"] = [{
        "id": f"blank-{uuid4().hex}",
        "providerName": "",
        "address": "",
        "dateCaseVisited": "",
        "alreadyInNetwork": None,
        "reportedCase": None,
        "actionTakenPlanned": "",
    }]

    history["firstContactCategory"] = None
    history["suspectedDiagnosis"] = "Rare custom disease"

    data["signsSymptoms"]["childAtHealthFacility"] = "yes"

    return data


def ori_data() -> dict:
    return {
        "searchForAdditionalCases": "yes",
        "additionalCasesIdentified": "yes",
        "numberOfAdditionalCases": 0,
        "outbreakResponseImmunizationDone": "yes",
        "numberOfChildrenVaccinated": 0,
        "outbreakResponseExplanation": "",
    }


async def test_afp_full_roundtrip_optional_contacts_no_stool(
    client,
    saved_ids,
):
    data = investigation(91)

    response = await client.post(
        AFP,
        json=data,
        headers=HEADERS,
    )

    assert response.status_code == 201, response.text

    investigation_id = UUID(response.json()["id"])

    saved_ids[0].append(investigation_id)

    assert response.json()["data"] == data
    assert response.json()["screeningStatus"] == "eligible"

    assert (
        response.json()["onsetGuidance"]
        == "investigate_without_stool"
    )

    assert "additionalInformation" not in response.json()["data"]

    async with AsyncSessionLocal() as session:
        examination = await session.get(
            AFPClinicalExamination,
            investigation_id,
        )

        assert examination is not None

        assert examination.right_triceps == (
            data["clinicalExamination"]["reflexes"]
            ["scores"]["rightTriceps"]
        )

        record = await session.get(
            AFPInvestigation,
            investigation_id,
        )

        assert record is not None
        assert record.suspected_diagnosis == "Rare custom disease"

    fetched = await client.get(
        f"{AFP}/{investigation_id}",
        headers=HEADERS,
    )

    assert fetched.status_code == 200
    assert fetched.json()["data"] == data

    edited = deepcopy(data)

    edited["clinicalExamination"]["reflexes"]["scores"][
        "leftTriceps"
    ] = "4+"

    updated = await client.put(
        f"{AFP}/{investigation_id}",
        json=edited,
        headers=HEADERS,
    )

    assert updated.status_code == 200, updated.text
    assert updated.json()["data"] == edited


async def test_day_181_screened_out_and_no_examination(
    client,
    saved_ids,
):
    data = investigation(181)

    data["signsSymptoms"]["siteOfParalysis"] = []

    data["clinicalExamination"]["reflexes"]["scores"][
        "rightTriceps"
    ] = None

    response = await client.post(
        AFP,
        json=data,
        headers=HEADERS,
    )

    assert response.status_code == 201, response.text

    record_id = UUID(response.json()["id"])
    saved_ids[0].append(record_id)

    assert response.json()["screeningStatus"] == "not_eligible"
    assert response.json()["onsetGuidance"] == "no_investigation"

    async with AsyncSessionLocal() as session:
        examination = await session.get(
            AFPClinicalExamination,
            record_id,
        )

        assert examination is None



async def test_afp_records_never_store_ori(
    client,
    saved_ids,
):
    data = investigation()

    created = await client.post(
        AFP,
        json=data,
        headers=HEADERS,
    )

    assert created.status_code == 201, created.text

    record_id = UUID(created.json()["id"])
    saved_ids[0].append(record_id)

    assert "additionalInformation" not in created.json()["data"]

    # Confirm PostgreSQL stores no embedded ORI section.
    async with AsyncSessionLocal() as session:
        record = await session.get(
            AFPInvestigation,
            record_id,
        )

        assert record is not None
        assert "additionalInformation" not in record.frontend_payload

    # Update the AFP investigation.
    updated = await client.put(
        f"{AFP}/{record_id}",
        json=data,
        headers=HEADERS,
    )

    assert updated.status_code == 200, updated.text

    # Retrieve and verify the independent AFP payload.
    fetched = await client.get(
        f"{AFP}/{record_id}",
        headers=HEADERS,
    )

    assert fetched.status_code == 200
    assert fetched.json()["data"] == data

    assert "additionalInformation" not in fetched.json()["data"]

    # Confirm UPDATE did not introduce ORI information.
    async with AsyncSessionLocal() as session:
        record = await session.get(
            AFPInvestigation,
            record_id,
        )

        assert record is not None
        assert "additionalInformation" not in record.frontend_payload



async def test_independent_ori_crud_and_isolation(
    client,
    saved_ids,
):
    data = ori_data()

    created = await client.post(
        ORI,
        json=data,
        headers=HEADERS,
    )

    assert created.status_code == 201, created.text

    record_id = UUID(created.json()["id"])
    saved_ids[1].append(record_id)

    assert created.json()["persistenceScope"] == "local_ori"
    assert created.json()["data"] == data
    assert "investigationId" not in created.json()

    fetched = await client.get(
        f"{ORI}/{record_id}",
        headers=HEADERS,
    )

    assert fetched.status_code == 200
    assert fetched.json()["data"] == data

    changed = deepcopy(data)

    changed.update({
        "outbreakResponseImmunizationDone": "no",
        "numberOfChildrenVaccinated": None,
        "outbreakResponseExplanation": "Synthetic explanation",
    })

    updated = await client.put(
        f"{ORI}/{record_id}",
        json=changed,
        headers=HEADERS,
    )

    assert updated.status_code == 200, updated.text
    assert updated.json()["data"] == changed

    # No invented investigation linkage.
    assert (
        "investigation_id"
        not in ORIRecord.__table__.columns
    )


async def test_ori_422_does_not_save_invalid_record(
    client,
):
    data = ori_data()
    data["numberOfChildrenVaccinated"] = None

    invalid = await client.post(
        ORI,
        json=data,
        headers=HEADERS,
    )

    assert invalid.status_code == 422

    assert (
        "additionalInformation.numberOfChildrenVaccinated"
        in invalid.json()["errors"]
    )

    data["numberOfChildrenVaccinated"] = -5

    invalid = await client.post(
        ORI,
        json=data,
        headers=HEADERS,
    )

    assert invalid.status_code == 422

    assert (
        "additionalInformation.numberOfChildrenVaccinated"
        in invalid.json()["errors"]
    )

    missing = await client.get(
        f"{ORI}/{uuid4()}",
        headers=HEADERS,
    )

    assert missing.status_code == 404


async def test_afp_rejects_nested_ori_and_unfinished_other(
    client,
):
    data = investigation()

    data["additionalInformation"] = ori_data()

    response = await client.post(
        AFP,
        json=data,
        headers=HEADERS,
    )

    assert response.status_code == 422
    assert "additionalInformation" in response.json()["errors"]

    del data["additionalInformation"]

    data["previousHealthcareContacts"]["suspectedDiagnosis"] = (
        "Other"
    )

    response = await client.post(
        AFP,
        json=data,
        headers=HEADERS,
    )

    assert response.status_code == 422

    assert (
        "previousHealthcareContacts.suspectedDiagnosisOther"
        in response.json()["errors"]
    )
