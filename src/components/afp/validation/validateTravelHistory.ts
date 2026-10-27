import type { AFPFormData } from "../types/afp.types";

import { getAFPScreeningStatus } from "../utils/afpScreening.utils";

import {
  isFutureDate,
  isValidCalendarDate,
  isValidDateFormat,
} from "../utils/afpDate.utils";

import { type AFPValidationErrors, requireAFPField } from "./afpValidation";

export function validateTravelHistory(data: AFPFormData): AFPValidationErrors {
  const errors: AFPValidationErrors = {};

  // Travel History is hidden until screening is eligible.
  if (getAFPScreeningStatus(data.clinicalInformation) !== "eligible") {
    return errors;
  }

  const travel = data.travelHistory;

  // Travel History OFF: no visible dependent fields.
  if (!travel.travelOutsideAreaLast30Days) {
    return errors;
  }

  // DSFP / SIMO OFF: notification date is not applicable.
  if (!travel.notifiedToConcernedDsfpSimo) {
    return errors;
  }

  const fieldId = "travelHistory.notificationDate";
  const date = travel.notificationDate;

  // Required date
  requireAFPField(errors, fieldId, date, "Date of notification");

  if (errors[fieldId]) {
    return errors;
  }

  // Date format validation
  if (!isValidDateFormat(date)) {
    errors[fieldId] = "Enter date in DD-MM-YYYY format.";
    return errors;
  }

  // Calendar date validation
  if (!isValidCalendarDate(date)) {
    errors[fieldId] = "Enter a valid calendar date.";
    return errors;
  }

  // Future date validation
  if (isFutureDate(date)) {
    errors[fieldId] = "Future dates are not allowed.";
  }

  return errors;
}
