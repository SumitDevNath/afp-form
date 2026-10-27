import type { AFPFormData } from "../types/afp.types";

import { getAFPScreeningStatus } from "../utils/afpScreening.utils";

import { requireAFPField, type AFPValidationErrors } from "./afpValidation";

export function validateAdditionalInformation(
  data: AFPFormData,
): AFPValidationErrors {
  const errors: AFPValidationErrors = {};

  // Section is hidden unless AFP screening is eligible.
  if (getAFPScreeningStatus(data.clinicalInformation) !== "eligible") {
    return errors;
  }

  const additional = data.additionalInformation;

  // QUESTION 1
  requireAFPField(
    errors,
    "additionalInformation.searchForAdditionalCases",
    additional.searchForAdditionalCases,
    "Search for additional AFP cases",
  );

  // Additional cases count is required only when
  // the first question is Yes and the toggle is ON.
  if (
    additional.searchForAdditionalCases === "yes" &&
    additional.additionalCasesIdentified === "yes"
  ) {
    requireAFPField(
      errors,
      "additionalInformation.numberOfAdditionalCases",
      additional.numberOfAdditionalCases,
      "Number of additional AFP cases",
    );
  }

  // QUESTION 2
  requireAFPField(
    errors,
    "additionalInformation.outbreakResponseImmunizationDone",
    additional.outbreakResponseImmunizationDone,
    "Outbreak response immunization",
  );

  // Number of vaccinated children is required only
  // when outbreak response immunization is Yes.
  if (additional.outbreakResponseImmunizationDone === "yes") {
    requireAFPField(
      errors,
      "additionalInformation.numberOfChildrenVaccinated",
      additional.numberOfChildrenVaccinated,
      "Number of children vaccinated",
    );
  }

  // Explanation is required only when
  // outbreak response immunization is No.
  if (additional.outbreakResponseImmunizationDone === "no") {
    requireAFPField(
      errors,
      "additionalInformation.outbreakResponseExplanation",
      additional.outbreakResponseExplanation,
      "Explanation",
    );
  }

  return errors;
}
