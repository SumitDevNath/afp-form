import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  scrollToFirstAFPError,
  type AFPValidationErrors,
  type AFPValidator,
} from "./afpValidation";

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
