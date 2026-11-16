
"""Phase 5 real-PostgreSQL tests. Run ONLY against afp_test.

Apply existing Alembic revision 0001_afp_owned to afp_test first.
"""

from copy import deepcopy
from datetime import date
from uuid import uuid4

import pytest
import pytest_asyncio
from sqlalchemy import delete, func, select

from app.core.config import get_settings
from app.db.session import AsyncSessionLocal
from app.models.afp import AFPHealthcareContact, AFPInvestigation
from app.services import afp as service
from tests.conftest import make_payload

pytestmark = pytest.mark.asyncio
TODAY = date(2026, 11, 16)


@pytest.fixture(autouse=True)
def prohibit_non_test_database() -> None:
    """Never execute these state-changing tests against afp_dev or NDSS."""
    assert get_settings().afp_db_name == "afp_test", (
        "Refusing database writes: set AFP_DB_NAME=afp_test."
    )


@pytest_asyncio.fixture
async def created_ids():
    ids = []
    try:
        yield ids
    finally:
        if ids:
            async with AsyncSessionLocal() as session:
                async with session.begin():
                    await session.execute(
                        delete(AFPInvestigation).where(AFPInvestigation.id.in_(ids))
                    )


def _payload() -> dict:
    return make_payload(TODAY)


async def test_create_and_read_all_owned_sections(created_ids):
    data = _payload()
    data["additionalInformation"].update({
        "searchForAdditionalCases": "yes",
        "additionalCasesIdentified": "yes",
        "numberOfAdditionalCases": 0,
        "outbreakResponseImmunizationDone": "yes",
        "numberOfChildrenVaccinated": 0,
    })
    async with AsyncSessionLocal() as session:
        created = await service.create_local_afp_investigation(
            session, data, local_dev_mode=True, today=TODAY
        )
        investigation_id = created.id
        created_ids.append(investigation_id)
        assert len(created.contacts) == 1
        assert created.contacts[0].client_id == data["previousHealthcareContacts"]["contacts"][0]["id"]
        assert created.examination.right_biceps == "0"
        assert created.examination.upper_flex_wrist_right == 0
        assert created.number_of_additional_cases == 0
        assert created.number_of_children_vaccinated == 0
        assert created.notified_to_concerned_dsfp_simo is None
        assert created.dsfp_simo_notification_date is None

    async with AsyncSessionLocal() as session:
        loaded = await service.get_local_afp_investigation(
            session, investigation_id, local_dev_mode=True
        )
        assert loaded is not None
        assert loaded.paralysis_onset_date == date(2026, 11, 9)
        assert loaded.examination.left_biceps == "1+"
        assert loaded.contacts[0].position == 0


async def test_reorder_preserves_contact_database_ids(created_ids):
    data = _payload()
    contacts = data["previousHealthcareContacts"]["contacts"]
    second = deepcopy(contacts[0])
    second["id"] = "contact-second"
    contacts.append(second)
    async with AsyncSessionLocal() as session:
        created = await service.create_local_afp_investigation(
            session, data, local_dev_mode=True, today=TODAY
        )
        investigation_id = created.id
        created_ids.append(investigation_id)
        original_db_ids = {c.client_id: c.id for c in created.contacts}

    contacts.reverse()
    third = deepcopy(contacts[0])
    third["id"] = "contact-third"
    contacts.append(third)
    async with AsyncSessionLocal() as session:
        updated = await service.update_local_afp_investigation(
            session, investigation_id, data, local_dev_mode=True, today=TODAY
        )
        assert [c.client_id for c in updated.contacts] == [
            "contact-second", contacts[1]["id"], "contact-third"
        ]
        for c in updated.contacts[:2]:
            assert c.id == original_db_ids[c.client_id]
        assert [c.position for c in updated.contacts] == [0, 1, 2]

    # Now remove a contact; it must be gone from the DB, with remaining IDs stable.
    contacts.pop(1)
    async with AsyncSessionLocal() as session:
        updated = await service.update_local_afp_investigation(
            session, investigation_id, data, local_dev_mode=True, today=TODAY
        )
        assert [c.client_id for c in updated.contacts] == [
            "contact-second", "contact-third"
        ]
        assert updated.contacts[0].id == original_db_ids["contact-second"]


