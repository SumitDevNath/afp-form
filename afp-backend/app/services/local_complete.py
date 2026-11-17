
"""Full AFP form storage for LOCAL development only (not NDSS integration).

The validated JSONB snapshot is the lossless read/write source of truth.
The existing SQLAlchemy tables mirror AFP-owned active fields for local queries.
Do not connect these operations to a public or production route.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any, Literal
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.afp import (
    AFPClinicalExamination,
    AFPHealthcareContact,
    AFPInvestigation,
)
from app.schemas.afp import AFPFormData
from app.schemas.validation import validate_afp_form
from app.services.afp import (
    AFPIntegrationPending,
    AFPInvestigationNotFound,
    AFPValidationFailure,
    _assign_known_fields,
    _check_local_only,
    _contact_values,
    _examination_values,
    _load,
    _main_values,
)


_SCREENING_COLUMNS = frozenset({
    "paralysis_present",
    "paralysis_flaccid",
    "paralysis_sudden_onset",
    "paralysis_onset_date",
    "paralysis_caused_by_injury",
    "paralysis_present_at_birth",
    "screening_diagnosis",
})


def _validate_local_form(
    payload: dict[str, Any],
    today: date | None,
) -> tuple[AFPFormData, bool]:
    """Validate a complete frontend-shaped request."""

    result = validate_afp_form(payload, today=today)

    if not result.is_valid:
        raise AFPValidationFailure(result.errors)

    if result.screening_status == "pending":
        raise AFPValidationFailure({
            "clinicalInformation.paralysisOnsetDate":
                "Complete AFP screening before saving."
        })

    assert result.data is not None

    return result.data, result.screening_status == "eligible"


def _parent_values(
    data: AFPFormData,
    eligible: bool,
) -> dict[str, Any]:
    """Keep relational clinical details only when that section is active."""

    values = _main_values(data)

    if not eligible:
        for key in values:
            if key not in _SCREENING_COLUMNS:
                values[key] = (
                    [] if key == "site_of_paralysis" else None
                )

    return values


async def get_local_full_afp(
    session: AsyncSession,
    investigation_id: UUID,
    *,
    local_dev_mode: Literal[True],
) -> AFPInvestigation | None:
    """Retrieve an existing complete local AFP investigation."""

    _check_local_only(local_dev_mode)

    record = await _load(session, investigation_id)

    if record is not None and record.frontend_payload is None:
        raise AFPIntegrationPending(
            "Legacy AFP record has no complete local snapshot; "
            "manual reconciliation needed."
        )

    return record


async def create_local_full_afp(
    session: AsyncSession,
    payload: dict[str, Any],
    *,
    local_dev_mode: Literal[True],
    today: date | None = None,
) -> AFPInvestigation:
    """Atomically store the complete snapshot and active relational fields."""

    _check_local_only(local_dev_mode)

    data, eligible = _validate_local_form(payload, today)

    snapshot = data.model_dump(
        mode="json",
        by_alias=True,
    )

    async with session.begin():
        record = AFPInvestigation(
            **_parent_values(data, eligible),
            frontend_payload=snapshot,
        )

        session.add(record)
        await session.flush()

        if eligible:
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

    loaded = await _load(session, record_id)

    assert loaded is not None
    return loaded


async def update_local_full_afp(
    session: AsyncSession,
    investigation_id: UUID,
    payload: dict[str, Any],
    *,
    local_dev_mode: Literal[True],
    today: date | None = None,
) -> AFPInvestigation:
    """Atomically replace the snapshot and synchronize relational children."""

    _check_local_only(local_dev_mode)

    data, eligible = _validate_local_form(payload, today)

    snapshot = data.model_dump(
        mode="json",
        by_alias=True,
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

        if record.frontend_payload is None:
            raise AFPIntegrationPending(
                "Legacy AFP record has no complete local snapshot; "
                "manual reconciliation needed."
            )

        _assign_known_fields(
            record,
            _parent_values(data, eligible),
        )

        # Replace the whole JSONB value rather than mutating it in place.
        record.frontend_payload = snapshot
        record.updated_at = datetime.now(timezone.utc)

        if not eligible:
            # The frontend hides examination and contact sections for
            # screened-out cases. The original complete JSON is still
            # preserved in frontend_payload.
            if record.examination is not None:
                await session.delete(record.examination)

            for contact in list(record.contacts):
                await session.delete(contact)

            await session.flush()

        else:
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
                row.client_id: row
                for row in record.contacts
            }

            new_contacts = (
                data.previous_healthcare_contacts.contacts
            )

            incoming_ids = {
                contact.id
                for contact in new_contacts
            }

            # Move old contact positions outside their final range.
            # This avoids transient unique-constraint violations
            # when contacts exchange their positions.
            temp_base = max(
                (row.position for row in record.contacts),
                default=-1,
            ) + 1

            for position, row in enumerate(record.contacts):
                row.position = temp_base + position

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
