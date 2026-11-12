/** AFP single-file consolidation of 45 supplied source files. Original logic, JSX and styling retained. */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useId,
  useRef,
  Fragment,
} from "react";
import type { ReactNode, MouseEvent } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";

// ===== Merged source: afp.types(1).ts =====
export type YesNo = "yes" | "no" | null;

export type YesNoUnknown = "yes" | "no" | "unknown" | null;

export type YesNoPending = "yes" | "no" | "pending" | null;

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

export type MuscleScore = 0 | 1 | 2 | 3 | 4 | 5 | null;

export type AFPFirstContactCategory =
  | "Regd doctor"
  | "GoB facility"
  | "Village doctor"
  | "NGO Clinic"
  | "Homeopath"
  | "Kabiraj"
  | "Imam"
  | "Pharmacist"
  | "HA"
  | "FWA"
  | "Other"
  | null;

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

export interface AFPReflexScores {
  rightBiceps: ReflexScoreCode;
  leftBiceps: ReflexScoreCode;

  rightBrachioradialis: ReflexScoreCode;
  leftBrachioradialis: ReflexScoreCode;

  rightPatellar: ReflexScoreCode;
  leftPatellar: ReflexScoreCode;

  rightAchilles: ReflexScoreCode;
  leftAchilles: ReflexScoreCode;
}

export interface AFPReflexExamination {
  scores: AFPReflexScores;
  rightPlantarReflex: PlantarReflexValue;
  leftPlantarReflex: PlantarReflexValue;
}

export interface AFPMuscleStrengthPair {
  right: MuscleScore;
  left: MuscleScore;
}

export interface AFPUpperLimbMuscleStrength {
  flexWrist: AFPMuscleStrengthPair;
  extendWrist: AFPMuscleStrengthPair;
  flexElbow: AFPMuscleStrengthPair;
  extendElbow: AFPMuscleStrengthPair;
  flexShoulder: AFPMuscleStrengthPair;
  extendShoulder: AFPMuscleStrengthPair;
  handGrip: AFPMuscleStrengthPair;
}

export interface AFPLowerLimbMuscleStrength {
  flexHip: AFPMuscleStrengthPair;
  extendHip: AFPMuscleStrengthPair;
  flexKnee: AFPMuscleStrengthPair;
  extendKnee: AFPMuscleStrengthPair;
  flexAnkle: AFPMuscleStrengthPair;
  extendAnkle: AFPMuscleStrengthPair;
}

export interface AFPMuscleStrength {
  upperLimb: AFPUpperLimbMuscleStrength;
  lowerLimb: AFPLowerLimbMuscleStrength;
}

export interface AFPClinicalExamination {
  reflexes: AFPReflexExamination;
  muscleStrength: AFPMuscleStrength;
}

export interface AFPHealthcareContact {
  id: string;
  providerName: string;
  address: string;
  dateCaseVisited: string;
  alreadyInNetwork: YesNoUnknown;
  reportedCase: YesNo;
  actionTakenPlanned: string;
}

export interface AFPPreviousHealthcareContacts {
  contacts: AFPHealthcareContact[];
  firstContactCategory: AFPFirstContactCategory;
  firstContactCategoryOther: string;
  additionalComments: string;
  suspectedDiagnosis: string;
}

export interface AFPAdditionalInformation {
  searchForAdditionalCases: YesNoPending;
  additionalCasesIdentified: YesNo;
  numberOfAdditionalCases: number | null;
  outbreakResponseImmunizationDone: YesNoPending;
  numberOfChildrenVaccinated: number | null;
  outbreakResponseExplanation: string;
}

export interface AFPFormData {
  clinicalInformation: AFPClinicalInformation;
  screeningDiagnosis: string;
  signsSymptoms: AFPSignsSymptoms;
  vaccinationHistory: AFPVaccinationHistory;
  travelHistory: AFPTravelHistory;
  clinicalExamination: AFPClinicalExamination;
  previousHealthcareContacts: AFPPreviousHealthcareContacts;
  additionalInformation: AFPAdditionalInformation;
}

export interface AFPFacilityOption {
  value: string;
  label: string;
}

export interface AFPSuspectedDiagnosisOption {
  value: string;
  label: string;
}

export type AFPFormUpdater = (previous: AFPFormData) => AFPFormData;

export interface AFPInvestigationFormProps {
  value?: AFPFormData;
  onChange?: (data: AFPFormData) => void;
  readOnly?: boolean;
  facilityOptions?: AFPFacilityOption[];
  suspectedDiagnosisOptions?: AFPSuspectedDiagnosisOption[];
}

// ===== Merged source: afpDate.utils.ts =====
const DISPLAY_DATE_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/;

export function isValidDateFormat(value: string): boolean {
  return DISPLAY_DATE_PATTERN.test(value);
}

export function isValidCalendarDate(value: string): boolean {
  if (!isValidDateFormat(value)) {
    return false;
  }

  const match = DISPLAY_DATE_PATTERN.exec(value);

  if (!match) {
    return false;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function parseDisplayDate(value: string): Date | null {
  if (!isValidCalendarDate(value)) {
    return null;
  }

  const [day, month, year] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function isFutureDate(value: string): boolean {
  const date = parseDisplayDate(value);

  if (!date) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date > today;
}

export function convertNativeDateToDisplay(value: string): string {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}-${month}-${year}`;
}

export function convertDisplayDateToNative(value: string): string {
  if (!isValidCalendarDate(value)) {
    return "";
  }

  const [day, month, year] = value.split("-");

  return `${year}-${month}-${day}`;
}

// ===== Merged source: afpScreening.utils.ts =====

const AFP_MAX_ONSET_DAYS = 60;

// Calculate completed calendar days since paralysis onset.
export function getAFPOnsetAgeDays(value: string): number | null {
  const onset = parseDisplayDate(value);

  if (!onset) return null;

  const today = new Date();

  // UTC calendar dates prevent daylight-saving-time errors.
  const utcOnset = Date.UTC(
    onset.getFullYear(),
    onset.getMonth(),
    onset.getDate(),
  );

  const utcToday = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return (utcToday - utcOnset) / 86_400_000;
}

export function getAFPScreeningStatus(
  clinicalInformation: AFPClinicalInformation,
): AFPScreeningStatus {
  const {
    paralysisPresent,
    paralysisFlaccid,
    paralysisSuddenOnset,
    paralysisOnsetDate,
    paralysisCausedByInjury,
    paralysisPresentAtBirth,
  } = clinicalInformation;

  // Preserve existing disqualifying-answer logic.
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

  // NEW: Date of paralysis onset is part of screening.
  const daysSinceOnset = getAFPOnsetAgeDays(paralysisOnsetDate);

  // Missing, invalid, or future date.
  if (daysSinceOnset === null || daysSinceOnset < 0) {
    return "pending";
  }

  // Eligibility requires onset fewer than 60 days ago.
  return daysSinceOnset < AFP_MAX_ONSET_DAYS ? "eligible" : "not_eligible";
}

// ===== Merged source: afpFacilities.ts =====
export const AFP_OTHER_FACILITY_VALUE = "__other__";

/**
 * Development-only placeholder facilities.
 *
 * These do NOT represent backend data.
 *
 * The senior developer can replace these
 * by passing `facilityOptions` to
 * <AFPInvestigationForm />.
 */
export const AFP_DEMO_FACILITY_OPTIONS: AFPFacilityOption[] = [
  {
    value: "demo_facility_1",
    label: "Development Facility 1",
  },
  {
    value: "demo_facility_2",
    label: "Development Facility 2",
  },
  {
    value: "demo_facility_3",
    label: "Development Facility 3",
  },
];

export const AFP_OTHER_FACILITY_OPTION: AFPFacilityOption = {
  value: AFP_OTHER_FACILITY_VALUE,
  label: "Other / Not in list",
};

// ===== Merged source: afpHealthcareContacts.ts =====
export const FIRST_CONTACT_CATEGORY_OPTIONS: {
  value: Exclude<AFPFirstContactCategory, null>;

  label: string;
}[] = [
  {
    value: "Regd doctor",
    label: "Regd doctor",
  },
  {
    value: "GoB facility",
    label: "GoB facility",
  },
  {
    value: "Village doctor",
    label: "Village doctor",
  },
  {
    value: "NGO Clinic",
    label: "NGO Clinic",
  },
  {
    value: "Homeopath",
    label: "Homeopath",
  },
  {
    value: "Kabiraj",
    label: "Kabiraj",
  },
  {
    value: "Imam",
    label: "Imam",
  },
  {
    value: "Pharmacist",
    label: "Pharmacist",
  },
  {
    value: "HA",
    label: "HA",
  },
  {
    value: "FWA",
    label: "FWA",
  },
  {
    value: "Other",
    label: "Other (specify)",
  },
];

// ===== Merged source: afpMuscleStrength.ts =====
export interface MuscleStrengthOption {
  value: Exclude<MuscleScore, null>;
  label: string;
}

export const MUSCLE_STRENGTH_OPTIONS: MuscleStrengthOption[] = [
  {
    value: 0,
    label: "No muscle contraction",
  },
  {
    value: 1,
    label: "Barely detectable contraction",
  },
  {
    value: 2,
    label: "Active movement, not against gravity",
  },
  {
    value: 3,
    label: "Movement against gravity only",
  },
  {
    value: 4,
    label: "Movement vs. gravity + mild resistance",
  },
  {
    value: 5,
    label: "Movement vs. full resistance (NORMAL)",
  },
];

export const UPPER_LIMB_MUSCLE_FIELDS = [
  {
    key: "flexWrist",
    label: "Flex wrist",
  },
  {
    key: "extendWrist",
    label: "Extend wrist",
  },
  {
    key: "flexElbow",
    label: "Flex elbow",
  },
  {
    key: "extendElbow",
    label: "Extend elbow",
  },
  {
    key: "flexShoulder",
    label: "Flex shoulder",
  },
  {
    key: "extendShoulder",
    label: "Extend shoulder",
  },
  {
    key: "handGrip",
    label: "Hand Grip",
  },
] as const;

export const LOWER_LIMB_MUSCLE_FIELDS = [
  {
    key: "flexHip",
    label: "Flex hip",
  },
  {
    key: "extendHip",
    label: "Extend hip",
  },
  {
    key: "flexKnee",
    label: "Flex knee",
  },
  {
    key: "extendKnee",
    label: "Extend knee",
  },
  {
    key: "flexAnkle",
    label: "Flex ankle",
  },
  {
    key: "extendAnkle",
    label: "Extend ankle",
  },
] as const;

// ===== Merged source: afpReflexes.ts =====
export interface ReflexScoreOption {
  value: Exclude<ReflexScoreCode, null>;
  label: string;
}

export interface PlantarReflexOption {
  value: Exclude<PlantarReflexValue, null>;
  label: string;
}

export const REFLEX_SCORE_OPTIONS: ReflexScoreOption[] = [
  {
    value: "0",
    label: "No response",
  },
  {
    value: "1+",
    label: "Somewhat diminished; low normal",
  },
  {
    value: "2+",
    label: "Average; normal",
  },
  {
    value: "3+",
    label:
      "Brisker than average; possibly but not necessarily indicative of disease",
  },
  {
    value: "4+",
    label: "Very brisk; hyperactive",
  },
];

export const PLANTAR_REFLEX_OPTIONS: PlantarReflexOption[] = [
  {
    value: "flexor",
    label: "Flexor",
  },
  {
    value: "extensor",
    label: "Extensor",
  },
  {
    value: "equivocal",
    label: "Equivocal",
  },
];

// ===== Merged source: afpVaccination.ts =====
export interface VaccinationRecordSourceOption {
  value: VaccinationRecordSource;
  label: string;
}

export const VACCINATION_RECORD_SOURCE_OPTIONS: {
  value: Exclude<VaccinationRecordSource, null>;
  label: string;
}[] = [
  {
    value: "card",
    label: "By Card",
  },
  {
    value: "history",
    label: "By History",
  },
];

export const VACCINATION_DOSE_OPTIONS = Array.from(
  { length: 11 },
  (_, index) => ({
    value: String(index),
    label: String(index),
  }),
);

// AFP Context and initial state

export const createInitialAFPSignsSymptoms = (): AFPSignsSymptoms => ({
  feverWhenParalysisBegan: null,
  musclePainWhenParalysisBegan: null,
  siteOfParalysis: [],
  otherParalysisSite: "",
  paralysisAsymmetric: null,
  paralysisMovedUpward: null,
  sensationPresentAtParalysisSite: null,
  childAtHealthFacility: null,
  healthFacility: {
    selectedFacilityOption: "",
    otherFacilityName: "",
    notificationDate: "",
    medicalRecordNumber: "",
  },
});

export const createInitialAFPVaccinationHistory =
  (): AFPVaccinationHistory => ({
    available: false,
    opvCampaignDoses: {
      recordSource: null,
      numberOfDoses: null,
    },
    opvRoutineDoses: {
      recordSource: null,
      numberOfDoses: null,
    },
    lastOpvDoseBeforeParalysisDate: "",
    ipvDoses: {
      recordSource: null,
      numberOfDoses: null,
    },
    lastIpvDoseBeforeParalysisDate: "",
    opvGivenAfterParalysis: null,
    opvAfterParalysisDate: "",
  });

export const createInitialAFPTravelHistory = (): AFPTravelHistory => ({
  travelOutsideAreaLast30Days: false,
  notifiedToConcernedDsfpSimo: false,
  notificationDate: "",
});

export const createInitialAFPClinicalExamination =
  (): AFPClinicalExamination => ({
    reflexes: {
      scores: {
        rightBiceps: null,
        leftBiceps: null,

        rightBrachioradialis: null,
        leftBrachioradialis: null,

        rightPatellar: null,
        leftPatellar: null,

        rightAchilles: null,
        leftAchilles: null,
      },
      rightPlantarReflex: null,
      leftPlantarReflex: null,
    },

    muscleStrength: {
      upperLimb: {
        flexWrist: {
          right: null,
          left: null,
        },
        extendWrist: {
          right: null,
          left: null,
        },
        flexElbow: {
          right: null,
          left: null,
        },
        extendElbow: {
          right: null,
          left: null,
        },
        flexShoulder: {
          right: null,
          left: null,
        },
        extendShoulder: {
          right: null,
          left: null,
        },
        handGrip: {
          right: null,
          left: null,
        },
      },

      lowerLimb: {
        flexHip: {
          right: null,
          left: null,
        },
        extendHip: {
          right: null,
          left: null,
        },
        flexKnee: {
          right: null,
          left: null,
        },
        extendKnee: {
          right: null,
          left: null,
        },
        flexAnkle: {
          right: null,
          left: null,
        },
        extendAnkle: {
          right: null,
          left: null,
        },
      },
    },
  });

function createFrontendContactId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `contact-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const createInitialAFPHealthcareContact = () => ({
  id: createFrontendContactId(),
  providerName: "",
  address: "",
  dateCaseVisited: "",
  alreadyInNetwork: null,
  reportedCase: null,
  actionTakenPlanned: "",
});

export const createInitialAFPPreviousHealthcareContacts =
  (): AFPPreviousHealthcareContacts => ({
    contacts: [createInitialAFPHealthcareContact()],
    firstContactCategory: null,
    firstContactCategoryOther: "",
    additionalComments: "",
    suspectedDiagnosis: "",
  });

export const createInitialAFPFormData = (): AFPFormData => ({
  clinicalInformation: {
    paralysisPresent: null,
    paralysisFlaccid: null,
    paralysisSuddenOnset: null,
    paralysisOnsetDate: "",
    paralysisCausedByInjury: null,
    paralysisPresentAtBirth: null,
  },
  previousHealthcareContacts: createInitialAFPPreviousHealthcareContacts(),
  screeningDiagnosis: "",
  signsSymptoms: createInitialAFPSignsSymptoms(),
  vaccinationHistory: createInitialAFPVaccinationHistory(),
  travelHistory: createInitialAFPTravelHistory(),
  clinicalExamination: createInitialAFPClinicalExamination(),
  additionalInformation: createInitialAFPAdditionalInformation(),
});

export const createInitialAFPAdditionalInformation =
  (): AFPAdditionalInformation => ({
    searchForAdditionalCases: null,
    additionalCasesIdentified: null,
    numberOfAdditionalCases: null,
    outbreakResponseImmunizationDone: null,
    numberOfChildrenVaccinated: null,
    outbreakResponseExplanation: "",
  });

interface AFPFormContextValue {
  data: AFPFormData;
  updateData: (updater: AFPFormUpdater) => void;
  readOnly: boolean;
}

const AFPFormContext = createContext<AFPFormContextValue | null>(null);
interface AFPFormProviderProps {
  children: ReactNode;
  value?: AFPFormData;
  onChange?: (data: AFPFormData) => void;
  readOnly?: boolean;
}

export function AFPFormProvider({
  children,
  value,
  onChange,
  readOnly = false,
}: AFPFormProviderProps) {
  const [internalData, setInternalData] = useState<AFPFormData>(
    createInitialAFPFormData,
  );
  const isControlled = value !== undefined;
  const data = value ?? internalData;
  const updateData = useCallback(
    (updater: AFPFormUpdater) => {
      if (readOnly) {
        return;
      }

      if (isControlled) {
        const nextData = updater(data);

        onChange?.(nextData);

        return;
      }

      setInternalData((previous) => {
        const nextData = updater(previous);

        onChange?.(nextData);

        return nextData;
      });
    },
    [data, isControlled, onChange, readOnly],
  );

  const contextValue = useMemo<AFPFormContextValue>(
    () => ({
      data,
      updateData,
      readOnly,
    }),
    [data, updateData, readOnly],
  );

  return (
    <AFPFormContext.Provider value={contextValue}>
      {children}
    </AFPFormContext.Provider>
  );
}

export function useAFPForm(): AFPFormContextValue {
  const context = useContext(AFPFormContext);

  if (!context) {
    throw new Error("useAFPForm must be used inside AFPFormProvider");
  }

  return context;
}

// ===== Merged source: afpValidation.ts =====
export type AFPValidationErrors = Record<string, string>;
export type AFPValidator<T> = (data: T) => AFPValidationErrors;

export function isAFPValueMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false; // 0, false, and deliberately selected answers are valid.
}

export function requireAFPField(
  errors: AFPValidationErrors,
  fieldId: string,
  value: unknown,
  label: string,
): void {
  if (isAFPValueMissing(value)) {
    errors[fieldId] = `${label} is not filled in.`;
  }
}

export function combineAFPValidators<T>(
  ...validators: AFPValidator<T>[]
): AFPValidator<T> {
  return (data) =>
    Object.assign({}, ...validators.map((validate) => validate(data)));
}

export function scrollToFirstAFPError(errors: AFPValidationErrors): void {
  // DOM order, not object key order, decides which visible field is first.
  const fields = document.querySelectorAll<HTMLElement>("[data-afp-field]");
  for (const field of fields) {
    const id = field.dataset.afpField;
    if (!id || !errors[id] || field.getClientRects().length === 0) continue;
    field.scrollIntoView({ behavior: "smooth", block: "center" });
    const control = field.querySelector<HTMLElement>(
      'input:not([disabled]):not([aria-hidden="true"]), textarea:not([disabled]), [role="combobox"], button:not([disabled])',
    );
    control?.focus({ preventScroll: true });
    return;
  }
}

// ===== Merged source: AFPValidationContext.tsx =====
interface AFPValidationContextValue {
  errors: AFPValidationErrors;
  attempted: boolean;
  isComplete: boolean;
  ready: boolean;
  submitForm: () => void;
}

interface AFPValidationProviderProps<T> {
  children: ReactNode;
  data: T;
  validate: AFPValidator<T>;
  ready?: boolean;
  fullFormReady?: boolean;
}

const AFPValidationContext = createContext<AFPValidationContextValue | null>(
  null,
);

export function AFPValidationProvider<T>({
  children,
  data,
  validate,
  ready = true,
  fullFormReady = false,
}: AFPValidationProviderProps<T>) {
  const [attempted, setAttempted] = useState(false);

  const errors = useMemo<AFPValidationErrors>(() => {
    if (!attempted || !ready) return {};
    return validate(data);
  }, [attempted, data, validate, ready]);

  // Never show a whole-form success until ALL section validators exist.
  const isComplete =
    attempted && ready && fullFormReady && Object.keys(errors).length === 0;

  const submitForm = useCallback(() => {
    if (!ready) return;
    const nextErrors = validate(data);
    setAttempted(true);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => scrollToFirstAFPError(nextErrors));
    }
  }, [data, ready, validate]);

  const value = useMemo<AFPValidationContextValue>(
    () => ({ errors, attempted, isComplete, ready, submitForm }),
    [errors, attempted, isComplete, ready, submitForm],
  );

  return (
    <AFPValidationContext.Provider value={value}>
      {children}
    </AFPValidationContext.Provider>
  );
}

