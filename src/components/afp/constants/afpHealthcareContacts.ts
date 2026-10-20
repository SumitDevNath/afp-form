import type { AFPFirstContactCategory } from "../types/afp.types";

export const FIRST_CONTACT_CATEGORY_OPTIONS: {
  value: Exclude<AFPFirstContactCategory, null>;

  label: string;
}[] = [
  {
    value: "Regd doctor",
    label: "Regd doctor",
  },
  {
    value: "GoB facility",
    label: "GoB facility",
  },
  {
    value: "Village doctor",
    label: "Village doctor",
  },
  {
    value: "NGO Clinic",
    label: "NGO Clinic",
  },
  {
    value: "Homeopath",
    label: "Homeopath",
  },
  {
    value: "Kabiraj",
    label: "Kabiraj",
  },
  {
    value: "Imam",
    label: "Imam",
  },
  {
    value: "Pharmacist",
    label: "Pharmacist",
  },
  {
    value: "HA",
    label: "HA",
  },
  {
    value: "FWA",
    label: "FWA",
  },
  {
    value: "Other",
    label: "Other (specify)",
  },
];
