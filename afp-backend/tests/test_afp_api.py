
"""Phase 6 HTTP tests against a dedicated PostgreSQL test database."""

from copy import deepcopy
from datetime import datetime
from uuid import UUID, uuid4
from zoneinfo import ZoneInfo

import pytest
import pytest_asyncio

from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete
from sqlalchemy.exc import IntegrityError

from app.api.routes import afp as afp_routes
from app.core.config import get_settings
from app.db.session import AsyncSessionLocal
from app.main import app
from app.models.afp import AFPInvestigation
from tests.conftest import make_payload


BASE = "/api/v1/afp/investigations"
HEADERS = {"X-AFP-Local-Dev": "true"}
TODAY = datetime.now(ZoneInfo("Asia/Dhaka")).date()

pytestmark = pytest.mark.asyncio


@pytest.fixture(autouse=True)
def safe_database():
    """Prevent API tests from using development/production databases."""

    settings = get_settings()

    assert settings.afp_db_name == "afp_test", (
        "Use AFP_DB_NAME=afp_test."
    )
    assert settings.afp_local_api_enabled is True, (
        "Use AFP_LOCAL_API_ENABLED=true."
    )
    assert settings.afp_db_host in {
        "127.0.0.1", "localhost", "::1"
    }


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(
        app=app,
        client=("127.0.0.1", 12345),
        raise_app_exceptions=False,
    )

    async with AsyncClient(
        transport=transport,
        base_url="http://127.0.0.1",
    ) as http:
        yield http


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


def example():
    return make_payload(TODAY)


async def test_post_get_and_db_persistence(client, saved_ids):
    payload = example()

    response = await client.post(
        BASE,
        json=payload,
        headers=HEADERS,
    )

    assert response.status_code == 201, response.text

    body = response.json()
    uid = UUID(body["id"])
    saved_ids.append(uid)

    # assert body["persistenceScope"] == "afp_owned_only"
    # assert body["notPersistedSections"] == [
    #     "vaccinationHistory",
    #     "travelHistory",
    # ]

    # assert set(body["data"]) == {
    #     "clinicalInformation",
    #     "screeningDiagnosis",
    #     "signsSymptoms",
    #     "clinicalExamination",
    #     "previousHealthcareContacts",
    #     "additionalInformation",
    # }
    assert body["persistenceScope"] == "local_full_form"
    assert body["notPersistedSections"] == []
    assert body["data"] == payload

    assert (
        body["data"]["clinicalExamination"]
        ["reflexes"]["scores"]["rightBiceps"]
        == "0"
    )

    assert (
        body["data"]["clinicalExamination"]
        ["muscleStrength"]["upperLimb"]["flexWrist"]["right"]
        == 0
    )

    assert (
        body["data"]["previousHealthcareContacts"]["contacts"][0]["id"]
        == payload["previousHealthcareContacts"]["contacts"][0]["id"]
    )

    fetched = await client.get(
        f"{BASE}/{uid}",
        headers=HEADERS,
    )

    assert fetched.status_code == 200
    assert fetched.json()["id"] == str(uid)

    async with AsyncSessionLocal() as session:
        record = await session.get(AFPInvestigation, uid)

        assert record is not None
        assert record.paralysis_present == "yes"


async def test_put_reorders_contacts_and_preserves_ids(
    client,
    saved_ids,
):
    payload = example()

    first = payload["previousHealthcareContacts"]["contacts"][0]
    second = deepcopy(first)
    second["id"] = "contact-phase6-second"

    payload["previousHealthcareContacts"]["contacts"].append(
        second
    )

    created = await client.post(
        BASE,
        json=payload,
        headers=HEADERS,
    )

    assert created.status_code == 201, created.text

    uid = UUID(created.json()["id"])
    saved_ids.append(uid)

    payload["previousHealthcareContacts"]["contacts"].reverse()

    payload["previousHealthcareContacts"]["contacts"][0]["address"] = (
        "Updated test address"
    )

    updated = await client.put(
        f"{BASE}/{uid}",
        json=payload,
        headers=HEADERS,
    )

    assert updated.status_code == 200, updated.text

    contacts = (
        updated.json()["data"]
        ["previousHealthcareContacts"]["contacts"]
    )

    assert [c["id"] for c in contacts] == [
        second["id"],
        first["id"],
    ]

    assert contacts[0]["address"] == "Updated test address"