export function useAFPValidation(): AFPValidationContextValue {
  const context = useContext(AFPValidationContext);
  if (!context) {
    throw new Error("useAFPValidation must be inside AFPValidationProvider");
  }
  return context;
}

// ===== Merged source: validateClinicalInformation.ts =====
/** Only the Clinical Information section. Others will be added section-by-section. */
export function validateClinicalInformation(
  data: AFPFormData,
): AFPValidationErrors {
  const errors: AFPValidationErrors = {};
  const clinical = data.clinicalInformation;

  const yesNoFields = [
    "paralysisPresent",
    "paralysisFlaccid",
    "paralysisSuddenOnset",
    "paralysisCausedByInjury",
    "paralysisPresentAtBirth",
  ] as const;

  const questionNumbers = [1, 2, 3, 5, 6] as const;

  yesNoFields.forEach((field, index) => {
    if (isAFPValueMissing(clinical[field])) {
      errors[`clinicalInformation.${field}`] =
        `Please select Yes or No for question ${questionNumbers[index]}.`;
    }
  });

  const dateKey = "clinicalInformation.paralysisOnsetDate";
  const date = clinical.paralysisOnsetDate;

  requireAFPField(errors, dateKey, date, "Date of paralysis onset");
  if (!errors[dateKey] && !isValidDateFormat(date)) {
    errors[dateKey] = "Enter date in DD-MM-YYYY format.";
  } else if (!errors[dateKey] && !isValidCalendarDate(date)) {
    errors[dateKey] = "Enter a valid calendar date.";
  } else if (!errors[dateKey] && isFutureDate(date)) {
    errors[dateKey] = "Future dates are not allowed.";
  }

  // 'Specify the diagnosis, if known' is intentionally optional.
  // Existing screening eligibility and dependent-data reset rules remain unchanged.
  return errors;
}

// ===== Merged source: validateSignsSymptoms.ts =====
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

// ===== Merged source: validateVaccinationHistory.ts =====
function validateDoseEntry(
  errors: AFPValidationErrors,
  fieldId: string,
  entry: AFPVaccinationDoseEntry,
): void {
  // Card / History is required.
  if (isAFPValueMissing(entry.recordSource)) {
    errors[`${fieldId}.recordSource`] = "Select source.";
  }

  // Zero doses is valid. Only null means unanswered.
  if (isAFPValueMissing(entry.numberOfDoses)) {
    errors[`${fieldId}.numberOfDoses`] = "Select doses.";
  }
}

function validateVaccinationDate(
  errors: AFPValidationErrors,
  fieldId: string,
  value: string,
  label: string,
  required: boolean,
): void {
  if (!value.trim()) {
    if (required) {
      errors[fieldId] = `${label} is not filled in.`;
    }

    return;
  }

  if (!isValidDateFormat(value)) {
    errors[fieldId] = "Enter date in DD-MM-YYYY format.";
    return;
  }

  if (!isValidCalendarDate(value)) {
    errors[fieldId] = "Enter a valid calendar date.";
    return;
  }

  if (isFutureDate(value)) {
    errors[fieldId] = "Future dates are not allowed.";
  }
}

export function validateVaccinationHistory(
  data: AFPFormData,
): AFPValidationErrors {
  const errors: AFPValidationErrors = {};

  // Vaccination History is hidden unless screening is eligible.
  if (getAFPScreeningStatus(data.clinicalInformation) !== "eligible") {
    return errors;
  }

  const vaccination = data.vaccinationHistory;

  // When unavailable, all dependent questions are excluded.
  if (!vaccination.available) {
    return errors;
  }

  // Question 1: OPV campaign doses.
  validateDoseEntry(
    errors,
    "vaccinationHistory.opvCampaignDoses",
    vaccination.opvCampaignDoses,
  );

  // Question 2: OPV routine doses.
  validateDoseEntry(
    errors,
    "vaccinationHistory.opvRoutineDoses",
    vaccination.opvRoutineDoses,
  );

  // Question 4: IPV doses.
  validateDoseEntry(
    errors,
    "vaccinationHistory.ipvDoses",
    vaccination.ipvDoses,
  );

  // Question 3: Last OPV date.
  const hasOpvDoses =
    (vaccination.opvCampaignDoses.numberOfDoses ?? 0) > 0 ||
    (vaccination.opvRoutineDoses.numberOfDoses ?? 0) > 0;

  validateVaccinationDate(
    errors,
    "vaccinationHistory.lastOpvDoseBeforeParalysisDate",
    vaccination.lastOpvDoseBeforeParalysisDate,
    "Date of last OPV dose",
    hasOpvDoses,
  );

  // Question 5: Last IPV date.
  const hasIpvDoses = (vaccination.ipvDoses.numberOfDoses ?? 0) > 0;

  validateVaccinationDate(
    errors,
    "vaccinationHistory.lastIpvDoseBeforeParalysisDate",
    vaccination.lastIpvDoseBeforeParalysisDate,
    "Date of last IPV dose",
    hasIpvDoses,
  );

  // Question 6: OPV given after paralysis onset.
  if (isAFPValueMissing(vaccination.opvGivenAfterParalysis)) {
    errors["vaccinationHistory.opvGivenAfterParalysis"] =
      "Please select Yes, No or Unknown for question 6.";
  }

  // Question 6 conditional date.
  if (vaccination.opvGivenAfterParalysis === "yes") {
    validateVaccinationDate(
      errors,
      "vaccinationHistory.opvAfterParalysisDate",
      vaccination.opvAfterParalysisDate,
      "Date of the OPV",
      true,
    );
  }

  return errors;
}

// ===== Merged source: validateTravelHistory.ts =====
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

// ===== Merged source: validateClinicalExamination.ts =====
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

// ===== Merged source: validatePreviousHealthcareContacts.ts =====
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

// ===== Merged source: validateAdditionalInformation.ts =====
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

// ===== Merged source: AFPValidationBridge.tsx =====
interface Props {
  children: ReactNode;
  fullFormReady?: boolean;
  suspectedDiagnosisOptions?: AFPSuspectedDiagnosisOption[];
}

function AFPValidationBridge({
  children,
  fullFormReady = true,
  suspectedDiagnosisOptions,
}: Props) {
  const { data } = useAFPForm();

  const validateCompletedSections = useMemo(
    () =>
      combineAFPValidators<AFPFormData>(
        validateClinicalInformation,
        validateSignsSymptoms,
        validateVaccinationHistory,
        validateTravelHistory,
        validateClinicalExamination,
        (formData) =>
          validatePreviousHealthcareContacts(
            formData,
            suspectedDiagnosisOptions,
          ),
        validateAdditionalInformation,
      ),
    [suspectedDiagnosisOptions],
  );

  return (
    <AFPValidationProvider
      data={data}
      validate={validateCompletedSections}
      ready
      fullFormReady={fullFormReady}
    >
      {children}
    </AFPValidationProvider>
  );
}

// Submit control

function AFPSubmitButton() {
  const { readOnly } = useAFPForm();
  const { submitForm, isComplete, ready } = useAFPValidation();

  return (
    <div className="flex justify-end py-5">
      <Button
        type="button"
        variant="contained"
        disabled={!ready || readOnly}
        onClick={submitForm}
        startIcon={isComplete ? <CheckCircleOutlinedIcon /> : undefined}
        sx={{
          minWidth: 160,
          minHeight: 44,
          px: 3,
          borderRadius: "8px",
          textTransform: "none",
          fontSize: "0.85rem",
          fontWeight: 700,
          bgcolor: isComplete ? "success.main" : "#173b69",
          transform: isComplete ? "scale(1.04)" : "scale(1)",
          transition: "background-color 180ms, transform 180ms",
          "&:hover": {
            bgcolor: isComplete ? "success.dark" : "#245081",
          },
        }}
      >
        Submit Form
      </Button>
    </div>
  );
}

// Investigation form

interface AFPFormContentProps {
  facilityOptions?: AFPFacilityOption[];
  suspectedDiagnosisOptions?: AFPSuspectedDiagnosisOption[];
}

function AFPFormContent({
  facilityOptions,
  suspectedDiagnosisOptions,
}: AFPFormContentProps) {
  const { data } = useAFPForm();

  const screeningStatus = getAFPScreeningStatus(data.clinicalInformation);

  return (
    <div className="space-y-4">
      <ClinicalInformationSection />

      {screeningStatus === "pending" && (
        <div
          className="
            rounded-lg
            border
            border-[#dbe5ef]
            bg-white
            px-4
            py-3
            text-sm
            text-[#64748b]
          "
        >
          Complete the AFP screening questions to continue the investigation.
        </div>
      )}

      {screeningStatus === "eligible" && (
        <>
          <SignsSymptomsSection facilityOptions={facilityOptions} />
          <VaccinationHistorySection />
          <TravelHistorySection />
          <ClinicalExaminationSection />
          <PreviousHealthcareContactsSection
            suspectedDiagnosisOptions={suspectedDiagnosisOptions}
          />
          <AdditionalInformationSection />
        </>
      )}

      {/* Validation pilot: currently validates Clinical Information only. */}
      <AFPSubmitButton />
    </div>
  );
}

export function AFPInvestigationForm({
  value,
  onChange,
  readOnly = false,
  facilityOptions,
  suspectedDiagnosisOptions,
}: AFPInvestigationFormProps) {
  return (
    <AFPFormProvider value={value} onChange={onChange} readOnly={readOnly}>
      <AFPValidationBridge
        suspectedDiagnosisOptions={suspectedDiagnosisOptions}
      >
        <AFPFormContent
          facilityOptions={facilityOptions}
          suspectedDiagnosisOptions={suspectedDiagnosisOptions}
        />
      </AFPValidationBridge>
    </AFPFormProvider>
  );
}

// Demo page

const demoFacilityOptions: AFPFacilityOption[] = [
  {
    value: "development-facility-1",
    label: "Development Facility 1",
  },
  {
    value: "development-facility-2",
    label: "Development Facility 2",
  },
];

const demoDiagnosisOptions: AFPSuspectedDiagnosisOption[] = [
  {
    value: "development-diagnosis-1",
    label: "Development Diagnosis 1",
  },
  {
    value: "development-diagnosis-2",
    label: "Development Diagnosis 2",
  },
];

export default function AFPDemoPage() {
  const [afpData, setAfpData] = useState<AFPFormData>(createInitialAFPFormData);

  return (
    <Box
      component="main"
      className="
        mx-auto
        w-full
        max-w-350
        px-3
        py-6
        sm:px-6
        lg:py-8
      "
    >
      <Box className="mb-6">
        <Typography
          component="h1"
          sx={{
            color: "#173b69",
            fontSize: {
              xs: "1.25rem",
              sm: "1.5rem",
            },
            fontWeight: 700,
          }}
        >
          Acute Flaccid Paralysis (AFP)
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: "#64748b",
            fontSize: "0.875rem",
          }}
        >
          Case Investigation Form — Frontend Part
        </Typography>
      </Box>

      <AFPInvestigationForm
        value={afpData}
        onChange={setAfpData}
        facilityOptions={demoFacilityOptions}
        suspectedDiagnosisOptions={demoDiagnosisOptions}
      />

      <Paper
        variant="outlined"
        sx={{
          mt: 4,
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
          }}
        >
          <Typography
            component="h2"
            sx={{
              color: "#173b69",
              fontSize: "0.95rem",
              fontWeight: 700,
            }}
          >
            Development State
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              color: "#64748b",
              fontSize: "0.72rem",
            }}
          >
            Frontend-only JSON preview. This is not an API payload.
          </Typography>
        </Box>

        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            maxHeight: 600,
            overflow: "auto",
            backgroundColor: "#0f172a",
            color: "#e2e8f0",
            fontFamily: "Consolas, 'Courier New', monospace",
            fontSize: "0.72rem",
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(afpData, null, 2)}
        </Box>
      </Paper>
    </Box>
  );
}

// Original public type exports retained.

// ===== Merged source: AdditionalInformationSection(2).tsx =====
// =========================================================
// TYPES
// =========================================================

interface NumberQuestionRowProps extends NumberFieldProps {
  label: string;
  className: string;
  fieldId: string;
}

interface QuestionCardProps {
  number: number;
  label: string;
  value: YesNoPending;
  onChange: (value: YesNoPending) => void;
  ariaLabel: string;
  disabled?: boolean;
  children?: ReactNode;

  // NEW: Validation
  fieldId: string;
  error?: string;
}

// =========================================================
// SHARED STYLING — UNCHANGED
// =========================================================

const dependentLabelClass = "pt-2 text-[12px] font-semibold text-[#173b69]";

const countRowClass =
  "grid gap-2 sm:grid-cols-[max-content_140px] sm:items-start";

// =========================================================
// NUMBER QUESTION ROW
// NEW: MUI ERROR + INLINE MESSAGE
// =========================================================

function NumberQuestionRow({
  label,
  className,
  fieldId,
  errorMessage = "",
  ...fieldProps
}: NumberQuestionRowProps) {
  return (
    <ValidatedField
      fieldId={fieldId}
      error={errorMessage}
      className="[&_.MuiFormHelperText-root]:mt-1!"
    >
      <div className={className}>
        <FieldLabel fieldId={fieldId} className={dependentLabelClass}>
          {label}
        </FieldLabel>

        <NumberField {...fieldProps} error={Boolean(errorMessage)} />
      </div>
    </ValidatedField>
  );
}

// =========================================================
// QUESTION CARD
// NEW: MUI YES / NO / PENDING VALIDATION
// =========================================================

function QuestionCard({
  number,
  label,
  value,
  onChange,
  ariaLabel,
  disabled = false,
  children,
  fieldId,
  error = "",
}: QuestionCardProps) {
  return (
    <div className="rounded-xl border border-[#d6e3f0] bg-[#f5f9fd] p-4 sm:p-5">
      <ValidatedField fieldId={fieldId} error={error}>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <FieldLabel
            fieldId={fieldId}
            component="p"
            className="m-0 pt-2 text-[13px] font-bold leading-5 text-[#173b69]"
          >
            {number}. {label}
          </FieldLabel>

          <YesNoPendingField
            value={value}
            onChange={onChange}
            disabled={disabled}
            ariaLabel={ariaLabel}
            error={Boolean(error)}
            errorId={`${fieldId}-error`}
          />
        </div>
      </ValidatedField>

      {children}
    </div>
  );
}

// =========================================================
// ADDITIONAL INFORMATION SECTION
// =========================================================

