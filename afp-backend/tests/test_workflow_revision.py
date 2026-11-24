
"""Deterministic AFP and independent ORI validation tests."""

from copy import deepcopy
from datetime import date, timedelta

import pytest

from app.schemas.afp import AFPFormData, ORIFormData
from app.schemas.validation import (
    get_onset_guidance,
    validate_afp_form,
    validate_ori_form,
)
from tests.conftest import make_payload


TODAY = date(2026, 11, 23)


def form():
    return make_payload(TODAY)


def validate(payload):
    return validate_afp_form(
        payload,
        today=TODAY,
    )


def ori_data():
    return {
        "searchForAdditionalCases": "pending",
        "additionalCasesIdentified": None,
        "numberOfAdditionalCases": None,
        "outbreakResponseImmunizationDone": "pending",
        "numberOfChildrenVaccinated": None,
        "outbreakResponseExplanation": "",
    }


@pytest.mark.parametrize(
    "age,status,guidance",
    [
        (0, "eligible", None),
        (60, "eligible", None),
        (90, "eligible", None),
        (91, "eligible", "investigate_without_stool"),
        (179, "eligible", "investigate_without_stool"),
        (180, "eligible", "investigate_without_stool"),
        (181, "not_eligible", "no_investigation"),
        (360, "not_eligible", "no_investigation"),
    ],
)
def test_onset_boundaries(age, status, guidance):
    payload = form()

    onset = TODAY - timedelta(days=age)

    payload["clinicalInformation"]["paralysisOnsetDate"] = (
        onset.strftime("%d-%m-%Y")
    )

    actual = validate(payload)

    assert actual.is_valid, actual.errors
    assert actual.screening_status == status

    assert get_onset_guidance(
        onset,
        TODAY,
    ) == guidance


@pytest.mark.parametrize(
    "field,value",
    [
        ("paralysisPresent", "no"),
        ("paralysisFlaccid", "no"),
        ("paralysisSuddenOnset", "no"),
        ("paralysisCausedByInjury", "yes"),
        ("paralysisPresentAtBirth", "yes"),
    ],
)
def test_disqualifying_answer_hides_dependents(
    field,
    value,
):
    payload = form()

    payload["clinicalInformation"][field] = value

    payload["signsSymptoms"]["siteOfParalysis"] = []

    payload["clinicalExamination"]["reflexes"]["scores"][
        "rightTriceps"
    ] = None

    result = validate(payload)

    assert result.screening_status == "not_eligible"
    assert result.is_valid


def test_facility_and_hospital_record_optional_when_q7_yes():
    payload = form()

    payload["signsSymptoms"]["childAtHealthFacility"] = "yes"

    facility = payload["signsSymptoms"]["healthFacility"]

    assert facility == {
        "selectedFacilityOption": "",
        "otherFacilityName": "",
        "notificationDate": "",
        "medicalRecordNumber": "",
    }

    assert validate(payload).is_valid

    facility["notificationDate"] = "31-02-2026"

    assert (
        "signsSymptoms.healthFacility.notificationDate"
        in validate(payload).errors
    )


def test_all_optional_contacts_and_required_diagnosis():
    payload = form()

    history = payload["previousHealthcareContacts"]

    history["contacts"] = []
    history["firstContactCategory"] = None
    history["firstContactCategoryOther"] = ""
    history["additionalComments"] = ""

    assert validate(payload).is_valid

    history["contacts"].append({
        "id": "blank-1",
        "providerName": "",
        "address": "",
        "dateCaseVisited": "",
        "alreadyInNetwork": None,
        "reportedCase": None,
        "actionTakenPlanned": "",
    })

    assert validate(payload).is_valid

    history["contacts"][0]["dateCaseVisited"] = "01-12-2026"

    assert (
        "previousHealthcareContacts.contacts.blank-1.dateCaseVisited"
        in validate(payload).errors
    )

    history["contacts"][0]["dateCaseVisited"] = ""

    history["suspectedDiagnosis"] = ""

    assert (
        "previousHealthcareContacts.suspectedDiagnosis"
        in validate(payload).errors
    )


@pytest.mark.parametrize(
    "diagnosis",
    [
        "Polio",
        "GBS",
        "TM",
        "Encephalitis",
        "Meningitis",
        "Enterovirus",
        "Eco virus",
        "Traumatic neuritis",
        "Tumor",
        "Paralytic disease",
        "Diphtheria neuropathy",
        "A custom uncommon disease",
    ],
)
def test_known_and_free_text_diagnoses(diagnosis):
    payload = form()

    payload["previousHealthcareContacts"]["suspectedDiagnosis"] = (
        diagnosis
    )

    assert validate(payload).is_valid


def test_other_placeholder_not_a_custom_disease():
    payload = form()

    payload["previousHealthcareContacts"]["suspectedDiagnosis"] = (
        "Other"
    )

    assert (
        "previousHealthcareContacts.suspectedDiagnosisOther"
        in validate(payload).errors
    )


def test_afp_rejects_old_nested_ori_section():
    payload = form()

    payload["additionalInformation"] = ori_data()

    assert "additionalInformation" in validate(payload).errors


def test_seven_sections_and_literal_score_storage():
    payload = form()

    scores = payload["clinicalExamination"]["reflexes"]["scores"]

    scores["rightTriceps"] = "2+"
    scores["leftTriceps"] = "4+"

    assert (
        payload["clinicalExamination"]["muscleStrength"]
        ["upperLimb"]["flexWrist"]["right"]
    ) == 0

    assert (
        payload["clinicalExamination"]["reflexes"]
        ["rightPlantarReflex"]
    ) == "flexor"

    data = AFPFormData.model_validate(payload).model_dump(
        mode="json",
        by_alias=True,
    )

    assert len(data) == 7
    assert data == payload

    assert scores["rightTriceps"] == "2+"

    assert isinstance(
        data["clinicalExamination"]["muscleStrength"]
        ["upperLimb"]["flexWrist"]["right"],
        int,
    )


def test_ori_its_own_contract():
    data = ori_data()

    result = validate_ori_form(data)

    assert result.is_valid

    assert result.data is not None

    assert result.data.model_dump(
        mode="json",
        by_alias=True,
    ) == data

    assert ORIFormData.model_validate(data).model_dump(
        mode="json",
        by_alias=True,
    ) == data


def test_ori_conditional_counts_and_zero():
    data = ori_data()

    data.update({
        "searchForAdditionalCases": "yes",
        "additionalCasesIdentified": "yes",
        "outbreakResponseImmunizationDone": "yes",
    })

    result = validate_ori_form(data)

    assert {
        "additionalInformation.numberOfAdditionalCases",
        "additionalInformation.numberOfChildrenVaccinated",
    }.issubset(result.errors)

    data.update({
        "numberOfAdditionalCases": 0,
        "numberOfChildrenVaccinated": 0,
    })

    assert validate_ori_form(data).is_valid

    data["outbreakResponseImmunizationDone"] = "no"

    assert (
        "additionalInformation.outbreakResponseExplanation"
        in validate_ori_form(data).errors
    )

    data["outbreakResponseExplanation"] = (
        "Locally documented explanation"
    )

    assert validate_ori_form(data).is_valid
