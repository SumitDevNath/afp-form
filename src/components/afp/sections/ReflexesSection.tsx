import ReflexBodyDiagram from "../clinical-examination/ReflexBodyDiagram";
import ReflexSelect from "../clinical-examination/ReflexSelect";
import { useAFPForm } from "../context/AFPFormContext";
import type {
  AFPReflexScores,
  PlantarReflexValue,
  ReflexScoreCode,
} from "../types/afp.types";

type ReflexScoreField = keyof AFPReflexScores;
interface MobileScoreFieldProps {
  label: string;
  value: ReflexScoreCode;
  onChange: (value: ReflexScoreCode) => void;
  disabled?: boolean;
}

function MobileScoreField({
  label,
  value,
  onChange,
  disabled = false,
}: MobileScoreFieldProps) {
  return (
    <div
      className="
        grid
        gap-2
        sm:grid-cols-[150px_minmax(0,1fr)]
        sm:items-center
      "
    >
      <label
        className="
          text-[12px]
          font-semibold
          text-[#173b69]
        "
      >
        {label}
      </label>

      <ReflexSelect
        type="score"
        value={value}
        onChange={onChange}
        disabled={disabled}
        ariaLabel={label}
      />
    </div>
  );
}

export default function ReflexesSection() {
  const { data, updateData, readOnly } = useAFPForm();

  const reflexes = data.clinicalExamination.reflexes;

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
    side: "rightPlantarReflex" | "leftPlantarReflex",

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
            Reflexes
          </h3>

          {/* DESKTOP / TABLET DIAGRAM */}
          <div
            className="
              relative
              mx-auto
              hidden
              min-h-[560px]
              max-w-[720px]
              md:block
            "
          >
            <span
              className="
                absolute
                left-[2%]
                top-[2%]
                text-[20px]
                font-medium
                text-[#111827]
              "
            >
              RT
            </span>

            <span
              className="
                absolute
                right-[2%]
                top-[2%]
                text-[20px]
                font-medium
                text-[#111827]
              "
            >
              LT
            </span>

            <ReflexBodyDiagram
              className="
                absolute
                left-1/2
                top-3
                h-[500px]
                w-[340px]
                -translate-x-1/2
              "
            />

            {/* RT UPPER 1 */}
            <div
              className="
                absolute
                left-0
                top-[13%]
                w-[165px]
              "
            >
              <ReflexSelect
                type="score"
                value={reflexes.scores.rightUpper1}
                onChange={(value) => updateScore("rightUpper1", value)}
                disabled={readOnly}
                ariaLabel="RT reflex score upper position 1"
              />
            </div>

            {/* LT UPPER 1 */}
            <div
              className="
                absolute
                right-0
                top-[13%]
                w-[165px]
              "
            >
              <ReflexSelect
                type="score"
                value={reflexes.scores.leftUpper1}
                onChange={(value) => updateScore("leftUpper1", value)}
                disabled={readOnly}
                ariaLabel="LT reflex score upper position 1"
              />
            </div>

            {/* RT UPPER 2 */}
            <div
              className="
                absolute
                left-[13%]
                top-[34%]
                w-[165px]
              "
            >
              <ReflexSelect
                type="score"
                value={reflexes.scores.rightUpper2}
                onChange={(value) => updateScore("rightUpper2", value)}
                disabled={readOnly}
                ariaLabel="RT reflex score upper position 2"
              />
            </div>

            {/* LT UPPER 2 */}
            <div
              className="
                absolute
                right-[13%]
                top-[34%]
                w-[165px]
              "
            >
              <ReflexSelect
                type="score"
                value={reflexes.scores.leftUpper2}
                onChange={(value) => updateScore("leftUpper2", value)}
                disabled={readOnly}
                ariaLabel="LT reflex score upper position 2"
              />
            </div>

            {/* RT LOWER 1 */}
            <div
              className="
                absolute
                left-[2%]
                top-[63%]
                w-[165px]
              "
            >
              <ReflexSelect
                type="score"
                value={reflexes.scores.rightLower1}
                onChange={(value) => updateScore("rightLower1", value)}
                disabled={readOnly}
                ariaLabel="RT reflex score lower position 1"
              />
            </div>

            {/* LT LOWER 1 */}
            <div
              className="
                absolute
                right-[2%]
                top-[63%]
                w-[165px]
              "
            >
              <ReflexSelect
                type="score"
                value={reflexes.scores.leftLower1}
                onChange={(value) => updateScore("leftLower1", value)}
                disabled={readOnly}
                ariaLabel="LT reflex score lower position 1"
              />
            </div>

            {/* RT LOWER 2 */}
            <div
              className="
                absolute
                left-[0%]
                top-[78%]
                w-[165px]
              "
            >
              <ReflexSelect
                type="score"
                value={reflexes.scores.rightLower2}
                onChange={(value) => updateScore("rightLower2", value)}
                disabled={readOnly}
                ariaLabel="RT reflex score lower position 2"
              />
            </div>

            {/* LT LOWER 2 */}
            <div
              className="
                absolute
                right-[0%]
                top-[78%]
                w-[165px]
              "
            >
              <ReflexSelect
                type="score"
                value={reflexes.scores.leftLower2}
                onChange={(value) => updateScore("leftLower2", value)}
                disabled={readOnly}
                ariaLabel="LT reflex score lower position 2"
              />
            </div>

            {/* RT PLANTAR */}
            <div
              className="
                absolute
                bottom-0
                left-0
                w-[180px]
              "
            >
              <ReflexSelect
                type="plantar"
                value={reflexes.rightPlantarReflex}
                onChange={(value) =>
                  updatePlantarReflex("rightPlantarReflex", value)
                }
                disabled={readOnly}
                ariaLabel="RT plantar reflex"
              />
            </div>

            {/* LT PLANTAR */}
            <div
              className="
                absolute
                bottom-0
                right-0
                w-[180px]
              "
            >
              <ReflexSelect
                type="plantar"
                value={reflexes.leftPlantarReflex}
                onChange={(value) =>
                  updatePlantarReflex("leftPlantarReflex", value)
                }
                disabled={readOnly}
                ariaLabel="LT plantar reflex"
              />
            </div>
          </div>

          {/* MOBILE */}
          <div
            className="
              space-y-6
              md:hidden
            "
          >
            <div>
              <h4
                className="
                  mb-3
                  text-sm
                  font-bold
                  text-[#173b69]
                "
              >
                RT
              </h4>

              <div
                className="
                  space-y-3
                "
              >
                <MobileScoreField
                  label="Upper position 1"
                  value={reflexes.scores.rightUpper1}
                  onChange={(value) => updateScore("rightUpper1", value)}
                  disabled={readOnly}
                />

                <MobileScoreField
                  label="Upper position 2"
                  value={reflexes.scores.rightUpper2}
                  onChange={(value) => updateScore("rightUpper2", value)}
                  disabled={readOnly}
                />

                <MobileScoreField
                  label="Lower position 1"
                  value={reflexes.scores.rightLower1}
                  onChange={(value) => updateScore("rightLower1", value)}
                  disabled={readOnly}
                />

                <MobileScoreField
                  label="Lower position 2"
                  value={reflexes.scores.rightLower2}
                  onChange={(value) => updateScore("rightLower2", value)}
                  disabled={readOnly}
                />

                <div
                  className="
                    grid
                    gap-2
                    sm:grid-cols-[150px_minmax(0,1fr)]
                    sm:items-center
                  "
                >
                  <label
                    className="
                      text-[12px]
                      font-semibold
                      text-[#173b69]
                    "
                  >
                    Plantar Reflex
                  </label>

                  <ReflexSelect
                    type="plantar"
                    value={reflexes.rightPlantarReflex}
                    onChange={(value) =>
                      updatePlantarReflex("rightPlantarReflex", value)
                    }
                    disabled={readOnly}
                    ariaLabel="RT plantar reflex"
                  />
                </div>
              </div>
            </div>

            <div
              className="
                border-t
                border-[#dbe6f1]
                pt-5
              "
            >
              <h4
                className="
                  mb-3
                  text-sm
                  font-bold
                  text-[#173b69]
                "
              >
                LT
              </h4>

              <div
                className="
                  space-y-3
                "
              >
                <MobileScoreField
                  label="Upper position 1"
                  value={reflexes.scores.leftUpper1}
                  onChange={(value) => updateScore("leftUpper1", value)}
                  disabled={readOnly}
                />

                <MobileScoreField
                  label="Upper position 2"
                  value={reflexes.scores.leftUpper2}
                  onChange={(value) => updateScore("leftUpper2", value)}
                  disabled={readOnly}
                />

                <MobileScoreField
                  label="Lower position 1"
                  value={reflexes.scores.leftLower1}
                  onChange={(value) => updateScore("leftLower1", value)}
                  disabled={readOnly}
                />

                <MobileScoreField
                  label="Lower position 2"
                  value={reflexes.scores.leftLower2}
                  onChange={(value) => updateScore("leftLower2", value)}
                  disabled={readOnly}
                />

                <div
                  className="
                    grid
                    gap-2
                    sm:grid-cols-[150px_minmax(0,1fr)]
                    sm:items-center
                  "
                >
                  <label
                    className="
                      text-[12px]
                      font-semibold
                      text-[#173b69]
                    "
                  >
                    Plantar Reflex
                  </label>

                  <ReflexSelect
                    type="plantar"
                    value={reflexes.leftPlantarReflex}
                    onChange={(value) =>
                      updatePlantarReflex("leftPlantarReflex", value)
                    }
                    disabled={readOnly}
                    ariaLabel="LT plantar reflex"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
