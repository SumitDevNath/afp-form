"""Tests for the ten-score AFP reflex contract; no live database required."""

from copy import deepcopy
from datetime import date

import pytest

from app.models.afp import AFPClinicalExamination, REFLEX_FIELDS
from app.schemas.afp import AFPFormData
from app.schemas.validation import validate_afp_form
from app.services.afp import _examination_values
from tests.conftest import make_payload

TODAY = date(2026, 11, 16)


def test_ten_reflex_scores_round_trip_and_sqlalchemy_columns():
    payload = make_payload(TODAY)
    scores = payload["clinicalExamination"]["reflexes"]["scores"]
    assert len(scores) == len(REFLEX_FIELDS) == 10
    data = AFPFormData.model_validate(payload)
    assert data.model_dump(mode="json", by_alias=True) == payload
    mapped = _examination_values(data)
    assert mapped["right_triceps"] == "2+"
    assert mapped["left_triceps"] == "3+"
    assert "right_triceps" in AFPClinicalExamination.__table__.columns
    assert "left_triceps" in AFPClinicalExamination.__table__.columns


@pytest.mark.parametrize("field", ["rightTriceps", "leftTriceps"])
def test_missing_triceps_property_rejected_structurally(field):
    payload = make_payload(TODAY)
    del payload["clinicalExamination"]["reflexes"]["scores"][field]
    result = validate_afp_form(payload, today=TODAY)
    assert not result.is_valid
    assert f"clinicalExamination.reflexes.scores.{field}" in result.errors


@pytest.mark.parametrize("field", ["rightTriceps", "leftTriceps"])
def test_null_triceps_rejected_for_eligible_records(field):
    payload = make_payload(TODAY)
    payload["clinicalExamination"]["reflexes"]["scores"][field] = None
    result = validate_afp_form(payload, today=TODAY)
    assert not result.is_valid
    assert result.errors[f"clinicalExamination.reflexes.scores.{field}"] == "Select reflex score."


@pytest.mark.parametrize("wrong_value", [0, False, "5+", "normal"])
def test_invalid_reflex_values_rejected(wrong_value):
    payload = make_payload(TODAY)
    payload["clinicalExamination"]["reflexes"]["scores"]["rightTriceps"] = wrong_value
    result = validate_afp_form(payload, today=TODAY)
    assert "clinicalExamination.reflexes.scores.rightTriceps" in result.errors


def test_screened_out_allows_not_assessed_triceps():
    payload = make_payload(TODAY)
    payload["clinicalInformation"]["paralysisPresent"] = "no"
    payload["clinicalExamination"]["reflexes"]["scores"]["rightTriceps"] = None
    payload["clinicalExamination"]["reflexes"]["scores"]["leftTriceps"] = None
    result = validate_afp_form(payload, today=TODAY)
    assert result.is_valid
    assert result.screening_status == "not_eligible"


def test_new_field_constraints_mirror_existing_reflex_constraints():
    constraints = {c.name for c in AFPClinicalExamination.__table__.constraints}
    assert "ck_afp_exam_right_triceps" in constraints
    assert "ck_afp_exam_left_triceps" in constraints


def test_all_five_allowed_codes_accepted():
    for score in ("0", "1+", "2+", "3+", "4+"):
        payload = make_payload(TODAY)
        payload["clinicalExamination"]["reflexes"]["scores"].update({
            "rightTriceps": score,
            "leftTriceps": score,
        })
        assert validate_afp_form(payload, today=TODAY).is_valid
