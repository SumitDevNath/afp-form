import { TextField } from "@mui/material";
import DateField from "../fields/DateField";
import YesNoField from "../fields/YesNoField";
import {
  createInitialAFPSignsSymptoms,
  createInitialAFPVaccinationHistory,
  createInitialAFPTravelHistory,
  createInitialAFPClinicalExamination,
  createInitialAFPAdditionalInformation,
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

interface ClinicalQuestion {
  number: number;
  label: string;
  field: YesNoClinicalField;
}

interface ClinicalYesNoQuestionProps {
  number: number;
  label: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
  disabled?: boolean;
}

interface ClinicalDateQuestionProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Question configurations
const leftQuestions: ClinicalQuestion[] = [
  {
    number: 1,
    label: "Is or was paralysis present?",
    field: "paralysisPresent",
  },
  {
    number: 2,
    label: "Is the paralysis flaccid (floppy)?",
    field: "paralysisFlaccid",
  },
  {
    number: 3,
    label: "Did paralysis occur suddenly?",
    field: "paralysisSuddenOnset",
  },
];

const rightQuestions: ClinicalQuestion[] = [
  {
    number: 5,
    label: "Was paralysis caused by injury?",
    field: "paralysisCausedByInjury",
  },
  {
    number: 6,
    label: "Was paralysis present at birth?",
    field: "paralysisPresentAtBirth",
  },
];

// Shared styling
const questionRowClass =
  "grid gap-3 border-b border-[#dde7f0] py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start";

const questionLabelClass =
  "m-0 pt-1 text-[13px] font-semibold leading-5 text-[#173b69]";

// Reusable Yes/No question
function ClinicalYesNoQuestion({
  number,
  label,
  value,
  onChange,
  disabled = false,
}: ClinicalYesNoQuestionProps) {
  return (
    <div className={questionRowClass}>
      <p className={questionLabelClass}>
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

// Date question
function ClinicalDateQuestion({
  value,
  onChange,
  disabled = false,
}: ClinicalDateQuestionProps) {
  return (
    <div className="grid gap-3 border-b border-[#dde7f0] py-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-start">
      <p className="m-0 pt-2 text-[13px] font-semibold leading-5 text-[#173b69]">
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

  // Update Yes/No answers and dependent sections
  const updateYesNoField = (field: YesNoClinicalField, value: YesNo) => {
    updateData((previous) => {
      const nextClinicalInformation: AFPClinicalInformation = {
        ...previous.clinicalInformation,
        [field]: value,
      };

      const nextScreeningStatus = getAFPScreeningStatus(
        nextClinicalInformation,
      );

      const isEligible = nextScreeningStatus === "eligible";
      const isNotEligible = nextScreeningStatus === "not_eligible";

      return {
        ...previous,
        clinicalInformation: nextClinicalInformation,

        // Diagnosis is only retained for not-eligible screening
        screeningDiagnosis: isNotEligible ? previous.screeningDiagnosis : "",

        // Reset dependent sections when screening is not eligible
        signsSymptoms: isEligible
          ? previous.signsSymptoms
          : createInitialAFPSignsSymptoms(),

        vaccinationHistory: isEligible
          ? previous.vaccinationHistory
          : createInitialAFPVaccinationHistory(),

        travelHistory: isEligible
          ? previous.travelHistory
          : createInitialAFPTravelHistory(),

        clinicalExamination: isEligible
          ? previous.clinicalExamination
          : createInitialAFPClinicalExamination(),

        additionalInformation: isEligible
          ? previous.additionalInformation
          : createInitialAFPAdditionalInformation(),
      };
    });
  };

  // Update paralysis onset date
  const updateOnsetDate = (value: string) => {
    updateData((previous) => ({
      ...previous,
      clinicalInformation: {
        ...previous.clinicalInformation,
        paralysisOnsetDate: value,
      },
    }));
  };

  // Update screening diagnosis
  const updateScreeningDiagnosis = (value: string) => {
    updateData((previous) => ({
      ...previous,
      screeningDiagnosis: value,
    }));
  };

  // Render reusable Yes/No questions
  const renderQuestion = ({ number, label, field }: ClinicalQuestion) => (
    <ClinicalYesNoQuestion
      key={field}
      number={number}
      label={label}
      value={clinicalInformation[field]}
      onChange={(value) => updateYesNoField(field, value)}
      disabled={readOnly}
    />
  );

  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}
      <div className="border-b border-[#e0e8f0] px-5 py-3 sm:px-7">
        <h2 className="m-0 text-[18px] font-bold text-[#173b69]">
          Clinical Information
        </h2>
      </div>

      {/* CLINICAL QUESTIONS */}
      <div className="grid grid-cols-1 px-5 pb-5 sm:px-7 lg:grid-cols-2 lg:gap-x-10">
        {/* LEFT: QUESTIONS 1–3 */}
        <div>{leftQuestions.map(renderQuestion)}</div>

        {/* RIGHT: QUESTIONS 4–6 */}
        <div>
          <ClinicalDateQuestion
            value={clinicalInformation.paralysisOnsetDate}
            onChange={updateOnsetDate}
            disabled={readOnly}
          />

          {rightQuestions.map(renderQuestion)}
        </div>
      </div>

      {/* SCREENING DIAGNOSIS */}
      {screeningStatus === "not_eligible" && (
        <div className="mx-5 mb-5 rounded-lg border border-[#f0cf8c] bg-[#fff9ec] px-4 py-4 sm:mx-7 sm:px-5">
          <label
            htmlFor="afp-screening-diagnosis"
            className="mb-2 block text-[13px] font-medium text-[#8a5a13]"
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
