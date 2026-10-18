import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import type { YesNo } from "../types/afp.types";

interface YesNoFieldProps {
  value: YesNo;
  onChange: (value: YesNo) => void;
  disabled?: boolean;
  ariaLabel: string;
}

export default function YesNoField({
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: YesNoFieldProps) {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextValue: YesNo,
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
        gap: "6px",

        "& .MuiToggleButtonGroup-grouped": {
          margin: 0,
          border: "1px solid #cbdcf0 !important",
          borderRadius: "7px !important",
        },

        "& .MuiToggleButton-root": {
          minWidth: 54,
          height: 34,
          px: 1.5,
          py: 0.5,

          color: "#64748b",
          backgroundColor: "#ffffff",

          fontSize: "0.75rem",
          fontWeight: 500,
          lineHeight: 1,

          textTransform: "none",

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
    </ToggleButtonGroup>
  );
}
