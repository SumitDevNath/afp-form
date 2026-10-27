import type { AFPFormData, AFPVaccinationDoseEntry } from "../types/afp.types";

import { getAFPScreeningStatus } from "../utils/afpScreening.utils";

import {
  isFutureDate,
  isValidCalendarDate,
  isValidDateFormat,
} from "../utils/afpDate.utils";

import { isAFPValueMissing, type AFPValidationErrors } from "./afpValidation";

function validateDoseEntry(
  errors: AFPValidationErrors,
  fieldId: string,
  entry: AFPVaccinationDoseEntry,
): void {
  // Card / History is required.
  if (isAFPValueMissing(entry.recordSource)) {
    errors[`${fieldId}.recordSource`] = "Select source.";
  }

  // Zero doses is valid. Only null means unanswered.
  if (isAFPValueMissing(entry.numberOfDoses)) {
    errors[`${fieldId}.numberOfDoses`] = "Select doses.";
  }
}

function validateVaccinationDate(
  errors: AFPValidationErrors,
  fieldId: string,
  value: string,
  label: string,
  required: boolean,
): void {
  if (!value.trim()) {
    if (required) {
      errors[fieldId] = `${label} is not filled in.`;
    }

    return;
  }

  if (!isValidDateFormat(value)) {
    errors[fieldId] = "Enter date in DD-MM-YYYY format.";
    return;
  }

  if (!isValidCalendarDate(value)) {
    errors[fieldId] = "Enter a valid calendar date.";
    return;
  }

  if (isFutureDate(value)) {
    errors[fieldId] = "Future dates are not allowed.";
  }
}

export function validateVaccinationHistory(
  data: AFPFormData,
): AFPValidationErrors {
  const errors: AFPValidationErrors = {};

  // Vaccination History is hidden unless screening is eligible.
  if (getAFPScreeningStatus(data.clinicalInformation) !== "eligible") {
    return errors;
  }

  const vaccination = data.vaccinationHistory;

  // When unavailable, all dependent questions are excluded.
  if (!vaccination.available) {
    return errors;
  }

  // Question 1: OPV campaign doses.
  validateDoseEntry(
    errors,
    "vaccinationHistory.opvCampaignDoses",
    vaccination.opvCampaignDoses,
  );

  // Question 2: OPV routine doses.
  validateDoseEntry(
    errors,
    "vaccinationHistory.opvRoutineDoses",
    vaccination.opvRoutineDoses,
  );

  // Question 4: IPV doses.
  validateDoseEntry(
    errors,
    "vaccinationHistory.ipvDoses",
    vaccination.ipvDoses,
  );

  // Question 3: Last OPV date.
  const hasOpvDoses =
    (vaccination.opvCampaignDoses.numberOfDoses ?? 0) > 0 ||
    (vaccination.opvRoutineDoses.numberOfDoses ?? 0) > 0;

  validateVaccinationDate(
    errors,
    "vaccinationHistory.lastOpvDoseBeforeParalysisDate",
    vaccination.lastOpvDoseBeforeParalysisDate,
    "Date of last OPV dose",
    hasOpvDoses,
  );

  // Question 5: Last IPV date.
  const hasIpvDoses = (vaccination.ipvDoses.numberOfDoses ?? 0) > 0;

  validateVaccinationDate(
    errors,
    "vaccinationHistory.lastIpvDoseBeforeParalysisDate",
    vaccination.lastIpvDoseBeforeParalysisDate,
    "Date of last IPV dose",
    hasIpvDoses,
  );

  // Question 6: OPV given after paralysis onset.
  if (isAFPValueMissing(vaccination.opvGivenAfterParalysis)) {
    errors["vaccinationHistory.opvGivenAfterParalysis"] =
      "Please select Yes, No or Unknown for question 6.";
  }

  // Question 6 conditional date.
  if (vaccination.opvGivenAfterParalysis === "yes") {
    validateVaccinationDate(
      errors,
      "vaccinationHistory.opvAfterParalysisDate",
      vaccination.opvAfterParalysisDate,
      "Date of the OPV",
      true,
    );
  }

  return errors;
}
