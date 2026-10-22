import { useState } from "react";
import { TextField } from "@mui/material";
import FieldError from "../fields/FieldError";
import YesNoField from "../fields/YesNoField";
import YesNoPendingField from "../fields/YesNoPendingField";
import { useAFPForm } from "../context/AFPFormContext";
import type {
  AFPAdditionalInformation,
  YesNo,
  YesNoPending,
} from "../types/afp.types";

interface NumberFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
  ariaLabel: string;
  disabled?: boolean;
  errorMessage?: string;
  onTouched?: () => void;
}

function NumberField({
  value,
  onChange,
  ariaLabel,
  disabled = false,
  errorMessage,
  onTouched,
}: NumberFieldProps) {
  return (
    <div>
      <TextField
        value={value ?? ""}
        onChange={(event) => {
          const rawValue = event.target.value;
          if (rawValue === "") {
            onChange(null);

            return;
          }
          const parsed = Number(rawValue);
          if (Number.isInteger(parsed) && parsed >= 0) {
            onChange(parsed);
          }
        }}
        onBlur={onTouched}
        disabled={disabled}
        type="number"
        size="small"
        aria-label={ariaLabel}
        slotProps={{
          htmlInput: {
            min: 0,
            step: 1,
          },
        }}
        sx={{
          width: {
            xs: "100%",
            sm: 140,
          },
          "& .MuiOutlinedInput-root": {
            minHeight: 38,
            borderRadius: "8px",
            backgroundColor: "#ffffff",
          },
          "& input": {
            py: "8px",
            fontSize: "0.8rem",
          },
        }}
      />
      <FieldError message={errorMessage} />
    </div>
  );
}

