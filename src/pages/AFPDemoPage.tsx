import { useState } from "react";

import { Box, Paper, Typography } from "@mui/material";

import {
  AFPInvestigationForm,
  createInitialAFPFormData,
  type AFPFacilityOption,
  type AFPFormData,
  type AFPSuspectedDiagnosisOption,
} from "../components/afp";

const demoFacilityOptions: AFPFacilityOption[] = [
  {
    value: "development-facility-1",
    label: "Development Facility 1",
  },
  {
    value: "development-facility-2",
    label: "Development Facility 2",
  },
];

const demoDiagnosisOptions: AFPSuspectedDiagnosisOption[] = [
  {
    value: "development-diagnosis-1",
    label: "Development Diagnosis 1",
  },
  {
    value: "development-diagnosis-2",
    label: "Development Diagnosis 2",
  },
];

export default function AFPDemoPage() {
  const [afpData, setAfpData] = useState<AFPFormData>(createInitialAFPFormData);

  return (
    <Box
      component="main"
      className="
        mx-auto
        w-full
        max-w-[1400px]
        px-3
        py-6
        sm:px-6
        lg:py-8
      "
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
          Case Investigation Form — Frontend Development Demo
        </Typography>
      </Box>

      <AFPInvestigationForm
        value={afpData}
        onChange={setAfpData}
        facilityOptions={demoFacilityOptions}
        suspectedDiagnosisOptions={demoDiagnosisOptions}
      />

      <Paper
        variant="outlined"
        sx={{
          mt: 4,
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
          }}
        >
          <Typography
            component="h2"
            sx={{
              color: "#173b69",
              fontSize: "0.95rem",
              fontWeight: 700,
            }}
          >
            Development State
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              color: "#64748b",
              fontSize: "0.72rem",
            }}
          >
            Frontend-only JSON preview. This is not an API payload.
          </Typography>
        </Box>

        <Box
          component="pre"
          sx={{
            m: 0,
            p: 2,
            maxHeight: 600,
            overflow: "auto",
            backgroundColor: "#0f172a",
            color: "#e2e8f0",
            fontFamily: "Consolas, 'Courier New', monospace",
            fontSize: "0.72rem",
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(afpData, null, 2)}
        </Box>
      </Paper>
    </Box>
  );
}
