import type { AFPFacilityOption } from "../types/afp.types";

export const AFP_OTHER_FACILITY_VALUE = "__other__";

/**
 * Development-only placeholder facilities.
 *
 * These do NOT represent backend data.
 *
 * The senior developer can replace these
 * by passing `facilityOptions` to
 * <AFPInvestigationForm />.
 */
export const AFP_DEMO_FACILITY_OPTIONS: AFPFacilityOption[] = [
  {
    value: "demo_facility_1",
    label: "Development Facility 1",
  },
  {
    value: "demo_facility_2",
    label: "Development Facility 2",
  },
  {
    value: "demo_facility_3",
    label: "Development Facility 3",
  },
];

export const AFP_OTHER_FACILITY_OPTION: AFPFacilityOption = {
  value: AFP_OTHER_FACILITY_VALUE,
  label: "Other / Not in list",
};
