
"""Phase 4 unit tests for the complete AFP frontend contract."""

from copy import deepcopy
from datetime import timedelta

import pytest

from app.schemas.validation import validate_afp_form


def check(payload: dict, today, **kwargs):
    return validate_afp_form(payload, today=today, **kwargs)


def test_valid_eligible_payload_and_json_roundtrip(payload, today):
    result = check(payload, today)
    assert result.is_valid, result.errors
    assert result.screening_status == "eligible"
    assert result.data.model_dump(mode="json", by_alias=True) == payload
    assert result.data.clinical_information.paralysis_onset_date == (
        today - timedelta(days=7)
    )


def test_unanswered_screening_is_pending_without_hidden_errors(payload, today):
    for key in (
        "paralysisPresent", "paralysisFlaccid", "paralysisSuddenOnset",
        "paralysisCausedByInjury", "paralysisPresentAtBirth",
    ):
        payload["clinicalInformation"][key] = None
    payload["clinicalInformation"]["paralysisOnsetDate"] = ""
    payload["signsSymptoms"]["siteOfParalysis"] = []
    result = check(payload, today)
    assert result.screening_status == "pending"
    assert set(result.errors) == {
        "clinicalInformation.paralysisPresent",
        "clinicalInformation.paralysisFlaccid",
        "clinicalInformation.paralysisSuddenOnset",
        "clinicalInformation.paralysisOnsetDate",
        "clinicalInformation.paralysisCausedByInjury",
        "clinicalInformation.paralysisPresentAtBirth",
    }


@pytest.mark.parametrize("days,status", [
    (0, "eligible"), (59, "eligible"), (60, "not_eligible"), (61, "not_eligible"),
])
def test_onset_boundary(payload, today, days, status):
    payload["clinicalInformation"]["paralysisOnsetDate"] = (
        today - timedelta(days=days)
    ).strftime("%d-%m-%Y")
    result = check(payload, today)
    assert result.screening_status == status
    assert result.is_valid


def test_future_onset_is_pending_and_invalid(payload, today):
    payload["clinicalInformation"]["paralysisOnsetDate"] = (
        today + timedelta(days=1)
    ).strftime("%d-%m-%Y")
    result = check(payload, today)
    assert result.screening_status == "pending"
    assert "clinicalInformation.paralysisOnsetDate" in result.errors


def test_disqualifying_answer_suppresses_hidden_section_requirements(payload, today):
    payload["clinicalInformation"]["paralysisPresent"] = "no"
    payload["signsSymptoms"]["siteOfParalysis"] = []
    payload["clinicalExamination"]["reflexes"]["scores"]["rightBiceps"] = None
    result = check(payload, today)
    assert result.screening_status == "not_eligible"
    assert not result.errors


@pytest.mark.parametrize("date_value", [
    "1-01-2026", "31-02-2026", "29-02-2025", "2026-01-01", "99-11-2026",
])
def test_invalid_date_format_or_calendar(payload, today, date_value):
    payload["clinicalInformation"]["paralysisOnsetDate"] = date_value
    result = check(payload, today)
    assert "clinicalInformation.paralysisOnsetDate" in result.errors


def test_leap_day_is_valid(payload, today):
    payload["clinicalInformation"]["paralysisOnsetDate"] = "29-02-2024"
    result = check(payload, today)
    assert result.screening_status == "not_eligible"
    assert not result.errors


def test_other_site_and_duplicate_site(payload, today):
    payload["signsSymptoms"]["siteOfParalysis"] = ["other"]
    result = check(payload, today)
    assert "signsSymptoms.otherParalysisSite" in result.errors

    payload["signsSymptoms"]["otherParalysisSite"] = "Trunk"
    payload["signsSymptoms"]["siteOfParalysis"] = ["other", "other"]
    assert "signsSymptoms.siteOfParalysis" in check(payload, today).errors


def test_health_facility_conditional(payload, today):
    signs = payload["signsSymptoms"]
    signs["childAtHealthFacility"] = "yes"
    signs["healthFacility"]["selectedFacilityOption"] = "__other__"
    errors = check(payload, today).errors
    assert {
        "signsSymptoms.healthFacility.otherFacilityName",
        "signsSymptoms.healthFacility.notificationDate",
        "signsSymptoms.healthFacility.medicalRecordNumber",
    }.issubset(errors)

    signs["healthFacility"].update({
        "otherFacilityName": "Development hospital",
        "notificationDate": today.strftime("%d-%m-%Y"),
        "medicalRecordNumber": "MR-123",
    })
    assert check(payload, today).is_valid


def test_vaccination_conditional_and_zero_doses(payload, today):
    vac = payload["vaccinationHistory"]
    vac["available"] = True
    assert "vaccinationHistory.opvCampaignDoses.recordSource" in check(payload, today).errors
    for key in ("opvCampaignDoses", "opvRoutineDoses", "ipvDoses"):
        vac[key] = {"recordSource": "card", "numberOfDoses": 0}
    vac["opvGivenAfterParalysis"] = "no"
    assert check(payload, today).is_valid

    vac["ipvDoses"]["numberOfDoses"] = 1
    assert "vaccinationHistory.lastIpvDoseBeforeParalysisDate" in check(payload, today).errors
    vac["lastIpvDoseBeforeParalysisDate"] = today.strftime("%d-%m-%Y")
    assert check(payload, today).is_valid

    vac["opvGivenAfterParalysis"] = "yes"
    assert "vaccinationHistory.opvAfterParalysisDate" in check(payload, today).errors


