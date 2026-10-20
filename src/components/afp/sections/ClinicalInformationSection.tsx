import { TextField } from "@mui/material";
import DateField from "../fields/DateField";
import YesNoField from "../fields/YesNoField";
import {
  createInitialAFPSignsSymptoms,
  createInitialAFPVaccinationHistory,
  createInitialAFPTravelHistory,
  createInitialAFPClinicalExamination,
  useAFPForm,
} from "../context/AFPFormContext";
import type { AFPClinicalInformation, YesNo } from "../types/afp.types";
import { getAFPScreeningStatus } from "../utils/afpScreening.utils";

type YesNoClinicalField =
  | "paralysisPresent"
  | "paralysisFlaccid"
  | "paralysisSuddenOnset"
  | "paralysisCausedByInjury"
  | "paralysisPresentAtBirth";

interface ClinicalYesNoQuestionProps {
  number: number;

  label: string;

  value: YesNo;

  onChange: (value: YesNo) => void;

  disabled?: boolean;
}

function ClinicalYesNoQuestion({
  number,
  label,
  value,
  onChange,
  disabled = false,
}: ClinicalYesNoQuestionProps) {
  return (
    <div
      className="
        grid gap-3
        border-b
        border-[#dde7f0]
        py-4
        sm:grid-cols-[minmax(0,1fr)_auto]
        sm:items-start
      "
    >
      <p
        className="
          m-0 pt-1
          text-[13px]
          font-semibold
          leading-5
          text-[#173b69]
        "
      >
        {number}. {label}
      </p>

      <YesNoField
        value={value}
        onChange={onChange}
        disabled={disabled}
        ariaLabel={`${number}. ${label}`}
      />
    </div>
  );
}

interface ClinicalDateQuestionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function ClinicalDateQuestion({
  value,
  onChange,
  disabled = false,
}: ClinicalDateQuestionProps) {
  return (
    <div
      className="
        grid gap-3
        border-b
        border-[#dde7f0]
        py-4
        sm:grid-cols-[minmax(0,1fr)_190px]
        sm:items-start
      "
    >
      <p
        className="
          m-0 pt-2
          text-[13px]
          font-semibold
          leading-5
          text-[#173b69]
        "
      >
        4. Date of paralysis onset
      </p>

      <DateField
        value={value}
        onChange={onChange}
        disabled={disabled}
        noFuture
        ariaLabel="Date of paralysis onset"
      />
    </div>
  );
}

export default function ClinicalInformationSection() {
  const { data, updateData, readOnly } = useAFPForm();
  const clinicalInformation = data.clinicalInformation;
  const screeningStatus = getAFPScreeningStatus(clinicalInformation);
  const updateYesNoField = (
    field: YesNoClinicalField,

    value: YesNo,
  ) => {
    updateData((previous) => {
      const nextClinicalInformation: AFPClinicalInformation = {
        ...previous.clinicalInformation,

        [field]: value,
      };

      const nextScreeningStatus = getAFPScreeningStatus(
        nextClinicalInformation,
      );

      return {
        ...previous,
        clinicalInformation: nextClinicalInformation,
        /*
         * Diagnosis belongs only to
         * not-eligible screening.
         */
        screeningDiagnosis:
          nextScreeningStatus === "not_eligible"
            ? previous.screeningDiagnosis
            : "",
        /*
         * Signs / Symptoms is a
         * dependent investigation
         * section.
         *
         * If screening is no longer
         * eligible, hidden data must
         * not remain in state.
         */
        signsSymptoms:
          nextScreeningStatus === "eligible"
            ? previous.signsSymptoms
            : createInitialAFPSignsSymptoms(),
        vaccinationHistory:
          nextScreeningStatus === "eligible"
            ? previous.vaccinationHistory
            : createInitialAFPVaccinationHistory(),
        travelHistory:
          nextScreeningStatus === "eligible"
            ? previous.travelHistory
            : createInitialAFPTravelHistory(),
        clinicalExamination:
          nextScreeningStatus === "eligible"
            ? previous.clinicalExamination
            : createInitialAFPClinicalExamination(),
      };
    });
  };

  const updateOnsetDate = (value: string) => {
    updateData((previous) => ({
      ...previous,
      clinicalInformation: {
        ...previous.clinicalInformation,
        paralysisOnsetDate: value,
      },
    }));
  };

  const updateScreeningDiagnosis = (value: string) => {
    updateData((previous) => ({
      ...previous,
      screeningDiagnosis: value,
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
          border-[#e0e8f0]
          px-5 py-3
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
          Clinical Information
        </h2>
      </div>

      <div
        className="
          grid
          grid-cols-1
          px-5 pb-5
          sm:px-7
          lg:grid-cols-2
          lg:gap-x-10
        "
      >
        <div>
          <ClinicalYesNoQuestion
            number={1}
            label="Is or was paralysis present?"
            value={clinicalInformation.paralysisPresent}
            onChange={(value) => updateYesNoField("paralysisPresent", value)}
            disabled={readOnly}
          />

          <ClinicalYesNoQuestion
            number={2}
            label="Is the paralysis flaccid (floppy)?"
            value={clinicalInformation.paralysisFlaccid}
            onChange={(value) => updateYesNoField("paralysisFlaccid", value)}
            disabled={readOnly}
          />

          <ClinicalYesNoQuestion
            number={3}
            label="Did paralysis occur suddenly?"
            value={clinicalInformation.paralysisSuddenOnset}
            onChange={(value) =>
              updateYesNoField("paralysisSuddenOnset", value)
            }
            disabled={readOnly}
          />
        </div>

        <div>
          <ClinicalDateQuestion
            value={clinicalInformation.paralysisOnsetDate}
            onChange={updateOnsetDate}
            disabled={readOnly}
          />

          <ClinicalYesNoQuestion
            number={5}
            label="Was paralysis caused by injury?"
            value={clinicalInformation.paralysisCausedByInjury}
            onChange={(value) =>
              updateYesNoField("paralysisCausedByInjury", value)
            }
            disabled={readOnly}
          />

          <ClinicalYesNoQuestion
            number={6}
            label="Was paralysis present at birth?"
            value={clinicalInformation.paralysisPresentAtBirth}
            onChange={(value) =>
              updateYesNoField("paralysisPresentAtBirth", value)
            }
            disabled={readOnly}
          />
        </div>
      </div>

      {screeningStatus === "not_eligible" && (
        <div
          className="
            mx-5 mb-5
            rounded-lg
            border
            border-[#f0cf8c]
            bg-[#fff9ec]
            px-4 py-4
            sm:mx-7
            sm:px-5
          "
        >
          <label
            htmlFor="afp-screening-diagnosis"
            className="
              mb-2 block
              text-[13px]
              font-medium
              text-[#8a5a13]
            "
          >
            Specify the diagnosis, if known:
          </label>

          <TextField
            id="afp-screening-diagnosis"
            value={data.screeningDiagnosis}
            onChange={(event) => updateScreeningDiagnosis(event.target.value)}
            disabled={readOnly}
            fullWidth
            size="small"
            placeholder="Enter diagnosis if known"
            slotProps={{
              htmlInput: {
                maxLength: 250,
              },
            }}
            sx={{
              maxWidth: 520,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",

                backgroundColor: "#ffffff",
              },
              "& input": {
                fontSize: "0.82rem",
              },
            }}
          />
        </div>
      )}
    </section>
  );
}
