import type { AFPFormData } from "../types/afp.types";
import { AFP_OTHER_FACILITY_VALUE } from "../constants/afpFacilities";
import { getAFPScreeningStatus } from "../utils/afpScreening.utils";

import {
  isFutureDate,
  isValidCalendarDate,
  isValidDateFormat,
} from "../utils/afpDate.utils";

import {
  isAFPValueMissing,
  requireAFPField,
  type AFPValidationErrors,
} from "./afpValidation";

export function validateSignsSymptoms(data: AFPFormData): AFPValidationErrors {
  const errors: AFPValidationErrors = {};

  // Do not validate sections hidden by AFP screening.
  if (getAFPScreeningStatus(data.clinicalInformation) !== "eligible") {
    return errors;
  }

  const signs = data.signsSymptoms;

  // Questions 1, 2, 4, 5, 6, 7
  const yesNoUnknownQuestions = [
    { number: 1, field: "feverWhenParalysisBegan" },
    { number: 2, field: "musclePainWhenParalysisBegan" },
    { number: 4, field: "paralysisAsymmetric" },
    { number: 5, field: "paralysisMovedUpward" },
    { number: 6, field: "sensationPresentAtParalysisSite" },
    { number: 7, field: "childAtHealthFacility" },
  ] as const;

  for (const { number, field } of yesNoUnknownQuestions) {
    if (isAFPValueMissing(signs[field])) {
      errors[`signsSymptoms.${field}`] =
        `Please select Yes, No or Unknown for question ${number}.`;
    }
  }

  // Question 3: Site of paralysis
  if (signs.siteOfParalysis.length === 0) {
    errors["signsSymptoms.siteOfParalysis"] =
      "Select at least one site of paralysis.";
  }

  // Required only if Other is checked.
  if (signs.siteOfParalysis.includes("other")) {
    requireAFPField(
      errors,
      "signsSymptoms.otherParalysisSite",
      signs.otherParalysisSite,
      "Other site of paralysis",
    );
  }

  // Question 7 dependent fields
  if (signs.childAtHealthFacility === "yes") {
    const facility = signs.healthFacility;

    requireAFPField(
      errors,
      "signsSymptoms.healthFacility.selectedFacilityOption",
      facility.selectedFacilityOption,
      "Health facility",
    );

    if (facility.selectedFacilityOption === AFP_OTHER_FACILITY_VALUE) {
      requireAFPField(
        errors,
        "signsSymptoms.healthFacility.otherFacilityName",
        facility.otherFacilityName,
        "Facility name",
      );
    }

    // Date of notification
    const dateId = "signsSymptoms.healthFacility.notificationDate";

    const date = facility.notificationDate;

    requireAFPField(errors, dateId, date, "Date of notification");

    if (!errors[dateId]) {
      if (!isValidDateFormat(date)) {
        errors[dateId] = "Enter date in DD-MM-YYYY format.";
      } else if (!isValidCalendarDate(date)) {
        errors[dateId] = "Enter a valid calendar date.";
      } else if (isFutureDate(date)) {
        errors[dateId] = "Future dates are not allowed.";
      }
    }

    // Medical record
    requireAFPField(
      errors,
      "signsSymptoms.healthFacility.medicalRecordNumber",
      facility.medicalRecordNumber,
      "Medical record #",
    );
  }

  return errors;
}