def test_travel_notification_requires_both_toggles(payload, today):
    travel = payload["travelHistory"]
    travel["notifiedToConcernedDsfpSimo"] = True
    assert check(payload, today).is_valid
    travel["travelOutsideAreaLast30Days"] = True
    assert "travelHistory.notificationDate" in check(payload, today).errors
    travel["notificationDate"] = today.strftime("%d-%m-%Y")
    assert check(payload, today).is_valid


def test_reflex_codes_and_muscle_integer_zero(payload, today):
    assert check(payload, today).is_valid
    payload["clinicalExamination"]["reflexes"]["scores"]["rightBiceps"] = 0
    assert "clinicalExamination.reflexes.scores.rightBiceps" in check(payload, today).errors
    payload["clinicalExamination"]["reflexes"]["scores"]["rightBiceps"] = "0"

    payload["clinicalExamination"]["muscleStrength"]["upperLimb"]["flexWrist"]["right"] = 6
    assert (
        "clinicalExamination.muscleStrength.upperLimb.flexWrist.right"
        in check(payload, today).errors
    )


def test_boolean_is_not_a_muscle_score(payload, today):
    payload["clinicalExamination"]["muscleStrength"]["upperLimb"]["flexWrist"]["right"] = False
    assert "clinicalExamination.muscleStrength.upperLimb.flexWrist.right" in check(payload, today).errors


def test_contact_stable_id_on_invalid_date(payload, today):
    contact = payload["previousHealthcareContacts"]["contacts"][0]
    contact["id"] = "contact-fallback-123"
    contact["dateCaseVisited"] = "31-02-2026"
    result = check(payload, today)
    assert (
        "previousHealthcareContacts.contacts.contact-fallback-123.dateCaseVisited"
        in result.errors
    )


def test_repeated_contacts_duplicate_id_and_order(payload, today):
    contacts = payload["previousHealthcareContacts"]["contacts"]
    second = deepcopy(contacts[0])
    second["id"] = "contact-new-456"
    contacts.append(second)
    assert check(payload, today).is_valid
    second["id"] = contacts[0]["id"]
    assert (
        f"previousHealthcareContacts.contacts.{second['id']}.providerName"
        in check(payload, today).errors
    )


def test_first_contact_other_and_diagnosis_flag(payload, today):
    history = payload["previousHealthcareContacts"]
    history["firstContactCategory"] = "Other"
    assert "previousHealthcareContacts.firstContactCategoryOther" in check(payload, today).errors
    history["firstContactCategoryOther"] = "Community provider"
    assert check(payload, today).is_valid
    assert "previousHealthcareContacts.suspectedDiagnosis" in check(
        payload, today, require_suspected_diagnosis=True
    ).errors


def test_additional_conditional_and_zero_counts(payload, today):
    info = payload["additionalInformation"]
    info["searchForAdditionalCases"] = "yes"
    info["additionalCasesIdentified"] = "yes"
    info["outbreakResponseImmunizationDone"] = "yes"
    errors = check(payload, today).errors
    assert "additionalInformation.numberOfAdditionalCases" in errors
    assert "additionalInformation.numberOfChildrenVaccinated" in errors
    info["numberOfAdditionalCases"] = 0
    info["numberOfChildrenVaccinated"] = 0
    assert check(payload, today).is_valid

    info["outbreakResponseImmunizationDone"] = "no"
    assert "additionalInformation.outbreakResponseExplanation" in check(payload, today).errors
    info["outbreakResponseExplanation"] = "Not applicable"
    assert check(payload, today).is_valid


def test_negative_counts_and_boolean_count_are_invalid(payload, today):
    payload["additionalInformation"]["numberOfChildrenVaccinated"] = -1
    assert "additionalInformation.numberOfChildrenVaccinated" in check(payload, today).errors
    payload["additionalInformation"]["numberOfChildrenVaccinated"] = False
    assert "additionalInformation.numberOfChildrenVaccinated" in check(payload, today).errors


def test_malformed_contacts_container_has_safe_error(payload, today):
    payload["previousHealthcareContacts"] = "malformed"
    result = check(payload, today)
    assert "previousHealthcareContacts" in result.errors


def test_extra_properties_and_bool_strings_rejected(payload, today):
    payload["admin"] = True
    assert "admin" in check(payload, today).errors
    payload.pop("admin")
    payload["travelHistory"]["notifiedToConcernedDsfpSimo"] = "false"
    assert "travelHistory.notifiedToConcernedDsfpSimo" in check(payload, today).errors


def test_hidden_empty_date_roundtrips_as_empty_string(payload, today):
    result = check(payload, today)
    assert result.is_valid
    assert result.data.model_dump(mode="json", by_alias=True)["travelHistory"]["notificationDate"] == ""
