import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { Button } from "@mui/material";
import { useAFPForm } from "./context/AFPFormContext";
import { useAFPInlineValidation } from "./validation/AFPInlineValidation";

export default function AFPFormSubmitButton() {
  const { readOnly } = useAFPForm();
  const { attempted, missingCount, verify } = useAFPInlineValidation();
  const complete = attempted && missingCount === 0;
  const invalid = attempted && missingCount > 0;

  return (
    <div className="flex justify-end py-4">
      <Button
        type="button"
        variant="contained"
        disabled={readOnly}
        onClick={verify}
        startIcon={
          complete ? (
            <CheckCircleOutlinedIcon />
          ) : invalid ? (
            <ErrorOutlinedIcon />
          ) : (
            <SendOutlinedIcon />
          )
        }
        sx={{
          minWidth: 185,
          minHeight: 45,
          px: 3,
          borderRadius: "9px",
          fontWeight: 700,
          fontSize: "0.85rem",
          textTransform: "none",
          boxShadow: "none",
          transition: "transform 180ms ease, background-color 180ms ease",
          backgroundColor: complete
            ? "#15803d"
            : invalid
              ? "#b42318"
              : "#2563eb",
          transform: complete ? "scale(1.04)" : "scale(1)",
          "&:hover": {
            backgroundColor: complete
              ? "#166534"
              : invalid
                ? "#991b1b"
                : "#1d4ed8",
            boxShadow: "none",
          },
        }}
      >
        {complete ? "Form Complete" : "Submit Form"}
      </Button>
    </div>
  );
}
