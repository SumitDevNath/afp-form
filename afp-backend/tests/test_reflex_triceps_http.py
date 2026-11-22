"""Real PostgreSQL/HTTP verification. Run ONLY against afp_test after 0003."""

from copy import deepcopy
from datetime import datetime
from uuid import UUID
from zoneinfo import ZoneInfo

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete

from app.core.config import get_settings
from app.db.session import AsyncSessionLocal
from app.main import app
from app.models.afp import AFPClinicalExamination, AFPInvestigation
from tests.conftest import make_payload

BASE = "/api/v1/afp/investigations"
HEADERS = {"X-AFP-Local-Dev": "true"}
pytestmark = pytest.mark.asyncio


@pytest.fixture(autouse=True)
def require_test_db():
    settings = get_settings()
    assert settings.afp_db_name == "afp_test", "Refuse writes outside afp_test"
    assert settings.afp_local_api_enabled is True
    assert settings.afp_db_host in {"127.0.0.1", "localhost", "::1"}


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(
        app=app, client=("127.0.0.1", 54321), raise_app_exceptions=False
    )
    async with AsyncClient(transport=transport, base_url="http://127.0.0.1") as value:
        yield value


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
                        delete(AFPInvestigation).where(AFPInvestigation.id.in_(ids))
                    )


async def test_post_get_put_preserves_triceps_in_json_and_columns(client, saved_ids):
    today = datetime.now(ZoneInfo("Asia/Dhaka")).date()
    payload = make_payload(today)
    payload["clinicalExamination"]["reflexes"]["scores"].update({
        "rightTriceps": "0", "leftTriceps": "4+"
    })

    created = await client.post(BASE, json=payload, headers=HEADERS)
    assert created.status_code == 201, created.text
    investigation_id = UUID(created.json()["id"])
    saved_ids.append(investigation_id)
    assert created.json()["data"] == payload

    async with AsyncSessionLocal() as session:
        examination = await session.get(AFPClinicalExamination, investigation_id)
        assert examination is not None
        assert examination.right_triceps == "0"
        assert examination.left_triceps == "4+"

    read = await client.get(f"{BASE}/{investigation_id}", headers=HEADERS)
    assert read.status_code == 200
    assert read.json()["data"] == payload

    updated = deepcopy(payload)
    updated["clinicalExamination"]["reflexes"]["scores"].update({
        "rightTriceps": "2+", "leftTriceps": "1+"
    })
    saved = await client.put(
        f"{BASE}/{investigation_id}", json=updated, headers=HEADERS
    )
    assert saved.status_code == 200, saved.text
    assert saved.json()["data"] == updated

    async with AsyncSessionLocal() as session:
        examination = await session.get(AFPClinicalExamination, investigation_id)
        assert examination is not None
        assert (examination.right_triceps, examination.left_triceps) == ("2+", "1+")


async def test_invalid_triceps_422_cannot_change_saved_record(client, saved_ids):
    today = datetime.now(ZoneInfo("Asia/Dhaka")).date()
    payload = make_payload(today)
    created = await client.post(BASE, json=payload, headers=HEADERS)
    assert created.status_code == 201, created.text
    investigation_id = UUID(created.json()["id"])
    saved_ids.append(investigation_id)

    for value in (None, "5+", 0):
        invalid = deepcopy(payload)
        invalid["clinicalExamination"]["reflexes"]["scores"]["rightTriceps"] = value
        response = await client.put(
            f"{BASE}/{investigation_id}", json=invalid, headers=HEADERS
        )
        assert response.status_code == 422, response.text
        assert "clinicalExamination.reflexes.scores.rightTriceps" in response.json()["errors"]

    fetched = await client.get(f"{BASE}/{investigation_id}", headers=HEADERS)
    assert fetched.json()["data"] == payload
