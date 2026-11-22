
"""Pure AFP validation, compatible with existing frontend field IDs.

The caller must check `result.errors` before any persistence.
"""

from dataclasses import dataclass
from datetime import date, datetime
import re
from typing import Any, Literal
from zoneinfo import ZoneInfo

from pydantic import ValidationError
from pydantic.alias_generators import to_camel

from app.schemas.afp import AFPFormData


ScreeningStatus = Literal["pending", "eligible", "not_eligible"]
FieldErrors = dict[str, str]


@dataclass(frozen=True)
class AFPValidationResult:
    data: AFPFormData | None
    screening_status: ScreeningStatus
    errors: FieldErrors

    @property
    def is_valid(self) -> bool:
        return self.data is not None and not self.errors


def _error_path(parts: tuple[Any, ...], raw: Any) -> str:
    """Resolve list indices to stable frontend contact IDs when possible."""
    result: list[str] = []
    for index, part in enumerate(parts):
        if (
            isinstance(part, int)
            and len(result) >= 2
            and result[-2:] == ["previousHealthcareContacts", "contacts"]
        ):
            history = raw.get("previousHealthcareContacts") if isinstance(raw, dict) else None
            contacts = history.get("contacts", []) if isinstance(history, dict) else []
            contact = contacts[part] if isinstance(contacts, list) and part < len(contacts) else {}
            client_id = contact.get("id") if isinstance(contact, dict) else None
            if isinstance(client_id, str) and re.fullmatch(r"[A-Za-z0-9_-]{1,255}", client_id):
                result.append(client_id)
            else:
                result.append(str(part))
        elif isinstance(part, int) and result == ["signsSymptoms", "siteOfParalysis"]:
            # The frontend has one checkbox-group field ID, not per-item IDs.
            continue
        else:
            result.append(str(part))
    return ".".join(result)


def _structural_errors(exc: ValidationError, raw: Any) -> FieldErrors:
    errors: FieldErrors = {}
    for error in exc.errors(include_input=False):
        field = _error_path(error["loc"], raw)
        kind = error["type"]
        if kind == "missing":
            message = "Required field is missing."
        elif kind in {"date_format", "date_calendar"}:
            message = error["msg"]
        elif kind in {"string_too_long", "too_long"}:
            message = "Value exceeds the allowed length."
        elif kind == "greater_than_equal":
            message = "Enter a nonnegative number."
        elif kind == "less_than_equal":
            message = "Number exceeds the allowed range."
        else:
            message = "Enter a valid value."
        errors.setdefault(field, message)
    return errors


def get_screening_status(data: AFPFormData, today: date) -> ScreeningStatus:
    clinical = data.clinical_information
    if (
        clinical.paralysis_present == "no"
        or clinical.paralysis_flaccid == "no"
        or clinical.paralysis_sudden_onset == "no"
        or clinical.paralysis_caused_by_injury == "yes"
        or clinical.paralysis_present_at_birth == "yes"
    ):
        return "not_eligible"

    answers = (
        clinical.paralysis_present,
        clinical.paralysis_flaccid,
        clinical.paralysis_sudden_onset,
        clinical.paralysis_caused_by_injury,
        clinical.paralysis_present_at_birth,
    )
    if None in answers:
        return "pending"

    onset = clinical.paralysis_onset_date
    if onset is None or onset > today:
        return "pending"

    return "eligible" if (today - onset).days < 60 else "not_eligible"


def _required(errors: FieldErrors, path: str, value: object, message: str) -> None:
    if value is None or (isinstance(value, str) and not value.strip()):
        errors[path] = message


def _date(
    errors: FieldErrors,
    path: str,
    value: date | None,
    today: date,
    required: bool = False,
) -> None:
    if value is None:
        if required:
            errors[path] = "Enter a date."
    elif value > today:
        errors[path] = "Future dates are not allowed."


