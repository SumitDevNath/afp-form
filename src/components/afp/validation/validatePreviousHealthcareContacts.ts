import type {
  AFPFormData,
  AFPHealthcareContact,
  AFPSuspectedDiagnosisOption,
} from "../types/afp.types";

import { getAFPScreeningStatus } from "../utils/afpScreening.utils";

import {
  isFutureDate,
  isValidCalendarDate,
  isValidDateFormat,
} from "../utils/afpDate.utils";

import { requireAFPField, type AFPValidationErrors } from "./afpValidation";

function validateContact(
  errors: AFPValidationErrors,
  contact: AFPHealthcareContact,
): void {
  // Stable contact ID prevents errors moving to another contact
  // when one is removed.
  const prefix = `previousHealthcareContacts.contacts.${contact.id}`;

  requireAFPField(
    errors,
    `${prefix}.providerName`,
    contact.providerName,
    "Provider name",
  );

  requireAFPField(errors, `${prefix}.address`, contact.address, "Address");

  const dateId = `${prefix}.dateCaseVisited`;
  const date = contact.dateCaseVisited;

  if (!date.trim()) {
    errors[dateId] = "Date is not filled in.";
  } else if (!isValidDateFormat(date)) {
    errors[dateId] = "Enter DD-MM-YYYY.";
  } else if (!isValidCalendarDate(date)) {
    errors[dateId] = "Invalid calendar date.";
  } else if (isFutureDate(date)) {
    errors[dateId] = "No future dates.";
  }

  if (contact.alreadyInNetwork === null) {
    errors[`${prefix}.alreadyInNetwork`] = "Select an answer.";
  }

  if (contact.reportedCase === null) {
    errors[`${prefix}.reportedCase`] = "Select Yes or No.";
  }

  requireAFPField(
    errors,
    `${prefix}.actionTakenPlanned`,
    contact.actionTakenPlanned,
    "Action taken / planned",
  );
}

export function validatePreviousHealthcareContacts(
  data: AFPFormData,
  suspectedDiagnosisOptions: readonly AFPSuspectedDiagnosisOption[] = [],
): AFPValidationErrors {
  const errors: AFPValidationErrors = {};

  if (getAFPScreeningStatus(data.clinicalInformation) !== "eligible") {
    return errors;
  }

  const history = data.previousHealthcareContacts;

  for (const contact of history.contacts) {
    validateContact(errors, contact);
  }

  requireAFPField(
    errors,
    "previousHealthcareContacts.firstContactCategory",
    history.firstContactCategory,
    "Category of the first contact",
  );

  if (history.firstContactCategory === "Other") {
    requireAFPField(
      errors,
      "previousHealthcareContacts.firstContactCategoryOther",
      history.firstContactCategoryOther,
      "Other contact category",
    );
  }

  requireAFPField(
    errors,
    "previousHealthcareContacts.additionalComments",
    history.additionalComments,
    "Additional comments",
  );

  // The dropdown is disabled if no options are configured.
  if (suspectedDiagnosisOptions.length > 0) {
    requireAFPField(
      errors,
      "previousHealthcareContacts.suspectedDiagnosis",
      history.suspectedDiagnosis,
      "Suspected diagnosis",
    );
  }

  return errors;
}
