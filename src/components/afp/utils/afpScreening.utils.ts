import type {
  AFPClinicalInformation,
  AFPScreeningStatus,
} from "../types/afp.types";

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
