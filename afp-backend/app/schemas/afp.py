
"""Pydantic v2 representation of the AFP frontend's complete JSON shape.

This is a validation contract, NOT an approved NDSS persistence contract.
"""

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StrictBool
from pydantic.alias_generators import to_camel

from app.utils.dates import FormDate


YesNo = Literal["yes", "no"] | None
YesNoUnknown = Literal["yes", "no", "unknown"] | None
YesNoPending = Literal["yes", "no", "pending"] | None
ReflexCode = Literal["0", "1+", "2+", "3+", "4+"] | None
PlantarCode = Literal["flexor", "extensor", "equivocal"] | None
MuscleScore = Annotated[int, Field(strict=True, ge=0, le=5)] | None
Source = Literal["card", "history"] | None
DoseCount = Annotated[int, Field(strict=True, ge=0, le=10)] | None
NonNegativeCount = Annotated[int, Field(strict=True, ge=0, le=2147483647)] | None
ParalysisSite = Literal[
    "right_arm", "left_arm", "right_leg", "left_leg", "neck", "face", "other"
]
ContactCategory = Literal[
    "Regd doctor", "GoB facility", "Village doctor", "NGO Clinic",
    "Homeopath", "Kabiraj", "Imam", "Pharmacist", "HA", "FWA", "Other",
] | None


class FrontendModel(BaseModel):
    """Strict frontend names and no unrecognized/mass-assigned properties."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        extra="forbid",
        strict=True,
    )


class ClinicalInformation(FrontendModel):
    paralysis_present: YesNo
    paralysis_flaccid: YesNo
    paralysis_sudden_onset: YesNo
    paralysis_onset_date: FormDate
    paralysis_caused_by_injury: YesNo
    paralysis_present_at_birth: YesNo


class HealthFacility(FrontendModel):
    selected_facility_option: str
    other_facility_name: str = Field(max_length=200)
    notification_date: FormDate
    medical_record_number: str = Field(max_length=100)


class SignsSymptoms(FrontendModel):
    fever_when_paralysis_began: YesNoUnknown
    muscle_pain_when_paralysis_began: YesNoUnknown
    site_of_paralysis: list[ParalysisSite]
    other_paralysis_site: str = Field(max_length=150)
    paralysis_asymmetric: YesNoUnknown
    paralysis_moved_upward: YesNoUnknown
    sensation_present_at_paralysis_site: YesNoUnknown
    child_at_health_facility: YesNoUnknown
    health_facility: HealthFacility


class VaccinationDose(FrontendModel):
    record_source: Source
    number_of_doses: DoseCount


class VaccinationHistory(FrontendModel):
    available: StrictBool
    opv_campaign_doses: VaccinationDose
    opv_routine_doses: VaccinationDose
    last_opv_dose_before_paralysis_date: FormDate
    ipv_doses: VaccinationDose
    last_ipv_dose_before_paralysis_date: FormDate
    opv_given_after_paralysis: YesNoUnknown
    opv_after_paralysis_date: FormDate


class TravelHistory(FrontendModel):
    travel_outside_area_last30_days: StrictBool = Field(alias="travelOutsideAreaLast30Days")
    notified_to_concerned_dsfp_simo: StrictBool
    notification_date: FormDate


class ReflexScores(FrontendModel):
    right_biceps: ReflexCode
    left_biceps: ReflexCode
    right_triceps: ReflexCode
    left_triceps: ReflexCode
    right_brachioradialis: ReflexCode
    left_brachioradialis: ReflexCode
    right_patellar: ReflexCode
    left_patellar: ReflexCode
    right_achilles: ReflexCode
    left_achilles: ReflexCode


class ReflexExamination(FrontendModel):
    scores: ReflexScores
    right_plantar_reflex: PlantarCode
    left_plantar_reflex: PlantarCode


class MusclePair(FrontendModel):
    right: MuscleScore
    left: MuscleScore


class UpperLimb(FrontendModel):
    flex_wrist: MusclePair
    extend_wrist: MusclePair
    flex_elbow: MusclePair
    extend_elbow: MusclePair
    flex_shoulder: MusclePair
    extend_shoulder: MusclePair
    hand_grip: MusclePair


class LowerLimb(FrontendModel):
    flex_hip: MusclePair
    extend_hip: MusclePair
    flex_knee: MusclePair
    extend_knee: MusclePair
    flex_ankle: MusclePair
    extend_ankle: MusclePair


class MuscleStrength(FrontendModel):
    upper_limb: UpperLimb
    lower_limb: LowerLimb


class ClinicalExamination(FrontendModel):
    reflexes: ReflexExamination
    muscle_strength: MuscleStrength


class HealthcareContact(FrontendModel):
    id: str = Field(min_length=1, max_length=255, pattern=r"^[A-Za-z0-9_-]+$")
    provider_name: str = Field(max_length=250)
    address: str = Field(max_length=500)
    date_case_visited: FormDate
    already_in_network: YesNoUnknown
    reported_case: YesNo
    action_taken_planned: str = Field(max_length=500)


class PreviousHealthcareContacts(FrontendModel):
    contacts: list[HealthcareContact]
    first_contact_category: ContactCategory
    first_contact_category_other: str = Field(max_length=150)
    additional_comments: str = Field(max_length=1000)
    suspected_diagnosis: str = Field(max_length=250)


class ORIFormData(FrontendModel):
    """Independent /ori frontend payload, not an AFP investigation section."""
    search_for_additional_cases: YesNoPending
    additional_cases_identified: YesNo
    number_of_additional_cases: NonNegativeCount
    outbreak_response_immunization_done: YesNoPending
    number_of_children_vaccinated: NonNegativeCount
    outbreak_response_explanation: str = Field(max_length=500)


class AFPFormData(FrontendModel):
    """Seven-section AFP investigation payload; ORI is independent."""

    clinical_information: ClinicalInformation
    previous_healthcare_contacts: PreviousHealthcareContacts
    screening_diagnosis: str = Field(max_length=250)
    signs_symptoms: SignsSymptoms
    vaccination_history: VaccinationHistory
    travel_history: TravelHistory
    clinical_examination: ClinicalExamination
