
"""Explicit AFP-owned HTTP response contract.

This response does not represent a complete NDSS investigation.
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.afp import (
    AdditionalInformation,
    ClinicalExamination,
    ClinicalInformation,
    FrontendModel,
    PreviousHealthcareContacts,
    SignsSymptoms,
)


class AFPOwnedData(FrontendModel):
    """AFP sections currently persisted by the local service."""

    clinical_information: ClinicalInformation
    screening_diagnosis: str
    signs_symptoms: SignsSymptoms
    clinical_examination: ClinicalExamination
    previous_healthcare_contacts: PreviousHealthcareContacts
    additional_information: AdditionalInformation


class AFPInvestigationRead(FrontendModel):
    """Safe, typed local development HTTP response."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    persistence_scope: Literal["afp_owned_only"] = "afp_owned_only"

    not_persisted_sections: list[
        Literal["vaccinationHistory", "travelHistory"]
    ] = Field(
        default_factory=lambda: [
            "vaccinationHistory",
            "travelHistory",
        ]
    )

    data: AFPOwnedData
