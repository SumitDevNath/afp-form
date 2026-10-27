import { useMemo, type ReactNode } from "react";

import { useAFPForm } from "../context/AFPFormContext";

import type {
  AFPFormData,
  AFPSuspectedDiagnosisOption,
} from "../types/afp.types";

import { AFPValidationProvider } from "./AFPValidationContext";
import { combineAFPValidators } from "./afpValidation";

import { validateClinicalInformation } from "./validateClinicalInformation";
import { validateSignsSymptoms } from "./validateSignsSymptoms";
import { validateVaccinationHistory } from "./validateVaccinationHistory";
import { validateTravelHistory } from "./validateTravelHistory";
import { validateClinicalExamination } from "./validateClinicalExamination";
import { validatePreviousHealthcareContacts } from "./validatePreviousHealthcareContacts";
import { validateAdditionalInformation } from "./validateAdditionalInformation";

interface Props {
  children: ReactNode;
  fullFormReady?: boolean;
  suspectedDiagnosisOptions?: AFPSuspectedDiagnosisOption[];
}

export default function AFPValidationBridge({
  children,
  fullFormReady = true,
  suspectedDiagnosisOptions,
}: Props) {
  const { data } = useAFPForm();

  const validateCompletedSections = useMemo(
    () =>
      combineAFPValidators<AFPFormData>(
        validateClinicalInformation,
        validateSignsSymptoms,
        validateVaccinationHistory,
        validateTravelHistory,
        validateClinicalExamination,
        (formData) =>
          validatePreviousHealthcareContacts(
            formData,
            suspectedDiagnosisOptions,
          ),
        validateAdditionalInformation,
      ),
    [suspectedDiagnosisOptions],
  );

  return (
    <AFPValidationProvider
      data={data}
      validate={validateCompletedSections}
      ready
      fullFormReady={fullFormReady}
    >
      {children}
    </AFPValidationProvider>
  );
}
