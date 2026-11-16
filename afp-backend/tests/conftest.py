
"""Frontend-shaped fixture; no database, patient data, or network required."""

from copy import deepcopy
from datetime import date, timedelta
from uuid import uuid4

import pytest


def _display(day: date) -> str:
    return day.strftime("%d-%m-%Y")


def make_payload(today: date) -> dict:
    onset = _display(today - timedelta(days=7))
    pair = {"right": 0, "left": 5}
    return {
        "clinicalInformation": {
            "paralysisPresent": "yes",
            "paralysisFlaccid": "yes",
            "paralysisSuddenOnset": "yes",
            "paralysisOnsetDate": onset,
            "paralysisCausedByInjury": "no",
            "paralysisPresentAtBirth": "no",
        },
        "screeningDiagnosis": "",
        "signsSymptoms": {
            "feverWhenParalysisBegan": "unknown",
            "musclePainWhenParalysisBegan": "no",
            "siteOfParalysis": ["right_leg"],
            "otherParalysisSite": "",
            "paralysisAsymmetric": "yes",
            "paralysisMovedUpward": "no",
            "sensationPresentAtParalysisSite": "unknown",
            "childAtHealthFacility": "no",
            "healthFacility": {
                "selectedFacilityOption": "",
                "otherFacilityName": "",
                "notificationDate": "",
                "medicalRecordNumber": "",
            },
        },
        "vaccinationHistory": {
            "available": False,
            "opvCampaignDoses": {"recordSource": None, "numberOfDoses": None},
            "opvRoutineDoses": {"recordSource": None, "numberOfDoses": None},
            "lastOpvDoseBeforeParalysisDate": "",
            "ipvDoses": {"recordSource": None, "numberOfDoses": None},
            "lastIpvDoseBeforeParalysisDate": "",
            "opvGivenAfterParalysis": None,
            "opvAfterParalysisDate": "",
        },
        "travelHistory": {
            "travelOutsideAreaLast30Days": False,
            "notifiedToConcernedDsfpSimo": False,
            "notificationDate": "",
        },
        "clinicalExamination": {
            "reflexes": {
                "scores": {
                    "rightBiceps": "0", "leftBiceps": "1+",
                    "rightBrachioradialis": "2+", "leftBrachioradialis": "3+",
                    "rightPatellar": "4+", "leftPatellar": "0",
                    "rightAchilles": "2+", "leftAchilles": "2+",
                },
                "rightPlantarReflex": "flexor",
                "leftPlantarReflex": "equivocal",
            },
            "muscleStrength": {
                "upperLimb": {
                    name: deepcopy(pair) for name in (
                        "flexWrist", "extendWrist", "flexElbow",
                        "extendElbow", "flexShoulder", "extendShoulder",
                        "handGrip",
                    )
                },
                "lowerLimb": {
                    name: deepcopy(pair) for name in (
                        "flexHip", "extendHip", "flexKnee",
                        "extendKnee", "flexAnkle", "extendAnkle",
                    )
                },
            },
        },
        "previousHealthcareContacts": {
            "contacts": [{
                "id": f"contact-{uuid4().hex}",
                "providerName": "Test provider",
                "address": "Test address",
                "dateCaseVisited": _display(today - timedelta(days=2)),
                "alreadyInNetwork": "unknown",
                "reportedCase": "no",
                "actionTakenPlanned": "Test plan",
            }],
            "firstContactCategory": "Regd doctor",
            "firstContactCategoryOther": "",
            "additionalComments": "",
            "suspectedDiagnosis": "",
        },
        "additionalInformation": {
            "searchForAdditionalCases": "pending",
            "additionalCasesIdentified": None,
            "numberOfAdditionalCases": None,
            "outbreakResponseImmunizationDone": "pending",
            "numberOfChildrenVaccinated": None,
            "outbreakResponseExplanation": "",
        },
    }


@pytest.fixture
def today() -> date:
    return date(2026, 11, 16)


@pytest.fixture
def payload(today: date) -> dict:
    return make_payload(today)
