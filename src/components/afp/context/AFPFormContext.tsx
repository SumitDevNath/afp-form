import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { AFPFormData, AFPFormUpdater } from "../types/afp.types";

export const createInitialAFPFormData = (): AFPFormData => ({
  clinicalInformation: {
    paralysisPresent: null,
    paralysisFlaccid: null,
    paralysisSuddenOnset: null,
    paralysisOnsetDate: "",
    paralysisCausedByInjury: null,
    paralysisPresentAtBirth: null,
  },
  screeningDiagnosis: "",
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

  const data = isControlled ? value : internalData;

  const updateData = useCallback(
    (updater: AFPFormUpdater) => {
      if (readOnly) return;

      if (isControlled) {
        const nextData = updater(data);
        onChange?.(nextData);
      } else {
        setInternalData((previous) => {
          const nextData = updater(previous);
          onChange?.(nextData);
          return nextData;
        });
      }
    },
    [data, isControlled, onChange, readOnly],
  );

  const contextValue = useMemo(
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
