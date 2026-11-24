
"""Local-development AFP and independent ORI HTTP response contracts."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.afp import AFPFormData, FrontendModel, ORIFormData


class AFPInvestigationRead(FrontendModel):
    id: UUID
    created_at: datetime
    updated_at: datetime

    persistence_scope: Literal["local_full_form"] = "local_full_form"
    not_persisted_sections: list[str] = Field(default_factory=list)

    data: AFPFormData

    screening_status: Literal[
        "pending",
        "eligible",
        "not_eligible",
    ]

    onset_guidance: Literal[
        "no_investigation",
        "investigate_without_stool",
    ] | None = None


class ORIRecordRead(FrontendModel):
    id: UUID
    created_at: datetime
    updated_at: datetime

    persistence_scope: Literal["local_ori"] = "local_ori"

    data: ORIFormData
