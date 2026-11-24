"""Register AFP SQLAlchemy models."""

from app.models.afp import (
    AFPClinicalExamination,
    AFPHealthcareContact,
    AFPInvestigation,
    ORIRecord,
)

__all__ = [
    "AFPInvestigation",
    "AFPClinicalExamination",
    "AFPHealthcareContact",
    "ORIRecord",
]