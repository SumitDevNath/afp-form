import { AFPFormProvider, useAFPForm } from "./context/AFPFormContext";

import ClinicalInformationSection from "./sections/ClinicalInformationSection";

import SignsSymptomsSection from "./sections/SignsSymptomsSection";

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
            px-4 py-3
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

          <div
            className="
              rounded-lg
              border
              border-dashed
              border-[#cbd8e5]
              bg-[#f8fbff]
              px-4 py-4
              text-sm
              text-[#64748b]
            "
          >
            Further investigation sections will appear here as the remaining
            phases are implemented.
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
