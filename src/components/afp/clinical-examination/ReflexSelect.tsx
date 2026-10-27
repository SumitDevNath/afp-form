import {
  FormControl,
  FormHelperText,
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
  errorMessage?: string;
  errorId?: string;
}

interface PlantarReflexSelectProps {
  type: "plantar";
  value: PlantarReflexValue;
  onChange: (value: PlantarReflexValue) => void;
  ariaLabel: string;
  disabled?: boolean;
  errorMessage?: string;
  errorId?: string;
}

type ReflexSelectProps = ReflexScoreSelectProps | PlantarReflexSelectProps;

export default function ReflexSelect(props: ReflexSelectProps) {
  const {
    type,
    value,
    ariaLabel,
    disabled = false,
    errorMessage = "",
    errorId,
  } = props;

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

  // NEW: MUI v9 error state
  const hasError = Boolean(errorMessage);

  return (
    <FormControl fullWidth size="small" disabled={disabled} error={hasError}>
      <Select
        value={value ?? ""}
        onChange={handleChange}
        displayEmpty
        aria-label={ariaLabel}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        renderValue={(selected) => {
          if (!selected) {
            return (
              <span className="text-[#475569]">
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

          // NEW: MUI error border takes priority.
          "&.Mui-error .MuiOutlinedInput-notchedOutline, &.Mui-error:hover .MuiOutlinedInput-notchedOutline, &.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "error.main",
            },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                maxWidth: 220,

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

      {/* NEW: MUI v9 INLINE ERROR MESSAGE */}
      {hasError && (
        <FormHelperText
          id={errorId}
          role="alert"
          sx={{
            m: 0,
            mt: 0.5,
            fontSize: "0.65rem",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
          }}
        >
          {errorMessage}
        </FormHelperText>
      )}
    </FormControl>
  );
}
