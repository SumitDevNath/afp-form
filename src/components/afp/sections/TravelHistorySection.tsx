import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";

import DateField from "../fields/DateField";
import ToggleSwitch from "../fields/ToggleSwitch";
import ValidatedField from "../fields/ValidatedField";

import { useAFPForm } from "../context/AFPFormContext";
import { useAFPValidation } from "../validation/AFPValidationContext";

import type { AFPTravelHistory } from "../types/afp.types";

export default function TravelHistorySection() {
  const { data, updateData, readOnly } = useAFPForm();

  // NEW: Shared Submit Form validation.
  const { errors } = useAFPValidation();

  const travelHistory = data.travelHistory;

  // =========================================================
  // EXISTING UPDATE FUNCTIONS — UNCHANGED
  // =========================================================

  // Shared travel history updater
  const updateTravelHistory = (
    updater: (previous: AFPTravelHistory) => AFPTravelHistory,
  ) => {
    updateData((previous) => ({
      ...previous,
      travelHistory: updater(previous.travelHistory),
    }));
  };

  // Travel availability toggle
  const handleTravelAvailabilityChange = (checked: boolean) => {
    updateTravelHistory((previous) =>
      checked
        ? {
            ...previous,
            travelOutsideAreaLast30Days: true,
          }
        : {
            travelOutsideAreaLast30Days: false,
            notifiedToConcernedDsfpSimo: false,
            notificationDate: "",
          },
    );
  };

  // DSFP / SIMO notification toggle
  const handleDsfpSimoChange = (checked: boolean) => {
    updateTravelHistory((previous) => ({
      ...previous,
      notifiedToConcernedDsfpSimo: checked,
      notificationDate: checked ? previous.notificationDate : "",
    }));
  };

  // Update notification date
  const updateNotificationDate = (value: string) => {
    updateTravelHistory((previous) => ({
      ...previous,
      notificationDate: value,
    }));
  };

  // =========================================================
  // NEW: VALIDATION
  // =========================================================

  const notificationDateFieldId = "travelHistory.notificationDate";

  const notificationDateError = errors[notificationDateFieldId] ?? "";

  // =========================================================
  // SECTION UI — ORIGINAL LAYOUT PRESERVED
  // =========================================================

  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}
      <div className="flex flex-col gap-3 border-b border-[#dce7f2] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <h2 className="m-0 text-[18px] font-bold text-[#173b69]">
          Travel History
        </h2>

        <div className="flex w-fit max-w-full items-center gap-2 rounded-xl bg-[#deebfb] px-3 py-1.5">
          <span className="text-[12px] font-semibold leading-4 text-[#173b69]">
            Travel outside area in last 30 days?
          </span>

          <ToggleSwitch
            checked={travelHistory.travelOutsideAreaLast30Days}
            onChange={handleTravelAvailabilityChange}
            disabled={readOnly}
            ariaLabel="Travel outside area in last 30 days"
          />

          <FlightOutlinedIcon
            aria-hidden="true"
            sx={{
              ml: 0.5,
              fontSize: 18,
              color: "#173b69",
            }}
          />
        </div>
      </div>

      {/* TRAVEL HISTORY CONTENT */}
      {!travelHistory.travelOutsideAreaLast30Days ? (
        <div className="px-5 py-6 text-sm text-[#718096] sm:px-7">
          Travel history details are currently hidden.
        </div>
      ) : (
        <div className="px-5 py-5 sm:px-7">
          {/* AFP-SPECIFIC DSFP / SIMO FIELD */}
          <div className="mt-5 max-w-140 rounded-lg border border-[#cbdced] bg-[#eff6ff] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 border-b border-[#d6e3f0] pb-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="m-0 text-[12px] font-semibold leading-5 text-[#173b69]">
                Notified to concerned DSFP / SIMO (for additional cases and
                ORI)?
              </p>

              <ToggleSwitch
                checked={travelHistory.notifiedToConcernedDsfpSimo}
                onChange={handleDsfpSimoChange}
                disabled={readOnly}
                ariaLabel="Notified to concerned DSFP or SIMO for additional cases and ORI"
              />
            </div>

            {/* =================================================
                CONDITIONAL NOTIFICATION DATE
                NEW: MUI v9 inline validation
               ================================================= */}

            {travelHistory.notifiedToConcernedDsfpSimo && (
              <div className="mt-4 grid gap-2 sm:grid-cols-[max-content_190px] sm:items-start">
                <label className="pt-2 text-[12px] font-semibold text-[#173b69]">
                  Date of notification
                </label>

                <ValidatedField
                  fieldId={notificationDateFieldId}
                  error={notificationDateError}
                  className="min-w-0 [&_.MuiFormHelperText-root]:mt-1!"
                >
                  <div
                    className={
                      notificationDateError
                        ? "[&_.MuiFormHelperText-root]:hidden"
                        : ""
                    }
                  >
                    <DateField
                      value={travelHistory.notificationDate}
                      onChange={updateNotificationDate}
                      disabled={readOnly}
                      noFuture
                      ariaLabel="DSFP SIMO date of notification"
                      errorMessage={notificationDateError}
                    />
                  </div>
                </ValidatedField>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
