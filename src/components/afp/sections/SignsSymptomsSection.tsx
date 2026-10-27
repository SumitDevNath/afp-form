import { Box, FormControl, TextField } from "@mui/material";
import CheckboxField from "../fields/CheckboxField";
import DateField from "../fields/DateField";
import SelectField from "../fields/SelectField";
import YesNoUnknownField from "../fields/YesNoUnknownField";
import ValidatedField from "../fields/ValidatedField";

import {
  AFP_DEMO_FACILITY_OPTIONS,
  AFP_OTHER_FACILITY_OPTION,
  AFP_OTHER_FACILITY_VALUE,
} from "../constants/afpFacilities";

import { useAFPForm } from "../context/AFPFormContext";
import { useAFPValidation } from "../validation/AFPValidationContext";

import type {
  AFPFacilityOption,
  AFPParalysisSite,
  AFPSignsSymptoms,
  YesNoUnknown,
} from "../types/afp.types";

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
        <p className="m-0 pt-1 text-[13px] font-semibold leading-5 text-[#173b69]">
          {number}. {label}
        </p>

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

export default function SignsSymptomsSection({
  facilityOptions,
}: SignsSymptomsSectionProps) {
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
              <p className="m-0 mb-4 text-[13px] font-semibold text-[#173b69]">
                3. SITE OF PARALYSIS
              </p>

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
                <label className={`${fieldLabelClass} lg:leading-4`}>
                  Select the health facility from the dropdown
                </label>

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
                  <label
                    htmlFor="afp-other-facility-name"
                    className={fieldLabelClass}
                  >
                    Facility name
                  </label>

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
              <label className={`${fieldLabelClass} lg:leading-4`}>
                Date of notification
              </label>

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
              <label
                htmlFor="afp-medical-record-number"
                className={`${fieldLabelClass} lg:leading-4`}
              >
                Medical record #
              </label>

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
