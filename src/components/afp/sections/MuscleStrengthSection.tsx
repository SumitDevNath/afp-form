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

type UpperLimbField = keyof AFPUpperLimbMuscleStrength;

type LowerLimbField = keyof AFPLowerLimbMuscleStrength;

interface MuscleStrengthRowProps {
  label: string;
  value: AFPMuscleStrengthPair;
  onRightChange: (value: MuscleScore) => void;
  onLeftChange: (value: MuscleScore) => void;
  disabled?: boolean;
}

function MuscleStrengthRow({
  label,
  value,
  onRightChange,
  onLeftChange,
  disabled = false,
}: MuscleStrengthRowProps) {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-3
        border-t
        border-[#e1e9f1]
        px-3
        py-3
        sm:grid-cols-[minmax(130px,0.75fr)_minmax(0,1fr)_minmax(0,1fr)]
        sm:items-start
        sm:px-4
      "
    >
      <div
        className="
          pt-0
          sm:pt-2
        "
      >
        <span
          className="
            text-[12px]
            font-semibold
            text-[#334155]
          "
        >
          {label}
        </span>
      </div>

      <div>
        <span
          className="
            mb-1
            block
            text-[10px]
            font-semibold
            uppercase
            tracking-wide
            text-[#64748b]
            sm:hidden
          "
        >
          Rt
        </span>

        <MuscleStrengthSelect
          value={value.right}
          onChange={onRightChange}
          disabled={disabled}
          ariaLabel={`${label} right muscle strength`}
        />
      </div>

      <div>
        <span
          className="
            mb-1
            block
            text-[10px]
            font-semibold
            uppercase
            tracking-wide
            text-[#64748b]
            sm:hidden
          "
        >
          Lt
        </span>

        <MuscleStrengthSelect
          value={value.left}
          onChange={onLeftChange}
          disabled={disabled}
          ariaLabel={`${label} left muscle strength`}
        />
      </div>
    </div>
  );
}

interface MuscleStrengthTableProps {
  title: string;

  children: React.ReactNode;
}

function MuscleStrengthTable({ title, children }: MuscleStrengthTableProps) {
  return (
    <div
      className="
        overflow-hidden
        rounded-lg
        border
        border-[#d5e1ed]
        bg-white
      "
    >
      <div
        className="
          grid
          grid-cols-1
          bg-[#eef5fc]
          px-3
          py-3
          sm:grid-cols-[minmax(130px,0.75fr)_minmax(0,1fr)_minmax(0,1fr)]
          sm:items-center
          sm:px-4
        "
      >
        <h4
          className="
            m-0
            text-[13px]
            font-bold
            text-[#173b69]
          "
        >
          {title}
        </h4>

        <span
          className="
            hidden
            text-center
            text-[11px]
            font-bold
            uppercase
            tracking-wide
            text-[#52677e]
            sm:block
          "
        >
          Rt
        </span>

        <span
          className="
            hidden
            text-center
            text-[11px]
            font-bold
            uppercase
            tracking-wide
            text-[#52677e]
            sm:block
          "
        >
          Lt
        </span>
      </div>
      {children}
    </div>
  );
}

export default function MuscleStrengthSection() {
  const { data, updateData, readOnly } = useAFPForm();

  const muscleStrength = data.clinicalExamination.muscleStrength;

  const updateUpperLimb = (
    field: UpperLimbField,
    side: MuscleSide,
    value: MuscleScore,
  ) => {
    updateData((previous) => ({
      ...previous,
      clinicalExamination: {
        ...previous.clinicalExamination,
        muscleStrength: {
          ...previous.clinicalExamination.muscleStrength,
          upperLimb: {
            ...previous.clinicalExamination.muscleStrength.upperLimb,
            [field]: {
              ...previous.clinicalExamination.muscleStrength.upperLimb[field],
              [side]: value,
            },
          },
        },
      },
    }));
  };

  const updateLowerLimb = (
    field: LowerLimbField,
    side: MuscleSide,
    value: MuscleScore,
  ) => {
    updateData((previous) => ({
      ...previous,
      clinicalExamination: {
        ...previous.clinicalExamination,
        muscleStrength: {
          ...previous.clinicalExamination.muscleStrength,
          lowerLimb: {
            ...previous.clinicalExamination.muscleStrength.lowerLimb,
            [field]: {
              ...previous.clinicalExamination.muscleStrength.lowerLimb[field],
              [side]: value,
            },
          },
        },
      },
    }));
  };

  return (
    <section
      className="
        overflow-hidden
        rounded-xl
        border
        border-[#d4e2ef]
        bg-white
        shadow-[0_1px_2px_rgba(15,23,42,0.03)]
      "
    >
      <div
        className="
          border-b
          border-[#dce7f2]
          px-5
          py-3
          sm:px-7
        "
      >
        <h2
          className="
            m-0
            text-[18px]
            font-bold
            text-[#173b69]
          "
        >
          Clinical Examination
        </h2>
      </div>

      <div
        className="
          px-5
          py-5
          sm:px-7
        "
      >
        <div
          className="
            rounded-xl
            border
            border-[#d9e5f1]
            bg-[#f8fbff]
            p-4
            sm:p-5
          "
        >
          <h3
            className="
              m-0
              mb-4
              text-[16px]
              font-bold
              text-[#173b69]
            "
          >
            Muscle Strength
          </h3>

          <div
            className="
              grid
              grid-cols-1
              gap-5
              xl:grid-cols-2
            "
          >
            <MuscleStrengthTable title="Upper Limb">
              {UPPER_LIMB_MUSCLE_FIELDS.map(({ key, label }) => (
                <MuscleStrengthRow
                  key={key}
                  label={label}
                  value={muscleStrength.upperLimb[key]}
                  onRightChange={(value) =>
                    updateUpperLimb(key, "right", value)
                  }
                  onLeftChange={(value) => updateUpperLimb(key, "left", value)}
                  disabled={readOnly}
                />
              ))}
            </MuscleStrengthTable>

            <MuscleStrengthTable title="Lower Limb">
              {LOWER_LIMB_MUSCLE_FIELDS.map(({ key, label }) => (
                <MuscleStrengthRow
                  key={key}
                  label={label}
                  value={muscleStrength.lowerLimb[key]}
                  onRightChange={(value) =>
                    updateLowerLimb(key, "right", value)
                  }
                  onLeftChange={(value) => updateLowerLimb(key, "left", value)}
                  disabled={readOnly}
                />
              ))}
            </MuscleStrengthTable>
          </div>
        </div>
      </div>
    </section>
  );
}
