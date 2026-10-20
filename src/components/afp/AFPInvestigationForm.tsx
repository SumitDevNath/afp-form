import { AFPFormProvider, useAFPForm } from "./context/AFPFormContext";

import ClinicalInformationSection from "./sections/ClinicalInformationSection";

import MuscleStrengthSection from "./sections/MuscleStrengthSection";

import ReflexesSection from "./sections/ReflexesSection";

import SignsSymptomsSection from "./sections/SignsSymptomsSection";

import TravelHistorySection from "./sections/TravelHistorySection";

import VaccinationHistorySection from "./sections/VaccinationHistorySection";

import type {
  AFPFacilityOption,
  AFPInvestigationFormProps,
} from "./types/afp.types";

import { getAFPScreeningStatus } from "./utils/afpScreening.utils";

interface AFPFormContentProps {
  facilityOptions?: AFPFacilityOption[];
}

function AFPFormContent({ facilityOptions }: AFPFormContentProps) {
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

          <ReflexesSection />

          <MuscleStrengthSection />

          <div
            className="
              rounded-lg
              border
              border-dashed
              border-[#cbd8e5]
              bg-[#f8fbff]
              px-4
              py-4
              text-sm
              text-[#64748b]
            "
          >
            Previous healthcare contacts and the remaining investigation
            sections will appear here in the next phases.
          </div>
        </>
      )}
    </div>
  );
}

export default function AFPInvestigationForm({
  value,
  onChange,
  readOnly = false,
  facilityOptions,
}: AFPInvestigationFormProps) {
  return (
    <AFPFormProvider value={value} onChange={onChange} readOnly={readOnly}>
      <AFPFormContent facilityOptions={facilityOptions} />
    </AFPFormProvider>
  );
}
