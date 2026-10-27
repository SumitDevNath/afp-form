import { TextField } from "@mui/material";
import FieldError from "./FieldError";

export interface NumberFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
  ariaLabel: string;
  disabled?: boolean;
  errorMessage?: string;
  onTouched?: () => void;

  // NEW: MUI v9 error styling
  error?: boolean;
}

export default function NumberField({
  value,
  onChange,
  ariaLabel,
  disabled = false,
  errorMessage,
  onTouched,
  error = false,
}: NumberFieldProps) {
  const handleChange = (rawValue: string) => {
    if (rawValue === "") {
      onChange(null);
      return;
    }

    const parsed = Number(rawValue);

    if (Number.isInteger(parsed) && parsed >= 0) {
      onChange(parsed);
    }
  };

  return (
    <div>
      <TextField
        value={value ?? ""}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={onTouched}
        disabled={disabled}
        type="number"
        size="small"
        aria-label={ariaLabel}
        error={error || Boolean(errorMessage)}
        slotProps={{
          htmlInput: {
            min: 0,
            step: 1,
          },
        }}
        sx={{
          width: {
            xs: "100%",
            sm: 140,
          },

          "& .MuiOutlinedInput-root": {
            minHeight: 38,
            borderRadius: "8px",
            backgroundColor: "#ffffff",
          },

          "& input": {
            py: "8px",
            fontSize: "0.8rem",
          },
        }}
      />

      <FieldError message={errorMessage} />
    </div>
  );
}