async def test_invalid_business_rule_422(client):
    payload = example()
    payload["signsSymptoms"]["siteOfParalysis"] = []

    response = await client.post(
        BASE,
        json=payload,
        headers=HEADERS,
    )

    assert response.status_code == 422
    assert "signsSymptoms.siteOfParalysis" in (
        response.json()["errors"]
    )


async def test_invalid_contact_date_uses_stable_id(client):
    payload = example()

    contact = (
        payload["previousHealthcareContacts"]["contacts"][0]
    )
    contact["dateCaseVisited"] = "31-02-2026"

    response = await client.post(
        BASE,
        json=payload,
        headers=HEADERS,
    )

    assert response.status_code == 422

    field_id = (
        f"previousHealthcareContacts.contacts."
        f"{contact['id']}.dateCaseVisited"
    )

    assert field_id in response.json()["errors"]


async def test_unknown_field_does_not_echo_sensitive_value(
    client,
):
    payload = example()
    payload["secretField"] = "VERY_PRIVATE_TEST_VALUE"

    response = await client.post(
        BASE,
        json=payload,
        headers=HEADERS,
    )

    assert response.status_code == 422
    assert "secretField" in response.json()["errors"]
    assert "VERY_PRIVATE_TEST_VALUE" not in response.text


async def test_shared_data_saved_in_local_snapshot(
    client,
    saved_ids,
):
    payload = example()

    payload["travelHistory"][
        "travelOutsideAreaLast30Days"
    ] = True

    response = await client.post(
        BASE,
        json=payload,
        headers=HEADERS,
    )

    assert response.status_code == 201, response.text

    saved_ids.append(UUID(response.json()["id"]))

    assert response.json()["data"][
        "travelHistory"
    ] == payload["travelHistory"]


async def test_screened_out_record_saved_locally(
    client,
    saved_ids,
):
    payload = example()

    payload["clinicalInformation"][
        "paralysisPresent"
    ] = "no"

    response = await client.post(
        BASE,
        json=payload,
        headers=HEADERS,
    )

    assert response.status_code == 201, response.text

    saved_ids.append(UUID(response.json()["id"]))

    assert response.json()["data"] == payload


async def test_not_found(client):
    response = await client.get(
        f"{BASE}/{uuid4()}",
        headers=HEADERS,
    )

    assert response.status_code == 404


async def test_malformed_json_400(client):
    response = await client.post(
        BASE,
        content='{"broken":',
        headers={
            **HEADERS,
            "Content-Type": "application/json",
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "message": "Malformed JSON request."
    }


async def test_missing_header_denied(client):
    response = await client.get(
        f"{BASE}/{uuid4()}"
    )

    assert response.status_code == 403


async def test_disabled_environment_denied(
    client,
    monkeypatch,
):
    monkeypatch.setattr(
        get_settings(),
        "afp_local_api_enabled",
        False,
    )

    response = await client.get(
        f"{BASE}/{uuid4()}",
        headers=HEADERS,
    )

    assert response.status_code == 503


async def test_non_loopback_client_denied():
    transport = ASGITransport(
        app=app,
        client=("203.0.113.5", 54321),
        raise_app_exceptions=False,
    )

    async with AsyncClient(
        transport=transport,
        base_url="http://127.0.0.1",
    ) as remote:
        response = await remote.get(
            f"{BASE}/{uuid4()}",
            headers=HEADERS,
        )

        assert response.status_code == 403


async def test_integrity_error_response_redacted(
    client,
    monkeypatch,
):
    async def failing_create(*args, **kwargs):
        raise IntegrityError(
            "insert",
            None,
            Exception("SECRET_DB_DETAILS"),
        )

    monkeypatch.setattr(
        afp_routes,
        "create_local_full_afp",
        failing_create,
    )

    response = await client.post(
        BASE,
        json=example(),
        headers=HEADERS,
    )

    assert response.status_code == 409
    assert "SECRET_DB_DETAILS" not in response.text


async def test_unexpected_error_response_redacted(
    client,
    monkeypatch,
):
    async def failing_create(*args, **kwargs):
        raise RuntimeError("SECRET_MEDICAL_DETAILS")

    monkeypatch.setattr(
        afp_routes,
        "create_local_full_afp",
        failing_create,
    )

    response = await client.post(
        BASE,
        json=example(),
        headers=HEADERS,
    )

    assert response.status_code == 500
    assert "SECRET_MEDICAL_DETAILS" not in response.text
