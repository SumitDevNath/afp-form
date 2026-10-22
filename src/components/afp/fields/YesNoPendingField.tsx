import type { MouseEvent } from "react";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import type { YesNoPending } from "../types/afp.types";

interface YesNoPendingFieldProps {
  value: YesNoPending;
  onChange: (value: YesNoPending) => void;
  disabled?: boolean;
  ariaLabel: string;
}

export default function YesNoPendingField({
  value,
  onChange,
  disabled = false,
  ariaLabel,
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
  );
}
