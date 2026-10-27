import { useState, type ReactNode } from "react";
import { TextField } from "@mui/material";
import NumberField, { type NumberFieldProps } from "../fields/NumberField";
import ToggleSwitch from "../fields/ToggleSwitch";
import YesNoPendingField from "../fields/YesNoPendingField";
import ValidatedField from "../fields/ValidatedField";
import { useAFPForm } from "../context/AFPFormContext";
import { useAFPValidation } from "../validation/AFPValidationContext";
import type {
  AFPAdditionalInformation,
  YesNo,
  YesNoPending,
} from "../types/afp.types";

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
        <label className={dependentLabelClass}>{label}</label>

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
          <p className="m-0 pt-2 text-[13px] font-bold leading-5 text-[#173b69]">
            {number}. {label}
          </p>

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

export default function AdditionalInformationSection() {
  const { data, updateData, readOnly } = useAFPForm();

  // NEW: Shared Submit Form validation.
  const { errors } = useAFPValidation();

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

  const additionalCountError =
    errors[additionalCountId] ||
    (additionalCountTouched &&
    additional.additionalCasesIdentified === "yes" &&
    additional.numberOfAdditionalCases === null
      ? "Enter how many additional AFP cases were identified."
      : "");

  const vaccinatedCountError =
    errors[vaccinatedCountId] ||
    (vaccinatedCountTouched &&
    additional.outbreakResponseImmunizationDone === "yes" &&
    additional.numberOfChildrenVaccinated === null
      ? "Enter how many children were vaccinated."
      : "");

  const explanationError =
    errors[explanationId] ||
    (explanationTouched &&
    additional.outbreakResponseImmunizationDone === "no" &&
    !additional.outbreakResponseExplanation.trim()
      ? "Please explain why outbreak response immunization was not done."
      : "");

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
                <label
                  htmlFor="afp-ori-explanation"
                  className="text-[12px] font-semibold leading-5 text-[#173b69]"
                >
                  Please explain why outbreak response immunization was not done
                </label>

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
