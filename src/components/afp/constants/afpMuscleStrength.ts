import type { MuscleScore } from "../types/afp.types";

export interface MuscleStrengthOption {
  value: Exclude<MuscleScore, null>;
  label: string;
}

export const MUSCLE_STRENGTH_OPTIONS: MuscleStrengthOption[] = [
  {
    value: 0,
    label: "No muscle contraction",
  },
  {
    value: 1,
    label: "Barely detectable contraction",
  },
  {
    value: 2,
    label: "Active movement, not against gravity",
  },
  {
    value: 3,
    label: "Movement against gravity only",
  },
  {
    value: 4,
    label: "Movement vs. gravity + mild resistance",
  },
  {
    value: 5,
    label: "Movement vs. full resistance (NORMAL)",
  },
];

export const UPPER_LIMB_MUSCLE_FIELDS = [
  {
    key: "flexWrist",
    label: "Flex wrist",
  },
  {
    key: "extendWrist",
    label: "Extend wrist",
  },
  {
    key: "flexElbow",
    label: "Flex elbow",
  },
  {
    key: "extendElbow",
    label: "Extend elbow",
  },
  {
    key: "flexShoulder",
    label: "Flex shoulder",
  },
  {
    key: "extendShoulder",
    label: "Extend shoulder",
  },
  {
    key: "handGrip",
    label: "Hand Grip",
  },
] as const;

export const LOWER_LIMB_MUSCLE_FIELDS = [
  {
    key: "flexHip",
    label: "Flex hip",
  },
  {
    key: "extendHip",
    label: "Extend hip",
  },
  {
    key: "flexKnee",
    label: "Flex knee",
  },
  {
    key: "extendKnee",
    label: "Extend knee",
  },
  {
    key: "flexAnkle",
    label: "Flex ankle",
  },
  {
    key: "extendAnkle",
    label: "Extend ankle",
  },
] as const;
