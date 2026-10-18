import type {
  AFPClinicalInformation,
  AFPScreeningStatus,
} from "../types/afp.types";

/**
 * Determines whether the answers satisfy the AFP form-screening rule.
 *
 * This is NOT a final AFP diagnosis or laboratory classification.
 *
 * Not eligible if:
 * - Question 1 = No
 * - Question 2 = No
 * - Question 3 = No
 * - Question 5 = Yes
 * - Question 6 = Yes
 *
 * Pending means the required screening questions have not all
 * been answered yet.
 */
export function getAFPScreeningStatus(
  clinicalInformation: AFPClinicalInformation,
): AFPScreeningStatus {
  const {
    paralysisPresent,
    paralysisFlaccid,
    paralysisSuddenOnset,
    paralysisCausedByInjury,
    paralysisPresentAtBirth,
  } = clinicalInformation;

  const hasDisqualifyingAnswer =
    paralysisPresent === "no" ||
    paralysisFlaccid === "no" ||
    paralysisSuddenOnset === "no" ||
    paralysisCausedByInjury === "yes" ||
    paralysisPresentAtBirth === "yes";

  if (hasDisqualifyingAnswer) {
    return "not_eligible";
  }

  const allScreeningQuestionsAnswered =
    paralysisPresent !== null &&
    paralysisFlaccid !== null &&
    paralysisSuddenOnset !== null &&
    paralysisCausedByInjury !== null &&
    paralysisPresentAtBirth !== null;

  if (!allScreeningQuestionsAnswered) {
    return "pending";
  }

  return "eligible";
}
