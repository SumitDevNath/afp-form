import type { ReactNode } from "react";

import { FormControl, FormHelperText } from "@mui/material";

import MuscleStrengthSelect from "../clinical-examination/MuscleStrengthSelect";

import { useAFPForm } from "../context/AFPFormContext";
import { useAFPValidation } from "../validation/AFPValidationContext";

import {
  LOWER_LIMB_MUSCLE_FIELDS,
  UPPER_LIMB_MUSCLE_FIELDS,
} from "../constants/afpMuscleStrength";

import type {
  AFPLowerLimbMuscleStrength,
  AFPMuscleStrengthPair,
  AFPUpperLimbMuscleStrength,
  MuscleScore,
} from "../types/afp.types";

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
        <span className="text-[12px] font-semibold text-[#334155]">
          {label}
        </span>
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

export default function MuscleStrengthSection() {
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