def _complete_rules(
    data: AFPFormData,
    today: date,
    status: ScreeningStatus,
    require_suspected_diagnosis: bool,
) -> FieldErrors:
    errors: FieldErrors = {}
    clinical = data.clinical_information

    for number, field in (
        (1, "paralysis_present"), (2, "paralysis_flaccid"),
        (3, "paralysis_sudden_onset"), (5, "paralysis_caused_by_injury"),
        (6, "paralysis_present_at_birth"),
    ):
        _required(
            errors,
            f"clinicalInformation.{_camel(field)}",
            getattr(clinical, field),
            f"Please select Yes or No for question {number}.",
        )
    _date(
        errors, "clinicalInformation.paralysisOnsetDate",
        clinical.paralysis_onset_date, today, required=True,
    )

    # Frontend hides the following sections unless screening is eligible.
    if status != "eligible":
        return errors

    signs = data.signs_symptoms
    for number, field in (
        (1, "fever_when_paralysis_began"),
        (2, "muscle_pain_when_paralysis_began"),
        (4, "paralysis_asymmetric"),
        (5, "paralysis_moved_upward"),
        (6, "sensation_present_at_paralysis_site"),
        (7, "child_at_health_facility"),
    ):
        _required(
            errors, f"signsSymptoms.{_camel(field)}",
            getattr(signs, field),
            f"Please select Yes, No or Unknown for question {number}.",
        )

    sites = signs.site_of_paralysis
    if not sites:
        errors["signsSymptoms.siteOfParalysis"] = "Select at least one site of paralysis."
    elif len(sites) != len(set(sites)):
        errors["signsSymptoms.siteOfParalysis"] = "Select each site only once."

    if "other" in sites:
        _required(
            errors, "signsSymptoms.otherParalysisSite",
            signs.other_paralysis_site, "Other site of paralysis is not filled in.",
        )

    if signs.child_at_health_facility == "yes":
        facility = signs.health_facility
        prefix = "signsSymptoms.healthFacility"
        _required(errors, f"{prefix}.selectedFacilityOption",
                  facility.selected_facility_option, "Health facility is not filled in.")
        if facility.selected_facility_option == "__other__":
            _required(errors, f"{prefix}.otherFacilityName",
                      facility.other_facility_name, "Facility name is not filled in.")
        _date(errors, f"{prefix}.notificationDate",
              facility.notification_date, today, required=True)
        _required(errors, f"{prefix}.medicalRecordNumber",
                  facility.medical_record_number, "Medical record # is not filled in.")

    vaccination = data.vaccination_history
    if vaccination.available:
        for name in ("opv_campaign_doses", "opv_routine_doses", "ipv_doses"):
            entry = getattr(vaccination, name)
            prefix = f"vaccinationHistory.{_camel(name)}"
            _required(errors, f"{prefix}.recordSource", entry.record_source, "Select source.")
            _required(errors, f"{prefix}.numberOfDoses", entry.number_of_doses, "Select doses.")

        opv_count = (
            (vaccination.opv_campaign_doses.number_of_doses or 0)
            + (vaccination.opv_routine_doses.number_of_doses or 0)
        )
        _date(
            errors, "vaccinationHistory.lastOpvDoseBeforeParalysisDate",
            vaccination.last_opv_dose_before_paralysis_date,
            today, required=opv_count > 0,
        )
        _date(
            errors, "vaccinationHistory.lastIpvDoseBeforeParalysisDate",
            vaccination.last_ipv_dose_before_paralysis_date, today,
            required=(vaccination.ipv_doses.number_of_doses or 0) > 0,
        )
        _required(
            errors, "vaccinationHistory.opvGivenAfterParalysis",
            vaccination.opv_given_after_paralysis,
            "Please select Yes, No or Unknown for question 6.",
        )
        if vaccination.opv_given_after_paralysis == "yes":
            _date(errors, "vaccinationHistory.opvAfterParalysisDate",
                  vaccination.opv_after_paralysis_date, today, required=True)

    travel = data.travel_history
    if travel.travel_outside_area_last30_days and travel.notified_to_concerned_dsfp_simo:
        _date(errors, "travelHistory.notificationDate",
              travel.notification_date, today, required=True)

    reflexes = data.clinical_examination.reflexes
    for name in (
        "right_biceps",
        "left_biceps",
        "right_triceps",
        "left_triceps",
        "right_brachioradialis",
        "left_brachioradialis",
        "right_patellar",
        "left_patellar",
        "right_achilles",
        "left_achilles",
    ):
        _required(
            errors,
            f"clinicalExamination.reflexes.scores.{_camel(name)}",
            getattr(reflexes.scores, name),
            "Select reflex score.",
        )
    for name in ("right_plantar_reflex", "left_plantar_reflex"):
        _required(errors, f"clinicalExamination.reflexes.{_camel(name)}",
                  getattr(reflexes, name), "Select plantar reflex.")

    strength = data.clinical_examination.muscle_strength
    for limb_name in ("upper_limb", "lower_limb"):
        limb = getattr(strength, limb_name)
        for field_name in type(limb).model_fields:
            pair = getattr(limb, field_name)
            for side in ("right", "left"):
                _required(
                    errors,
                    f"clinicalExamination.muscleStrength.{_camel(limb_name)}."
                    f"{_camel(field_name)}.{side}",
                    getattr(pair, side), "Select a score.",
                )

    history = data.previous_healthcare_contacts
    if not history.contacts:
        errors["previousHealthcareContacts.contacts"] = "Add at least one contact."

    seen: set[str] = set()
    for contact in history.contacts:
        prefix = f"previousHealthcareContacts.contacts.{contact.id}"
        if contact.id in seen:
            errors[f"{prefix}.providerName"] = "Contact ID is duplicated."
        seen.add(contact.id)
        for field_name, label in (
            ("provider_name", "Provider name"),
            ("address", "Address"),
            ("action_taken_planned", "Action taken / planned"),
        ):
            _required(
                errors, f"{prefix}.{_camel(field_name)}",
                getattr(contact, field_name), f"{label} is not filled in.",
            )
        _date(errors, f"{prefix}.dateCaseVisited",
              contact.date_case_visited, today, required=True)
        _required(errors, f"{prefix}.alreadyInNetwork",
                  contact.already_in_network, "Select an answer.")
        _required(errors, f"{prefix}.reportedCase",
                  contact.reported_case, "Select Yes or No.")

    _required(
        errors, "previousHealthcareContacts.firstContactCategory",
        history.first_contact_category, "Category of the first contact is not filled in.",
    )
    if history.first_contact_category == "Other":
        _required(errors, "previousHealthcareContacts.firstContactCategoryOther",
                  history.first_contact_category_other,
                  "Other contact category is not filled in.")
    if require_suspected_diagnosis:
        _required(errors, "previousHealthcareContacts.suspectedDiagnosis",
                  history.suspected_diagnosis, "Suspected diagnosis is not filled in.")

    additional = data.additional_information
    _required(errors, "additionalInformation.searchForAdditionalCases",
              additional.search_for_additional_cases,
              "Search for additional AFP cases is not filled in.")
    if (
        additional.search_for_additional_cases == "yes"
        and additional.additional_cases_identified == "yes"
    ):
        _required(errors, "additionalInformation.numberOfAdditionalCases",
                  additional.number_of_additional_cases,
                  "Number of additional AFP cases is not filled in.")
    _required(errors, "additionalInformation.outbreakResponseImmunizationDone",
              additional.outbreak_response_immunization_done,
              "Outbreak response immunization is not filled in.")
    if additional.outbreak_response_immunization_done == "yes":
        _required(errors, "additionalInformation.numberOfChildrenVaccinated",
                  additional.number_of_children_vaccinated,
                  "Number of children vaccinated is not filled in.")
    elif additional.outbreak_response_immunization_done == "no":
        _required(errors, "additionalInformation.outbreakResponseExplanation",
                  additional.outbreak_response_explanation,
                  "Explanation is not filled in.")

    return errors


def _camel(name: str) -> str:
    return to_camel(name)


def validate_afp_form(
    payload: Any,
    *,
    today: date | None = None,
    require_suspected_diagnosis: bool = False,
) -> AFPValidationResult:
    """Validate the complete frontend JSON envelope without persistence.

    The explicit flag is true only when approved diagnosis options are supplied.
    Passing validation is not permission to persist shared-service data.
    """
    if today is None:
        # Provisional local business timezone; confirm NDSS convention later.
        today = datetime.now(ZoneInfo("Asia/Dhaka")).date()

    try:
        data = AFPFormData.model_validate(payload)
    except ValidationError as exc:
        return AFPValidationResult(
            data=None,
            screening_status="pending",
            errors=_structural_errors(exc, payload),
        )

    status = get_screening_status(data, today)
    errors = _complete_rules(data, today, status, require_suspected_diagnosis)
    return AFPValidationResult(data=data, screening_status=status, errors=errors)
