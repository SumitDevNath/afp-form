
"""AFP-owned persistence helpers and legacy local AFP service.

The complete local AFP form uses app.services.local_complete.
ORI has separate storage in app.services.ori.

These helpers remain necessary for the investigation service.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any, Literal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.afp import (
    AFPClinicalExamination,
    AFPHealthcareContact,
    AFPInvestigation,
    MUSCLE_COLUMNS,
    REFLEX_FIELDS,
)

from app.schemas.afp import AFPFormData, HealthcareContact
from app.schemas.validation import validate_afp_form


class AFPValidationFailure(ValueError):
    """Frontend-compatible validation errors."""

    def __init__(self, errors: dict[str, str]) -> None:
        self.errors = errors
        super().__init__("AFP form validation failed")


class AFPIntegrationPending(RuntimeError):
    """An operation requires an unconfirmed NDSS integration rule."""


class AFPInvestigationNotFound(LookupError):
    """The local AFP investigation does not exist."""


_EMPTY_VACCINATION: dict[str, Any] = {
    "available": False,
    "opvCampaignDoses": {
        "recordSource": None,
        "numberOfDoses": None,
    },
    "opvRoutineDoses": {
        "recordSource": None,
        "numberOfDoses": None,
    },
    "lastOpvDoseBeforeParalysisDate": "",
    "ipvDoses": {
        "recordSource": None,
        "numberOfDoses": None,
    },
    "lastIpvDoseBeforeParalysisDate": "",
    "opvGivenAfterParalysis": None,
    "opvAfterParalysisDate": "",
}

_EMPTY_TRAVEL = {
    "travelOutsideAreaLast30Days": False,
    "notifiedToConcernedDsfpSimo": False,
    "notificationDate": "",
}


def _check_local_only(flag: Literal[True]) -> None:
    if flag is not True:
        raise AFPIntegrationPending(
            "Local development operations require explicit opt-in."
        )


def _validate_owned_projection(
    payload: Any,
    today: date | None,
) -> AFPFormData:
    """Retained for the original AFP-owned development service."""

    if not isinstance(payload, dict):
        raise AFPValidationFailure({
            "__root__": "Expected a JSON object."
        })

    if (
        payload.get("vaccinationHistory") != _EMPTY_VACCINATION
        or payload.get("travelHistory") != _EMPTY_TRAVEL
    ):
        raise AFPIntegrationPending(
            "Shared vaccination/travel values need the "
            "approved NDSS orchestration. Nothing was saved."
        )

    result = validate_afp_form(
        payload,
        today=today,
    )

    if not result.is_valid:
        raise AFPValidationFailure(result.errors)

    if result.screening_status != "eligible":
        raise AFPIntegrationPending(
            "Persistence of pending/screened-out cases is not "
            "approved for the legacy service. Nothing was saved."
        )

    assert result.data is not None
    return result.data


def _main_values(
    data: AFPFormData,
) -> dict[str, Any]:
    """Map AFP fields to investigation columns.

    ORI fields are deliberately excluded.
    """

    c = data.clinical_information
    s = data.signs_symptoms
    f = s.health_facility
    h = data.previous_healthcare_contacts

    has_facility = s.child_at_health_facility == "yes"

    return {
        "paralysis_present": c.paralysis_present,
        "paralysis_flaccid": c.paralysis_flaccid,
        "paralysis_sudden_onset": c.paralysis_sudden_onset,
        "paralysis_onset_date": c.paralysis_onset_date,
        "paralysis_caused_by_injury": c.paralysis_caused_by_injury,
        "paralysis_present_at_birth": c.paralysis_present_at_birth,

        "screening_diagnosis": data.screening_diagnosis,

        "fever_when_paralysis_began": s.fever_when_paralysis_began,
        "muscle_pain_when_paralysis_began": s.muscle_pain_when_paralysis_began,

        "site_of_paralysis": list(s.site_of_paralysis),

        "other_paralysis_site": (
            s.other_paralysis_site
            if "other" in s.site_of_paralysis
            else None
        ),

        "paralysis_asymmetric": s.paralysis_asymmetric,
        "paralysis_moved_upward": s.paralysis_moved_upward,

        "sensation_present_at_paralysis_site":
            s.sensation_present_at_paralysis_site,

        "child_at_health_facility": s.child_at_health_facility,

        "selected_facility_option": (
            f.selected_facility_option
            if has_facility
            else None
        ),

        "other_facility_name": (
            f.other_facility_name
            if (
                has_facility
                and f.selected_facility_option == "__other__"
            )
            else None
        ),

        "health_facility_notification_date": (
            f.notification_date
            if has_facility
            else None
        ),

        "medical_record_number": (
            f.medical_record_number
            if has_facility
            else None
        ),

        "first_contact_category": h.first_contact_category,

        "first_contact_category_other": (
            h.first_contact_category_other
            if h.first_contact_category == "Other"
            else None
        ),

        "additional_comments": h.additional_comments,

        "suspected_diagnosis": h.suspected_diagnosis,

        # No ORI fields are written by AFP.
    }


def _examination_values(
    data: AFPFormData,
) -> dict[str, Any]:
    """Map reflex and muscle scores to relational columns."""

    examination = data.clinical_examination

    values = {
        name: getattr(
            examination.reflexes.scores,
            name,
        )
        for name in REFLEX_FIELDS
    }

    values["right_plantar_reflex"] = (
        examination.reflexes.right_plantar_reflex
    )

    values["left_plantar_reflex"] = (
        examination.reflexes.left_plantar_reflex
    )

    for column in MUSCLE_COLUMNS:
        limb, remainder = column.split("_", 1)
        muscle, side = remainder.rsplit("_", 1)

        pair = getattr(
            getattr(
                examination.muscle_strength,
                f"{limb}_limb",
            ),
            muscle,
        )

        values[column] = getattr(pair, side)

    return values


def _contact_values(
    contact: HealthcareContact,
    position: int,
) -> dict[str, Any]:
    return {
        "client_id": contact.id,
        "position": position,

        "provider_name": contact.provider_name,
        "address": contact.address,

        "date_case_visited": contact.date_case_visited,

        "already_in_network": contact.already_in_network,
        "reported_case": contact.reported_case,

        "action_taken_planned": contact.action_taken_planned,
    }


def _assign_known_fields(
    instance: Any,
    values: dict[str, Any],
) -> None:
    for name, value in values.items():
        setattr(instance, name, value)


async def _load(
    session: AsyncSession,
    investigation_id: UUID,
    *,
    lock: bool = False,
) -> AFPInvestigation | None:
    query = (
        select(AFPInvestigation)
        .where(
            AFPInvestigation.id == investigation_id
        )
        .options(
            selectinload(AFPInvestigation.examination),
            selectinload(AFPInvestigation.contacts),
        )
        .execution_options(populate_existing=True)
    )

    if lock:
        query = query.with_for_update(
            of=AFPInvestigation
        )

    result = await session.execute(query)
    return result.scalar_one_or_none()


async def get_local_afp_investigation(
    session: AsyncSession,
    investigation_id: UUID,
    *,
    local_dev_mode: Literal[True],
) -> AFPInvestigation | None:
    _check_local_only(local_dev_mode)
    return await _load(session, investigation_id)


async def create_local_afp_investigation(
    session: AsyncSession,
    payload: dict[str, Any],
    *,
    local_dev_mode: Literal[True],
    today: date | None = None,
) -> AFPInvestigation:
    """Legacy AFP-owned local persistence."""

    _check_local_only(local_dev_mode)

    data = _validate_owned_projection(
        payload,
        today,
    )

    async with session.begin():
        record = AFPInvestigation(
            **_main_values(data)
        )

        session.add(record)
        await session.flush()

        session.add(
            AFPClinicalExamination(
                investigation_id=record.id,
                **_examination_values(data),
            )
        )

        session.add_all(
            AFPHealthcareContact(
                investigation_id=record.id,
                **_contact_values(contact, position),
            )
            for position, contact in enumerate(
                data.previous_healthcare_contacts.contacts
            )
        )

        await session.flush()
        record_id = record.id

    loaded = await _load(
        session,
        record_id,
    )

    assert loaded is not None
    return loaded


async def update_local_afp_investigation(
    session: AsyncSession,
    investigation_id: UUID,
    payload: dict[str, Any],
    *,
    local_dev_mode: Literal[True],
    today: date | None = None,
) -> AFPInvestigation:
    """Legacy AFP-owned local update."""

    _check_local_only(local_dev_mode)

    data = _validate_owned_projection(
        payload,
        today,
    )

    async with session.begin():
        record = await _load(
            session,
            investigation_id,
            lock=True,
        )

        if record is None:
            raise AFPInvestigationNotFound(
                "AFP investigation not found"
            )

        _assign_known_fields(
            record,
            _main_values(data),
        )

        record.updated_at = datetime.now(timezone.utc)

        if record.examination is None:
            session.add(
                AFPClinicalExamination(
                    investigation_id=record.id,
                    **_examination_values(data),
                )
            )
        else:
            _assign_known_fields(
                record.examination,
                _examination_values(data),
            )

        old_contacts = {
            contact.client_id: contact
            for contact in record.contacts
        }

        new_contacts = (
            data.previous_healthcare_contacts.contacts
        )

        incoming_ids = {
            contact.id
            for contact in new_contacts
        }

        # Stage current positions away from final positions
        # to avoid transient UNIQUE constraint collisions.
        next_temp = max(
            (contact.position for contact in record.contacts),
            default=-1,
        ) + 1

        for index, row in enumerate(record.contacts):
            row.position = next_temp + index

        await session.flush()

        for client_id, row in old_contacts.items():
            if client_id not in incoming_ids:
                await session.delete(row)

        await session.flush()

        for position, contact in enumerate(new_contacts):
            values = _contact_values(
                contact,
                position,
            )

            existing = old_contacts.get(contact.id)

            if existing is None:
                session.add(
                    AFPHealthcareContact(
                        investigation_id=record.id,
                        **values,
                    )
                )
            else:
                _assign_known_fields(
                    existing,
                    values,
                )

        await session.flush()

    loaded = await _load(
        session,
        investigation_id,
    )

    assert loaded is not None
    return loaded