function AdditionalInformationSection() {
  const { data, updateData, readOnly } = useAFPForm();

  // NEW: Shared Submit Form validation.
  const { errors, attempted } = useAFPValidation();

  const additional = data.additionalInformation;

  // Existing local touched states — unchanged.
  const [additionalCountTouched, setAdditionalCountTouched] = useState(false);

  const [vaccinatedCountTouched, setVaccinatedCountTouched] = useState(false);

  const [explanationTouched, setExplanationTouched] = useState(false);

  // =========================================================
  // EXISTING CONTEXT UPDATE FUNCTIONS — UNCHANGED
  // =========================================================

  const updateAdditional = (
    updater: (previous: AFPAdditionalInformation) => AFPAdditionalInformation,
  ) => {
    updateData((previous) => ({
      ...previous,
      additionalInformation: updater(previous.additionalInformation),
    }));
  };

  const updateAdditionalField = <K extends keyof AFPAdditionalInformation>(
    field: K,
    value: AFPAdditionalInformation[K],
  ) => {
    updateAdditional((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Question 1: Search for additional AFP cases
  const updateSearchStatus = (value: YesNoPending) => {
    updateAdditional((previous) => ({
      ...previous,
      searchForAdditionalCases: value,

      additionalCasesIdentified:
        value === "yes" ? previous.additionalCasesIdentified : null,

      numberOfAdditionalCases:
        value === "yes" ? previous.numberOfAdditionalCases : null,
    }));

    if (value !== "yes") {
      setAdditionalCountTouched(false);
    }
  };

  // Question 1: Additional AFP cases toggle
  const updateAdditionalCasesIdentified = (value: YesNo) => {
    updateAdditional((previous) => ({
      ...previous,
      additionalCasesIdentified: value,

      numberOfAdditionalCases:
        value === "yes" ? previous.numberOfAdditionalCases : null,
    }));

    if (value !== "yes") {
      setAdditionalCountTouched(false);
    }
  };

  // Question 2: Outbreak response immunization
  const updateOutbreakResponse = (value: YesNoPending) => {
    updateAdditional((previous) => ({
      ...previous,
      outbreakResponseImmunizationDone: value,

      numberOfChildrenVaccinated:
        value === "yes" ? previous.numberOfChildrenVaccinated : null,

      outbreakResponseExplanation:
        value === "no" ? previous.outbreakResponseExplanation : "",
    }));

    if (value !== "yes") {
      setVaccinatedCountTouched(false);
    }

    if (value !== "no") {
      setExplanationTouched(false);
    }
  };

  // =========================================================
  // VALIDATION FIELD IDS
  // =========================================================

  const searchStatusId = "additionalInformation.searchForAdditionalCases";

  const additionalCountId = "additionalInformation.numberOfAdditionalCases";

  const outbreakResponseId =
    "additionalInformation.outbreakResponseImmunizationDone";

  const vaccinatedCountId = "additionalInformation.numberOfChildrenVaccinated";

  const explanationId = "additionalInformation.outbreakResponseExplanation";

  // =========================================================
  // VALIDATION ERRORS
  //
  // Submission errors take priority.
  // Existing blur-time validation is retained.
  // =========================================================

  const searchStatusError = errors[searchStatusId] ?? "";

  const outbreakResponseError = errors[outbreakResponseId] ?? "";

  const additionalCountError = attempted
    ? errors[additionalCountId] ||
      (additionalCountTouched &&
      additional.additionalCasesIdentified === "yes" &&
      additional.numberOfAdditionalCases === null
        ? "Enter how many additional AFP cases were identified."
        : "")
    : "";

  const vaccinatedCountError = attempted
    ? errors[vaccinatedCountId] ||
      (vaccinatedCountTouched &&
      additional.outbreakResponseImmunizationDone === "yes" &&
      additional.numberOfChildrenVaccinated === null
        ? "Enter how many children were vaccinated."
        : "")
    : "";

  const explanationError = attempted
    ? errors[explanationId] ||
      (explanationTouched &&
      additional.outbreakResponseImmunizationDone === "no" &&
      !additional.outbreakResponseExplanation.trim()
        ? "Please explain why outbreak response immunization was not done."
        : "")
    : "";

  // =========================================================
  // SECTION UI — ORIGINAL LAYOUT PRESERVED
  // =========================================================

  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}
      <div className="border-b border-[#dce7f2] px-5 py-3 sm:px-7">
        <h2 className="m-0 text-[18px] font-bold text-[#173b69]">
          Additional Information
        </h2>
      </div>

      <div className="px-5 py-5 sm:px-7">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* ===============================================
              QUESTION 1
             =============================================== */}

          <QuestionCard
            number={1}
            label="Search for additional AFP cases?"
            value={additional.searchForAdditionalCases}
            onChange={updateSearchStatus}
            disabled={readOnly}
            ariaLabel="Search for additional AFP cases"
            fieldId={searchStatusId}
            error={searchStatusError}
          >
            {additional.searchForAdditionalCases === "yes" && (
              <div className="mt-4 w-max rounded-lg border border-[#cbdced] bg-[#eff6ff] px-4 py-4 sm:px-5">
                {/* ADDITIONAL AFP CASES TOGGLE */}

                <div className="flex flex-col gap-3 border-b border-[#d6e3f0] pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[12px] font-semibold leading-5 text-[#173b69]">
                    Additional AFP cases identified?
                  </p>

                  <ToggleSwitch
                    checked={additional.additionalCasesIdentified === "yes"}
                    onChange={(checked) =>
                      updateAdditionalCasesIdentified(checked ? "yes" : "no")
                    }
                    disabled={readOnly}
                    ariaLabel="Additional AFP cases identified"
                  />
                </div>

                {/* CONDITIONAL NUMBER FIELD */}

                {additional.additionalCasesIdentified === "yes" && (
                  <NumberQuestionRow
                    className="mt-4 grid gap-5 sm:grid-cols-[max-content_140px] sm:items-start"
                    fieldId={additionalCountId}
                    label="How many?"
                    value={additional.numberOfAdditionalCases}
                    onChange={(value) =>
                      updateAdditionalField("numberOfAdditionalCases", value)
                    }
                    disabled={readOnly}
                    ariaLabel="Number of additional AFP cases identified"
                    onTouched={() => setAdditionalCountTouched(true)}
                    errorMessage={additionalCountError}
                  />
                )}
              </div>
            )}
          </QuestionCard>

          {/* ===============================================
              QUESTION 2
             =============================================== */}

          <QuestionCard
            number={2}
            label="Outbreak response immunization done?"
            value={additional.outbreakResponseImmunizationDone}
            onChange={updateOutbreakResponse}
            disabled={readOnly}
            ariaLabel="Outbreak response immunization done"
            fieldId={outbreakResponseId}
            error={outbreakResponseError}
          >
            {/* CONDITIONAL VACCINATED COUNT */}

            {additional.outbreakResponseImmunizationDone === "yes" && (
              <NumberQuestionRow
                className={`mt-4 border-t border-[#dce6f0] pt-4 ${countRowClass}`}
                fieldId={vaccinatedCountId}
                label="How many children vaccinated?"
                value={additional.numberOfChildrenVaccinated}
                onChange={(value) =>
                  updateAdditionalField("numberOfChildrenVaccinated", value)
                }
                disabled={readOnly}
                ariaLabel="Number of children vaccinated"
                onTouched={() => setVaccinatedCountTouched(true)}
                errorMessage={vaccinatedCountError}
              />
            )}

            {/* CONDITIONAL EXPLANATION */}

            {additional.outbreakResponseImmunizationDone === "no" && (
              <div className="mt-4 flex flex-col gap-1 border-t border-[#dce6f0] pt-4">
                <FieldLabel
                  fieldId={explanationId}
                  htmlFor="afp-ori-explanation"
                  className="text-[12px] font-semibold leading-5 text-[#173b69]"
                >
                  Please explain why outbreak response immunization was not done
                </FieldLabel>

                <div className="min-w-0" data-afp-field={explanationId}>
                  <TextField
                    id="afp-ori-explanation"
                    value={additional.outbreakResponseExplanation}
                    onChange={(event) =>
                      updateAdditionalField(
                        "outbreakResponseExplanation",
                        event.target.value,
                      )
                    }
                    onBlur={() => setExplanationTouched(true)}
                    disabled={readOnly}
                    fullWidth
                    size="small"
                    error={Boolean(explanationError)}
                    helperText={explanationError || undefined}
                    placeholder="Please Explain"
                    slotProps={{
                      htmlInput: {
                        maxLength: 500,
                      },
                      formHelperText: {
                        sx: {
                          m: 0,
                          mt: 1,
                          fontSize: "0.75rem",
                          lineHeight: 1.5,
                          whiteSpace: "nowrap",
                        },
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        minHeight: 38,
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },

                      "& input": {
                        py: "8px",
                        fontSize: "0.78rem",
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </QuestionCard>
        </div>

        {/* ===============================================
            PENDING INFORMATION NOTICE — UNCHANGED
           =============================================== */}

        <div className="mt-5 rounded-lg border border-[#f0c97d] bg-[#fff8e9] px-4 py-3 sm:px-5">
          <p className="m-0 text-[12px] font-semibold leading-5 text-[#8a5811]">
            If the answer to the question no 1 or 2 is Pending, complete
            activities within 7 days of AFP confirmation and share the updated
            form with EPI HQ.
          </p>
        </div>
      </div>
    </section>
  );
}

// ===== Merged source: ClinicalExaminationSection(3).tsx =====
function ClinicalExaminationSection() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}
      <div className="border-b border-[#dce7f2] px-5 py-3 sm:px-7">
        <h2 className="m-0 text-[18px] font-bold text-[#173b69]">
          Clinical Examination
        </h2>
      </div>

      {/* REFLEXES & MUSCLE STRENGTH */}
      {/* <div className="grid grid-cols-1 items-stretch gap-5 px-5 py-5 sm:px-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"> */}
      <div className="grid grid-cols-1 items-stretch gap-5 px-5 py-5 sm:px-7 xl:grid-cols-2">
        <ReflexesSection />
        <MuscleStrengthSection />
      </div>
    </section>
  );
}

// ===== Merged source: ClinicalInformationSection(20261102-054535).tsx =====
type YesNoClinicalField =
  | "paralysisPresent"
  | "paralysisFlaccid"
  | "paralysisSuddenOnset"
  | "paralysisCausedByInjury"
  | "paralysisPresentAtBirth";

interface ClinicalQuestion {
  number: number;
  label: string;
  field: YesNoClinicalField;
}

interface ClinicalYesNoQuestionProps {
  number: number;
  label: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
  disabled?: boolean;
  fieldId: string;
  error?: string;
}

interface ClinicalDateQuestionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

// Question configurations
const leftQuestions: ClinicalQuestion[] = [
  {
    number: 1,
    label: "Is or was paralysis present?",
    field: "paralysisPresent",
  },
  {
    number: 2,
    label: "Is the paralysis flaccid (floppy)?",
    field: "paralysisFlaccid",
  },
  {
    number: 3,
    label: "Did paralysis occur suddenly?",
    field: "paralysisSuddenOnset",
  },
];

const rightQuestions: ClinicalQuestion[] = [
  {
    number: 5,
    label: "Was paralysis caused by injury?",
    field: "paralysisCausedByInjury",
  },
  {
    number: 6,
    label: "Was paralysis present at birth?",
    field: "paralysisPresentAtBirth",
  },
];

// Shared styling
const questionRowClass =
  "grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start";

const questionLabelClass =
  "m-0 pt-1 text-[13px] font-semibold leading-5 text-[#173b69]";

// Reusable Yes/No question
function ClinicalYesNoQuestion({
  number,
  label,
  value,
  onChange,
  disabled = false,
  fieldId,
  error = "",
}: ClinicalYesNoQuestionProps) {
  return (
    <ValidatedField
      fieldId={fieldId}
      error={error}
      className="border-b border-[#dde7f0]"
    >
      <div className={questionRowClass}>
        <FieldLabel
          component="p"
          fieldId={fieldId}
          className={questionLabelClass}
        >
          {number}. {label}
        </FieldLabel>

        <YesNoField
          value={value}
          onChange={onChange}
          disabled={disabled}
          ariaLabel={`${number}. ${label}`}
          error={Boolean(error)}
          errorId={`${fieldId}-error`}
        />
      </div>
    </ValidatedField>
  );
}

// Date question
function ClinicalDateQuestion({
  value,
  onChange,
  disabled = false,
  error = "",
}: ClinicalDateQuestionProps) {
  return (
    <ValidatedField
      fieldId="clinicalInformation.paralysisOnsetDate"
      error={error}
      className="border-b border-[#dde7f0]"
    >
      <div className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-start">
        <FieldLabel
          component="p"
          fieldId="clinicalInformation.paralysisOnsetDate"
          className="m-0 pt-2 text-[13px] font-semibold leading-5 text-[#173b69]"
        >
          4. Date of paralysis onset
        </FieldLabel>

        <DateField
          value={value}
          onChange={onChange}
          disabled={disabled}
          noFuture
          ariaLabel="Date of paralysis onset"
          errorMessage={error}
        />
      </div>
    </ValidatedField>
  );
}

function ClinicalInformationSection() {
  const { data, updateData, readOnly } = useAFPForm();
  const { errors } = useAFPValidation();

  const clinicalInformation = data.clinicalInformation;
  const screeningStatus = getAFPScreeningStatus(clinicalInformation);

  // Update Yes/No answers and dependent sections
  const updateYesNoField = (field: YesNoClinicalField, value: YesNo) => {
    updateData((previous) => {
      const nextClinicalInformation: AFPClinicalInformation = {
        ...previous.clinicalInformation,
        [field]: value,
      };

      const nextScreeningStatus = getAFPScreeningStatus(
        nextClinicalInformation,
      );

      const isEligible = nextScreeningStatus === "eligible";
      const isNotEligible = nextScreeningStatus === "not_eligible";

      return {
        ...previous,
        clinicalInformation: nextClinicalInformation,

        // Diagnosis is only retained for not-eligible screening
        screeningDiagnosis: isNotEligible ? previous.screeningDiagnosis : "",

        // Reset dependent sections when screening is not eligible
        signsSymptoms: isEligible
          ? previous.signsSymptoms
          : createInitialAFPSignsSymptoms(),

        vaccinationHistory: isEligible
          ? previous.vaccinationHistory
          : createInitialAFPVaccinationHistory(),

        travelHistory: isEligible
          ? previous.travelHistory
          : createInitialAFPTravelHistory(),

        clinicalExamination: isEligible
          ? previous.clinicalExamination
          : createInitialAFPClinicalExamination(),

        additionalInformation: isEligible
          ? previous.additionalInformation
          : createInitialAFPAdditionalInformation(),
      };
    });
  };

  // Update paralysis onset date
  const updateOnsetDate = (value: string) => {
    updateData((previous) => {
      const nextClinicalInformation: AFPClinicalInformation = {
        ...previous.clinicalInformation,
        paralysisOnsetDate: value,
      };

      const nextStatus = getAFPScreeningStatus(nextClinicalInformation);

      const onsetAgeDays = getAFPOnsetAgeDays(value);

      // Do not clear entered details while editing an
      // incomplete date. Reset when the valid onset date
      // confirms the case is outside the 60-day window.
      const outsideWindow = onsetAgeDays !== null && onsetAgeDays >= 60;

      return {
        ...previous,
        clinicalInformation: nextClinicalInformation,

        screeningDiagnosis:
          nextStatus === "not_eligible" ? previous.screeningDiagnosis : "",

        signsSymptoms: outsideWindow
          ? createInitialAFPSignsSymptoms()
          : previous.signsSymptoms,

        vaccinationHistory: outsideWindow
          ? createInitialAFPVaccinationHistory()
          : previous.vaccinationHistory,

        travelHistory: outsideWindow
          ? createInitialAFPTravelHistory()
          : previous.travelHistory,

        clinicalExamination: outsideWindow
          ? createInitialAFPClinicalExamination()
          : previous.clinicalExamination,

        additionalInformation: outsideWindow
          ? createInitialAFPAdditionalInformation()
          : previous.additionalInformation,
      };
    });
  };

  // Update screening diagnosis
  const updateScreeningDiagnosis = (value: string) => {
    updateData((previous) => ({
      ...previous,
      screeningDiagnosis: value,
    }));
  };

  // Render reusable Yes/No questions
  const renderQuestion = ({ number, label, field }: ClinicalQuestion) => (
    <ClinicalYesNoQuestion
      key={field}
      number={number}
      label={label}
      value={clinicalInformation[field]}
      onChange={(value) => updateYesNoField(field, value)}
      disabled={readOnly}
      fieldId={`clinicalInformation.${field}`}
      error={errors[`clinicalInformation.${field}`]}
    />
  );

  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}
      <div className="border-b border-[#e0e8f0] px-5 py-3 sm:px-7">
        <h2 className="m-0 text-[18px] font-bold text-[#173b69]">
          Clinical Information
        </h2>
      </div>

      {/* CLINICAL QUESTIONS */}
      <div className="grid grid-cols-1 px-5 pb-5 sm:px-7 lg:grid-cols-2 lg:gap-x-10">
        {/* LEFT: QUESTIONS 1–3 */}
        <div>{leftQuestions.map(renderQuestion)}</div>

        {/* RIGHT: QUESTIONS 4–6 */}
        <div>
          <ClinicalDateQuestion
            value={clinicalInformation.paralysisOnsetDate}
            onChange={updateOnsetDate}
            disabled={readOnly}
            error={errors["clinicalInformation.paralysisOnsetDate"]}
          />

          {rightQuestions.map(renderQuestion)}
        </div>
      </div>

      {/* SCREENING DIAGNOSIS */}
      {screeningStatus === "not_eligible" && (
        <div className="mx-5 mb-5 rounded-lg border border-[#f0cf8c] bg-[#fff9ec] px-4 py-4 sm:mx-7 sm:px-5">
          <label
            htmlFor="afp-screening-diagnosis"
            className="mb-2 block text-[16px] font-medium text-[#8a5a13]"
          >
            Based on your answer, the Patient has not affected with Acute
            Flaccid Paralysis. Specify the diagnosis, if known:
          </label>

          <TextField
            id="afp-screening-diagnosis"
            value={data.screeningDiagnosis}
            onChange={(event) => updateScreeningDiagnosis(event.target.value)}
            disabled={readOnly}
            fullWidth
            size="small"
            placeholder="Enter diagnosis if known"
            slotProps={{
              htmlInput: {
                maxLength: 250,
              },
            }}
            sx={{
              maxWidth: 520,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#ffffff",
              },
              "& input": {
                fontSize: "0.82rem",
              },
            }}
          />
        </div>
      )}
    </section>
  );
}

// ===== Merged source: MuscleStrengthSection(2).tsx =====
type MuscleSide = "right" | "left";
type MuscleRegion = "upperLimb" | "lowerLimb";

type MuscleRegionFields = {
  upperLimb: AFPUpperLimbMuscleStrength;
  lowerLimb: AFPLowerLimbMuscleStrength;
};

interface MuscleStrengthRowProps {
  label: string;
  value: AFPMuscleStrengthPair;

  // NEW: Validation
  fieldId: string;
  errors: Record<string, string>;

  onChange: (side: MuscleSide, value: MuscleScore) => void;

  disabled?: boolean;
}

interface MuscleStrengthTableProps {
  title: string;
  children: ReactNode;
}

// =========================================================
// EXISTING CONFIGURATION
// =========================================================

const sides = [
  { key: "right", title: "Rt" },
  { key: "left", title: "Lt" },
] as const;

const tableGridClass =
  "grid grid-cols-1 sm:grid-cols-[minmax(130px,0.75fr)_minmax(0,1fr)_minmax(0,1fr)]";

const mobileSideLabelClass =
  "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#64748b] sm:hidden";

const desktopSideLabelClass =
  "hidden text-center text-[11px] font-bold uppercase tracking-wide text-[#52677e] sm:block";

// =========================================================
// MUSCLE STRENGTH ROW — MUI v9 VALIDATION
// =========================================================

function MuscleStrengthRow({
  label,
  value,
  fieldId,
  errors,
  onChange,
  disabled = false,
}: MuscleStrengthRowProps) {
  return (
    <div
      className={`${tableGridClass} gap-3 border-t border-[#e1e9f1] px-3 py-3 sm:items-start sm:px-4`}
    >
      <div className="pt-0 sm:pt-2">
        <FieldLabel
          component="span"
          fieldId={`${fieldId}.right`}
          className="text-[12px] font-semibold text-[#334155]"
        >
          {label}
        </FieldLabel>
      </div>

      {sides.map(({ key, title }) => {
        const inputFieldId = `${fieldId}.${key}`;

        const errorMessage = errors[inputFieldId] ?? "";

        const hasError = Boolean(errorMessage);

        return (
          <FormControl
            key={key}
            component="div"
            fullWidth
            size="small"
            error={hasError}
            data-afp-field={inputFieldId}
            aria-invalid={hasError || undefined}
            sx={(theme) => ({
              minWidth: 0,

              // MUI v9 error border for the existing
              // MuscleStrengthSelect component.
              ...(hasError && {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: `${theme.palette.error.main} !important`,
                },

                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: `${theme.palette.error.main} !important`,
                  },

                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: `${theme.palette.error.main} !important`,
                  },
              }),
            })}
          >
            <span className={mobileSideLabelClass}>{title}</span>

            {/* EXISTING SELECT — UNCHANGED */}
            <MuscleStrengthSelect
              value={value[key]}
              onChange={(score) => onChange(key, score)}
              disabled={disabled}
              ariaLabel={`${label} ${key} muscle strength`}
            />

            {/* NEW: MUI ERROR MESSAGE */}
            {hasError && (
              <FormHelperText
                id={`${inputFieldId}-error`}
                role="alert"
                sx={{
                  m: 0,
                  mt: 0.75,
                  fontSize: "0.69rem",
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                }}
              >
                {errorMessage}
              </FormHelperText>
            )}
          </FormControl>
        );
      })}
    </div>
  );
}

