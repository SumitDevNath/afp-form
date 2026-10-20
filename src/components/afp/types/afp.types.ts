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

export interface AFPFormData {
  clinicalInformation: AFPClinicalInformation;
  /**
   * Used only when AFP screening status
   * is "not_eligible".
   */
  screeningDiagnosis: string;
  signsSymptoms: AFPSignsSymptoms;
}

export interface AFPFacilityOption {
  /**
   * Frontend option value only.
   *
   * This is not a database ID unless the
   * integrating application intentionally
   * supplies one.
   */
  value: string;
  label: string;
}

export type AFPFormUpdater = (previous: AFPFormData) => AFPFormData;

export interface AFPInvestigationFormProps {
  value?: AFPFormData;
  onChange?: (data: AFPFormData) => void;
  readOnly?: boolean;
  /**
   * Facility options supplied by the
   * integrating application.
   *
   * Development placeholder options are
   * used when this prop is omitted.
   */
  facilityOptions?: AFPFacilityOption[];
}
