import { Checkbox, FormControlLabel } from "@mui/material";

interface CheckboxFieldProps {
  label: string;
  checked: boolean;

  onChange: (checked: boolean) => void;

  disabled?: boolean;
}

export default function CheckboxField({
  label,
  checked,
  onChange,
  disabled = false,
}: CheckboxFieldProps) {
  return (
    <FormControlLabel
      disabled={disabled}
      control={
        <Checkbox
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          size="small"
          sx={{
            p: "4px",

            color: "#abc1da",

            "&.Mui-checked": {
              color: "#2563eb",
            },

            "& .MuiSvgIcon-root": {
              fontSize: 18,
            },
          }}
        />
      }
      label={label}
      sx={{
        m: 0,

        gap: "2px",

        alignItems: "center",

        "& .MuiFormControlLabel-label": {
          color: "#334155",
          fontSize: "0.75rem",
          lineHeight: 1.3,
        },
      }}
    />
  );
}
