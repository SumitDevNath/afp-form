import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import DateField from "../fields/DateField";
import SelectField from "../fields/SelectField";
import ToggleSwitch from "../fields/ToggleSwitch";
import YesNoUnknownField from "../fields/YesNoUnknownField";
import { useAFPForm } from "../context/AFPFormContext";
import {
  VACCINATION_DOSE_OPTIONS,
  VACCINATION_RECORD_SOURCE_OPTIONS,
} from "../constants/afpVaccination";
import type {
  AFPVaccinationDoseEntry,
  AFPVaccinationHistory,
  VaccinationRecordSource,
  YesNoUnknown,
} from "../types/afp.types";

type DoseEntryField = "opvCampaignDoses" | "opvRoutineDoses" | "ipvDoses";

interface DoseQuestionProps {
  number: number;
  label: string;
  value: AFPVaccinationDoseEntry;
  disabled?: boolean;
  onSourceChange: (value: VaccinationRecordSource) => void;
  onDoseChange: (value: number | null) => void;
}

function RecordSourceSelect({
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: {
  value: VaccinationRecordSource;
  onChange: (value: VaccinationRecordSource) => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === "card" || value === "history") {
      onChange(value);
    }
  };

  return (
    <FormControl size="small" fullWidth disabled={disabled}>
      <Select
        value={value ?? ""}
        onChange={handleChange}
        displayEmpty
        inputProps={{
          "aria-label": ariaLabel,
        }}
        renderValue={(selected) => {
          if (!selected) {
            return (
              <span
                className="
                  text-[#94a3b8]
                "
              >
                By Card/ History
              </span>
            );
          }

          return (
            VACCINATION_RECORD_SOURCE_OPTIONS.find(
              (option) => option.value === selected,
            )?.label ?? selected
          );
        }}
        sx={{
          minHeight: 38,
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          fontSize: "0.76rem",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#b9c8d8",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#8ca6c1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563eb",
          },
          "& .MuiSelect-select": {
            py: "8px",
          },
        }}
      >
        {VACCINATION_RECORD_SOURCE_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              fontSize: "0.82rem",
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function DoseQuestion({
  number,
  label,
  value,
  disabled = false,
  onSourceChange,
  onDoseChange,
}: DoseQuestionProps) {
  return (
    <div
      className="
        grid
        gap-3
        border-b
        border-[#e3ebf3]
        py-4
        md:grid-cols-[minmax(0,1fr)_130px_90px]
        md:items-start
      "
    >
      <p
        className="
          m-0
          pt-2
          text-[12px]
          font-semibold
          leading-5
          text-[#173b69]
        "
      >
        {number}. {label}
      </p>

      <RecordSourceSelect
        value={value.recordSource}
        onChange={onSourceChange}
        disabled={disabled}
        ariaLabel={`${label} record source`}
      />

      <SelectField
        value={value.numberOfDoses === null ? "" : String(value.numberOfDoses)}
        options={VACCINATION_DOSE_OPTIONS}
        onChange={(selected) => {
          const parsed = Number(selected);
          onDoseChange(Number.isInteger(parsed) ? parsed : null);
        }}
        placeholder="Dose"
        ariaLabel={`${label} number of doses`}
        disabled={disabled}
      />
    </div>
  );
}

interface DateQuestionProps {
  number: number;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function DateQuestion({
  number,
  label,
  value,
  onChange,
  disabled = false,
}: DateQuestionProps) {
  return (
    <div
      className="
        grid
        gap-3
        border-b
        border-[#e3ebf3]
        py-4
        md:grid-cols-[minmax(0,1fr)_180px]
        md:items-start
      "
    >
      <p
        className="
          m-0
          pt-2
          text-[12px]
          font-semibold
          leading-5
          text-[#173b69]
        "
      >
        {number}. {label}
      </p>

      <DateField
        value={value}
        onChange={onChange}
        disabled={disabled}
        noFuture
        ariaLabel={label}
      />
    </div>
  );
}

export default function VaccinationHistorySection() {
  const { data, updateData, readOnly } = useAFPForm();
  const vaccination = data.vaccinationHistory;
  const updateVaccination = (
    updater: (previous: AFPVaccinationHistory) => AFPVaccinationHistory,
  ) => {
    updateData((previous) => ({
      ...previous,
      vaccinationHistory: updater(previous.vaccinationHistory),
    }));
  };

  const handleAvailabilityChange = (available: boolean) => {
    updateData((previous) => ({
      ...previous,
      vaccinationHistory: available
        ? {
            ...previous.vaccinationHistory,
            available: true,
          }
        : {
            available: false,
            opvCampaignDoses: {
              recordSource: null,
              numberOfDoses: null,
            },
            opvRoutineDoses: {
              recordSource: null,
              numberOfDoses: null,
            },
            lastOpvDoseBeforeParalysisDate: "",
            ipvDoses: {
              recordSource: null,
              numberOfDoses: null,
            },
            lastIpvDoseBeforeParalysisDate: "",
            opvGivenAfterParalysis: null,
            opvAfterParalysisDate: "",
          },
    }));
  };

  const updateDoseSource = (
    field: DoseEntryField,
    value: VaccinationRecordSource,
  ) => {
    updateVaccination((previous) => ({
      ...previous,
      [field]: {
        ...previous[field],
        recordSource: value,
      },
    }));
  };

  const updateDoseCount = (field: DoseEntryField, value: number | null) => {
    updateVaccination((previous) => ({
      ...previous,
      [field]: {
        ...previous[field],
        numberOfDoses: value,
      },
    }));
  };

  const updateDate = (
    field:
      | "lastOpvDoseBeforeParalysisDate"
      | "lastIpvDoseBeforeParalysisDate"
      | "opvAfterParalysisDate",

    value: string,
  ) => {
    updateVaccination((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateOpvAfterParalysis = (value: YesNoUnknown) => {
    updateVaccination((previous) => ({
      ...previous,
      opvGivenAfterParalysis: value,
      opvAfterParalysisDate:
        value === "yes" ? previous.opvAfterParalysisDate : "",
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
          flex
          flex-col
          gap-3
          border-b
          border-[#dce7f2]
          px-5
          py-3
          sm:flex-row
          sm:items-center
          sm:justify-between
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
          Vaccination History
        </h2>

        <div
          className="
            flex
            w-fit
            items-center
            gap-2
            rounded-xl
            bg-[#deebfb]
            px-3
            py-1.5
          "
        >
          <span
            className="
              text-[12px]
              font-semibold
              text-[#173b69]
            "
          >
            Vaccination history available?
          </span>

          <ToggleSwitch
            checked={vaccination.available}
            onChange={handleAvailabilityChange}
            disabled={readOnly}
            ariaLabel="Vaccination history available"
          />
        </div>
      </div>

      {!vaccination.available ? (
        <div
          className="
            px-5
            py-6
            text-sm
            text-[#718096]
            sm:px-7
          "
        >
          Vaccination history is currently marked as unavailable.
        </div>
      ) : (
        <>
          <div
            className="
              grid
              grid-cols-1
              gap-x-10
              px-5
              sm:px-7
              xl:grid-cols-2
            "
          >
            {/* LEFT COLUMN */}
            <div>
              <DoseQuestion
                number={1}
                label="Number of OPV doses received through campaigns (e.g. NID, Mop-up, MNT)"
                value={vaccination.opvCampaignDoses}
                onSourceChange={(value) =>
                  updateDoseSource("opvCampaignDoses", value)
                }
                onDoseChange={(value) =>
                  updateDoseCount("opvCampaignDoses", value)
                }
                disabled={readOnly}
              />

              <DoseQuestion
                number={2}
                label="Number of OPV doses received through routine EPI (DPT/Penta/MR)"
                value={vaccination.opvRoutineDoses}
                onSourceChange={(value) =>
                  updateDoseSource("opvRoutineDoses", value)
                }
                onDoseChange={(value) =>
                  updateDoseCount("opvRoutineDoses", value)
                }
                disabled={readOnly}
              />

              <DoseQuestion
                number={4}
                label="IPV doses received"
                value={vaccination.ipvDoses}
                onSourceChange={(value) => updateDoseSource("ipvDoses", value)}
                onDoseChange={(value) => updateDoseCount("ipvDoses", value)}
                disabled={readOnly}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div>
              <DateQuestion
                number={3}
                label="Date of last OPV dose before paralysis onset"
                value={vaccination.lastOpvDoseBeforeParalysisDate}
                onChange={(value) =>
                  updateDate("lastOpvDoseBeforeParalysisDate", value)
                }
                disabled={readOnly}
              />

              <DateQuestion
                number={5}
                label="Date of last IPV dose before paralysis onset"
                value={vaccination.lastIpvDoseBeforeParalysisDate}
                onChange={(value) =>
                  updateDate("lastIpvDoseBeforeParalysisDate", value)
                }
                disabled={readOnly}
              />
            </div>
          </div>

          {/* QUESTION 6 */}
          <div
            className="
              mx-5
              mb-5
              mt-4
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
                grid
                gap-4
                lg:grid-cols-[minmax(260px,1fr)_auto_minmax(250px,0.8fr)]
                lg:items-start
              "
            >
              <p
                className="
                  m-0
                  pt-2
                  text-[13px]
                  font-semibold
                  leading-5
                  text-[#173b69]
                "
              >
                6. Was OPV given after paralysis onset?
              </p>

              <YesNoUnknownField
                value={vaccination.opvGivenAfterParalysis}
                onChange={updateOpvAfterParalysis}
                disabled={readOnly}
                ariaLabel="Was OPV given after paralysis onset?"
              />

              {vaccination.opvGivenAfterParalysis === "yes" && (
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-[11px]
                      font-semibold
                      text-[#52677e]
                    "
                  >
                    If yes, date of the OPV
                  </label>

                  <DateField
                    value={vaccination.opvAfterParalysisDate}
                    onChange={(value) =>
                      updateDate("opvAfterParalysisDate", value)
                    }
                    disabled={readOnly}
                    noFuture
                    ariaLabel="Date of OPV after paralysis onset"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
