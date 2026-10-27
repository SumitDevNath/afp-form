import type { MouseEvent } from "react";
import type { YesNoPending } from "../types/afp.types";
import { FormControl, ToggleButton, ToggleButtonGroup } from "@mui/material";

interface YesNoPendingFieldProps {
  value: YesNoPending;
  onChange: (value: YesNoPending) => void;
  disabled?: boolean;
  ariaLabel: string;

  // Optional validation properties
  error?: boolean;
  errorId?: string;
}

export default function YesNoPendingField({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  error = false,
  errorId,
}: YesNoPendingFieldProps) {
  const handleChange = (
    _event: MouseEvent<HTMLElement>,
    nextValue: YesNoPending,
  ) => {
    if (nextValue === null) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <FormControl
      error={error}
      sx={{
        m: 0,
        minWidth: 0,
      }}
    >
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
        size="small"
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          gap: "6px",

          "& .MuiToggleButtonGroup-grouped": {
            margin: 0,
            border: `1px solid ${error ? "#d32f2f" : "#cbdcf0"} !important`,
            borderRadius: "7px !important",
          },

          "& .MuiToggleButton-root": {
            minWidth: {
              xs: 52,
              sm: 58,
            },
            height: 34,
            px: {
              xs: 1,
              sm: 1.5,
            },
            color: "#64748b",
            backgroundColor: "#ffffff",
            fontSize: "0.72rem",
            fontWeight: 500,
            lineHeight: 1,
            textTransform: "none",
            whiteSpace: "nowrap",

            "&:hover": {
              backgroundColor: "#ffffff",
            },

            "&.Mui-selected": {
              color: "#0756c9",
              borderColor: "#216fed !important",
              backgroundColor: "#dceaff",
              fontWeight: 600,
            },

            "&.Mui-selected:hover": {
              backgroundColor: "#dceaff",
            },
          },
        }}
      >
        <ToggleButton value="yes">Yes</ToggleButton>
        <ToggleButton value="no">No</ToggleButton>
        <ToggleButton value="pending">Pending</ToggleButton>
      </ToggleButtonGroup>
    </FormControl>
  );
}
