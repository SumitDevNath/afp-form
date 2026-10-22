import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import DateField from "../fields/DateField";
import ToggleSwitch from "../fields/ToggleSwitch";
import { useAFPForm } from "../context/AFPFormContext";
import type { AFPTravelHistory } from "../types/afp.types";

export default function TravelHistorySection() {
  const { data, updateData, readOnly } = useAFPForm();

  const travelHistory = data.travelHistory;

  const updateTravelHistory = (
    updater: (previous: AFPTravelHistory) => AFPTravelHistory,
  ) => {
    updateData((previous) => ({
      ...previous,
      travelHistory: updater(previous.travelHistory),
    }));
  };

  const handleTravelAvailabilityChange = (checked: boolean) => {
    /*
     * OFF means that AFP travel-specific
     * dependent values must not remain
     * in the AFP state.
     */
    updateTravelHistory((previous) => {
      if (!checked) {
        return {
          travelOutsideAreaLast30Days: false,
          notifiedToConcernedDsfpSimo: false,
          notificationDate: "",
        };
      }

      return {
        ...previous,
        travelOutsideAreaLast30Days: true,
      };
    });
  };

  const handleDsfpSimoChange = (checked: boolean) => {
    updateTravelHistory((previous) => ({
      ...previous,
      notifiedToConcernedDsfpSimo: checked,
      /*
       * Date belongs only to an
       * affirmative notification.
       */
      notificationDate: checked ? previous.notificationDate : "",
    }));
  };

  const updateNotificationDate = (value: string) => {
    updateTravelHistory((previous) => ({
      ...previous,
      notificationDate: value,
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
      {/* SECTION HEADER */}
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
          Travel History
        </h2>

        <div
          className="
            flex
            w-fit
            max-w-full
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
              leading-4
              text-[#173b69]
            "
          >
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

      {!travelHistory.travelOutsideAreaLast30Days ? (
        <div
          className="
            px-5
            py-6
            text-sm
            text-[#718096]
            sm:px-7
          "
        >
          Travel history details are currently hidden.
        </div>
      ) : (
        <div
          className="
            px-5
            py-5
            sm:px-7
          "
        >
          {/* SHARED TRAVEL MODULE PLACEHOLDER */}
          <div
            className="
              rounded-lg
              border
              border-dashed
              border-[#b8cce1]
              bg-[#f8fbff]
              px-4
              py-4
              sm:px-5
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <FlightOutlinedIcon
                aria-hidden="true"
                sx={{
                  mt: "2px",
                  fontSize: 20,
                  color: "#315f91",
                }}
              />

              <div>
                <h3
                  className="
                    m-0
                    text-[13px]
                    font-semibold
                    text-[#173b69]
                  "
                >
                  Shared Travel and Address Information
                </h3>

                <p
                  className="
                    mb-0
                    mt-1
                    max-w-[800px]
                    text-[12px]
                    leading-5
                    text-[#64748b]
                  "
                >
                  In the Facility Portal, the existing shared travel/address
                  component will be rendered here. These common fields are not
                  duplicated inside AFPFormData.
                </p>
              </div>
            </div>
          </div>

          {/* AFP-SPECIFIC DSFP / SIMO FIELD */}
          <div
            className="
              mt-5
              max-w-[560px]
              rounded-lg
              border
              border-[#cbdced]
              bg-[#eff6ff]
              px-4
              py-4
              sm:px-5
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                border-b
                border-[#d6e3f0]
                pb-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <p
                className="
                  m-0
                  text-[12px]
                  font-semibold
                  leading-5
                  text-[#173b69]
                "
              >
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

            {travelHistory.notifiedToConcernedDsfpSimo && (
              <div
                className="
                  mt-4
                  grid
                  gap-2
                  sm:grid-cols-[minmax(0,1fr)_190px]
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
                  Date of notification
                </label>

                <DateField
                  value={travelHistory.notificationDate}
                  onChange={updateNotificationDate}
                  disabled={readOnly}
                  noFuture
                  ariaLabel="DSFP SIMO date of notification"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
