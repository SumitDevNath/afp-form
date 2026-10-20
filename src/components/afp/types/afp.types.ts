export type YesNo = "yes" | "no" | null;

export type YesNoUnknown = "yes" | "no" | "unknown" | null;

export type AFPScreeningStatus = "pending" | "eligible" | "not_eligible";

export type AFPParalysisSite =
  | "right_arm"
  | "left_arm"
  | "right_leg"
  | "left_leg"
  | "neck"
  | "face"
  | "other";

export type VaccinationRecordSource = "card" | "history" | null;

export type ReflexScoreCode = "0" | "1+" | "2+" | "3+" | "4+" | null;

export type PlantarReflexValue = "flexor" | "extensor" | "equivocal" | null;

export interface AFPClinicalInformation {
  paralysisPresent: YesNo;
  paralysisFlaccid: YesNo;
  paralysisSuddenOnset: YesNo;
  paralysisOnsetDate: string;
  paralysisCausedByInjury: YesNo;
  paralysisPresentAtBirth: YesNo;
}

export interface AFPHealthFacilityDetails {
  selectedFacilityOption: string;
  otherFacilityName: string;
  notificationDate: string;
  medicalRecordNumber: string;
}

export interface AFPSignsSymptoms {
  feverWhenParalysisBegan: YesNoUnknown;

  musclePainWhenParalysisBegan: YesNoUnknown;

  siteOfParalysis: AFPParalysisSite[];

  otherParalysisSite: string;

  paralysisAsymmetric: YesNoUnknown;

  paralysisMovedUpward: YesNoUnknown;

  sensationPresentAtParalysisSite: YesNoUnknown;

  childAtHealthFacility: YesNoUnknown;

  healthFacility: AFPHealthFacilityDetails;
}

export interface AFPVaccinationDoseEntry {
  recordSource: VaccinationRecordSource;

  numberOfDoses: number | null;
}

export interface AFPVaccinationHistory {
  available: boolean;

  opvCampaignDoses: AFPVaccinationDoseEntry;

  opvRoutineDoses: AFPVaccinationDoseEntry;

  lastOpvDoseBeforeParalysisDate: string;

  ipvDoses: AFPVaccinationDoseEntry;

  lastIpvDoseBeforeParalysisDate: string;

  opvGivenAfterParalysis: YesNoUnknown;

  opvAfterParalysisDate: string;
}

export interface AFPTravelHistory {
  travelOutsideAreaLast30Days: boolean;

  notifiedToConcernedDsfpSimo: boolean;

  notificationDate: string;
}

/**
 * IMPORTANT:
 *
 * The Figma SVG shows the locations of
 * these eight reflex selectors but does
 * not identify their anatomical names.
 *
 * These keys are positional placeholders
 * until the medical/source mapping is
 * confirmed.
 */
export interface AFPReflexScores {
  rightUpper1: ReflexScoreCode;
  rightUpper2: ReflexScoreCode;
  rightLower1: ReflexScoreCode;
  rightLower2: ReflexScoreCode;

  leftUpper1: ReflexScoreCode;
  leftUpper2: ReflexScoreCode;
  leftLower1: ReflexScoreCode;
  leftLower2: ReflexScoreCode;
}

export interface AFPReflexExamination {
  scores: AFPReflexScores;

  rightPlantarReflex: PlantarReflexValue;

  leftPlantarReflex: PlantarReflexValue;
}

export interface AFPClinicalExamination {
  reflexes: AFPReflexExamination;
}

export interface AFPFormData {
  clinicalInformation: AFPClinicalInformation;

  screeningDiagnosis: string;

  signsSymptoms: AFPSignsSymptoms;

  vaccinationHistory: AFPVaccinationHistory;

  travelHistory: AFPTravelHistory;

  clinicalExamination: AFPClinicalExamination;
}

export interface AFPFacilityOption {
  value: string;
  label: string;
}

export type AFPFormUpdater = (previous: AFPFormData) => AFPFormData;

export interface AFPInvestigationFormProps {
  value?: AFPFormData;

  onChange?: (data: AFPFormData) => void;

  readOnly?: boolean;

  facilityOptions?: AFPFacilityOption[];
}
