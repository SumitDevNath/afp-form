import { useState } from "react";

import { Box, Typography } from "@mui/material";

import AFPInvestigationForm from "../components/afp/AFPInvestigationForm";

import { createInitialAFPFormData } from "../components/afp/context/AFPFormContext";

import type { AFPFormData } from "../components/afp/types/afp.types";

export default function AFPDemoPage() {
  const [afpData, setAfpData] = useState<AFPFormData>(createInitialAFPFormData);

  return (
    <Box
      component="main"
      className="mx-auto w-full max-w-[1200px] px-3 py-6 sm:px-6 lg:py-8"
    >
      <Box className="mb-6">
        <Typography
          component="h1"
          sx={{
            color: "#173b69",
            fontSize: {
              xs: "1.25rem",
              sm: "1.5rem",
            },
            fontWeight: 700,
          }}
        >
          Acute Flaccid Paralysis (AFP)
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: "#64748b",
            fontSize: "0.875rem",
          }}
        >
          Case Investigation Form — Frontend Demo
        </Typography>
      </Box>

      <AFPInvestigationForm value={afpData} onChange={setAfpData} />
    </Box>
  );
}
