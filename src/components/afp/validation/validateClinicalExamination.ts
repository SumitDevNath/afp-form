import type { AFPFormData, AFPReflexScores } from "../types/afp.types";

import {
  LOWER_LIMB_MUSCLE_FIELDS,
  UPPER_LIMB_MUSCLE_FIELDS,
} from "../constants/afpMuscleStrength";

import { getAFPScreeningStatus } from "../utils/afpScreening.utils";

import { isAFPValueMissing, type AFPValidationErrors } from "./afpValidation";

export function validateClinicalExamination(
  data: AFPFormData,
): AFPValidationErrors {
  const errors: AFPValidationErrors = {};

  // Clinical Examination is hidden unless screening is eligible.
  if (getAFPScreeningStatus(data.clinicalInformation) !== "eligible") {
    return errors;
  }

  const examination = data.clinicalExamination;

  // =========================================================
  // REFLEXES: EIGHT BILATERAL SCORES
  // =========================================================

  for (const field of Object.keys(examination.reflexes.scores) as Array<
    keyof AFPReflexScores
  >) {
    if (isAFPValueMissing(examination.reflexes.scores[field])) {
      errors[`clinicalExamination.reflexes.scores.${field}`] =
        "Select reflex score.";
    }
  }

  // =========================================================
  // PLANTAR REFLEXES
  // =========================================================

  for (const field of ["rightPlantarReflex", "leftPlantarReflex"] as const) {
    if (isAFPValueMissing(examination.reflexes[field])) {
      errors[`clinicalExamination.reflexes.${field}`] =
        "Select plantar reflex.";
    }
  }

  // =========================================================
  // UPPER-LIMB MUSCLE STRENGTH
  // =========================================================

  for (const { key } of UPPER_LIMB_MUSCLE_FIELDS) {
    const pair = examination.muscleStrength.upperLimb[key];

    for (const side of ["right", "left"] as const) {
      if (isAFPValueMissing(pair[side])) {
        errors[`clinicalExamination.muscleStrength.upperLimb.${key}.${side}`] =
          "Select a score.";
      }
    }
  }

  // =========================================================
  // LOWER-LIMB MUSCLE STRENGTH
  // =========================================================

  for (const { key } of LOWER_LIMB_MUSCLE_FIELDS) {
    const pair = examination.muscleStrength.lowerLimb[key];

    for (const side of ["right", "left"] as const) {
      if (isAFPValueMissing(pair[side])) {
        errors[`clinicalExamination.muscleStrength.lowerLimb.${key}.${side}`] =
          "Select a score.";
      }
    }
  }

  return errors;
}
