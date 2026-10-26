import { TextField } from "@mui/material";
import CheckboxField from "../fields/CheckboxField";
import DateField from "../fields/DateField";
import SelectField from "../fields/SelectField";
import YesNoUnknownField from "../fields/YesNoUnknownField";
import {
  AFP_DEMO_FACILITY_OPTIONS,
  AFP_OTHER_FACILITY_OPTION,
  AFP_OTHER_FACILITY_VALUE,
} from "../constants/afpFacilities";
import { useAFPForm } from "../context/AFPFormContext";
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
}

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

function QuestionRow({
  number,
  label,
  value,
  onChange,
  disabled = false,
}: QuestionRowProps) {
  return (
    <div className="grid gap-3 border-b border-[#dde7f0] py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <p className="m-0 pt-1 text-[13px] font-semibold leading-5 text-[#173b69]">
        {number}. {label}
      </p>

      <YesNoUnknownField
        value={value}
        onChange={onChange}
        disabled={disabled}
        ariaLabel={`${number}. ${label}`}
      />
    </div>
  );
}

export default function SignsSymptomsSection({
  facilityOptions,
}: SignsSymptomsSectionProps) {
  const { data, updateData, readOnly } = useAFPForm();

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

  const hasOtherParalysisSite = signs.siteOfParalysis.includes("other");

  const showHealthFacilityDetails = signs.childAtHealthFacility === "yes";

  const showOtherFacilityName =
    healthFacility.selectedFacilityOption === AFP_OTHER_FACILITY_VALUE;

  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}
      <div className="border-b border-[#e0e8f0] px-5 py-3 sm:px-7">
        <h2 className="m-0 text-[18px] font-bold text-[#173b69]">
          Signs / Symptoms
        </h2>
      </div>

      {/* QUESTIONS 1, 2, 4, 5, 6, 7 AND QUESTION 3 */}
      <div className="grid grid-cols-1 px-5 sm:px-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.85fr)] lg:gap-x-7">
        {/* LEFT SIDE */}
        <div>
          {questions.map(({ number, label, field }) => (
            <QuestionRow
              key={number}
              number={number}
              label={label}
              value={signs[field]}
              onChange={(value) => updateYesNoUnknownField(field, value)}
              disabled={readOnly}
            />
          ))}
        </div>

        {/* QUESTION 3: SITE OF PARALYSIS */}
        <div className="py-4 lg:border-l lg:border-[#dde7f0] lg:pl-6">
          <p className="m-0 mb-4 text-[13px] font-semibold text-[#173b69]">
            3. SITE OF PARALYSIS
          </p>

          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
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
          </div>

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
              <div className="min-w-0 max-w-65 flex-1">
                <TextField
                  value={signs.otherParalysisSite}
                  onChange={(event) =>
                    updateOtherParalysisSite(event.target.value)
                  }
                  disabled={readOnly}
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUESTION 7 DEPENDENT DETAILS */}
      {showHealthFacilityDetails && (
        <div className="mx-5 mb-5 mt-3 rounded-lg border border-[#d6e2ef] bg-[#f1f6fc] px-4 py-3 sm:mx-7">
          {/* RESPONSIVE FACILITY GRID */}
          <div className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-3 lg:grid-cols-12 lg:gap-x-4 lg:items-start">
            {/* HEALTH FACILITY */}
            <div className="min-w-0 sm:col-span-2 lg:order-1 lg:col-span-6">
              <label className={`${fieldLabelClass} lg:leading-4`}>
                Select the health facility from the dropdown
              </label>

              <div className="lg:[&_.MuiFormControl-root]:w-full">
                <SelectField
                  value={healthFacility.selectedFacilityOption}
                  options={facilitySelectOptions}
                  onChange={updateFacilityOption}
                  placeholder="List of health facilities"
                  ariaLabel="Health facility"
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* OTHER FACILITY NAME */}
            {showOtherFacilityName && (
              <div className="min-w-0 sm:col-span-2 lg:order-4 lg:col-span-6">
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
                  fullWidth
                  size="small"
                  placeholder="Enter health facility name"
                  slotProps={{
                    htmlInput: { maxLength: 200 },
                  }}
                  sx={facilityTextFieldSx}
                />
              </div>
            )}

            {/* DATE OF NOTIFICATION */}
            <div className="min-w-0 lg:order-2 lg:col-span-3">
              <label className={`${fieldLabelClass} lg:leading-4`}>
                Date of notification
              </label>

              <div className="lg:[&_.MuiFormControl-root]:w-full lg:[&_.MuiTextField-root]:w-full">
                <DateField
                  value={healthFacility.notificationDate}
                  onChange={(value) =>
                    updateHealthFacilityField("notificationDate", value)
                  }
                  disabled={readOnly}
                  noFuture
                  ariaLabel="Date of notification"
                />
              </div>
            </div>

            {/* MEDICAL RECORD NUMBER */}
            <div className="min-w-0 lg:order-0 lg:col-span-3">
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
                fullWidth
                size="small"
                placeholder="Enter record number"
                slotProps={{
                  htmlInput: { maxLength: 100 },
                }}
                sx={facilityTextFieldSx}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
