import type { AFPFormData } from "../types/afp.types";
import {
  isFutureDate,
  isValidCalendarDate,
  isValidDateFormat,
} from "../utils/afpDate.utils";
import type { AFPValidationErrors } from "./afpValidation";
import { isAFPValueMissing, requireAFPField } from "./afpValidation";

/** Only the Clinical Information section. Others will be added section-by-section. */
export function validateClinicalInformation(data: AFPFormData): AFPValidationErrors {
  const errors: AFPValidationErrors = {};
  const clinical = data.clinicalInformation;

  const yesNoFields = [
    "paralysisPresent",
    "paralysisFlaccid",
    "paralysisSuddenOnset",
    "paralysisCausedByInjury",
    "paralysisPresentAtBirth",
  ] as const;

  const questionNumbers = [1, 2, 3, 5, 6] as const;

  yesNoFields.forEach((field, index) => {
    if (isAFPValueMissing(clinical[field])) {
      errors[`clinicalInformation.${field}`] =
        `Please select Yes or No for question ${questionNumbers[index]}.`;
    }
  });

  const dateKey = "clinicalInformation.paralysisOnsetDate";
  const date = clinical.paralysisOnsetDate;

  requireAFPField(errors, dateKey, date, "Date of paralysis onset");
  if (!errors[dateKey] && !isValidDateFormat(date)) {
    errors[dateKey] = "Enter date in DD-MM-YYYY format.";
  } else if (!errors[dateKey] && !isValidCalendarDate(date)) {
    errors[dateKey] = "Enter a valid calendar date.";
  } else if (!errors[dateKey] && isFutureDate(date)) {
    errors[dateKey] = "Future dates are not allowed.";
  }

  // 'Specify the diagnosis, if known' is intentionally optional.
  // Existing screening eligibility and dependent-data reset rules remain unchanged.
  return errors;
}
