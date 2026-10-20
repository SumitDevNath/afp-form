import type { VaccinationRecordSource } from "../types/afp.types";

export interface VaccinationRecordSourceOption {
  value: VaccinationRecordSource;
  label: string;
}

export const VACCINATION_RECORD_SOURCE_OPTIONS: {
  value: Exclude<VaccinationRecordSource, null>;
  label: string;
}[] = [
  {
    value: "card",
    label: "By Card",
  },
  {
    value: "history",
    label: "By History",
  },
];

export const VACCINATION_DOSE_OPTIONS = Array.from(
  { length: 11 },
  (_, index) => ({
    value: String(index),
    label: String(index),
  }),
);
