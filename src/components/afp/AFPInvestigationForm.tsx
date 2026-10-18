import { AFPFormProvider, useAFPForm } from "./context/AFPFormContext";

import ClinicalInformationSection from "./sections/ClinicalInformationSection";

import type { AFPInvestigationFormProps } from "./types/afp.types";

import { getAFPScreeningStatus } from "./utils/afpScreening.utils";

function AFPFormContent() {
  const { data } = useAFPForm();

  const screeningStatus = getAFPScreeningStatus(data.clinicalInformation);

  return (
    <div className="space-y-4">
      <ClinicalInformationSection />

      {screeningStatus === "pending" && (
        <div
          className="
            rounded-lg border
            border-[#dbe5ef]
            bg-white px-4 py-3
            text-sm text-[#64748b]
          "
        >
          Complete the AFP screening questions to continue the investigation.
        </div>
      )}

      {screeningStatus === "eligible" && (
        <div
          className="
            rounded-lg border
            border-dashed border-[#cbd8e5]
            bg-[#f8fbff] px-4 py-4
            text-sm text-[#64748b]
          "
        >
          AFP screening criteria are satisfied. Additional investigation
          sections will appear here as they are implemented in the next phases.
        </div>
      )}
    </div>
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
