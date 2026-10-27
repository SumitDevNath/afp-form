import { Fragment } from "react";

import ReflexBodyDiagram, {
  REFLEX_ANCHORS,
  REFLEX_DIAGRAM_LAYOUT,
} from "../clinical-examination/ReflexBodyDiagram";

import ReflexSelect from "../clinical-examination/ReflexSelect";
import { useAFPForm } from "../context/AFPFormContext";
import { useAFPValidation } from "../validation/AFPValidationContext";

import type {
  AFPReflexScores,
  PlantarReflexValue,
  ReflexScoreCode,
} from "../types/afp.types";

type ReflexScoreField = keyof AFPReflexScores;

type PlantarField = "rightPlantarReflex" | "leftPlantarReflex";

// Switch between MUI and SVG renderers.
// Existing behavior preserved.
const DIAGRAM_RENDERER: "mui" | "svg" = "mui";

type ReflexFieldProps = {
  label: string;
  ariaLabel?: string;
  disabled?: boolean;

  placement?: {
    side: "left" | "right";
    top: number;
  };

  // NEW: Validation
  fieldId: string;
  errorMessage?: string;
} & (
  | {
      type: "score";
      value: ReflexScoreCode;
      onChange: (value: ReflexScoreCode) => void;
    }
  | {
      type: "plantar";
      value: PlantarReflexValue;
      onChange: (value: PlantarReflexValue) => void;
    }
);

// =========================================================
// REFLEX CONFIGURATION — UNCHANGED
// =========================================================

const reflexQuestions = [
  {
    label: "Biceps",
    anchor: "biceps",
    rightField: "rightBiceps",
    leftField: "leftBiceps",
  },
  {
    label: "Brachioradialis",
    anchor: "brachioradialis",
    rightField: "rightBrachioradialis",
    leftField: "leftBrachioradialis",
  },
  {
    label: "Patellar",
    anchor: "patellar",
    rightField: "rightPatellar",
    leftField: "leftPatellar",
  },
  {
    label: "Achilles",
    anchor: "achilles",
    rightField: "rightAchilles",
    leftField: "leftAchilles",
  },
] as const satisfies ReadonlyArray<{
  label: string;
  anchor: keyof typeof REFLEX_ANCHORS;
  rightField: ReflexScoreField;
  leftField: ReflexScoreField;
}>;

const sides = [
  {
    heading: "RT",
    scoreKey: "rightField",
    plantarKey: "rightPlantarReflex",
    position: "left",
  },
  {
    heading: "LT",
    scoreKey: "leftField",
    plantarKey: "leftPlantarReflex",
    position: "right",
  },
] as const;

// =========================================================
// SHARED STYLING — UNCHANGED
// =========================================================

const attachedLabelClass =
  "mb-0 block px-2 py-0 text-center text-[10px] font-semibold leading-4 text-[#173b69]";

const mobileLabelClass = "text-[12px] font-semibold text-[#173b69]";

// Preserve original anatomical positioning.
function getDropdownTop(anchorY: number): number {
  const diagramScale = REFLEX_DIAGRAM_LAYOUT.width / 360;

  return (
    REFLEX_DIAGRAM_LAYOUT.diagramTop +
    anchorY * diagramScale -
    REFLEX_DIAGRAM_LAYOUT.controlCenterOffset
  );
}

// =========================================================
// REFLEX FIELD — WITH VALIDATION
// =========================================================

function ReflexField(props: ReflexFieldProps) {
  const {
    label,
    ariaLabel = label,
    disabled = false,
    placement,
    fieldId,
    errorMessage = "",
  } = props;

  const wrapperClass = placement
    ? `absolute z-10 w-[25%] min-w-[125px] max-w-[160px] ${
        placement.side === "left" ? "left-0" : "right-0"
      }`
    : "grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center";

  const labelClass = placement
    ? `${attachedLabelClass}${props.type === "plantar" ? " mt-3" : ""}`
    : mobileLabelClass;

  // Desktop and mobile instances share the validation field ID,
  // but have distinct helper-text IDs for accessibility.
  const errorId = `${fieldId}-${placement ? "desktop" : "mobile"}-error`;

  return (
    <div
      data-afp-field={fieldId}
      className={wrapperClass}
      style={placement ? { top: placement.top } : undefined}
    >
      <label className={labelClass}>{label}</label>

      {props.type === "score" ? (
        <ReflexSelect
          type="score"
          value={props.value}
          onChange={props.onChange}
          disabled={disabled}
          ariaLabel={ariaLabel}
          errorMessage={errorMessage}
          errorId={errorId}
        />
      ) : (
        <ReflexSelect
          type="plantar"
          value={props.value}
          onChange={props.onChange}
          disabled={disabled}
          ariaLabel={ariaLabel}
          errorMessage={errorMessage}
          errorId={errorId}
        />
      )}
    </div>
  );
}

// =========================================================
// REFLEXES SECTION
// =========================================================

