import type { MouseEvent } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { YesNoUnknown } from "../types/afp.types";

interface YesNoUnknownFieldProps {
  value: YesNoUnknown;
  onChange: (value: YesNoUnknown) => void;
  disabled?: boolean;
  ariaLabel: string;
}

export default function YesNoUnknownField({
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: YesNoUnknownFieldProps) {
  const handleChange = (
    _event: MouseEvent<HTMLElement>,
    nextValue: YesNoUnknown,
  ) => {
    if (nextValue === null) {
      return;
    }
    onChange(nextValue);
  };

  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={handleChange}
      disabled={disabled}
      aria-label={ariaLabel}
      size="small"
      sx={{
        display: "flex",
        flexWrap: "nowrap",
        gap: "6px",
        "& .MuiToggleButtonGroup-grouped": {
          margin: 0,
          border: "1px solid #cbdcf0 !important",
          borderRadius: "7px !important",
        },
        "& .MuiToggleButton-root": {
          minWidth: {
            xs: 52,
            sm: 54,
          },
          height: 34,
          px: {
            xs: 1,
            sm: 1.5,
          },
          py: 0.5,
          color: "#64748b",
          backgroundColor: "#ffffff",
          fontSize: "0.72rem",
          fontWeight: 500,
          lineHeight: 1,
          textTransform: "none",
          whiteSpace: "nowrap",
          transition:
            "background-color 120ms ease, border-color 120ms ease, color 120ms ease",
          "&:hover": {
            backgroundColor: "#ffffff",
          },
          "&.Mui-selected": {
            color: "#0756c9",
            borderColor: "#216fed !important",
            backgroundColor: "#eef5ff",
            fontWeight: 600,
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#eef5ff",
          },
          "&.Mui-disabled": {
            color: "#94a3b8",
            backgroundColor: "#f8fafc",
          },
        },
      }}
    >
      <ToggleButton value="yes">Yes</ToggleButton>

      <ToggleButton value="no">No</ToggleButton>

      <ToggleButton value="unknown">Unknown</ToggleButton>
    </ToggleButtonGroup>
  );
}
