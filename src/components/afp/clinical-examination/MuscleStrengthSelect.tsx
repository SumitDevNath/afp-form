import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { MUSCLE_STRENGTH_OPTIONS } from "../constants/afpMuscleStrength";
import type { MuscleScore } from "../types/afp.types";

interface MuscleStrengthSelectProps {
  value: MuscleScore;
  onChange: (value: MuscleScore) => void;
  ariaLabel: string;
  disabled?: boolean;
  error?: boolean;
}

export default function MuscleStrengthSelect({
  value,
  onChange,
  ariaLabel,
  disabled = false,
  error = false,
}: MuscleStrengthSelectProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    const rawValue = event.target.value;
    const numericValue = Number(rawValue);
    const isValid = MUSCLE_STRENGTH_OPTIONS.some(
      (option) => option.value === numericValue,
    );
    if (!isValid) {
      return;
    }
    onChange(numericValue as Exclude<MuscleScore, null>);
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled} error={error}>
      <Select
        value={value === null ? "" : String(value)}
        onChange={handleChange}
        displayEmpty
        aria-label={ariaLabel}
        renderValue={(selected) => {
          if (selected === "") {
            return (
              <span
                className="
                  text-[#94a3b8]
                "
              >
                Select score
              </span>
            );
          }

          const numericValue = Number(selected);

          const option = MUSCLE_STRENGTH_OPTIONS.find(
            (item) => item.value === numericValue,
          );

          return option?.label ?? selected;
        }}
        sx={{
          minHeight: 38,
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
            borderColor: "#b9c8d8",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#8ca6c1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563eb",
          },
        }}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                maxWidth: 430,
                "& .MuiMenuItem-root": {
                  whiteSpace: "normal",
                  fontSize: "0.78rem",
                  lineHeight: 1.4,
                  py: 1,
                },
              },
            },
          },
        }}
      >
        {MUSCLE_STRENGTH_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={String(option.value)}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
