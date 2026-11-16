
"""Allowlisted ORM-to-HTTP mapping of persisted AFP-owned fields."""

from datetime import date

from pydantic.alias_generators import to_camel

from app.models.afp import AFPInvestigation, REFLEX_FIELDS
from app.schemas.api import AFPInvestigationRead


CLINICAL_FIELDS = (
    "paralysis_present",
    "paralysis_flaccid",
    "paralysis_sudden_onset",
    "paralysis_caused_by_injury",
    "paralysis_present_at_birth",
)

SIGNS_FIELDS = (
    "fever_when_paralysis_began",
    "muscle_pain_when_paralysis_began",
    "paralysis_asymmetric",
    "paralysis_moved_upward",
    "sensation_present_at_paralysis_site",
    "child_at_health_facility",
)

MUSCLES = {
    "upperLimb": (
        "flexWrist",
        "extendWrist",
        "flexElbow",
        "extendElbow",
        "flexShoulder",
        "extendShoulder",
        "handGrip",
    ),
    "lowerLimb": (
        "flexHip",
        "extendHip",
        "flexKnee",
        "extendKnee",
        "flexAnkle",
        "extendAnkle",
    ),
}


def _display(value: date | None) -> str:
    return value.strftime("%d-%m-%Y") if value is not None else ""


def _fields(
    record: object,
    names: tuple[str, ...],
) -> dict[str, object]:
    return {
        to_camel(name): getattr(record, name)
        for name in names
    }


def _snake(name: str) -> str:
    """Convert an approved key such as flexWrist to flex_wrist."""
    import re

    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


def to_owned_read(
    record: AFPInvestigation,
) -> AFPInvestigationRead:
    """Map an eagerly loaded AFP record to its HTTP response."""

    exam = record.examination

    if exam is None:
        raise RuntimeError("AFP examination missing")

    strengths: dict[
        str, dict[str, dict[str, int | None]]
    ] = {}

    for limb, muscles in MUSCLES.items():
        prefix = "upper" if limb == "upperLimb" else "lower"

        strengths[limb] = {}

        for muscle in muscles:
            column = f"{prefix}_{_snake(muscle)}"

            strengths[limb][muscle] = {
                side: getattr(exam, f"{column}_{side}")
                for side in ("right", "left")
            }

    contacts = [
        {
            "id": row.client_id,
            "providerName": row.provider_name or "",
            "address": row.address or "",
            "dateCaseVisited": _display(row.date_case_visited),
            "alreadyInNetwork": row.already_in_network,
            "reportedCase": row.reported_case,
            "actionTakenPlanned": row.action_taken_planned or "",
        }
        for row in sorted(
            record.contacts,
            key=lambda item: item.position,
        )
    ]

    data = {
        "clinicalInformation": {
            **_fields(record, CLINICAL_FIELDS),
            "paralysisOnsetDate": _display(
                record.paralysis_onset_date
            ),
        },
        "screeningDiagnosis": record.screening_diagnosis or "",
        "signsSymptoms": {
            **_fields(record, SIGNS_FIELDS),
            "siteOfParalysis": list(record.site_of_paralysis),
            "otherParalysisSite": (
                record.other_paralysis_site or ""
            ),
            "healthFacility": {
                "selectedFacilityOption": (
                    record.selected_facility_option or ""
                ),
                "otherFacilityName": (
                    record.other_facility_name or ""
                ),
                "notificationDate": _display(
                    record.health_facility_notification_date
                ),
                "medicalRecordNumber": (
                    record.medical_record_number or ""
                ),
            },
        },
        "clinicalExamination": {
            "reflexes": {
                "scores": _fields(exam, REFLEX_FIELDS),
                "rightPlantarReflex": exam.right_plantar_reflex,
                "leftPlantarReflex": exam.left_plantar_reflex,
            },
            "muscleStrength": strengths,
        },
        "previousHealthcareContacts": {
            "contacts": contacts,
            "firstContactCategory": record.first_contact_category,
            "firstContactCategoryOther": (
                record.first_contact_category_other or ""
            ),
            "additionalComments": (
                record.additional_comments or ""
            ),
            "suspectedDiagnosis": (
                record.suspected_diagnosis or ""
            ),
        },
        "additionalInformation": {
            "searchForAdditionalCases": (
                record.search_for_additional_cases
            ),
            "additionalCasesIdentified": (
                record.additional_cases_identified
            ),
            "numberOfAdditionalCases": (
                record.number_of_additional_cases
            ),
            "outbreakResponseImmunizationDone": (
                record.outbreak_response_immunization_done
            ),
            "numberOfChildrenVaccinated": (
                record.number_of_children_vaccinated
            ),
            "outbreakResponseExplanation": (
                record.outbreak_response_explanation or ""
            ),
        },
    }

    return AFPInvestigationRead.model_validate(
        {
            "id": record.id,
            "createdAt": record.created_at,
            "updatedAt": record.updated_at,
            "data": data,
        }
    )
