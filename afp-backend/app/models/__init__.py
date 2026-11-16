
"""Register AFP SQLAlchemy models."""

from app.models.afp import (
    AFPClinicalExamination,
    AFPHealthcareContact,
    AFPInvestigation,
)

__all__ = [
    "AFPInvestigation",
    "AFPClinicalExamination",
    "AFPHealthcareContact",
]
