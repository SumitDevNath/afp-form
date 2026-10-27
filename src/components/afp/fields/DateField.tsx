import { useId, useRef, useState } from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import {
  convertNativeDateToDisplay,
  isFutureDate,
  isValidCalendarDate,
  isValidDateFormat,
} from "../utils/afpDate.utils";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  noFuture?: boolean;
  placeholder?: string;
  ariaLabel: string;
  errorMessage?: string;
}

function getDateError(value: string, noFuture: boolean): string {
  if (!value.trim()) {
    return "";
  }
  if (!isValidDateFormat(value)) {
    return "Enter date in DD-MM-YYYY format.";
  }
  if (!isValidCalendarDate(value)) {
    return "Enter a valid calendar date.";
  }
  if (noFuture && isFutureDate(value)) {
    return "Future dates are not allowed.";
  }
  return "";
}

function getTodayAsNativeDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DateField({
  value,
  onChange,
  disabled = false,
  noFuture = false,
  placeholder = "DD-MM-YYYY",
  ariaLabel,
  errorMessage = "",
}: DateFieldProps) {
  const inputId = useId();
  const nativeDateRef = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);
  const localError = touched ? getDateError(value, noFuture) : "";
  const error = errorMessage || localError;
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };
  const handleNativeDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nativeValue = event.target.value;

    if (!nativeValue) {
      return;
    }

    onChange(convertNativeDateToDisplay(nativeValue));
    setTouched(true);
  };

  const openCalendar = () => {
    if (disabled || !nativeDateRef.current) {
      return;
    }

    try {
      nativeDateRef.current.showPicker();
    } catch {
      nativeDateRef.current.focus();
      nativeDateRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <TextField
        id={inputId}
        value={value}
        onChange={handleTextChange}
        onBlur={() => setTouched(true)}
        disabled={disabled}
        error={Boolean(error)}
        helperText={errorMessage ? undefined : localError || undefined}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        fullWidth
        size="small"
        slotProps={{
          formHelperText: {
            role: "alert",
            sx: { ml: 0, mt: 0.5, fontSize: "0.75rem", lineHeight: 1.5 },
          },
          htmlInput: {
            maxLength: 10,
            inputMode: "numeric",
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  onClick={openCalendar}
                  disabled={disabled}
                  aria-label={`Open calendar for ${ariaLabel}`}
                  edge="end"
                  size="small"
                >
                  <CalendarMonthOutlinedIcon
                    sx={{
                      fontSize: 18,
                    }}
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          maxWidth: {
            xs: "100%",
            sm: 190,
          },
          "& .MuiOutlinedInput-root": {
            minHeight: 38,
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            "& fieldset": {
              borderColor: "#b9c8d8",
            },
            "&:hover fieldset": {
              borderColor: "#8ca6c1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#2563eb",
            },
            "&.Mui-error fieldset, &.Mui-error:hover fieldset, &.Mui-error.Mui-focused fieldset":
              {
                borderColor: "#d32f2f",
              },
          },
          "& input": {
            py: "8px",
            fontSize: "0.78rem",
          },
          "& input::placeholder": {
            color: "#94a3b8",
            opacity: 1,
          },
        }}
      />

      <input
        ref={nativeDateRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleNativeDateChange}
        max={noFuture ? getTodayAsNativeDate() : undefined}
        className="
          pointer-events-none
          absolute h-0 w-0 opacity-0
        "
      />
    </div>
  );
}
