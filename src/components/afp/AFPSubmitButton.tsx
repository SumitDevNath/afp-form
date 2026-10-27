import { Button } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { useAFPValidation } from "./validation/AFPValidationContext";
import { useAFPForm } from "./context/AFPFormContext";

export default function AFPSubmitButton() {
  const { readOnly } = useAFPForm();
  const { submitForm, isComplete, ready } = useAFPValidation();

  return (
    <div className="flex justify-end py-5">
      <Button
        type="button"
        variant="contained"
        disabled={!ready || readOnly}
        onClick={submitForm}
        startIcon={isComplete ? <CheckCircleOutlinedIcon /> : undefined}
        sx={{
          minWidth: 160,
          minHeight: 44,
          px: 3,
          borderRadius: "8px",
          textTransform: "none",
          fontSize: "0.85rem",
          fontWeight: 700,
          bgcolor: isComplete ? "success.main" : "#173b69",
          transform: isComplete ? "scale(1.04)" : "scale(1)",
          transition: "background-color 180ms, transform 180ms",
          "&:hover": {
            bgcolor: isComplete ? "success.dark" : "#245081",
          },
        }}
      >
        Submit Form
      </Button>
    </div>
  );
}
