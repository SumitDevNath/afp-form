import type { PlantarReflexValue, ReflexScoreCode } from "../types/afp.types";

export interface ReflexScoreOption {
  value: Exclude<ReflexScoreCode, null>;
  label: string;
}

export interface PlantarReflexOption {
  value: Exclude<PlantarReflexValue, null>;
  label: string;
}

export const REFLEX_SCORE_OPTIONS: ReflexScoreOption[] = [
  {
    value: "0",
    label: "No response",
  },
  {
    value: "1+",
    label: "Somewhat diminished; low normal",
  },
  {
    value: "2+",
    label: "Average; normal",
  },
  {
    value: "3+",
    label:
      "Brisker than average; possibly but not necessarily indicative of disease",
  },
  {
    value: "4+",
    label: "Very brisk; hyperactive",
  },
];

export const PLANTAR_REFLEX_OPTIONS: PlantarReflexOption[] = [
  {
    value: "flexor",
    label: "Flexor",
  },
  {
    value: "extensor",
    label: "Extensor",
  },
  {
    value: "equivocal",
    label: "Equivocal",
  },
];
