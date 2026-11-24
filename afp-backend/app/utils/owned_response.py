
"""Convert local AFP JSONB snapshots to safe seven-section API responses."""

from datetime import datetime
from zoneinfo import ZoneInfo

from app.models.afp import AFPInvestigation
from app.schemas.afp import AFPFormData
from app.schemas.api import AFPInvestigationRead
from app.schemas.validation import (
    get_onset_guidance,
    get_screening_status,
)
from app.services.afp import AFPIntegrationPending


def to_owned_read(
    record: AFPInvestigation,
) -> AFPInvestigationRead:
    if not isinstance(record.frontend_payload, dict):
        raise AFPIntegrationPending(
            "Complete local form snapshot unavailable; "
            "reconciliation required."
        )

    # Historical AFP snapshots included additionalInformation.
    # Remove it only from the HTTP response, not from the database.
    snapshot = dict(record.frontend_payload)
    snapshot.pop("additionalInformation", None)

    data = AFPFormData.model_validate(snapshot)

    today = datetime.now(
        ZoneInfo("Asia/Dhaka")
    ).date()

    return AFPInvestigationRead.model_validate({
        "id": record.id,
        "createdAt": record.created_at,
        "updatedAt": record.updated_at,
        "data": data,
        "screeningStatus": get_screening_status(
            data,
            today,
        ),
        "onsetGuidance": get_onset_guidance(
            data.clinical_information.paralysis_onset_date,
            today,
        ),
    })
