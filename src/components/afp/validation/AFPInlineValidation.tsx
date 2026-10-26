import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAFPForm } from "../context/AFPFormContext";
import { validateAFPForm } from "../utils/afpFormValidation";

type ValidationContextValue = {
  attempted: boolean;
  missingCount: number;
  verify: () => void;
  isMissing: (section: string, field: string) => boolean;
};

const ValidationContext = createContext<ValidationContextValue | null>(null);

export function AFPInlineValidationProvider({
  children,
  requireSuspectedDiagnosis = false,
}: {
  children: ReactNode;
  requireSuspectedDiagnosis?: boolean;
}) {
  const { data } = useAFPForm();
  const [attempted, setAttempted] = useState(false);
  const issues = useMemo(
    () => validateAFPForm(data, { requireSuspectedDiagnosis }),
    [data, requireSuspectedDiagnosis],
  );
  const invalidKeys = useMemo(
    () => new Set(issues.map((issue) => `${issue.section}::${issue.field}`)),
    [issues],
  );

  const verify = () => {
    setAttempted(true);
    if (issues.length > 0) {
      // Wait for the new inline errors to be rendered, then point to the first.
      window.requestAnimationFrame(() => {
        const visibleInvalidField = Array.from(
          document.querySelectorAll<HTMLElement>('[data-afp-invalid="true"]'),
        ).find((element) => element.getClientRects().length > 0);
        visibleInvalidField?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  };

  return (
    <ValidationContext.Provider
      value={{
        attempted,
        missingCount: issues.length,
        verify,
        isMissing: (section, field) =>
          attempted && invalidKeys.has(`${section}::${field}`),
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
}

export function useAFPInlineValidation() {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error(
      "Place AFPInlineValidationProvider inside AFPFormProvider and wrap all AFP sections and the Submit button.",
    );
  }
  return context;
}

export function AFPValidationField({
  section,
  field,
  children,
  className = "",
  message,
}: {
  section: string;
  field: string;
  children: ReactNode;
  className?: string;
  message?: string;
}) {
  const { isMissing } = useAFPInlineValidation();
  const missing = isMissing(section, field);
  const description = field.replace(/^\d+\.\s*/, "").replace(/[?.]$/, "");

  return (
    <div className={`min-w-0 ${className}`} data-afp-invalid={missing ? "true" : undefined}>
      <div
        style={
          missing
            ? {
                outline: "2px solid #dc2626",
                outlineOffset: "2px",
                borderRadius: "8px",
              }
            : undefined
        }
      >
        {children}
      </div>
      {missing && (
        <p role="alert" className="mt-1.5 text-[11px] font-medium leading-4 text-[#b42318]">
          {message ?? `${description} is not filled in.`}
        </p>
      )}
    </div>
  );
}
