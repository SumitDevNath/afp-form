import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

export interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  value: string;
  options: SelectFieldOption[];
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
}

export default function SelectField({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
  disabled = false,
}: SelectFieldProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        inputProps={{
          "aria-label": ariaLabel,
        }}
        renderValue={(selected) => {
          if (!selected) {
            return (
              <span
                className="
                  text-[#94a3b8]
                "
              >
                {placeholder}
              </span>
            );
          }

          const option = options.find((item) => item.value === selected);

          return option?.label ?? selected;
        }}
        sx={{
          minHeight: 38,

          borderRadius: "8px",

          backgroundColor: "#ffffff",

          fontSize: "0.78rem",

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#b9c8d8",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#8ca6c1",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563eb",
          },

          "& .MuiSelect-select": {
            py: "8px",
          },
        }}
      >
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>

        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              fontSize: "0.82rem",
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
