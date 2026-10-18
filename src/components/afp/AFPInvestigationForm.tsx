import { Box, Typography } from "@mui/material";

import { AFPFormProvider } from "./context/AFPFormContext";

import type { AFPInvestigationFormProps } from "./types/afp.types";

function AFPFormContent() {
  return (
    <Box
      component="section"
      className="rounded-xl border border-[#d9e5f2] bg-white p-4 sm:p-6"
    >
      <Typography
        component="h2"
        sx={{
          color: "#173b69",
          fontSize: "1.125rem",
          fontWeight: 700,
        }}
      >
        AFP Case Investigation Form
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: "#64748b",
          fontSize: "0.875rem",
        }}
      >
        Form foundation initialized. Clinical Information will be implemented in
        Phase 2.
      </Typography>
    </Box>
  );
}

export default function AFPInvestigationForm({
  value,
  onChange,
  readOnly = false,
}: AFPInvestigationFormProps) {
  return (
    <AFPFormProvider value={value} onChange={onChange} readOnly={readOnly}>
      <AFPFormContent />
    </AFPFormProvider>
  );
}