async def test_validation_fails_before_database_write(created_ids):
    data = _payload()
    data["clinicalExamination"]["muscleStrength"]["upperLimb"]["flexWrist"]["right"] = 6
    async with AsyncSessionLocal() as session:
        with pytest.raises(service.AFPValidationFailure) as exc:
            await service.create_local_afp_investigation(
                session, data, local_dev_mode=True, today=TODAY
            )
        assert "clinicalExamination.muscleStrength.upperLimb.flexWrist.right" in exc.value.errors


async def test_shared_sections_are_not_silently_discarded():
    data = _payload()
    data["travelHistory"]["travelOutsideAreaLast30Days"] = True
    async with AsyncSessionLocal() as session:
        with pytest.raises(service.AFPIntegrationPending):
            await service.create_local_afp_investigation(
                session, data, local_dev_mode=True, today=TODAY
            )
    data = _payload()
    data["vaccinationHistory"]["available"] = True
    async with AsyncSessionLocal() as session:
        with pytest.raises(service.AFPIntegrationPending):
            await service.create_local_afp_investigation(
                session, data, local_dev_mode=True, today=TODAY
            )


async def test_ineligible_investigation_is_not_saved():
    data = _payload()
    data["clinicalInformation"]["paralysisPresent"] = "no"
    async with AsyncSessionLocal() as session:
        with pytest.raises(service.AFPIntegrationPending):
            await service.create_local_afp_investigation(
                session, data, local_dev_mode=True, today=TODAY
            )


async def test_atomic_rollback_after_parent_flush(monkeypatch):
    data = _payload()
    contact = deepcopy(data["previousHealthcareContacts"]["contacts"][0])
    contact["id"] = "contact-rollback-second"
    data["previousHealthcareContacts"]["contacts"].append(contact)
    marker = "phase5_rollback_" + uuid4().hex
    data["screeningDiagnosis"] = marker
    real = service._contact_values

    def fail_second(item, position):
        if position == 1:
            raise RuntimeError("Synthetic test failure")
        return real(item, position)

    monkeypatch.setattr(service, "_contact_values", fail_second)
    async with AsyncSessionLocal() as session:
        with pytest.raises(RuntimeError, match="Synthetic test failure"):
            await service.create_local_afp_investigation(
                session, data, local_dev_mode=True, today=TODAY
            )
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(func.count()).select_from(AFPInvestigation).where(
                AFPInvestigation.screening_diagnosis == marker
            )
        )
        assert result.scalar_one() == 0


async def test_unknown_record_update_raises_without_insert():
    async with AsyncSessionLocal() as session:
        with pytest.raises(service.AFPInvestigationNotFound):
            await service.update_local_afp_investigation(
                session, uuid4(), _payload(), local_dev_mode=True, today=TODAY
            )


async def test_failed_update_restores_existing_contact_and_parent(created_ids, monkeypatch):
    data = _payload()
    async with AsyncSessionLocal() as session:
        row = await service.create_local_afp_investigation(
            session, data, local_dev_mode=True, today=TODAY
        )
        investigation_id = row.id
        created_ids.append(investigation_id)
        original_address = row.contacts[0].address

    data["previousHealthcareContacts"]["contacts"][0]["address"] = "Changed address"
    second = deepcopy(data["previousHealthcareContacts"]["contacts"][0])
    second["id"] = "contact-failed-update"
    data["previousHealthcareContacts"]["contacts"].append(second)
    data["screeningDiagnosis"] = "attempted update"
    real = service._contact_values

    def fail_second(item, position):
        if position == 1:
            raise RuntimeError("Synthetic update failure")
        return real(item, position)

    monkeypatch.setattr(service, "_contact_values", fail_second)
    async with AsyncSessionLocal() as session:
        with pytest.raises(RuntimeError, match="Synthetic update failure"):
            await service.update_local_afp_investigation(
                session, investigation_id, data, local_dev_mode=True, today=TODAY
            )

    async with AsyncSessionLocal() as session:
        persisted = await service.get_local_afp_investigation(
            session, investigation_id, local_dev_mode=True
        )
        assert persisted is not None
        assert persisted.contacts[0].address == original_address
        assert len(persisted.contacts) == 1
        assert persisted.screening_diagnosis == ""
