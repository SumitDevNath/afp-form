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

const paralysisSiteOptions: {
  value: AFPParalysisSite;
  label: string;
}[] = [
  {
    value: "right_arm",
    label: "Right Arm",
  },
  {
    value: "left_arm",
    label: "Left Arm",
  },
  {
    value: "right_leg",
    label: "Right Leg",
  },
  {
    value: "left_leg",
    label: "Left Leg",
  },
  {
    value: "neck",
    label: "Neck",
  },
  {
    value: "face",
    label: "Face",
  },
  {
    value: "other",
    label: "Other",
  },
];

function QuestionRow({
  number,
  label,
  value,
  onChange,
  disabled = false,
}: QuestionRowProps) {
  return (
    <div className="grid gap-3 border-b border-[#dde7f0] py-4 sm:grid-cols-[minmax(0,1fr)_auto]sm:items-start">
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

      /*
       * Question 7 dependent
       * fields must not survive
       * when the answer changes
       * away from Yes.
       */
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

  const toggleParalysisSite = (
    site: AFPParalysisSite,

    checked: boolean,
  ) => {
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

  const updateFacilityOption = (value: string) => {
    updateSigns((previous) => ({
      ...previous,
      healthFacility: {
        ...previous.healthFacility,
        selectedFacilityOption: value,
        /*
         * Clear custom facility
         * name when the selected
         * facility is no longer
         * Other.
         */
        otherFacilityName:
          value === AFP_OTHER_FACILITY_VALUE
            ? previous.healthFacility.otherFacilityName
            : "",
      },
    }));
  };

  const updateOtherFacilityName = (value: string) => {
    updateSigns((previous) => ({
      ...previous,

      healthFacility: {
        ...previous.healthFacility,
        otherFacilityName: value,
      },
    }));
  };

  const updateNotificationDate = (value: string) => {
    updateSigns((previous) => ({
      ...previous,

      healthFacility: {
        ...previous.healthFacility,
        notificationDate: value,
      },
    }));
  };

  const updateMedicalRecordNumber = (value: string) => {
    updateSigns((previous) => ({
      ...previous,

      healthFacility: {
        ...previous.healthFacility,
        medicalRecordNumber: value,
      },
    }));
  };

  const hasOtherParalysisSite = signs.siteOfParalysis.includes("other");

  const showHealthFacilityDetails = signs.childAtHealthFacility === "yes";

  const showOtherFacilityName =
    signs.healthFacility.selectedFacilityOption === AFP_OTHER_FACILITY_VALUE;

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
          Signs / Symptoms
        </h2>
      </div>

      <div
        className="
          grid
          grid-cols-1
          px-5
          sm:px-7
          lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.85fr)]
          lg:gap-x-7
        "
      >
        {/* LEFT SIDE */}
        <div>
          <QuestionRow
            number={1}
            label="Fever when paralysis began?"
            value={signs.feverWhenParalysisBegan}
            onChange={(value) =>
              updateYesNoUnknownField("feverWhenParalysisBegan", value)
            }
            disabled={readOnly}
          />

          <QuestionRow
            number={2}
            label="Muscle pain when paralysis began?"
            value={signs.musclePainWhenParalysisBegan}
            onChange={(value) =>
              updateYesNoUnknownField("musclePainWhenParalysisBegan", value)
            }
            disabled={readOnly}
          />

          <QuestionRow
            number={4}
            label="Is paralysis asymmetric (NOT equal) on each side of body?"
            value={signs.paralysisAsymmetric}
            onChange={(value) =>
              updateYesNoUnknownField("paralysisAsymmetric", value)
            }
            disabled={readOnly}
          />

          <QuestionRow
            number={5}
            label="Did paralysis begin in feet or hands and move upward over time?"
            value={signs.paralysisMovedUpward}
            onChange={(value) =>
              updateYesNoUnknownField("paralysisMovedUpward", value)
            }
            disabled={readOnly}
          />

          <QuestionRow
            number={6}
            label="Is sensation present in the site of paralysis?"
            value={signs.sensationPresentAtParalysisSite}
            onChange={(value) =>
              updateYesNoUnknownField("sensationPresentAtParalysisSite", value)
            }
            disabled={readOnly}
          />
        </div>

        {/* QUESTION 3 */}
        <div
          className="
            py-4
            lg:border-l
            lg:border-[#dde7f0]
            lg:pl-6
          "
        >
          <p
            className="
              m-0 mb-4
              text-[13px]
              font-semibold
              text-[#173b69]
            "
          >
            3. SITE OF PARALYSIS
          </p>

          <div
            className="
              grid
              grid-cols-2
              gap-x-5
              gap-y-3
            "
          >
            {paralysisSiteOptions
              .filter((option) => option.value !== "other")
              .map((option) => (
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

          <div className="mt-3 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
            <CheckboxField
              label="Other"
              checked={hasOtherParalysisSite}
              onChange={(checked) => toggleParalysisSite("other", checked)}
              disabled={readOnly}
            />

            {hasOtherParalysisSite && (
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: 38,

                    borderRadius: "8px",

                    backgroundColor: "#ffffff",
                  },

                  "& input": {
                    py: "8px",

                    fontSize: "0.78rem",
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* QUESTION 7 */}
      <div
        className="
          mx-5
          mb-5 mt-2
          rounded-lg
          border
          border-[#d6e2ef]
          bg-[#f1f6fc]
          px-4
          py-4
          sm:mx-7
          sm:px-5
        "
      >
        <div
          className="
            grid gap-3
            lg:grid-cols-[minmax(0,1fr)_auto]
            lg:items-center
          "
        >
          <p
            className="
              m-0
              text-[13px]
              font-semibold
              leading-5
              text-[#173b69]
            "
          >
            7. Was / has the child been at a health facility?
          </p>

          <YesNoUnknownField
            value={signs.childAtHealthFacility}
            onChange={(value) =>
              updateYesNoUnknownField("childAtHealthFacility", value)
            }
            disabled={readOnly}
            ariaLabel="Was or has the child been at a health facility?"
          />
        </div>

        {showHealthFacilityDetails && (
          <div
            className="
              mt-4
              grid
              gap-4
              md:grid-cols-2
              lg:grid-cols-[minmax(240px,1.6fr)_minmax(170px,0.75fr)_minmax(180px,0.9fr)]
            "
          >
            <div
              className={
                showOtherFacilityName ? "md:col-span-2 lg:col-span-1" : ""
              }
            >
              <label
                className="
                  mb-1.5 block
                  text-[11px]
                  font-semibold
                  text-[#52677e]
                "
              >
                Mention the health facility
              </label>

              <SelectField
                value={signs.healthFacility.selectedFacilityOption}
                options={facilitySelectOptions}
                onChange={updateFacilityOption}
                placeholder="Select the health facility from the dropdown"
                ariaLabel="Health facility"
                disabled={readOnly}
              />

              {showOtherFacilityName && (
                <div className="mt-3">
                  <label
                    htmlFor="afp-other-facility-name"
                    className="
                      mb-1.5
                      block
                      text-[11px]
                      font-semibold
                      text-[#52677e]
                    "
                  >
                    Facility name
                  </label>

                  <TextField
                    id="afp-other-facility-name"
                    value={signs.healthFacility.otherFacilityName}
                    onChange={(event) =>
                      updateOtherFacilityName(event.target.value)
                    }
                    disabled={readOnly}
                    fullWidth
                    size="small"
                    placeholder="Enter health facility name"
                    slotProps={{
                      htmlInput: {
                        maxLength: 200,
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        minHeight: 38,
                        borderRadius: "8px",
                        backgroundColor: "#ffffff",
                      },

                      "& input": {
                        py: "8px",
                        fontSize: "0.78rem",
                      },
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label
                className="
                  mb-1.5 block
                  text-[11px]
                  font-semibold
                  text-[#52677e]
                "
              >
                Date of notification
              </label>

              <DateField
                value={signs.healthFacility.notificationDate}
                onChange={updateNotificationDate}
                disabled={readOnly}
                noFuture
                ariaLabel="Date of notification"
              />
            </div>

            <div>
              <label
                htmlFor="afp-medical-record-number"
                className="
                  mb-1.5 block
                  text-[11px]
                  font-semibold
                  text-[#52677e]
                "
              >
                Medical record #
              </label>

              <TextField
                id="afp-medical-record-number"
                value={signs.healthFacility.medicalRecordNumber}
                onChange={(event) =>
                  updateMedicalRecordNumber(event.target.value)
                }
                disabled={readOnly}
                fullWidth
                size="small"
                placeholder="Enter record number"
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: 38,

                    borderRadius: "8px",

                    backgroundColor: "#ffffff",
                  },

                  "& input": {
                    py: "8px",

                    fontSize: "0.78rem",
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
