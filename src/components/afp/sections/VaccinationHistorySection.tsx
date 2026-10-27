import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

import DateField from "../fields/DateField";
import SelectField from "../fields/SelectField";
import ToggleSwitch from "../fields/ToggleSwitch";
import YesNoUnknownField from "../fields/YesNoUnknownField";
import ValidatedField from "../fields/ValidatedField";

import { useAFPForm } from "../context/AFPFormContext";
import { useAFPValidation } from "../validation/AFPValidationContext";

import {
  VACCINATION_DOSE_OPTIONS,
  VACCINATION_RECORD_SOURCE_OPTIONS,
} from "../constants/afpVaccination";

import type {
  AFPVaccinationDoseEntry,
  AFPVaccinationHistory,
  VaccinationRecordSource,
  YesNoUnknown,
} from "../types/afp.types";

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

const questionLabelClass =
  "m-0 pt-2 text-[12px] font-semibold leading-5 text-[#173b69]";

const questionRowClass =
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
      className={`${questionRowClass} md:grid-cols-[minmax(0,1fr)_130px_90px]`}
    >
      <p className={questionLabelClass}>
        {number}. {label}
      </p>

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
        <p className={questionLabelClass}>
          {number}. {label}
        </p>

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

export default function VaccinationHistorySection() {
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
                  <p className="m-0 text-[13px] font-semibold leading-5 text-[#173b69]">
                    6. Was OPV given after paralysis onset?
                  </p>

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
                    <label className="text-[11px] font-semibold text-[#52677e]">
                      Date of the OPV
                    </label>

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
