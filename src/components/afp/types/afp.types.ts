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
  /**
   * This corresponds to the SVG control:
   * "Travel outside area in last 30 days?"
   *
   * It controls whether the AFP travel
   * details area is active.
   */
  travelOutsideAreaLast30Days: boolean;

  /**
   * AFP-specific field.
   *
   * The SVG displays this as a toggle.
   */
  notifiedToConcernedDsfpSimo: boolean;

  /**
   * Used only when
   * notifiedToConcernedDsfpSimo = true.
   */
  notificationDate: string;
}

export interface AFPFormData {
  clinicalInformation: AFPClinicalInformation;

  screeningDiagnosis: string;

  signsSymptoms: AFPSignsSymptoms;

  vaccinationHistory: AFPVaccinationHistory;

  travelHistory: AFPTravelHistory;
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