// =========================================================
// MUSCLE STRENGTH TABLE — UNCHANGED
// =========================================================

function MuscleStrengthTable({ title, children }: MuscleStrengthTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d5e1ed] bg-white">
      <div
        className={`${tableGridClass} bg-[#eef5fc] px-3 py-3 sm:items-center sm:px-4`}
      >
        <h4 className="m-0 text-[13px] font-bold text-[#173b69]">{title}</h4>

        {sides.map(({ key, title: heading }) => (
          <span key={key} className={desktopSideLabelClass}>
            {heading}
          </span>
        ))}
      </div>

      {children}
    </div>
  );
}

// =========================================================
// MUSCLE STRENGTH SECTION
// =========================================================

function MuscleStrengthSection() {
  const { data, updateData, readOnly } = useAFPForm();

  // NEW: Shared Submit Form validation
  const { errors } = useAFPValidation();

  const muscleStrength = data.clinicalExamination.muscleStrength;

  // =======================================================
  // EXISTING UPDATE FUNCTION — UNCHANGED
  // =======================================================

  const updateMuscleStrength = <Region extends MuscleRegion>(
    region: Region,
    field: keyof MuscleRegionFields[Region],
    side: MuscleSide,
    value: MuscleScore,
  ) => {
    updateData((previous) => {
      const examination = previous.clinicalExamination;

      const previousStrength = examination.muscleStrength;

      const previousRegion = previousStrength[region];

      return {
        ...previous,
        clinicalExamination: {
          ...examination,
          muscleStrength: {
            ...previousStrength,
            [region]: {
              ...previousRegion,
              [field]: {
                ...previousRegion[field],
                [side]: value,
              },
            },
          },
        },
      };
    });
  };

  // =======================================================
  // SECTION UI
  // =======================================================

  return (
    <div className="h-full min-w-0 self-stretch rounded-xl border border-[#d9e5f1] bg-[#f8fbff] p-4 sm:p-5">
      <h3 className="m-0 mb-4 text-[16px] font-bold text-[#173b69]">
        Muscle Strength
      </h3>

      <div className="grid grid-cols-1 gap-5">
        {/* UPPER LIMB */}
        <MuscleStrengthTable title="Upper Limb">
          {UPPER_LIMB_MUSCLE_FIELDS.map(({ key, label }) => (
            <MuscleStrengthRow
              key={key}
              label={label}
              value={muscleStrength.upperLimb[key]}
              fieldId={`clinicalExamination.muscleStrength.upperLimb.${key}`}
              errors={errors}
              onChange={(side, score) =>
                updateMuscleStrength("upperLimb", key, side, score)
              }
              disabled={readOnly}
            />
          ))}
        </MuscleStrengthTable>

        {/* LOWER LIMB */}
        <MuscleStrengthTable title="Lower Limb">
          {LOWER_LIMB_MUSCLE_FIELDS.map(({ key, label }) => (
            <MuscleStrengthRow
              key={key}
              label={label}
              value={muscleStrength.lowerLimb[key]}
              fieldId={`clinicalExamination.muscleStrength.lowerLimb.${key}`}
              errors={errors}
              onChange={(side, score) =>
                updateMuscleStrength("lowerLimb", key, side, score)
              }
              disabled={readOnly}
            />
          ))}
        </MuscleStrengthTable>
      </div>
    </div>
  );
}

// ===== Merged source: PreviousHealthcareContactsSection(2).tsx =====
interface PreviousHealthcareContactsSectionProps {
  suspectedDiagnosisOptions?: AFPSuspectedDiagnosisOption[];
}

type ContactTextField = "providerName" | "address" | "actionTakenPlanned";

type EditableContactField =
  | ContactTextField
  | "dateCaseVisited"
  | "alreadyInNetwork"
  | "reportedCase";

interface CompactTextFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  maxLength?: number;
  multiline?: boolean;
  minRows?: number;
  disabled?: boolean;
  error?: boolean;
  errorId?: string;
}

