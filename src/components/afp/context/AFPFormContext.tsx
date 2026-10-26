import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  AFPAdditionalInformation,
  AFPClinicalExamination,
  AFPFormData,
  AFPFormUpdater,
  AFPPreviousHealthcareContacts,
  AFPSignsSymptoms,
  AFPTravelHistory,
  AFPVaccinationHistory,
} from "../types/afp.types";

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