export default function ReflexesSection() {
  const { data, updateData, readOnly } = useAFPForm();

  // NEW: Shared submission validation.
  const { errors } = useAFPValidation();

  const reflexes = data.clinicalExamination.reflexes;

  // =======================================================
  // EXISTING CONTEXT FUNCTIONS — UNCHANGED
  // =======================================================

  const updateScore = (field: ReflexScoreField, value: ReflexScoreCode) => {
    updateData((previous) => ({
      ...previous,
      clinicalExamination: {
        ...previous.clinicalExamination,
        reflexes: {
          ...previous.clinicalExamination.reflexes,
          scores: {
            ...previous.clinicalExamination.reflexes.scores,
            [field]: value,
          },
        },
      },
    }));
  };

  const updatePlantarReflex = (
    side: PlantarField,
    value: PlantarReflexValue,
  ) => {
    updateData((previous) => ({
      ...previous,
      clinicalExamination: {
        ...previous.clinicalExamination,
        reflexes: {
          ...previous.clinicalExamination.reflexes,
          [side]: value,
        },
      },
    }));
  };

  // =======================================================
  // UI — EXISTING DIAGRAM AND POSITIONING PRESERVED
  // =======================================================

  return (
    <div className="min-w-0 rounded-xl border border-[#d9e5f1] bg-[#f8fbff] p-4 sm:p-5">
      <h3 className="m-0 mb-4 text-[16px] font-bold text-[#173b69]">
        Reflexes
      </h3>

      {/* DESKTOP / TABLET ANATOMICAL LAYOUT */}
      <div
        className="relative mx-auto hidden w-full max-w-190 md:block"
        style={{
          height: REFLEX_DIAGRAM_LAYOUT.stageHeight,
        }}
      >
        {/* SIDE HEADINGS */}
        <span className="absolute left-0 top-0 z-20 rounded-md bg-[#eaf3ff] px-2 py-1 text-[12px] font-bold text-[#1752a0]">
          RT
        </span>

        <span className="absolute right-0 top-0 z-20 rounded-md bg-[#eaf3ff] px-2 py-1 text-[12px] font-bold text-[#1752a0]">
          LT
        </span>

        {/* CENTERED INFANT BODY */}
        <div
          className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2"
          style={{
            top: REFLEX_DIAGRAM_LAYOUT.diagramTop,
            width: REFLEX_DIAGRAM_LAYOUT.width,
            height: REFLEX_DIAGRAM_LAYOUT.height,
          }}
        >
          <ReflexBodyDiagram
            className="h-full w-full"
            renderer={DIAGRAM_RENDERER}
          />
        </div>

        {/* REFLEX SCORES */}
        {reflexQuestions.map((question) => (
          <Fragment key={question.anchor}>
            {sides.map((side) => {
              const field = question[side.scoreKey];

              const fieldId = `clinicalExamination.reflexes.scores.${field}`;

              return (
                <ReflexField
                  key={side.heading}
                  type="score"
                  label={`${side.heading} ${question.label}`}
                  value={reflexes.scores[field]}
                  onChange={(value) => updateScore(field, value)}
                  disabled={readOnly}
                  ariaLabel={`${side.heading} ${question.label} reflex score`}
                  fieldId={fieldId}
                  errorMessage={errors[fieldId]}
                  placement={{
                    side: side.position,
                    top: getDropdownTop(REFLEX_ANCHORS[question.anchor].y),
                  }}
                />
              );
            })}
          </Fragment>
        ))}

        {/* PLANTAR REFLEX */}
        {sides.map((side) => {
          const fieldId = `clinicalExamination.reflexes.${side.plantarKey}`;

          return (
            <ReflexField
              key={side.heading}
              type="plantar"
              label={`${side.heading} Plantar Reflex`}
              value={reflexes[side.plantarKey]}
              onChange={(value) => updatePlantarReflex(side.plantarKey, value)}
              disabled={readOnly}
              ariaLabel={`${side.heading} Plantar Reflex`}
              fieldId={fieldId}
              errorMessage={errors[fieldId]}
              placement={{
                side: side.position,
                top: getDropdownTop(REFLEX_ANCHORS.plantar.y),
              }}
            />
          );
        })}
      </div>

      {/* MOBILE: RESPONSIVE INFANT DIAGRAM + SCORE LIST */}
      <div className="md:hidden">
        <div className="mx-auto mb-6 w-full max-w-80">
          <div className="mb-2 flex justify-between">
            <span className="rounded-md bg-[#eaf3ff] px-2 py-1 text-[12px] font-bold text-[#1752a0]">
              RT
            </span>

            <span className="rounded-md bg-[#eaf3ff] px-2 py-1 text-[12px] font-bold text-[#1752a0]">
              LT
            </span>
          </div>

          <ReflexBodyDiagram
            className="h-auto w-full"
            renderer={DIAGRAM_RENDERER}
          />
        </div>

        <div className="space-y-6">
          {sides.map((side, index) => (
            <div
              key={side.heading}
              className={
                index === 1 ? "border-t border-[#dbe6f1] pt-5" : undefined
              }
            >
              <h4 className="mb-3 text-sm font-bold text-[#173b69]">
                {side.heading}
              </h4>

              <div className="space-y-4">
                {/* REFLEX SCORES */}
                {reflexQuestions.map((question) => {
                  const field = question[side.scoreKey];

                  const fieldId = `clinicalExamination.reflexes.scores.${field}`;

                  return (
                    <ReflexField
                      key={field}
                      type="score"
                      label={question.label}
                      value={reflexes.scores[field]}
                      onChange={(value) => updateScore(field, value)}
                      disabled={readOnly}
                      fieldId={fieldId}
                      errorMessage={errors[fieldId]}
                    />
                  );
                })}

                {/* PLANTAR REFLEX */}
                {(() => {
                  const fieldId = `clinicalExamination.reflexes.${side.plantarKey}`;

                  return (
                    <ReflexField
                      type="plantar"
                      label="Plantar Reflex"
                      value={reflexes[side.plantarKey]}
                      onChange={(value) =>
                        updatePlantarReflex(side.plantarKey, value)
                      }
                      disabled={readOnly}
                      fieldId={fieldId}
                      errorMessage={errors[fieldId]}
                    />
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
