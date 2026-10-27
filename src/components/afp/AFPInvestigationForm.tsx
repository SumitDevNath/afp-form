import { AFPFormProvider, useAFPForm } from "./context/AFPFormContext";
import AFPValidationBridge from "./validation/AFPValidationBridge";
import AdditionalInformationSection from "./sections/AdditionalInformationSection";
import ClinicalExaminationSection from "./sections/ClinicalExaminationSection";
import ClinicalInformationSection from "./sections/ClinicalInformationSection";
import PreviousHealthcareContactsSection from "./sections/PreviousHealthcareContactsSection";
import SignsSymptomsSection from "./sections/SignsSymptomsSection";
import TravelHistorySection from "./sections/TravelHistorySection";
import VaccinationHistorySection from "./sections/VaccinationHistorySection";
import type {
  AFPFacilityOption,
  AFPInvestigationFormProps,
  AFPSuspectedDiagnosisOption,
} from "./types/afp.types";
import { getAFPScreeningStatus } from "./utils/afpScreening.utils";
import AFPSubmitButton from "./AFPSubmitButton";

interface AFPFormContentProps {
  facilityOptions?: AFPFacilityOption[];
  suspectedDiagnosisOptions?: AFPSuspectedDiagnosisOption[];
}

function AFPFormContent({
  facilityOptions,
  suspectedDiagnosisOptions,
}: AFPFormContentProps) {
  const { data } = useAFPForm();

  const screeningStatus = getAFPScreeningStatus(data.clinicalInformation);

  return (
    <div className="space-y-4">
      <ClinicalInformationSection />

      {screeningStatus === "pending" && (
        <div
          className="
            rounded-lg
            border
            border-[#dbe5ef]
            bg-white
            px-4
            py-3
            text-sm
            text-[#64748b]
          "
        >
          Complete the AFP screening questions to continue the investigation.
        </div>
      )}

      {screeningStatus === "eligible" && (
        <>
          <SignsSymptomsSection facilityOptions={facilityOptions} />
          <VaccinationHistorySection />
          <TravelHistorySection />
          <ClinicalExaminationSection />
          <PreviousHealthcareContactsSection
            suspectedDiagnosisOptions={suspectedDiagnosisOptions}
          />
          <AdditionalInformationSection />
        </>
      )}

      {/* Validation pilot: currently validates Clinical Information only. */}
      <AFPSubmitButton />
    </div>
  );
}

export default function AFPInvestigationForm({
  value,
  onChange,
  readOnly = false,
  facilityOptions,
  suspectedDiagnosisOptions,
}: AFPInvestigationFormProps) {
  return (
    <AFPFormProvider value={value} onChange={onChange} readOnly={readOnly}>
      <AFPValidationBridge
        suspectedDiagnosisOptions={suspectedDiagnosisOptions}
      >
        <AFPFormContent
          facilityOptions={facilityOptions}
          suspectedDiagnosisOptions={suspectedDiagnosisOptions}
        />
      </AFPValidationBridge>
    </AFPFormProvider>
  );
}
