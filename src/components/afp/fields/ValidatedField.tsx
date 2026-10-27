import type { ReactNode } from "react";
import { FormHelperText } from "@mui/material";

interface ValidatedFieldProps {
  fieldId: string;
  error?: string;
  children: ReactNode;
  className?: string;
  showMessage?: boolean;
}

export default function ValidatedField({
  fieldId,
  error = "",
  children,
  className = "",
  showMessage = true,
}: ValidatedFieldProps) {
  return (
    <div
      data-afp-field={fieldId}
      role="group"
      aria-invalid={Boolean(error)}
      className={`min-w-0 ${className}`}
    >
      {children}
      {error && showMessage && (
        <FormHelperText
          id={`${fieldId}-error`}
          error
          role="alert"
          sx={{
            ml: 0,
            mt: -0.5,
            mb: 1.5,
            fontSize: "0.75rem",
            lineHeight: 1.5,
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </FormHelperText>
      )}
    </div>
  );
}