interface ContactBlockProps {
  contact: AFPHealthcareContact;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onTextChange: (field: ContactTextField, value: string) => void;
  onDateChange: (value: string) => void;
  onNetworkChange: (value: YesNoUnknown) => void;
  onReportChange: (value: YesNo) => void;
  errors: AFPValidationErrors;
  disabled?: boolean;
  compactLayout?: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

interface OptionsSelectProps {
  value: string | null;
  options: readonly SelectOption[];
  onChange: (event: SelectChangeEvent<string>) => void;
  placeholder: string;
  placeholderClassName: string;
  ariaLabel: string;
  disabled: boolean;
  wrapMenuItems?: boolean;
  error?: boolean;
  errorId?: string;
}

// =========================================================
// SHARED STYLING
// =========================================================

const contactLabelClass =
  "mb-1.5 block text-[12px] font-semibold text-[#173b69]";

const sideLabelClass = "mb-1.5 block text-[12px] font-semibold text-[#617996]";

const selectSx = {
  minHeight: 40,
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  fontSize: "0.78rem",
};

const errorSpacing = "[&_.MuiFormHelperText-root]:mt-2!";

// =========================================================
// TEXT QUESTIONS
// =========================================================

const textQuestions = [
  {
    field: "providerName",
    label: "1. Name of Hospital/ Doctor/ Health care provider",
    placeholder: "Enter name",
    ariaSuffix: "provider name",
    maxLength: 250,
  },
  {
    field: "address",
    label: "2. Address",
    placeholder: "Enter address",
    ariaSuffix: "address",
    maxLength: 500,
  },
  {
    field: "actionTakenPlanned",
    label: "6. Action taken / planned",
    placeholder: "Enter action taken or planned",
    ariaSuffix: "action taken or planned",
    maxLength: 500,
  },
] as const satisfies readonly {
  field: ContactTextField;
  label: string;
  placeholder: string;
  ariaSuffix: string;
  maxLength: number;
}[];

// =========================================================
// COMPACT TEXT FIELD
// Native MUI error property added.
// =========================================================

function CompactTextField({
  id,
  value,
  onChange,
  placeholder,
  ariaLabel,
  maxLength = 250,
  multiline = false,
  minRows,
  disabled = false,
  error = false,
  errorId,
}: CompactTextFieldProps) {
  return (
    <TextField
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
      error={error}
      fullWidth
      size="small"
      multiline={multiline}
      minRows={minRows}
      slotProps={{
        htmlInput: {
          maxLength,
          "aria-describedby": error ? errorId : undefined,
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          minHeight: multiline ? undefined : 40,
          borderRadius: "8px",
          backgroundColor: "#ffffff",
        },
        "& input": {
          fontSize: "0.78rem",
        },
        "& textarea": {
          fontSize: "0.78rem",
          lineHeight: 1.5,
        },
      }}
    />
  );
}

// =========================================================
// OPTIONS SELECT
// MUI FormControl error support added.
// =========================================================

function OptionsSelect({
  value,
  options,
  onChange,
  placeholder,
  placeholderClassName,
  ariaLabel,
  disabled,
  wrapMenuItems = false,
  error = false,
  errorId,
}: OptionsSelectProps) {
  return (
    <FormControl fullWidth size="small" disabled={disabled} error={error}>
      <Select<string>
        value={value ?? ""}
        onChange={onChange}
        displayEmpty
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
        renderValue={(selected) =>
          !selected ? (
            <span className={placeholderClassName}>{placeholder}</span>
          ) : (
            (options.find((option) => option.value === selected)?.label ??
            selected)
          )
        }
        sx={selectSx}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                ...(wrapMenuItems ? { maxWidth: 420 } : {}),
                "& .MuiMenuItem-root": {
                  ...(wrapMenuItems ? { whiteSpace: "normal" } : {}),
                  fontSize: "0.8rem",
                },
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// =========================================================
// STABLE CONTACT VALIDATION ID
// =========================================================

const contactFieldId = (contactId: string, field: string) =>
  `previousHealthcareContacts.contacts.${contactId}.${field}`;

// =========================================================
// REUSABLE CONTACT TEXT QUESTION
// =========================================================

function ContactTextQuestion({
  question,
  contact,
  contactNumber,
  onTextChange,
  disabled,
  errors,
}: {
  question: (typeof textQuestions)[number];
  contact: AFPHealthcareContact;
  contactNumber: number;
  onTextChange: ContactBlockProps["onTextChange"];
  disabled: boolean;
  errors: AFPValidationErrors;
}) {
  const fieldId = contactFieldId(contact.id, question.field);

  const error = errors[fieldId] ?? "";

  return (
    <ValidatedField fieldId={fieldId} error={error} className={errorSpacing}>
      <FieldLabel fieldId={fieldId} className={contactLabelClass}>
        {question.label}
      </FieldLabel>

      <CompactTextField
        value={contact[question.field]}
        onChange={(value) => onTextChange(question.field, value)}
        placeholder={question.placeholder}
        ariaLabel={`Contact ${contactNumber} ${question.ariaSuffix}`}
        maxLength={question.maxLength}
        disabled={disabled}
        error={Boolean(error)}
        errorId={`${fieldId}-error`}
      />
    </ValidatedField>
  );
}

// =========================================================
// INDIVIDUAL HEALTHCARE CONTACT
// =========================================================

function ContactBlock({
  contact,
  index,
  canRemove,
  onRemove,
  onTextChange,
  onDateChange,
  onNetworkChange,
  onReportChange,
  errors,
  disabled = false,
  compactLayout = false,
}: ContactBlockProps) {
  const contactNumber = index + 1;

  const dateId = contactFieldId(contact.id, "dateCaseVisited");

  const networkId = contactFieldId(contact.id, "alreadyInNetwork");

  const reportId = contactFieldId(contact.id, "reportedCase");

  const dateError = errors[dateId] ?? "";
  const networkError = errors[networkId] ?? "";
  const reportError = errors[reportId] ?? "";

  return (
    <div className="w-full min-w-0 rounded-xl border border-[#d8e5f2] bg-[#f8fbff] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="m-0 text-[14px] font-bold text-[#173b69]">
          Contact {contactNumber}
        </h4>

        {canRemove && (
          <Button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            startIcon={<DeleteOutlinedIcon />}
            size="small"
            sx={{
              color: "#b42318",
              fontSize: "0.72rem",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#fff1f0",
              },
            }}
          >
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* QUESTIONS 1 & 2 */}

        {textQuestions.slice(0, 2).map((question) => (
          <ContactTextQuestion
            key={question.field}
            question={question}
            contact={contact}
            contactNumber={contactNumber}
            onTextChange={onTextChange}
            disabled={disabled}
            errors={errors}
          />
        ))}

        {/* QUESTIONS 3, 4 & 5 */}

        <div
          className={`grid gap-4 md:grid-cols-[170px_minmax(0,240px)_minmax(0,240px)] md:items-start ${
            compactLayout ? "lg:grid-cols-1 2xl:grid-cols-2" : ""
          }`}
        >
          {/* QUESTION 3 — DATE */}

          <ValidatedField
            fieldId={dateId}
            error={dateError}
            showMessage={false}
            className="min-w-0 [&_.MuiFormHelperText-root]:whitespace-nowrap"
          >
            <FieldLabel fieldId={dateId} className={contactLabelClass}>
              3. Dates case visited
            </FieldLabel>

            <DateField
              value={contact.dateCaseVisited}
              onChange={onDateChange}
              disabled={disabled}
              noFuture
              ariaLabel={`Contact ${contactNumber} date case visited`}
              errorMessage={dateError}
            />
          </ValidatedField>

          {/* QUESTION 4 — NETWORK */}

          <ValidatedField
            fieldId={networkId}
            error={networkError}
            className={`min-w-0 ${errorSpacing}`}
          >
            <FieldLabel fieldId={networkId} className={contactLabelClass}>
              4. Already in network?
            </FieldLabel>

            <YesNoUnknownField
              value={contact.alreadyInNetwork}
              onChange={onNetworkChange}
              disabled={disabled}
              ariaLabel={`Contact ${contactNumber} already in network`}
              error={Boolean(networkError)}
              errorId={`${networkId}-error`}
            />
          </ValidatedField>

          {/* QUESTION 5 — REPORTED CASE */}

          <ValidatedField
            fieldId={reportId}
            error={reportError}
            className={`min-w-0 ${errorSpacing}`}
          >
            <FieldLabel fieldId={reportId} className={contactLabelClass}>
              5. Did they / person report the case?
            </FieldLabel>

            <YesNoField
              value={contact.reportedCase}
              onChange={onReportChange}
              disabled={disabled}
              ariaLabel={`Contact ${contactNumber} reported the case`}
              error={Boolean(reportError)}
              errorId={`${reportId}-error`}
            />
          </ValidatedField>
        </div>

        {/* QUESTION 6 */}

        <ContactTextQuestion
          question={textQuestions[2]}
          contact={contact}
          contactNumber={contactNumber}
          onTextChange={onTextChange}
          disabled={disabled}
          errors={errors}
        />
      </div>
    </div>
  );
}

// =========================================================
// PREVIOUS HEALTHCARE CONTACTS SECTION
// =========================================================

function PreviousHealthcareContactsSection({
  suspectedDiagnosisOptions = [],
}: PreviousHealthcareContactsSectionProps) {
  const { data, updateData, readOnly } = useAFPForm();

  const { errors } = useAFPValidation();

  const history = data.previousHealthcareContacts;

  // =======================================================
  // EXISTING UPDATE FUNCTIONS — UNCHANGED
  // =======================================================

  const updateHistory = (
    updater: (
      previous: AFPPreviousHealthcareContacts,
    ) => AFPPreviousHealthcareContacts,
  ) => {
    updateData((previous) => ({
      ...previous,
      previousHealthcareContacts: updater(previous.previousHealthcareContacts),
    }));
  };

  // Update contact by ID
  const updateContact = (
    id: string,
    updater: (contact: AFPHealthcareContact) => AFPHealthcareContact,
  ) => {
    updateHistory((previous) => ({
      ...previous,
      contacts: previous.contacts.map((contact) =>
        contact.id === id ? updater(contact) : contact,
      ),
    }));
  };

  // Shared contact field updater
  const updateContactField = <K extends EditableContactField>(
    id: string,
    field: K,
    value: AFPHealthcareContact[K],
  ) => {
    updateContact(id, (contact) => ({
      ...contact,
      [field]: value,
    }));
  };

  // Add contact
  const addContact = () => {
    updateHistory((previous) => ({
      ...previous,
      contacts: [...previous.contacts, createInitialAFPHealthcareContact()],
    }));
  };

  // Remove contact
  const removeContact = (id: string) => {
    updateHistory((previous) => {
      if (previous.contacts.length <= 1) {
        return previous;
      }

      return {
        ...previous,
        contacts: previous.contacts.filter((contact) => contact.id !== id),
      };
    });
  };

  // First contact category
  const updateFirstContactCategory = (value: AFPFirstContactCategory) => {
    updateHistory((previous) => ({
      ...previous,
      firstContactCategory: value,
      firstContactCategoryOther:
        value === "Other" ? previous.firstContactCategoryOther : "",
    }));
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const option = FIRST_CONTACT_CATEGORY_OPTIONS.find(
      (item) => item.value === event.target.value,
    );

    if (option) {
      updateFirstContactCategory(option.value);
    }
  };

  // Suspected diagnosis
  const handleDiagnosisChange = (event: SelectChangeEvent<string>) => {
    const option = suspectedDiagnosisOptions.find(
      (item) => item.value === event.target.value,
    );

    if (!option) return;

    updateHistory((previous) => ({
      ...previous,
      suspectedDiagnosis: option.value,
    }));
  };

  // =======================================================
  // VALIDATION FIELD IDS
  // =======================================================

  const categoryId = "previousHealthcareContacts.firstContactCategory";

  const categoryOtherId =
    "previousHealthcareContacts.firstContactCategoryOther";

  const commentsId = "previousHealthcareContacts.additionalComments";

  const diagnosisId = "previousHealthcareContacts.suspectedDiagnosis";

  // =======================================================
  // UI — ORIGINAL LAYOUT PRESERVED
  // =======================================================

  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}

      <div className="border-b border-[#dce7f2] px-5 py-3 sm:px-7">
        <h2 className="m-0 text-[18px] font-bold uppercase leading-6 text-[#173b69]">
          History of Previous Contacts with Health Care Providers After Date of
          Paralysis Onset
        </h2>
      </div>

      <div className="px-0">
        {/* CONTACTS CONTAINER */}

        <div className="mx-0 w-full overflow-hidden border border-[#d8e5f2] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#d8e5f2] bg-[#f8fbff] px-4 py-3 sm:flex-row sm:items-center">
            <h3 className="m-0 text-[16px] font-bold text-[#2563b8]">
              CONTACTS
            </h3>

            <Button
              type="button"
              variant="contained"
              onClick={addContact}
              disabled={readOnly}
              sx={{
                width: "fit-content",
                borderRadius: "9px",
                backgroundColor: "#2864d7",
                px: 2.5,
                py: 0.9,
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#1f56bf",
                  boxShadow: "none",
                },
              }}
            >
              + Add more contacts
            </Button>
          </div>

          {/* CONTACT LIST — RESPONSIVE GRID */}

          <div
            className={
              history.contacts.length > 1
                ? "grid grid-cols-1 items-start gap-4 p-3 sm:p-4 lg:grid-cols-2"
                : "space-y-4 p-3 sm:p-4"
            }
          >
            {history.contacts.map((contact, index) => (
              <ContactBlock
                key={contact.id}
                contact={contact}
                index={index}
                canRemove={history.contacts.length > 1}
                onRemove={() => removeContact(contact.id)}
                onTextChange={(field, value) =>
                  updateContactField(contact.id, field, value)
                }
                onDateChange={(value) =>
                  updateContactField(contact.id, "dateCaseVisited", value)
                }
                onNetworkChange={(value) =>
                  updateContactField(contact.id, "alreadyInNetwork", value)
                }
                onReportChange={(value) =>
                  updateContactField(contact.id, "reportedCase", value)
                }
                disabled={readOnly}
                compactLayout={history.contacts.length > 1}
                errors={errors}
              />
            ))}
          </div>
        </div>

        {/* ===================================================
            BOTTOM FIELDS
           =================================================== */}

        <div className="m-5 grid gap-5 lg:grid-cols-[minmax(220px,0.75fr)_minmax(320px,1.5fr)]">
          {/* FIRST CONTACT CATEGORY */}

          <div>
            <ValidatedField
              fieldId={categoryId}
              error={errors[categoryId]}
              className={errorSpacing}
            >
              <FieldLabel
                fieldId={categoryId}
                className="mb-1.5 block text-[12px] font-semibold text-[#355b88]"
              >
                Category of the first contact:
              </FieldLabel>

              <OptionsSelect
                value={history.firstContactCategory ?? ""}
                options={FIRST_CONTACT_CATEGORY_OPTIONS}
                onChange={handleCategoryChange}
                placeholder="List of the Contacts"
                placeholderClassName="text-[#64748b]"
                ariaLabel="Category of the first contact"
                disabled={readOnly}
                error={Boolean(errors[categoryId])}
                errorId={`${categoryId}-error`}
              />
            </ValidatedField>

            {/* OTHER CATEGORY */}

            {history.firstContactCategory === "Other" && (
              <ValidatedField
                fieldId={categoryOtherId}
                error={errors[categoryOtherId]}
                className={`mt-3 ${errorSpacing}`}
              >
                <CompactTextField
                  value={history.firstContactCategoryOther}
                  onChange={(value) =>
                    updateHistory((previous) => ({
                      ...previous,
                      firstContactCategoryOther: value,
                    }))
                  }
                  placeholder="Specify other"
                  ariaLabel="Specify other first contact category"
                  maxLength={150}
                  disabled={readOnly}
                  error={Boolean(errors[categoryOtherId])}
                  errorId={`${categoryOtherId}-error`}
                />
              </ValidatedField>
            )}
          </div>

          {/* ADDITIONAL COMMENTS */}

          <ValidatedField
            fieldId={commentsId}
            error={errors[commentsId]}
            className={errorSpacing}
          >
            <FieldLabel fieldId={commentsId} className={sideLabelClass}>
              Additional comments
            </FieldLabel>

            <CompactTextField
              value={history.additionalComments}
              onChange={(value) =>
                updateHistory((previous) => ({
                  ...previous,
                  additionalComments: value,
                }))
              }
              placeholder="Enter comments"
              ariaLabel="Additional comments"
              maxLength={1000}
              multiline
              minRows={3}
              disabled={readOnly}
              error={Boolean(errors[commentsId])}
              errorId={`${commentsId}-error`}
            />
          </ValidatedField>

          {/* SUSPECTED DIAGNOSIS */}

          <ValidatedField
            fieldId={diagnosisId}
            error={errors[diagnosisId]}
            className={`max-w-[320px] ${errorSpacing}`}
          >
            <FieldLabel
              fieldId={diagnosisId}
              className={sideLabelClass}
              required={suspectedDiagnosisOptions.length > 0}
            >
              Suspected diagnosis
            </FieldLabel>

            <OptionsSelect
              value={history.suspectedDiagnosis}
              options={suspectedDiagnosisOptions}
              onChange={handleDiagnosisChange}
              placeholder={
                suspectedDiagnosisOptions.length > 0
                  ? "Select from the list of Disease"
                  : "No diagnosis options configured"
              }
              placeholderClassName="text-[#475569]"
              ariaLabel="Suspected diagnosis"
              disabled={readOnly || suspectedDiagnosisOptions.length === 0}
              wrapMenuItems
              error={Boolean(errors[diagnosisId])}
              errorId={`${diagnosisId}-error`}
            />
          </ValidatedField>
        </div>
      </div>
    </section>
  );
}

// ===== Merged source: ReflexesSection(3).tsx =====
type ReflexScoreField = keyof AFPReflexScores;

type PlantarField = "rightPlantarReflex" | "leftPlantarReflex";

// Switch between MUI and SVG renderers.
// Existing behavior preserved.
const DIAGRAM_RENDERER: "mui" | "svg" = "mui";

type ReflexFieldProps = {
  label: string;
  ariaLabel?: string;
  disabled?: boolean;

  placement?: {
    side: "left" | "right";
    top: number;
  };

  // NEW: Validation
  fieldId: string;
  errorMessage?: string;
} & (
  | {
      type: "score";
      value: ReflexScoreCode;
      onChange: (value: ReflexScoreCode) => void;
    }
  | {
      type: "plantar";
      value: PlantarReflexValue;
      onChange: (value: PlantarReflexValue) => void;
    }
);

// =========================================================
// REFLEX CONFIGURATION — UNCHANGED
// =========================================================

const reflexQuestions = [
  {
    label: "Biceps",
    anchor: "biceps",
    rightField: "rightBiceps",
    leftField: "leftBiceps",
  },
  {
    label: "Brachioradialis",
    anchor: "brachioradialis",
    rightField: "rightBrachioradialis",
    leftField: "leftBrachioradialis",
  },
  {
    label: "Patellar",
    anchor: "patellar",
    rightField: "rightPatellar",
    leftField: "leftPatellar",
  },
  {
    label: "Achilles",
    anchor: "achilles",
    rightField: "rightAchilles",
    leftField: "leftAchilles",
  },
] as const satisfies ReadonlyArray<{
  label: string;
  anchor: keyof typeof REFLEX_ANCHORS;
  rightField: ReflexScoreField;
  leftField: ReflexScoreField;
}>;

const sides_Reflexes = [
  {
    heading: "RT",
    scoreKey: "rightField",
    plantarKey: "rightPlantarReflex",
    position: "left",
  },
  {
    heading: "LT",
    scoreKey: "leftField",
    plantarKey: "leftPlantarReflex",
    position: "right",
  },
] as const;

// =========================================================
// SHARED STYLING — UNCHANGED
// =========================================================

const attachedLabelClass =
  "mb-0 block px-2 py-0 text-center text-[10px] font-semibold leading-4 text-[#173b69]";

const mobileLabelClass = "text-[12px] font-semibold text-[#173b69]";

// Preserve original anatomical positioning.
function getDropdownTop(anchorY: number): number {
  const diagramScale = REFLEX_DIAGRAM_LAYOUT.width / 360;

  return (
    REFLEX_DIAGRAM_LAYOUT.diagramTop +
    anchorY * diagramScale -
    REFLEX_DIAGRAM_LAYOUT.controlCenterOffset
  );
}

// =========================================================
// REFLEX FIELD — WITH VALIDATION
// =========================================================

function ReflexField(props: ReflexFieldProps) {
  const {
    label,
    ariaLabel = label,
    disabled = false,
    placement,
    fieldId,
    errorMessage = "",
  } = props;

  const wrapperClass = placement
    ? `absolute z-10 w-[25%] min-w-[125px] max-w-[160px] ${
        placement.side === "left" ? "left-0" : "right-0"
      }`
    : "grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center";

  const labelClass = placement
    ? `${attachedLabelClass}${props.type === "plantar" ? " mt-3" : ""}`
    : mobileLabelClass;

  // Desktop and mobile instances share the validation field ID,
  // but have distinct helper-text IDs for accessibility.
  const errorId = `${fieldId}-${placement ? "desktop" : "mobile"}-error`;

  return (
    <div
      data-afp-field={fieldId}
      className={wrapperClass}
      style={placement ? { top: placement.top } : undefined}
    >
      <FieldLabel fieldId={fieldId} className={labelClass}>
        {label}
      </FieldLabel>

      {props.type === "score" ? (
        <ReflexSelect
          type="score"
          value={props.value}
          onChange={props.onChange}
          disabled={disabled}
          ariaLabel={ariaLabel}
          errorMessage={errorMessage}
          errorId={errorId}
        />
      ) : (
        <ReflexSelect
          type="plantar"
          value={props.value}
          onChange={props.onChange}
          disabled={disabled}
          ariaLabel={ariaLabel}
          errorMessage={errorMessage}
          errorId={errorId}
        />
      )}
    </div>
  );
}

// =========================================================
// REFLEXES SECTION
// =========================================================

function ReflexesSection() {
  const { data, updateData, readOnly } = useAFPForm();

  // NEW: Shared submission validation.
  const { errors } = useAFPValidation();

  const reflexes = data.clinicalExamination.reflexes;

  // =======================================================
  // EXISTING CONTEXT FUNCTIONS — UNCHANGED
  // =======================================================

  const updateScore = (field: ReflexScoreField, value: ReflexScoreCode) => {
    updateData((previous) => ({
      ...previous,
      clinicalExamination: {
        ...previous.clinicalExamination,
        reflexes: {
          ...previous.clinicalExamination.reflexes,
          scores: {
            ...previous.clinicalExamination.reflexes.scores,
            [field]: value,
          },
        },
      },
    }));
  };

  const updatePlantarReflex = (
    side: PlantarField,
    value: PlantarReflexValue,
  ) => {
    updateData((previous) => ({
      ...previous,
      clinicalExamination: {
        ...previous.clinicalExamination,
        reflexes: {
          ...previous.clinicalExamination.reflexes,
          [side]: value,
        },
      },
    }));
  };

  // =======================================================
  // UI — EXISTING DIAGRAM AND POSITIONING PRESERVED
  // =======================================================

  return (
    <div className="min-w-0 rounded-xl border border-[#d9e5f1] bg-[#f8fbff] p-4 sm:p-5">
      <h3 className="m-0 mb-4 text-[16px] font-bold text-[#173b69]">
        Reflexes
      </h3>

      {/* DESKTOP / TABLET ANATOMICAL LAYOUT */}
      <div
        className="relative mx-auto hidden w-full max-w-190 md:block"
        style={{
          height: REFLEX_DIAGRAM_LAYOUT.stageHeight,
        }}
      >
        {/* SIDE HEADINGS */}
        <span className="absolute left-0 top-0 z-20 rounded-md bg-[#eaf3ff] px-2 py-1 text-[12px] font-bold text-[#1752a0]">
          RT
        </span>

        <span className="absolute right-0 top-0 z-20 rounded-md bg-[#eaf3ff] px-2 py-1 text-[12px] font-bold text-[#1752a0]">
          LT
        </span>

        {/* CENTERED INFANT BODY */}
        <div
          className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2"
          style={{
            top: REFLEX_DIAGRAM_LAYOUT.diagramTop,
            width: REFLEX_DIAGRAM_LAYOUT.width,
            height: REFLEX_DIAGRAM_LAYOUT.height,
          }}
        >
          <ReflexBodyDiagram
            className="h-full w-full"
            renderer={DIAGRAM_RENDERER}
          />
        </div>

        {/* REFLEX SCORES */}
        {reflexQuestions.map((question) => (
          <Fragment key={question.anchor}>
            {sides_Reflexes.map((side) => {
              const field = question[side.scoreKey];

              const fieldId = `clinicalExamination.reflexes.scores.${field}`;

              return (
                <ReflexField
                  key={side.heading}
                  type="score"
                  label={`${side.heading} ${question.label}`}
                  value={reflexes.scores[field]}
                  onChange={(value) => updateScore(field, value)}
                  disabled={readOnly}
                  ariaLabel={`${side.heading} ${question.label} reflex score`}
                  fieldId={fieldId}
                  errorMessage={errors[fieldId]}
                  placement={{
                    side: side.position,
                    top: getDropdownTop(REFLEX_ANCHORS[question.anchor].y),
                  }}
                />
              );
            })}
          </Fragment>
        ))}

        {/* PLANTAR REFLEX */}
        {sides_Reflexes.map((side) => {
          const fieldId = `clinicalExamination.reflexes.${side.plantarKey}`;

          return (
            <ReflexField
              key={side.heading}
              type="plantar"
              label={`${side.heading} Plantar Reflex`}
              value={reflexes[side.plantarKey]}
              onChange={(value) => updatePlantarReflex(side.plantarKey, value)}
              disabled={readOnly}
              ariaLabel={`${side.heading} Plantar Reflex`}
              fieldId={fieldId}
              errorMessage={errors[fieldId]}
              placement={{
                side: side.position,
                top: getDropdownTop(REFLEX_ANCHORS.plantar.y),
              }}
            />
          );
        })}
      </div>

      {/* MOBILE: RESPONSIVE INFANT DIAGRAM + SCORE LIST */}
      <div className="md:hidden">
        <div className="mx-auto mb-6 w-full max-w-80">
          <div className="mb-2 flex justify-between">
            <span className="rounded-md bg-[#eaf3ff] px-2 py-1 text-[12px] font-bold text-[#1752a0]">
              RT
            </span>

            <span className="rounded-md bg-[#eaf3ff] px-2 py-1 text-[12px] font-bold text-[#1752a0]">
              LT
            </span>
          </div>

          <ReflexBodyDiagram
            className="h-auto w-full"
            renderer={DIAGRAM_RENDERER}
          />
        </div>

        <div className="space-y-6">
          {sides_Reflexes.map((side, index) => (
            <div
              key={side.heading}
              className={
                index === 1 ? "border-t border-[#dbe6f1] pt-5" : undefined
              }
            >
              <h4 className="mb-3 text-sm font-bold text-[#173b69]">
                {side.heading}
              </h4>

              <div className="space-y-4">
                {/* REFLEX SCORES */}
                {reflexQuestions.map((question) => {
                  const field = question[side.scoreKey];

                  const fieldId = `clinicalExamination.reflexes.scores.${field}`;

                  return (
                    <ReflexField
                      key={field}
                      type="score"
                      label={question.label}
                      value={reflexes.scores[field]}
                      onChange={(value) => updateScore(field, value)}
                      disabled={readOnly}
                      fieldId={fieldId}
                      errorMessage={errors[fieldId]}
                    />
                  );
                })}

                {/* PLANTAR REFLEX */}
                {(() => {
                  const fieldId = `clinicalExamination.reflexes.${side.plantarKey}`;

                  return (
                    <ReflexField
                      type="plantar"
                      label="Plantar Reflex"
                      value={reflexes[side.plantarKey]}
                      onChange={(value) =>
                        updatePlantarReflex(side.plantarKey, value)
                      }
                      disabled={readOnly}
                      fieldId={fieldId}
                      errorMessage={errors[fieldId]}
                    />
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Merged source: SignsSymptomsSection(4).tsx =====
type YesNoUnknownSignsField =
  | "feverWhenParalysisBegan"
  | "musclePainWhenParalysisBegan"
  | "paralysisAsymmetric"
  | "paralysisMovedUpward"
  | "sensationPresentAtParalysisSite"
  | "childAtHealthFacility";

type HealthFacilityTextField =
  | "otherFacilityName"
  | "notificationDate"
  | "medicalRecordNumber";

interface SignsSymptomsSectionProps {
  facilityOptions?: AFPFacilityOption[];
}

interface QuestionRowProps {
  number: number;
  label: string;
  value: YesNoUnknown;
  onChange: (value: YesNoUnknown) => void;
  disabled?: boolean;
  fieldId: string;
  error?: string;
}

// Existing question configuration
const questions: {
  number: number;
  label: string;
  field: YesNoUnknownSignsField;
}[] = [
  {
    number: 1,
    label: "Fever when paralysis began?",
    field: "feverWhenParalysisBegan",
  },
  {
    number: 2,
    label: "Muscle pain when paralysis began?",
    field: "musclePainWhenParalysisBegan",
  },
  {
    number: 4,
    label: "Is paralysis asymmetric (NOT equal) on each side of body?",
    field: "paralysisAsymmetric",
  },
  {
    number: 5,
    label: "Did paralysis begin in feet or hands and move upward over time?",
    field: "paralysisMovedUpward",
  },
  {
    number: 6,
    label: "Is sensation present in the site of paralysis?",
    field: "sensationPresentAtParalysisSite",
  },
  {
    number: 7,
    label: "Was / has the child been at a health facility?",
    field: "childAtHealthFacility",
  },
];

const paralysisSiteOptions: {
  value: AFPParalysisSite;
  label: string;
}[] = [
  { value: "right_arm", label: "Right Arm" },
  { value: "left_arm", label: "Left Arm" },
  { value: "right_leg", label: "Right Leg" },
  { value: "left_leg", label: "Left Leg" },
  { value: "neck", label: "Neck" },
  { value: "face", label: "Face" },
];

const fieldLabelClass = "mb-1.5 block text-[11px] font-semibold text-[#52677e]";

const facilityTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    height: 38,
    borderRadius: "8px",
    backgroundColor: "#ffffff",
  },
  "& input": {
    py: "7px",
    fontSize: "0.78rem",
  },
};

const otherParalysisTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 38,
    borderRadius: "8px",
    backgroundColor: "#ffffff",
  },

  "& input": {
    py: "8px",
    fontSize: "0.78rem",
  },
};

// =========================================================
// REUSABLE QUESTION ROW WITH MUI VALIDATION
// =========================================================

function QuestionRow({
  number,
  label,
  value,
  onChange,
  disabled = false,
  fieldId,
  error = "",
}: QuestionRowProps) {
  return (
    <ValidatedField
      fieldId={fieldId}
      error={error}
      className="border-b border-[#dde7f0]"
    >
      <div className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <FieldLabel
          fieldId={fieldId}
          component="p"
          className="m-0 pt-1 text-[13px] font-semibold leading-5 text-[#173b69]"
        >
          {number}. {label}
        </FieldLabel>

        <YesNoUnknownField
          value={value}
          onChange={onChange}
          disabled={disabled}
          ariaLabel={`${number}. ${label}`}
          error={Boolean(error)}
          errorId={`${fieldId}-error`}
        />
      </div>
    </ValidatedField>
  );
}

// =========================================================
// SIGNS / SYMPTOMS SECTION
// =========================================================

function SignsSymptomsSection({ facilityOptions }: SignsSymptomsSectionProps) {
  const { data, updateData, readOnly } = useAFPForm();

  // NEW: shared submission validation errors
  const { errors } = useAFPValidation();

  const signs = data.signsSymptoms;
  const healthFacility = signs.healthFacility;

  const facilities =
    facilityOptions && facilityOptions.length > 0
      ? facilityOptions
      : AFP_DEMO_FACILITY_OPTIONS;

  const facilitySelectOptions = [
    ...facilities.filter((option) => option.value !== AFP_OTHER_FACILITY_VALUE),
    AFP_OTHER_FACILITY_OPTION,
  ];

  // =========================================================
  // EXISTING CONTEXT UPDATE FUNCTIONS — UNCHANGED
  // =========================================================

  const updateSigns = (
    updater: (previous: AFPSignsSymptoms) => AFPSignsSymptoms,
  ) => {
    updateData((previous) => ({
      ...previous,
      signsSymptoms: updater(previous.signsSymptoms),
    }));
  };

  const updateYesNoUnknownField = (
    field: YesNoUnknownSignsField,
    value: YesNoUnknown,
  ) => {
    updateSigns((previous) => {
      const next = {
        ...previous,
        [field]: value,
      };

      // Clear Question 7 details when answer is not Yes.
      if (field === "childAtHealthFacility" && value !== "yes") {
        return {
          ...next,
          healthFacility: {
            selectedFacilityOption: "",
            otherFacilityName: "",
            notificationDate: "",
            medicalRecordNumber: "",
          },
        };
      }

      return next;
    });
  };

  const toggleParalysisSite = (site: AFPParalysisSite, checked: boolean) => {
    updateSigns((previous) => {
      const nextSites = checked
        ? previous.siteOfParalysis.includes(site)
          ? previous.siteOfParalysis
          : [...previous.siteOfParalysis, site]
        : previous.siteOfParalysis.filter(
            (currentSite) => currentSite !== site,
          );

      return {
        ...previous,
        siteOfParalysis: nextSites,
        otherParalysisSite: nextSites.includes("other")
          ? previous.otherParalysisSite
          : "",
      };
    });
  };

  const updateOtherParalysisSite = (value: string) => {
    updateSigns((previous) => ({
      ...previous,
      otherParalysisSite: value,
    }));
  };

  const updateHealthFacilityField = (
    field: HealthFacilityTextField,
    value: string,
  ) => {
    updateSigns((previous) => ({
      ...previous,
      healthFacility: {
        ...previous.healthFacility,
        [field]: value,
      },
    }));
  };

  const updateFacilityOption = (value: string) => {
    updateSigns((previous) => ({
      ...previous,
      healthFacility: {
        ...previous.healthFacility,
        selectedFacilityOption: value,
        otherFacilityName:
          value === AFP_OTHER_FACILITY_VALUE
            ? previous.healthFacility.otherFacilityName
            : "",
      },
    }));
  };

  // =========================================================
  // EXISTING CONDITIONAL VISIBILITY
  // =========================================================

  const hasOtherParalysisSite = signs.siteOfParalysis.includes("other");

  const showHealthFacilityDetails = signs.childAtHealthFacility === "yes";

  const showOtherFacilityName =
    healthFacility.selectedFacilityOption === AFP_OTHER_FACILITY_VALUE;

  // NEW: Date validation error
  const notificationDateError =
    errors["signsSymptoms.healthFacility.notificationDate"] ?? "";

  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}
      <div className="border-b border-[#e0e8f0] px-5 py-3 sm:px-7">
        <h2 className="m-0 text-[18px] font-bold text-[#173b69]">
          Signs / Symptoms
        </h2>
      </div>

      {/* QUESTIONS 1, 2, 4, 5, 6, 7 AND QUESTION 3 */}
      <div className="grid grid-cols-1 px-5 sm:px-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.85fr)] lg:grid-rows-[auto_1fr] lg:gap-x-7">
        {/* LEFT SIDE: QUESTIONS 1, 2, 4, 5, 6, 7 */}
        {/* QUESTIONS 1 AND 2 */}
        <div className="lg:col-start-1 lg:row-start-1">
          {questions
            .filter(({ number }) => number <= 2)
            .map(({ number, label, field }) => (
              <QuestionRow
                key={number}
                number={number}
                label={label}
                value={signs[field]}
                onChange={(value) => updateYesNoUnknownField(field, value)}
                disabled={readOnly}
                fieldId={`signsSymptoms.${field}`}
                error={errors[`signsSymptoms.${field}`]}
              />
            ))}
        </div>

        {/* =====================================================
            QUESTION 3: SITE OF PARALYSIS
           ===================================================== */}

        <div className="py-4 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:border-l lg:border-[#dde7f0] lg:pl-6">
          <ValidatedField
            fieldId="signsSymptoms.siteOfParalysis"
            error={errors["signsSymptoms.siteOfParalysis"]}
          >
            <FormControl
              component="fieldset"
              fullWidth
              error={Boolean(errors["signsSymptoms.siteOfParalysis"])}
              sx={{ minWidth: 0 }}
            >
              <FieldLabel
                component="p"
                fieldId="signsSymptoms.siteOfParalysis"
                className="m-0 mb-4 text-[13px] font-semibold text-[#173b69]"
              >
                3. SITE OF PARALYSIS
              </FieldLabel>

              <Box
                className="grid grid-cols-2 gap-x-5 gap-y-3"
                sx={{
                  outline: errors["signsSymptoms.siteOfParalysis"]
                    ? "1px solid"
                    : "none",
                  outlineColor: "error.main",
                  outlineOffset: 5,
                  borderRadius: "4px",
                }}
              >
                {paralysisSiteOptions.map((option) => (
                  <CheckboxField
                    key={option.value}
                    label={option.label}
                    checked={signs.siteOfParalysis.includes(option.value)}
                    onChange={(checked) =>
                      toggleParalysisSite(option.value, checked)
                    }
                    disabled={readOnly}
                  />
                ))}
              </Box>
            </FormControl>
          </ValidatedField>

          {/* OTHER PARALYSIS SITE */}
          <div className="mt-3 flex items-center gap-3">
            <div className="shrink-0">
              <CheckboxField
                label="Other"
                checked={hasOtherParalysisSite}
                onChange={(checked) => toggleParalysisSite("other", checked)}
                disabled={readOnly}
              />
            </div>

            {hasOtherParalysisSite && (
              <ValidatedField
                fieldId="signsSymptoms.otherParalysisSite"
                error={errors["signsSymptoms.otherParalysisSite"]}
                className="min-w-0 max-w-65 flex-1"
              >
                <TextField
                  value={signs.otherParalysisSite}
                  onChange={(event) =>
                    updateOtherParalysisSite(event.target.value)
                  }
                  disabled={readOnly}
                  error={Boolean(errors["signsSymptoms.otherParalysisSite"])}
                  size="small"
                  fullWidth
                  placeholder="Specify other"
                  aria-label="Specify other site of paralysis"
                  slotProps={{
                    htmlInput: {
                      maxLength: 150,
                    },
                  }}
                  sx={otherParalysisTextFieldSx}
                />
              </ValidatedField>
            )}
          </div>
        </div>
        {/* QUESTIONS 4, 5, 6 AND 7 */}
        <div className="lg:col-start-1 lg:row-start-2">
          {questions
            .filter(({ number }) => number >= 4)
            .map(({ number, label, field }) => (
              <QuestionRow
                key={number}
                number={number}
                label={label}
                value={signs[field]}
                onChange={(value) => updateYesNoUnknownField(field, value)}
                disabled={readOnly}
                fieldId={`signsSymptoms.${field}`}
                error={errors[`signsSymptoms.${field}`]}
              />
            ))}
        </div>
      </div>

      {/* =====================================================
          QUESTION 7 DEPENDENT DETAILS
         ===================================================== */}

      {showHealthFacilityDetails && (
        <div className="size-max mx-5 mb-5 mt-3 rounded-lg border border-[#d6e2ef] bg-[#f1f6fc] px-4 py-3 sm:mx-7">
          {/* SINGLE RESPONSIVE GRID */}
          <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-3 lg:grid-cols-[minmax(0,1fr)_230px_220px] lg:items-start lg:gap-x-5">
            {/* COLUMN 1: HEALTH FACILITY + OTHER */}
            <div className="sm:col-span-2 lg:col-span-1">
              {/* HEALTH FACILITY */}
              <ValidatedField
                fieldId="signsSymptoms.healthFacility.selectedFacilityOption"
                error={
                  errors["signsSymptoms.healthFacility.selectedFacilityOption"]
                }
              >
                <FieldLabel
                  fieldId="signsSymptoms.healthFacility.selectedFacilityOption"
                  className={`${fieldLabelClass} lg:leading-4`}
                >
                  Select the health facility from the dropdown
                </FieldLabel>

                <SelectField
                  value={healthFacility.selectedFacilityOption}
                  options={facilitySelectOptions}
                  onChange={updateFacilityOption}
                  placeholder="List of health facilities"
                  ariaLabel="Health facility"
                  disabled={readOnly}
                  error={Boolean(
                    errors[
                      "signsSymptoms.healthFacility.selectedFacilityOption"
                    ],
                  )}
                  errorId="signsSymptoms.healthFacility.selectedFacilityOption-error"
                />
              </ValidatedField>

              {/* OTHER FACILITY NAME */}
              {showOtherFacilityName && (
                <ValidatedField
                  fieldId="signsSymptoms.healthFacility.otherFacilityName"
                  error={
                    errors["signsSymptoms.healthFacility.otherFacilityName"]
                  }
                  className="mt-3 min-w-0"
                >
                  <FieldLabel
                    fieldId="signsSymptoms.healthFacility.otherFacilityName"
                    htmlFor="afp-other-facility-name"
                    className={fieldLabelClass}
                  >
                    Facility name
                  </FieldLabel>

                  <TextField
                    id="afp-other-facility-name"
                    value={healthFacility.otherFacilityName}
                    onChange={(event) =>
                      updateHealthFacilityField(
                        "otherFacilityName",
                        event.target.value,
                      )
                    }
                    disabled={readOnly}
                    error={Boolean(
                      errors["signsSymptoms.healthFacility.otherFacilityName"],
                    )}
                    fullWidth
                    size="small"
                    placeholder="Enter health facility name"
                    slotProps={{
                      htmlInput: {
                        maxLength: 200,
                      },
                    }}
                    sx={facilityTextFieldSx}
                  />
                </ValidatedField>
              )}
            </div>

            {/* ==========================================
          COLUMN 2: DATE OF NOTIFICATION
         ========================================== */}

            <ValidatedField
              fieldId="signsSymptoms.healthFacility.notificationDate"
              error={notificationDateError}
              className="min-w-0"
            >
              <FieldLabel
                fieldId="signsSymptoms.healthFacility.notificationDate"
                className={`${fieldLabelClass} lg:leading-4`}
              >
                Date of notification
              </FieldLabel>

              <div
                className={`
            lg:[&_.MuiTextField-root]:max-w-none!
            ${notificationDateError ? "[&_.MuiFormHelperText-root]:hidden" : ""}
          `}
              >
                <DateField
                  value={healthFacility.notificationDate}
                  onChange={(value) =>
                    updateHealthFacilityField("notificationDate", value)
                  }
                  disabled={readOnly}
                  noFuture
                  ariaLabel="Date of notification"
                  errorMessage={notificationDateError}
                />
              </div>
            </ValidatedField>

            {/* ==========================================
          COLUMN 3: MEDICAL RECORD
         ========================================== */}

            <ValidatedField
              fieldId="signsSymptoms.healthFacility.medicalRecordNumber"
              error={errors["signsSymptoms.healthFacility.medicalRecordNumber"]}
              className="min-w-0"
            >
              <FieldLabel
                fieldId="signsSymptoms.healthFacility.medicalRecordNumber"
                htmlFor="afp-medical-record-number"
                className={`${fieldLabelClass} lg:leading-4`}
              >
                Medical record #
              </FieldLabel>

              <TextField
                id="afp-medical-record-number"
                value={healthFacility.medicalRecordNumber}
                onChange={(event) =>
                  updateHealthFacilityField(
                    "medicalRecordNumber",
                    event.target.value,
                  )
                }
                disabled={readOnly}
                error={Boolean(
                  errors["signsSymptoms.healthFacility.medicalRecordNumber"],
                )}
                fullWidth
                size="small"
                placeholder="Enter record number"
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
                sx={facilityTextFieldSx}
              />
            </ValidatedField>
          </div>
        </div>
      )}
    </section>
  );
}

// ===== Merged source: TravelHistorySection(2).tsx =====
function TravelHistorySection() {
  const { data, updateData, readOnly } = useAFPForm();

  // NEW: Shared Submit Form validation.
  const { errors } = useAFPValidation();

  const travelHistory = data.travelHistory;

  // =========================================================
  // EXISTING UPDATE FUNCTIONS — UNCHANGED
  // =========================================================

  // Shared travel history updater
  const updateTravelHistory = (
    updater: (previous: AFPTravelHistory) => AFPTravelHistory,
  ) => {
    updateData((previous) => ({
      ...previous,
      travelHistory: updater(previous.travelHistory),
    }));
  };

  // Travel availability toggle
  const handleTravelAvailabilityChange = (checked: boolean) => {
    updateTravelHistory((previous) =>
      checked
        ? {
            ...previous,
            travelOutsideAreaLast30Days: true,
          }
        : {
            travelOutsideAreaLast30Days: false,
            notifiedToConcernedDsfpSimo: false,
            notificationDate: "",
          },
    );
  };

  // DSFP / SIMO notification toggle
  const handleDsfpSimoChange = (checked: boolean) => {
    updateTravelHistory((previous) => ({
      ...previous,
      notifiedToConcernedDsfpSimo: checked,
      notificationDate: checked ? previous.notificationDate : "",
    }));
  };

  // Update notification date
  const updateNotificationDate = (value: string) => {
    updateTravelHistory((previous) => ({
      ...previous,
      notificationDate: value,
    }));
  };

  // =========================================================
  // NEW: VALIDATION
  // =========================================================

  const notificationDateFieldId = "travelHistory.notificationDate";

  const notificationDateError = errors[notificationDateFieldId] ?? "";

  // =========================================================
  // SECTION UI — ORIGINAL LAYOUT PRESERVED
  // =========================================================

  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}
      <div className="flex flex-col gap-3 border-b border-[#dce7f2] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <h2 className="m-0 text-[18px] font-bold text-[#173b69]">
          Travel History
        </h2>

        <div className="flex w-fit max-w-full items-center gap-2 rounded-xl bg-[#deebfb] px-3 py-1.5">
          <span className="text-[12px] font-semibold leading-4 text-[#173b69]">
            Travel outside area in last 30 days?
          </span>

          <ToggleSwitch
            checked={travelHistory.travelOutsideAreaLast30Days}
            onChange={handleTravelAvailabilityChange}
            disabled={readOnly}
            ariaLabel="Travel outside area in last 30 days"
          />

          <FlightOutlinedIcon
            aria-hidden="true"
            sx={{
              ml: 0.5,
              fontSize: 18,
              color: "#173b69",
            }}
          />
        </div>
      </div>

      {/* TRAVEL HISTORY CONTENT */}
      {!travelHistory.travelOutsideAreaLast30Days ? (
        <div className="px-5 py-6 text-sm text-[#718096] sm:px-7">
          Travel history details are currently hidden.
        </div>
      ) : (
        <div className="px-5 py-5 sm:px-7">
          {/* AFP-SPECIFIC DSFP / SIMO FIELD */}
          <div className="mt-5 max-w-140 rounded-lg border border-[#cbdced] bg-[#eff6ff] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 border-b border-[#d6e3f0] pb-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="m-0 text-[12px] font-semibold leading-5 text-[#173b69]">
                Notified to concerned DSFP / SIMO (for additional cases and
                ORI)?
              </p>

              <ToggleSwitch
                checked={travelHistory.notifiedToConcernedDsfpSimo}
                onChange={handleDsfpSimoChange}
                disabled={readOnly}
                ariaLabel="Notified to concerned DSFP or SIMO for additional cases and ORI"
              />
            </div>

            {/* =================================================
                CONDITIONAL NOTIFICATION DATE
                NEW: MUI v9 inline validation
               ================================================= */}

            {travelHistory.notifiedToConcernedDsfpSimo && (
              <div className="mt-4 grid gap-2 sm:grid-cols-[max-content_190px] sm:items-start">
                <FieldLabel
                  fieldId={notificationDateFieldId}
                  className="pt-2 text-[12px] font-semibold text-[#173b69]"
                >
                  Date of notification
                </FieldLabel>

                <ValidatedField
                  fieldId={notificationDateFieldId}
                  error={notificationDateError}
                  className="min-w-0 [&_.MuiFormHelperText-root]:mt-1!"
                >
                  <div
                    className={
                      notificationDateError
                        ? "[&_.MuiFormHelperText-root]:hidden"
                        : ""
                    }
                  >
                    <DateField
                      value={travelHistory.notificationDate}
                      onChange={updateNotificationDate}
                      disabled={readOnly}
                      noFuture
                      ariaLabel="DSFP SIMO date of notification"
                      errorMessage={notificationDateError}
                    />
                  </div>
                </ValidatedField>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ===== Merged source: VaccinationHistorySection(3).tsx =====
type DoseEntryField = "opvCampaignDoses" | "opvRoutineDoses" | "ipvDoses";

type VaccinationDateField =
  | "lastOpvDoseBeforeParalysisDate"
  | "lastIpvDoseBeforeParalysisDate"
  | "opvAfterParalysisDate";

interface QuestionConfig<T extends string> {
  number: number;
  label: string;
  field: T;
}

interface DoseQuestionProps {
  number: number;
  label: string;
  fieldId: string;
  value: AFPVaccinationDoseEntry;
  disabled?: boolean;
  onSourceChange: (value: VaccinationRecordSource) => void;
  onDoseChange: (value: number | null) => void;
  sourceError?: string;
  doseError?: string;
}

interface DateQuestionProps {
  number: number;
  label: string;
  fieldId: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

// =========================================================
// QUESTION CONFIGURATIONS — UNCHANGED
// =========================================================

const doseQuestions: QuestionConfig<DoseEntryField>[] = [
  {
    number: 1,
    label:
      "Number of OPV doses received through campaigns (e.g. NID, Mop-up, MNT)",
    field: "opvCampaignDoses",
  },
  {
    number: 2,
    label: "Number of OPV doses received through routine EPI (DPT/Penta/MR)",
    field: "opvRoutineDoses",
  },
  {
    number: 4,
    label: "IPV doses received",
    field: "ipvDoses",
  },
];

const dateQuestions: QuestionConfig<VaccinationDateField>[] = [
  {
    number: 3,
    label: "Date of last OPV dose before paralysis onset",
    field: "lastOpvDoseBeforeParalysisDate",
  },
  {
    number: 5,
    label: "Date of last IPV dose before paralysis onset",
    field: "lastIpvDoseBeforeParalysisDate",
  },
];

// =========================================================
// SHARED STYLING — UNCHANGED
// =========================================================

const questionLabelClass_VaccinationHistory =
  "m-0 pt-2 text-[12px] font-semibold leading-5 text-[#173b69]";

const questionRowClass_VaccinationHistory =
  "grid gap-3 border-b border-[#e3ebf3] py-4 md:items-start";

const recordSourceSelectSx = {
  minHeight: 38,
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  fontSize: "0.76rem",

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#b9c8d8",
  },

  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#8ca6c1",
  },

  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#2563eb",
  },

  "& .MuiSelect-select": {
    py: "8px",
  },
};

// =========================================================
// RECORD SOURCE SELECT
// Added optional MUI v9 error support.
// =========================================================

function RecordSourceSelect({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  error = false,
  errorId,
}: {
  value: VaccinationRecordSource;
  onChange: (value: VaccinationRecordSource) => void;
  disabled?: boolean;
  ariaLabel: string;
  error?: boolean;
  errorId?: string;
}) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const selected = event.target.value;

    if (selected === "card" || selected === "history") {
      onChange(selected);
    }
  };

  return (
    <FormControl size="small" fullWidth disabled={disabled} error={error}>
      <Select
        value={value ?? ""}
        onChange={handleChange}
        displayEmpty
        inputProps={{
          "aria-label": ariaLabel,
          "aria-invalid": error || undefined,
          "aria-describedby": error ? errorId : undefined,
        }}
        renderValue={(selected) =>
          !selected ? (
            <span className="text-[#94a3b8]">By Card/ History</span>
          ) : (
            (VACCINATION_RECORD_SOURCE_OPTIONS.find(
              (option) => option.value === selected,
            )?.label ?? selected)
          )
        }
        sx={{
          ...recordSourceSelectSx,

          "&.Mui-error .MuiOutlinedInput-notchedOutline, &.Mui-error:hover .MuiOutlinedInput-notchedOutline, &.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "error.main",
            },
        }}
      >
        {VACCINATION_RECORD_SOURCE_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{ fontSize: "0.82rem" }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// =========================================================
// REUSABLE DOSE QUESTION
// Validation added to both dropdowns independently.
// =========================================================

function DoseQuestion({
  number,
  label,
  fieldId,
  value,
  disabled = false,
  onSourceChange,
  onDoseChange,
  sourceError = "",
  doseError = "",
}: DoseQuestionProps) {
  const sourceFieldId = `${fieldId}.recordSource`;
  const doseFieldId = `${fieldId}.numberOfDoses`;

  return (
    <div
      className={`${questionRowClass_VaccinationHistory} md:grid-cols-[minmax(0,1fr)_130px_90px]`}
    >
      <FieldLabel
        fieldId={sourceFieldId}
        component="p"
        className={questionLabelClass_VaccinationHistory}
      >
        {number}. {label}
      </FieldLabel>

      {/* CARD / HISTORY */}
      <ValidatedField
        fieldId={sourceFieldId}
        error={sourceError}
        className="min-w-0 [&_.MuiFormHelperText-root]:mt-1!"
      >
        <RecordSourceSelect
          value={value.recordSource}
          onChange={onSourceChange}
          disabled={disabled}
          ariaLabel={`${label} record source`}
          error={Boolean(sourceError)}
          errorId={`${sourceFieldId}-error`}
        />
      </ValidatedField>

      {/* NUMBER OF DOSES */}
      <ValidatedField
        fieldId={doseFieldId}
        error={doseError}
        className="min-w-0 [&_.MuiFormHelperText-root]:mt-1!"
      >
        <SelectField
          value={
            value.numberOfDoses === null ? "" : String(value.numberOfDoses)
          }
          options={VACCINATION_DOSE_OPTIONS}
          onChange={(selected) => {
            const parsed = Number(selected);

            onDoseChange(Number.isInteger(parsed) ? parsed : null);
          }}
          placeholder="Dose"
          ariaLabel={`${label} number of doses`}
          disabled={disabled}
          error={Boolean(doseError)}
          errorId={`${doseFieldId}-error`}
        />
      </ValidatedField>
    </div>
  );
}

// =========================================================
// REUSABLE DATE QUESTION
// Full-row helper text keeps long errors on one line.
// =========================================================

function DateQuestion({
  number,
  label,
  fieldId,
  value,
  onChange,
  disabled = false,
  error = "",
}: DateQuestionProps) {
  return (
    <ValidatedField
      fieldId={fieldId}
      error={error}
      className="border-b border-[#e3ebf3]"
    >
      <div
        className={`
          grid gap-3
          md:grid-cols-[minmax(0,1fr)_180px]
          md:items-start
          ${error ? "pt-4 pb-1" : "py-4"}
        `}
      >
        <FieldLabel
          fieldId={fieldId}
          component="p"
          className={questionLabelClass_VaccinationHistory}
        >
          {number}. {label}
        </FieldLabel>

        <div className={error ? "[&_.MuiFormHelperText-root]:hidden" : ""}>
          <DateField
            value={value}
            onChange={onChange}
            disabled={disabled}
            noFuture
            ariaLabel={label}
            errorMessage={error}
          />
        </div>
      </div>
    </ValidatedField>
  );
}

// =========================================================
// VACCINATION HISTORY SECTION
// =========================================================

function VaccinationHistorySection() {
  const { data, updateData, readOnly } = useAFPForm();

  // NEW: shared submission validation.
  const { errors } = useAFPValidation();

  const vaccination = data.vaccinationHistory;

  // =======================================================
  // EXISTING UPDATE FUNCTIONS — UNCHANGED
  // =======================================================

  const updateVaccination = (
    updater: (previous: AFPVaccinationHistory) => AFPVaccinationHistory,
  ) => {
    updateData((previous) => ({
      ...previous,
      vaccinationHistory: updater(previous.vaccinationHistory),
    }));
  };

  // Vaccination availability toggle
  const handleAvailabilityChange = (available: boolean) => {
    updateData((previous) => ({
      ...previous,
      vaccinationHistory: available
        ? {
            ...previous.vaccinationHistory,
            available: true,
          }
        : {
            available: false,
            opvCampaignDoses: {
              recordSource: null,
              numberOfDoses: null,
            },
            opvRoutineDoses: {
              recordSource: null,
              numberOfDoses: null,
            },
            lastOpvDoseBeforeParalysisDate: "",
            ipvDoses: {
              recordSource: null,
              numberOfDoses: null,
            },
            lastIpvDoseBeforeParalysisDate: "",
            opvGivenAfterParalysis: null,
            opvAfterParalysisDate: "",
          },
    }));
  };

  // Shared source/count update handler
  const updateDoseEntry = (
    field: DoseEntryField,
    changes: Partial<AFPVaccinationDoseEntry>,
  ) => {
    updateVaccination((previous) => ({
      ...previous,
      [field]: {
        ...previous[field],
        ...changes,
      },
    }));
  };

  // Shared date update handler
  const updateDate = (field: VaccinationDateField, value: string) => {
    updateVaccination((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // Question 6 dependent date handling
  const updateOpvAfterParalysis = (value: YesNoUnknown) => {
    updateVaccination((previous) => ({
      ...previous,
      opvGivenAfterParalysis: value,
      opvAfterParalysisDate:
        value === "yes" ? previous.opvAfterParalysisDate : "",
    }));
  };

  // =======================================================
  // VALIDATION ERRORS
  // =======================================================

  const q6FieldId = "vaccinationHistory.opvGivenAfterParalysis";

  const q6Error = errors[q6FieldId] ?? "";

  const opvAfterDateFieldId = "vaccinationHistory.opvAfterParalysisDate";

  const opvAfterDateError = errors[opvAfterDateFieldId] ?? "";

  // =======================================================
  // SECTION UI — ORIGINAL LAYOUT PRESERVED
  // =======================================================

  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}
      <div className="flex flex-col gap-3 border-b border-[#dce7f2] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <h2 className="m-0 text-[18px] font-bold text-[#173b69]">
          Vaccination History
        </h2>

        <div className="flex w-fit items-center gap-2 rounded-xl bg-[#deebfb] px-3 py-1.5">
          <span className="text-[12px] font-semibold text-[#173b69]">
            Vaccination history available?
          </span>

          <ToggleSwitch
            checked={vaccination.available}
            onChange={handleAvailabilityChange}
            disabled={readOnly}
            ariaLabel="Vaccination history available"
          />
        </div>
      </div>

      {/* VACCINATION QUESTIONS */}
      {!vaccination.available ? (
        <div className="px-5 py-6 text-sm text-[#718096] sm:px-7">
          Vaccination history is currently marked as unavailable.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-10 px-5 sm:px-7 xl:grid-cols-2">
            {/* LEFT COLUMN: QUESTIONS 1, 2, 4 */}
            <div>
              {doseQuestions.map(({ number, label, field }) => {
                const fieldId = `vaccinationHistory.${field}`;

                return (
                  <DoseQuestion
                    key={field}
                    number={number}
                    label={label}
                    fieldId={fieldId}
                    value={vaccination[field]}
                    onSourceChange={(value) =>
                      updateDoseEntry(field, {
                        recordSource: value,
                      })
                    }
                    onDoseChange={(value) =>
                      updateDoseEntry(field, {
                        numberOfDoses: value,
                      })
                    }
                    disabled={readOnly}
                    sourceError={errors[`${fieldId}.recordSource`]}
                    doseError={errors[`${fieldId}.numberOfDoses`]}
                  />
                );
              })}
            </div>

            {/* RIGHT COLUMN: QUESTIONS 3, 5 */}
            <div className="xl:pt-22">
              {dateQuestions.map(({ number, label, field }) => {
                const fieldId = `vaccinationHistory.${field}`;

                return (
                  <DateQuestion
                    key={field}
                    number={number}
                    label={label}
                    fieldId={fieldId}
                    value={vaccination[field]}
                    onChange={(value) => updateDate(field, value)}
                    disabled={readOnly}
                    error={errors[fieldId]}
                  />
                );
              })}
            </div>
          </div>

          {/* =================================================
              QUESTION 6
             ================================================= */}

          <div className="mx-5 mb-5 mt-4 rounded-lg border border-[#d6e2ef] bg-[#f1f6fc] px-4 py-4 sm:mx-7 sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6">
              {/* QUESTION + YES/NO/UNKNOWN */}
              <ValidatedField
                fieldId={q6FieldId}
                error={q6Error}
                className="min-w-0 [&_.MuiFormHelperText-root]:mt-1!"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                  <FieldLabel
                    fieldId={q6FieldId}
                    component="p"
                    className="m-0 text-[13px] font-semibold leading-5 text-[#173b69]"
                  >
                    6. Was OPV given after paralysis onset?
                  </FieldLabel>

                  <YesNoUnknownField
                    value={vaccination.opvGivenAfterParalysis}
                    onChange={updateOpvAfterParalysis}
                    disabled={readOnly}
                    ariaLabel="Was OPV given after paralysis onset?"
                    error={Boolean(q6Error)}
                    errorId={`${q6FieldId}-error`}
                  />
                </div>
              </ValidatedField>

              {/* CONDITIONAL DATE */}
              {vaccination.opvGivenAfterParalysis === "yes" && (
                <ValidatedField
                  fieldId={opvAfterDateFieldId}
                  error={opvAfterDateError}
                  className="min-w-0 [&_.MuiFormHelperText-root]:mt-1!"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <FieldLabel
                      fieldId={opvAfterDateFieldId}
                      className="text-[11px] font-semibold text-[#52677e]"
                    >
                      Date of the OPV
                    </FieldLabel>

                    <div
                      className={`
                        w-full min-w-0
                        sm:w-47.5 sm:shrink-0
                        ${
                          opvAfterDateError
                            ? "[&_.MuiFormHelperText-root]:hidden"
                            : ""
                        }
                      `}
                    >
                      <DateField
                        value={vaccination.opvAfterParalysisDate}
                        onChange={(value) =>
                          updateDate("opvAfterParalysisDate", value)
                        }
                        disabled={readOnly}
                        noFuture
                        ariaLabel="Date of OPV after paralysis onset"
                        errorMessage={opvAfterDateError}
                      />
                    </div>
                  </div>
                </ValidatedField>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

// ===== Merged source: MuscleStrengthSelect.tsx =====
interface MuscleStrengthSelectProps {
  value: MuscleScore;
  onChange: (value: MuscleScore) => void;
  ariaLabel: string;
  disabled?: boolean;
  error?: boolean;
}

function MuscleStrengthSelect({
  value,
  onChange,
  ariaLabel,
  disabled = false,
  error = false,
}: MuscleStrengthSelectProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const rawValue = event.target.value;
    const numericValue = Number(rawValue);
    const isValid = MUSCLE_STRENGTH_OPTIONS.some(
      (option) => option.value === numericValue,
    );
    if (!isValid) {
      return;
    }
    onChange(numericValue as Exclude<MuscleScore, null>);
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled} error={error}>
      <Select
        value={value === null ? "" : String(value)}
        onChange={handleChange}
        displayEmpty
        aria-label={ariaLabel}
        renderValue={(selected) => {
          if (selected === "") {
            return (
              <span
                className="
                  text-[#94a3b8]
                "
              >
                Select score
              </span>
            );
          }

          const numericValue = Number(selected);

          const option = MUSCLE_STRENGTH_OPTIONS.find(
            (item) => item.value === numericValue,
          );

          return option?.label ?? selected;
        }}
        sx={{
          minHeight: 38,
          borderRadius: "7px",
          backgroundColor: "#ffffff",
          fontSize: "0.72rem",
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            py: "7px",
            pr: "30px !important",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#b9c8d8",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#8ca6c1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563eb",
          },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                maxWidth: 430,
                "& .MuiMenuItem-root": {
                  whiteSpace: "normal",
                  fontSize: "0.78rem",
                  lineHeight: 1.4,
                  py: 1,
                },
              },
            },
          },
        }}
      >
        {MUSCLE_STRENGTH_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={String(option.value)}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// ===== Merged source: ReflexBodyDiagram(2).tsx =====
export interface ReflexBodyDiagramProps {
  className?: string;
  renderer?: "mui" | "svg";
}

export const REFLEX_ANCHORS = {
  biceps: {
    label: "Biceps",
    y: 185,
    rightX: 120,
    leftX: 240,
  },
  brachioradialis: {
    label: "Brachioradialis",
    y: 255,
    rightX: 98,
    leftX: 262,
  },
  patellar: {
    label: "Patellar",
    y: 420,
    rightX: 145,
    leftX: 215,
  },
  achilles: {
    label: "Achilles",
    y: 500,
    rightX: 139,
    leftX: 221,
  },
  plantar: {
    label: "Plantar",
    y: 570,
    rightX: 110,
    leftX: 250,
  },
} as const;

export const REFLEX_DIAGRAM_LAYOUT = {
  width: 450,
  height: 763,
  diagramTop: 30,
  stageHeight: 830,
  controlCenterOffset: 36,
} as const;

// Anatomical coordinates.
const BODY_LINES = [
  [180, 123, 180, 150], // Neck
  [180, 150, 127, 159], // Right shoulder
  [180, 150, 233, 159], // Left shoulder
  [180, 150, 180, 328], // Spine
  [127, 159, 113, 210], // Right upper arm
  [113, 210, 92, 275], // Right forearm
  [92, 275, 65, 325], // Right wrist
  [233, 159, 247, 210], // Left upper arm
  [247, 210, 268, 275], // Left forearm
  [268, 275, 295, 325], // Left wrist
  [180, 328, 145, 350], // Right hip
  [180, 328, 215, 350], // Left hip
  [145, 350, 145, 420], // Right thigh
  [145, 420, 139, 500], // Right lower leg
  [215, 350, 215, 420], // Left thigh
  [215, 420, 221, 500], // Left lower leg
  [139, 500, 110, 570], // Right foot
  [221, 500, 250, 570], // Left foot
] as const;

function ReflexBodyDiagram({
  className = "",
  renderer = "mui",
}: ReflexBodyDiagramProps) {
  // Desktop and mobile instances need different IDs for accessibility.
  const uniqueId = useId();
  const titleId = `${uniqueId}-title`;
  const descriptionId = `${uniqueId}-description`;

  const contents = (
    <>
      <title id={titleId}>Infant reflex examination diagram</title>
      <desc id={descriptionId}>
        A single front-facing schematic infant body showing bilateral biceps,
        brachioradialis, patellar, Achilles, and plantar reflex sites. The
        patient's right side is displayed on the viewer's left.
      </desc>

      <circle
        cx="180"
        cy="72"
        r="50"
        fill="none"
        stroke="#475569"
        strokeWidth="2"
      />

      {BODY_LINES.map(([x1, y1, x2, y2], index) => (
        <line
          key={index}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#475569"
          strokeWidth="2"
        />
      ))}

      <polyline
        points="65,325 57,333 51,324"
        fill="none"
        stroke="#475569"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <polyline
        points="295,325 303,333 309,324"
        fill="none"
        stroke="#475569"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {Object.values(REFLEX_ANCHORS).map((site) => (
        <g key={site.label}>
          <line
            x1="0"
            y1={site.y}
            x2={site.rightX}
            y2={site.y}
            stroke="#8ba6c4"
            strokeWidth="1.5"
          />
          <line
            x1={site.leftX}
            y1={site.y}
            x2="360"
            y2={site.y}
            stroke="#8ba6c4"
            strokeWidth="1.5"
          />
          <circle
            cx={site.rightX}
            cy={site.y}
            r="4.5"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="1.5"
          >
            <title>Right {site.label} reflex site</title>
          </circle>
          <circle
            cx={site.leftX}
            cy={site.y}
            r="4.5"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="1.5"
          >
            <title>Left {site.label} reflex site</title>
          </circle>
        </g>
      ))}
    </>
  );

  const rootProps = {
    viewBox: "0 0 360 610",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    role: "img" as const,
    "aria-labelledby": `${titleId} ${descriptionId}`,
  };

  // MUI draws the diagram using Box rendered as an SVG root.
  if (renderer === "mui") {
    return (
      <Box component="svg" {...rootProps} sx={{ display: "block" }}>
        {contents}
      </Box>
    );
  }

  // Original native SVG root for a like-for-like comparison.
  return <svg {...rootProps}>{contents}</svg>;
}

// ===== Merged source: ReflexSelect(2).tsx =====
interface ReflexScoreSelectProps {
  type: "score";
  value: ReflexScoreCode;
  onChange: (value: ReflexScoreCode) => void;
  ariaLabel: string;
  disabled?: boolean;
  errorMessage?: string;
  errorId?: string;
}

interface PlantarReflexSelectProps {
  type: "plantar";
  value: PlantarReflexValue;
  onChange: (value: PlantarReflexValue) => void;
  ariaLabel: string;
  disabled?: boolean;
  errorMessage?: string;
  errorId?: string;
}

type ReflexSelectProps = ReflexScoreSelectProps | PlantarReflexSelectProps;

function ReflexSelect(props: ReflexSelectProps) {
  const {
    type,
    value,
    ariaLabel,
    disabled = false,
    errorMessage = "",
    errorId,
  } = props;

  const options =
    type === "score" ? REFLEX_SCORE_OPTIONS : PLANTAR_REFLEX_OPTIONS;

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selected = event.target.value;

    if (type === "score") {
      const valid = REFLEX_SCORE_OPTIONS.some(
        (option) => option.value === selected,
      );

      if (valid) {
        props.onChange(selected as Exclude<ReflexScoreCode, null>);
      }

      return;
    }

    const valid = PLANTAR_REFLEX_OPTIONS.some(
      (option) => option.value === selected,
    );

    if (valid) {
      props.onChange(selected as Exclude<PlantarReflexValue, null>);
    }
  };

  // NEW: MUI v9 error state
  const hasError = Boolean(errorMessage);

  return (
    <FormControl fullWidth size="small" disabled={disabled} error={hasError}>
      <Select
        value={value ?? ""}
        onChange={handleChange}
        displayEmpty
        aria-label={ariaLabel}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        renderValue={(selected) => {
          if (!selected) {
            return (
              <span className="text-[#475569]">
                {type === "score" ? "Reflex Score" : "Plantar Reflex"}
              </span>
            );
          }

          const option = options.find((item) => item.value === selected);

          return option?.label ?? selected;
        }}
        sx={{
          height: 38,
          borderRadius: "7px",
          backgroundColor: "#ffffff",
          fontSize: "0.72rem",

          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            py: "7px",
            pr: "30px !important",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#334155",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#334155",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563eb",
          },

          // NEW: MUI error border takes priority.
          "&.Mui-error .MuiOutlinedInput-notchedOutline, &.Mui-error:hover .MuiOutlinedInput-notchedOutline, &.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "error.main",
            },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                maxWidth: 220,

                "& .MuiMenuItem-root": {
                  whiteSpace: "normal",
                  fontSize: "0.78rem",
                  lineHeight: 1.4,
                },
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {/* NEW: MUI v9 INLINE ERROR MESSAGE */}
      {hasError && (
        <FormHelperText
          id={errorId}
          role="alert"
          sx={{
            m: 0,
            mt: 0.5,
            fontSize: "0.65rem",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
          }}
        >
          {errorMessage}
        </FormHelperText>
      )}
    </FormControl>
  );
}

// ===== Merged source: CheckboxField(4).tsx =====
interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function CheckboxField({
  label,
  checked,
  onChange,
  disabled = false,
}: CheckboxFieldProps) {
  return (
    <FormControlLabel
      disabled={disabled}
      control={
        <Checkbox
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          size="small"
          sx={{
            p: "4px",
            color: "#abc1da",
            "&.Mui-checked": {
              color: "#2563eb",
            },
            "& .MuiSvgIcon-root": {
              fontSize: 18,
            },
          }}
        />
      }
      label={label}
      sx={{
        m: 0,
        gap: "2px",
        alignItems: "center",
        "& .MuiFormControlLabel-label": {
          color: "#334155",
          fontSize: "0.75rem",
          lineHeight: 1.3,
        },
      }}
    />
  );
}

// ===== Merged source: DateField(4).tsx =====
interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  noFuture?: boolean;
  placeholder?: string;
  ariaLabel: string;
  errorMessage?: string;
}

function getDateError(value: string, noFuture: boolean): string {
  if (!value.trim()) {
    return "";
  }
  if (!isValidDateFormat(value)) {
    return "Enter date in DD-MM-YYYY format.";
  }
  if (!isValidCalendarDate(value)) {
    return "Enter a valid calendar date.";
  }
  if (noFuture && isFutureDate(value)) {
    return "Future dates are not allowed.";
  }
  return "";
}

function getTodayAsNativeDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DateField({
  value,
  onChange,
  disabled = false,
  noFuture = false,
  placeholder = "DD-MM-YYYY",
  ariaLabel,
  errorMessage = "",
}: DateFieldProps) {
  const inputId = useId();
  const nativeDateRef = useRef<HTMLInputElement>(null);
  const { attempted } = useAFPValidation();
  const localError = attempted ? getDateError(value, noFuture) : "";
  const error = errorMessage || localError;
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };
  const handleNativeDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nativeValue = event.target.value;

    if (!nativeValue) {
      return;
    }

    onChange(convertNativeDateToDisplay(nativeValue));
  };

  const openCalendar = () => {
    if (disabled || !nativeDateRef.current) {
      return;
    }

    try {
      nativeDateRef.current.showPicker();
    } catch {
      nativeDateRef.current.focus();
      nativeDateRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <TextField
        id={inputId}
        value={value}
        onChange={handleTextChange}
        disabled={disabled}
        error={Boolean(error)}
        helperText={errorMessage ? undefined : localError || undefined}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        fullWidth
        size="small"
        slotProps={{
          formHelperText: {
            role: "alert",
            sx: { ml: 0, mt: 0.5, fontSize: "0.75rem", lineHeight: 1.5 },
          },
          htmlInput: {
            maxLength: 10,
            inputMode: "numeric",
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  onClick={openCalendar}
                  disabled={disabled}
                  aria-label={`Open calendar for ${ariaLabel}`}
                  edge="end"
                  size="small"
                >
                  <CalendarMonthOutlinedIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          maxWidth: {
            xs: "100%",
            sm: 190,
          },
          "& .MuiOutlinedInput-root": {
            minHeight: 38,
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            "& fieldset": {
              borderColor: "#b9c8d8",
            },
            "&:hover fieldset": {
              borderColor: "#8ca6c1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2563eb",
            },
            "&.Mui-error fieldset, &.Mui-error:hover fieldset, &.Mui-error.Mui-focused fieldset":
              {
                borderColor: "#d32f2f",
              },
          },
          "& input": {
            py: "8px",
            fontSize: "0.78rem",
          },
          "& input::placeholder": {
            color: "#94a3b8",
            opacity: 1,
          },
        }}
      />

      <input
        ref={nativeDateRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleNativeDateChange}
        max={noFuture ? getTodayAsNativeDate() : undefined}
        className="
          pointer-events-none
          absolute h-0 w-0 opacity-0
        "
      />
    </div>
  );
}

// ===== Merged source: FieldError(4).tsx =====
interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="mt-1 text-xs leading-4 text-red-600">
      {message}
    </p>
  );
}

// ===== Merged source: NumberField(1).tsx =====
export interface NumberFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
  ariaLabel: string;
  disabled?: boolean;
  errorMessage?: string;
  onTouched?: () => void;

  // NEW: MUI v9 error styling
  error?: boolean;
}

function NumberField({
  value,
  onChange,
  ariaLabel,
  disabled = false,
  errorMessage,
  onTouched,
  error = false,
}: NumberFieldProps) {
  const handleChange = (rawValue: string) => {
    if (rawValue === "") {
      onChange(null);
      return;
    }

    const parsed = Number(rawValue);

    if (Number.isInteger(parsed) && parsed >= 0) {
      onChange(parsed);
    }
  };

  return (
    <div>
      <TextField
        value={value ?? ""}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={onTouched}
        disabled={disabled}
        type="number"
        size="small"
        aria-label={ariaLabel}
        error={error || Boolean(errorMessage)}
        slotProps={{
          htmlInput: {
            min: 0,
            step: 1,
          },
        }}
        sx={{
          width: {
            xs: "100%",
            sm: 140,
          },

          "& .MuiOutlinedInput-root": {
            minHeight: 38,
            borderRadius: "8px",
            backgroundColor: "#ffffff",
          },

          "& input": {
            py: "8px",
            fontSize: "0.8rem",
          },
        }}
      />

      <FieldError message={errorMessage} />
    </div>
  );
}

// ===== Merged source: SelectField(1).tsx =====
export interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  value: string;
  options: SelectFieldOption[];
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  error?: boolean;
  errorId?: string;
}

function SelectField({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
  disabled = false,
  error = false,
  errorId,
}: SelectFieldProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled} error={error}>
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        aria-describedby={error ? errorId : undefined}
        inputProps={{
          "aria-label": ariaLabel,
          "aria-invalid": error || undefined,
        }}
        renderValue={(selected) => {
          if (!selected) {
            return <span className="text-[#94a3b8]">{placeholder}</span>;
          }

          const option = options.find((item) => item.value === selected);

          return option?.label ?? selected;
        }}
        sx={{
          minHeight: 38,
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          fontSize: "0.78rem",

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#b9c8d8",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#8ca6c1",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563eb",
          },

          "&.Mui-error .MuiOutlinedInput-notchedOutline, &.Mui-error:hover .MuiOutlinedInput-notchedOutline, &.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "error.main",
            },

          "& .MuiSelect-select": {
            py: "8px",
          },
        }}
      >
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>

        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              fontSize: "0.82rem",
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// ===== Merged source: ToggleSwitch(4).tsx =====
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
}

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}: ToggleSwitchProps) {
  return (
    <Switch
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      disabled={disabled}
      slotProps={{
        input: {
          "aria-label": ariaLabel,
        },
      }}
      size="small"
      sx={{
        width: 46,
        height: 26,
        p: 0,
        "& .MuiSwitch-switchBase": {
          p: "3px",
          transitionDuration: "180ms",
          "&.Mui-checked": {
            transform: "translateX(20px)",
            color: "#ffffff",
            "& + .MuiSwitch-track": {
              backgroundColor: "#2563eb",
              opacity: 1,
            },
          },
        },
        "& .MuiSwitch-thumb": {
          width: 20,
          height: 20,
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.2)",
        },
        "& .MuiSwitch-track": {
          borderRadius: 13,
          backgroundColor: "#b6c3d3",
          opacity: 1,
        },
      }}
    />
  );
}

// ===== Required-field indicators (UI-only; existing validators stay authoritative) =====
const AFP_REQUIRED_ALWAYS = new Set<string>([
  "signsSymptoms.feverWhenParalysisBegan",
  "signsSymptoms.musclePainWhenParalysisBegan",
  "signsSymptoms.paralysisAsymmetric",
  "signsSymptoms.paralysisMovedUpward",
  "signsSymptoms.sensationPresentAtParalysisSite",
  "signsSymptoms.childAtHealthFacility",
  "signsSymptoms.siteOfParalysis",
  "previousHealthcareContacts.firstContactCategory",
  "additionalInformation.searchForAdditionalCases",
  "additionalInformation.outbreakResponseImmunizationDone",
]);

function isAFPFieldRequired(fieldId: string, data: AFPFormData): boolean {
  if (fieldId.startsWith("clinicalInformation.")) return true;
  if (fieldId === "screeningDiagnosis") return false; // "if known"
  if (getAFPScreeningStatus(data.clinicalInformation) !== "eligible") {
    return false;
  }

  if (AFP_REQUIRED_ALWAYS.has(fieldId)) return true;
  if (fieldId.startsWith("clinicalExamination.")) return true;
  if (fieldId.startsWith("previousHealthcareContacts.contacts.")) return true;

  const signs = data.signsSymptoms;
  const vaccination = data.vaccinationHistory;
  const travel = data.travelHistory;
  const history = data.previousHealthcareContacts;
  const additional = data.additionalInformation;

  switch (fieldId) {
    case "signsSymptoms.otherParalysisSite":
      return signs.siteOfParalysis.includes("other");
    case "signsSymptoms.healthFacility.selectedFacilityOption":
    case "signsSymptoms.healthFacility.notificationDate":
    case "signsSymptoms.healthFacility.medicalRecordNumber":
      return signs.childAtHealthFacility === "yes";
    case "signsSymptoms.healthFacility.otherFacilityName":
      return (
        signs.childAtHealthFacility === "yes" &&
        signs.healthFacility.selectedFacilityOption === AFP_OTHER_FACILITY_VALUE
      );
    case "vaccinationHistory.lastOpvDoseBeforeParalysisDate":
      return (
        vaccination.available &&
        ((vaccination.opvCampaignDoses.numberOfDoses ?? 0) > 0 ||
          (vaccination.opvRoutineDoses.numberOfDoses ?? 0) > 0)
      );
    case "vaccinationHistory.lastIpvDoseBeforeParalysisDate":
      return (
        vaccination.available && (vaccination.ipvDoses.numberOfDoses ?? 0) > 0
      );
    case "vaccinationHistory.opvAfterParalysisDate":
      return (
        vaccination.available && vaccination.opvGivenAfterParalysis === "yes"
      );
    case "travelHistory.notificationDate":
      return (
        travel.travelOutsideAreaLast30Days && travel.notifiedToConcernedDsfpSimo
      );
    case "previousHealthcareContacts.firstContactCategoryOther":
      return history.firstContactCategory === "Other";
    case "previousHealthcareContacts.suspectedDiagnosis":
      return false; // Enable via required override when options are configured.
    case "additionalInformation.numberOfAdditionalCases":
      return (
        additional.searchForAdditionalCases === "yes" &&
        additional.additionalCasesIdentified === "yes"
      );
    case "additionalInformation.numberOfChildrenVaccinated":
      return additional.outbreakResponseImmunizationDone === "yes";
    case "additionalInformation.outbreakResponseExplanation":
      return additional.outbreakResponseImmunizationDone === "no";
    default:
      return (
        vaccination.available &&
        (/^vaccinationHistory\.(opvCampaignDoses|opvRoutineDoses|ipvDoses)\.(recordSource|numberOfDoses)$/.test(
          fieldId,
        ) ||
          fieldId === "vaccinationHistory.opvGivenAfterParalysis")
      );
  }
}

interface FieldLabelProps {
  children: ReactNode;
  fieldId: string;
  component?: "label" | "p" | "span";
  className?: string;
  htmlFor?: string;
  required?: boolean;
}

function FieldLabel({
  children,
  fieldId,
  component = "label",
  className,
  htmlFor,
  required,
}: FieldLabelProps) {
  const { data } = useAFPForm();
  const showRequired = required ?? isAFPFieldRequired(fieldId, data);

  const content = (
    <>
      {children}
      {showRequired && (
        <Box
          component="span"
          aria-hidden="true"
          sx={{ ml: "2px", color: "error.main" }}
        >
          *
        </Box>
      )}
    </>
  );

  if (component === "p") {
    return (
      <Box component="p" className={className}>
        {content}
      </Box>
    );
  }
  if (component === "span") {
    return (
      <Box component="span" className={className}>
        {content}
      </Box>
    );
  }
  return (
    <Box component="label" htmlFor={htmlFor} className={className}>
      {content}
    </Box>
  );
}

// ===== Merged source: ValidatedField(1).tsx =====
interface ValidatedFieldProps {
  fieldId: string;
  error?: string;
  children: ReactNode;
  className?: string;
  showMessage?: boolean;
}

function ValidatedField({
  fieldId,
  error = "",
  children,
  className = "",
  showMessage = true,
}: ValidatedFieldProps) {
  return (
    <div
      data-afp-field={fieldId}
      role="group"
      aria-invalid={Boolean(error)}
      className={`min-w-0 ${className}`}
    >
      {children}
      {error && showMessage && (
        <FormHelperText
          id={`${fieldId}-error`}
          error
          role="alert"
          sx={{
            ml: 0,
            mt: -0.5,
            mb: 1.5,
            fontSize: "0.75rem",
            lineHeight: 1.5,
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </FormHelperText>
      )}
    </div>
  );
}

// ===== Merged source: YesNoField(4).tsx =====
interface YesNoFieldProps {
  value: YesNo;
  onChange: (value: YesNo) => void;
  disabled?: boolean;
  ariaLabel: string;
  error?: boolean;
  errorId?: string;
}

function YesNoField({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  error = false,
  errorId,
}: YesNoFieldProps) {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextValue: YesNo,
  ) => {
    if (nextValue === null) {
      return;
    }

    onChange(nextValue);
  };

  return (
    <FormControl error={error} sx={{ m: 0, minWidth: 0 }}>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
        size="small"
        sx={{
          gap: "6px",
          "& .MuiToggleButtonGroup-grouped": {
            margin: 0,
            border: `1px solid ${error ? "#d32f2f" : "#cbdcf0"} !important`,
            borderRadius: "7px !important",
          },
          "& .MuiToggleButton-root": {
            minWidth: 54,
            height: 34,
            px: 1.5,
            py: 0.5,
            color: "#64748b",
            backgroundColor: "#ffffff",
            fontSize: "0.75rem",
            fontWeight: 500,
            lineHeight: 1,
            textTransform: "none",
            transition:
              "background-color 120ms ease, border-color 120ms ease, color 120ms ease",
            "&:hover": {
              backgroundColor: "#ffffff",
            },
            "&.Mui-selected": {
              color: "#0756c9",
              borderColor: "#216fed !important",
              backgroundColor: "#eef5ff",
              fontWeight: 600,
            },
            "&.Mui-selected:hover": {
              backgroundColor: "#eef5ff",
            },
            "&.Mui-disabled": {
              color: "#94a3b8",
              backgroundColor: "#f8fafc",
            },
          },
        }}
      >
        <ToggleButton value="yes">Yes</ToggleButton>

        <ToggleButton value="no">No</ToggleButton>
      </ToggleButtonGroup>
    </FormControl>
  );
}

// ===== Merged source: YesNoPendingField(1).tsx =====
interface YesNoPendingFieldProps {
  value: YesNoPending;
  onChange: (value: YesNoPending) => void;
  disabled?: boolean;
  ariaLabel: string;

  // Optional validation properties
  error?: boolean;
  errorId?: string;
}

function YesNoPendingField({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  error = false,
  errorId,
}: YesNoPendingFieldProps) {
  const handleChange = (
    _event: MouseEvent<HTMLElement>,
    nextValue: YesNoPending,
  ) => {
    if (nextValue === null) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <FormControl
      error={error}
      sx={{
        m: 0,
        minWidth: 0,
      }}
    >
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
        size="small"
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          gap: "6px",

          "& .MuiToggleButtonGroup-grouped": {
            margin: 0,
            border: `1px solid ${error ? "#d32f2f" : "#cbdcf0"} !important`,
            borderRadius: "7px !important",
          },

          "& .MuiToggleButton-root": {
            minWidth: {
              xs: 52,
              sm: 58,
            },
            height: 34,
            px: {
              xs: 1,
              sm: 1.5,
            },
            color: "#64748b",
            backgroundColor: "#ffffff",
            fontSize: "0.72rem",
            fontWeight: 500,
            lineHeight: 1,
            textTransform: "none",
            whiteSpace: "nowrap",

            "&:hover": {
              backgroundColor: "#ffffff",
            },

            "&.Mui-selected": {
              color: "#0756c9",
              borderColor: "#216fed !important",
              backgroundColor: "#dceaff",
              fontWeight: 600,
            },

            "&.Mui-selected:hover": {
              backgroundColor: "#dceaff",
            },
          },
        }}
      >
        <ToggleButton value="yes">Yes</ToggleButton>
        <ToggleButton value="no">No</ToggleButton>
        <ToggleButton value="pending">Pending</ToggleButton>
      </ToggleButtonGroup>
    </FormControl>
  );
}

// ===== Merged source: YesNoUnknownField(1).tsx =====
interface YesNoUnknownFieldProps {
  value: YesNoUnknown;
  onChange: (value: YesNoUnknown) => void;
  disabled?: boolean;
  ariaLabel: string;
  error?: boolean;
  errorId?: string;
}

function YesNoUnknownField({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  error = false,
  errorId,
}: YesNoUnknownFieldProps) {
  const handleChange = (
    _event: MouseEvent<HTMLElement>,
    nextValue: YesNoUnknown,
  ) => {
    if (nextValue === null) {
      return;
    }

    onChange(nextValue);
  };

  return (
    <FormControl error={error} sx={{ m: 0, minWidth: 0 }}>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
        size="small"
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          gap: "6px",

          "& .MuiToggleButtonGroup-grouped": {
            margin: 0,
            border: `1px solid ${error ? "#d32f2f" : "#cbdcf0"} !important`,
            borderRadius: "7px !important",
          },

          "& .MuiToggleButton-root": {
            minWidth: {
              xs: 52,
              sm: 54,
            },
            height: 34,
            px: {
              xs: 1,
              sm: 1.5,
            },
            py: 0.5,
            color: "#64748b",
            backgroundColor: "#ffffff",
            fontSize: "0.72rem",
            fontWeight: 500,
            lineHeight: 1,
            textTransform: "none",
            whiteSpace: "nowrap",
            transition:
              "background-color 120ms ease, border-color 120ms ease, color 120ms ease",

            "&:hover": {
              backgroundColor: "#ffffff",
            },

            "&.Mui-selected": {
              color: "#0756c9",
              borderColor: "#216fed !important",
              backgroundColor: "#eef5ff",
              fontWeight: 600,
            },

            "&.Mui-selected:hover": {
              backgroundColor: "#eef5ff",
            },

            "&.Mui-disabled": {
              color: "#94a3b8",
              backgroundColor: "#f8fafc",
            },
          },
        }}
      >
        <ToggleButton value="yes">Yes</ToggleButton>
        <ToggleButton value="no">No</ToggleButton>
        <ToggleButton value="unknown">Unknown</ToggleButton>
      </ToggleButtonGroup>
    </FormControl>
  );
}
