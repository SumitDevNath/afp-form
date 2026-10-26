import type { ReactNode } from "react";
import MuscleStrengthSelect from "../clinical-examination/MuscleStrengthSelect";
import { useAFPForm } from "../context/AFPFormContext";
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
  onChange: (side: MuscleSide, value: MuscleScore) => void;
  disabled?: boolean;
}

interface MuscleStrengthTableProps {
  title: string;
  children: ReactNode;
}

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

function MuscleStrengthRow({
  label,
  value,
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

      {sides.map(({ key, title }) => (
        <div key={key}>
          <span className={mobileSideLabelClass}>{title}</span>

          <MuscleStrengthSelect
            value={value[key]}
            onChange={(score) => onChange(key, score)}
            disabled={disabled}
            ariaLabel={`${label} ${key} muscle strength`}
          />
        </div>
      ))}
    </div>
  );
}

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

export default function MuscleStrengthSection() {
  const { data, updateData, readOnly } = useAFPForm();

  const muscleStrength = data.clinicalExamination.muscleStrength;

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