export default function AdditionalInformationSection() {
  const { data, updateData, readOnly } = useAFPForm();
  const additional = data.additionalInformation;
  const [additionalCountTouched, setAdditionalCountTouched] = useState(false);
  const [vaccinatedCountTouched, setVaccinatedCountTouched] = useState(false);
  const [explanationTouched, setExplanationTouched] = useState(false);
  const updateAdditional = (
    updater: (previous: AFPAdditionalInformation) => AFPAdditionalInformation,
  ) => {
    updateData((previous) => ({
      ...previous,
      additionalInformation: updater(previous.additionalInformation),
    }));
  };

  const updateSearchStatus = (value: YesNoPending) => {
    updateAdditional((previous) => ({
      ...previous,
      searchForAdditionalCases: value,
      additionalCasesIdentified:
        value === "yes" ? previous.additionalCasesIdentified : null,
      numberOfAdditionalCases:
        value === "yes" ? previous.numberOfAdditionalCases : null,
    }));

    if (value !== "yes") {
      setAdditionalCountTouched(false);
    }
  };

  const updateAdditionalCasesIdentified = (value: YesNo) => {
    updateAdditional((previous) => ({
      ...previous,
      additionalCasesIdentified: value,
      numberOfAdditionalCases:
        value === "yes" ? previous.numberOfAdditionalCases : null,
    }));

    if (value !== "yes") {
      setAdditionalCountTouched(false);
    }
  };

  const updateOutbreakResponse = (value: YesNoPending) => {
    updateAdditional((previous) => ({
      ...previous,
      outbreakResponseImmunizationDone: value,
      numberOfChildrenVaccinated:
        value === "yes" ? previous.numberOfChildrenVaccinated : null,
      outbreakResponseExplanation:
        value === "no" ? previous.outbreakResponseExplanation : "",
    }));

    if (value !== "yes") {
      setVaccinatedCountTouched(false);
    }

    if (value !== "no") {
      setExplanationTouched(false);
    }
  };

  const additionalCountError =
    additionalCountTouched &&
    additional.additionalCasesIdentified === "yes" &&
    additional.numberOfAdditionalCases === null
      ? "Enter how many additional AFP cases were identified."
      : "";

  const vaccinatedCountError =
    vaccinatedCountTouched &&
    additional.outbreakResponseImmunizationDone === "yes" &&
    additional.numberOfChildrenVaccinated === null
      ? "Enter how many children were vaccinated."
      : "";

  const explanationError =
    explanationTouched &&
    additional.outbreakResponseImmunizationDone === "no" &&
    !additional.outbreakResponseExplanation.trim()
      ? "Please explain why outbreak response immunization was not done."
      : "";

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
          Additional Information
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
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-2
          "
        >
          {/* QUESTION 1 */}
          <div
            className="
              rounded-xl
              border
              border-[#d6e3f0]
              bg-[#f5f9fd]
              p-4
              sm:p-5
            "
          >
            <div
              className="
                grid
                gap-3
                lg:grid-cols-[minmax(0,1fr)_auto]
                lg:items-start
              "
            >
              <p
                className="
                  m-0
                  pt-2
                  text-[13px]
                  font-bold
                  leading-5
                  text-[#173b69]
                "
              >
                1. Search for additional AFP cases?
              </p>

              <YesNoPendingField
                value={additional.searchForAdditionalCases}
                onChange={updateSearchStatus}
                disabled={readOnly}
                ariaLabel="Search for additional AFP cases"
              />
            </div>

            {additional.searchForAdditionalCases === "yes" && (
              <div
                className="
                  mt-4
                  space-y-4
                  border-t
                  border-[#dce6f0]
                  pt-4
                "
              >
                <div
                  className="
                    grid
                    gap-3
                    sm:grid-cols-[minmax(0,1fr)_auto]
                    sm:items-center
                  "
                >
                  <p
                    className="
                      m-0
                      text-[12px]
                      font-semibold
                      text-[#173b69]
                    "
                  >
                    If yes, Additional AFP cases identified?
                  </p>

                  <YesNoField
                    value={additional.additionalCasesIdentified}
                    onChange={updateAdditionalCasesIdentified}
                    disabled={readOnly}
                    ariaLabel="Additional AFP cases identified"
                  />
                </div>

                {additional.additionalCasesIdentified === "yes" && (
                  <div
                    className="
                      grid
                      gap-3
                      sm:grid-cols-[minmax(0,1fr)_140px]
                      sm:items-start
                    "
                  >
                    <label
                      className="
                        pt-2
                        text-[12px]
                        font-semibold
                        text-[#173b69]
                      "
                    >
                      If yes, How many?
                    </label>

                    <NumberField
                      value={additional.numberOfAdditionalCases}
                      onChange={(value) =>
                        updateAdditional((previous) => ({
                          ...previous,

                          numberOfAdditionalCases: value,
                        }))
                      }
                      disabled={readOnly}
                      ariaLabel="Number of additional AFP cases identified"
                      onTouched={() => setAdditionalCountTouched(true)}
                      errorMessage={additionalCountError}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QUESTION 2 */}
          <div
            className="
              rounded-xl
              border
              border-[#d6e3f0]
              bg-[#f5f9fd]
              p-4
              sm:p-5
            "
          >
            <div
              className="
                grid
                gap-3
                lg:grid-cols-[minmax(0,1fr)_auto]
                lg:items-start
              "
            >
              <p
                className="
                  m-0
                  pt-2
                  text-[13px]
                  font-bold
                  leading-5
                  text-[#173b69]
                "
              >
                2. Outbreak response immunization done?
              </p>

              <YesNoPendingField
                value={additional.outbreakResponseImmunizationDone}
                onChange={updateOutbreakResponse}
                disabled={readOnly}
                ariaLabel="Outbreak response immunization done"
              />
            </div>

            {additional.outbreakResponseImmunizationDone === "yes" && (
              <div
                className="
                  mt-4
                  grid
                  gap-3
                  border-t
                  border-[#dce6f0]
                  pt-4
                  sm:grid-cols-[minmax(0,1fr)_140px]
                  sm:items-start
                "
              >
                <label
                  className="
                    pt-2
                    text-[12px]
                    font-semibold
                    text-[#173b69]
                  "
                >
                  If yes, how many children vaccinated?
                </label>

                <NumberField
                  value={additional.numberOfChildrenVaccinated}
                  onChange={(value) =>
                    updateAdditional((previous) => ({
                      ...previous,

                      numberOfChildrenVaccinated: value,
                    }))
                  }
                  disabled={readOnly}
                  ariaLabel="Number of children vaccinated"
                  onTouched={() => setVaccinatedCountTouched(true)}
                  errorMessage={vaccinatedCountError}
                />
              </div>
            )}

            {additional.outbreakResponseImmunizationDone === "no" && (
              <div
                className="
                  mt-4
                  grid
                  gap-3
                  border-t
                  border-[#dce6f0]
                  pt-4
                  sm:grid-cols-[120px_minmax(0,1fr)]
                  sm:items-start
                "
              >
                <label
                  htmlFor="afp-ori-explanation"
                  className="
                    pt-2
                    text-[12px]
                    font-semibold
                    text-[#173b69]
                  "
                >
                  If no, explain
                </label>

                <div>
                  <TextField
                    id="afp-ori-explanation"
                    value={additional.outbreakResponseExplanation}
                    onChange={(event) =>
                      updateAdditional((previous) => ({
                        ...previous,

                        outbreakResponseExplanation: event.target.value,
                      }))
                    }
                    onBlur={() => setExplanationTouched(true)}
                    disabled={readOnly}
                    fullWidth
                    size="small"
                    placeholder="Enter explanation"
                    slotProps={{
                      htmlInput: {
                        maxLength: 500,
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

                  <FieldError message={explanationError} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="
            mt-5
            rounded-lg
            border
            border-[#f0c97d]
            bg-[#fff8e9]
            px-4
            py-3
            sm:px-5
          "
        >
          <p
            className="
              m-0
              text-[12px]
              font-semibold
              leading-5
              text-[#8a5811]
            "
          >
            If the answer to the question no 1 or 2 is Pending, complete
            activities within 7 days of AFP confirmation and share the updated
            form with EPI HQ.
          </p>
        </div>
      </div>
    </section>
  );
}
