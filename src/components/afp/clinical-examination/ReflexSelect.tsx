import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

import {
  PLANTAR_REFLEX_OPTIONS,
  REFLEX_SCORE_OPTIONS,
} from "../constants/afpReflexes";

import type { PlantarReflexValue, ReflexScoreCode } from "../types/afp.types";

interface ReflexScoreSelectProps {
  type: "score";
  value: ReflexScoreCode;
  onChange: (value: ReflexScoreCode) => void;
  ariaLabel: string;
  disabled?: boolean;
}

interface PlantarReflexSelectProps {
  type: "plantar";
  value: PlantarReflexValue;
  onChange: (value: PlantarReflexValue) => void;
  ariaLabel: string;
  disabled?: boolean;
}

type ReflexSelectProps = ReflexScoreSelectProps | PlantarReflexSelectProps;

export default function ReflexSelect(props: ReflexSelectProps) {
  const { type, value, ariaLabel, disabled = false } = props;

  const options =
    type === "score" ? REFLEX_SCORE_OPTIONS : PLANTAR_REFLEX_OPTIONS;

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selected = event.target.value;

    if (type === "score") {
      const valid = REFLEX_SCORE_OPTIONS.some(
        (option) => option.value === selected,
      );

      if (valid) {
        props.onChange(selected as Exclude<ReflexScoreCode, null>);
      }

      return;
    }

    const valid = PLANTAR_REFLEX_OPTIONS.some(
      (option) => option.value === selected,
    );

    if (valid) {
      props.onChange(selected as Exclude<PlantarReflexValue, null>);
    }
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <Select
        value={value ?? ""}
        onChange={handleChange}
        displayEmpty
        aria-label={ariaLabel}
        renderValue={(selected) => {
          if (!selected) {
            return (
              <span
                className="
                  text-[#475569]
                "
              >
                {type === "score" ? "Reflex Score" : "Plantar Reflex"}
              </span>
            );
          }

          const option = options.find((item) => item.value === selected);

          return option?.label ?? selected;
        }}
        sx={{
          height: 38,
          borderRadius: "7px",
          backgroundColor: "#ffffff",
          fontSize: "0.72rem",
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            py: "7px",
            pr: "30px !important",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#334155",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#334155",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563eb",
          },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                maxWidth: 420,
                "& .MuiMenuItem-root": {
                  whiteSpace: "normal",
                  fontSize: "0.78rem",
                  lineHeight: 1.4,
                },
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
