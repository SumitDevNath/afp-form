import { AFP_OTHER_FACILITY_VALUE } from "../constants/afpFacilities";
import type { AFPFormData } from "../types/afp.types";
import { getAFPScreeningStatus } from "./afpScreening.utils";

export interface AFPValidationIssue {
  section: string;
  field: string;
}

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function validateAFPForm(
  data: AFPFormData,
  options?: {
    requireSuspectedDiagnosis?: boolean;
  },
): AFPValidationIssue[] {
  const issues: AFPValidationIssue[] = [];

  const add = (section: string, field: string) => {
    issues.push({
      section,
      field,
    });
  };

  /* =========================================================
     CLINICAL INFORMATION
     ========================================================= */

  const clinical = data.clinicalInformation;

  if (clinical.paralysisPresent === null) {
    add("Clinical Information", "1. Is or was paralysis present?");
  }

  if (clinical.paralysisFlaccid === null) {
    add("Clinical Information", "2. Is the paralysis flaccid (floppy)?");
  }

  if (clinical.paralysisSuddenOnset === null) {
    add("Clinical Information", "3. Did paralysis occur suddenly?");
  }

  if (isBlank(clinical.paralysisOnsetDate)) {
    add("Clinical Information", "4. Date of paralysis onset");
  }

  if (clinical.paralysisCausedByInjury === null) {
    add("Clinical Information", "5. Was paralysis caused by injury?");
  }

  if (clinical.paralysisPresentAtBirth === null) {
    add("Clinical Information", "6. Was paralysis present at birth?");
  }

  const screeningStatus = getAFPScreeningStatus(clinical);

  /*
   * If screening is still incomplete, do not validate
   * sections that are not yet accessible.
   */
  if (screeningStatus === "pending") {
    return issues;
  }

  /*
   * A not-eligible AFP investigation stops here.
   *
   * "Specify diagnosis, if known" remains optional,
   * because the UI explicitly says "if known".
   */
  if (screeningStatus === "not_eligible") {
    return issues;
  }

  /* =========================================================
     SIGNS / SYMPTOMS
     ========================================================= */

  const signs = data.signsSymptoms;

  if (signs.feverWhenParalysisBegan === null) {
    add("Signs / Symptoms", "1. Fever when paralysis began?");
  }

  if (signs.musclePainWhenParalysisBegan === null) {
    add("Signs / Symptoms", "2. Muscle pain when paralysis began?");
  }

  if (signs.siteOfParalysis.length === 0) {
    add("Signs / Symptoms", "3. Site of paralysis");
  }

  if (
    signs.siteOfParalysis.includes("other") &&
    isBlank(signs.otherParalysisSite)
  ) {
    add("Signs / Symptoms", "3. Specify other site of paralysis");
  }

  if (signs.paralysisAsymmetric === null) {
    add("Signs / Symptoms", "4. Is paralysis asymmetric?");
  }

  if (signs.paralysisMovedUpward === null) {
    add("Signs / Symptoms", "5. Did paralysis move upward over time?");
  }

  if (signs.sensationPresentAtParalysisSite === null) {
    add(
      "Signs / Symptoms",
      "6. Is sensation present in the site of paralysis?",
    );
  }

  if (signs.childAtHealthFacility === null) {
    add(
      "Signs / Symptoms",
      "7. Was / has the child been at a health facility?",
    );
  }

  if (signs.childAtHealthFacility === "yes") {
    const facility = signs.healthFacility;

    if (isBlank(facility.selectedFacilityOption)) {
      add("Signs / Symptoms", "Health facility");
    }

    if (
      facility.selectedFacilityOption === AFP_OTHER_FACILITY_VALUE &&
      isBlank(facility.otherFacilityName)
    ) {
      add("Signs / Symptoms", "Facility name");
    }

    if (isBlank(facility.notificationDate)) {
      add("Signs / Symptoms", "Date of notification");
    }

    if (isBlank(facility.medicalRecordNumber)) {
      add("Signs / Symptoms", "Medical record #");
    }
  }

  /* =========================================================
     VACCINATION HISTORY
     ========================================================= */

  const vaccination = data.vaccinationHistory;

  /*
   * available === false is treated as a valid state.
   * Details only need validation when available === true.
   */
  if (vaccination.available) {
    if (vaccination.opvCampaignDoses.recordSource === null) {
      add("Vaccination History", "1. OPV campaign dose record source");
    }

    if (vaccination.opvCampaignDoses.numberOfDoses === null) {
      add("Vaccination History", "1. Number of OPV campaign doses");
    }

    if (vaccination.opvRoutineDoses.recordSource === null) {
      add("Vaccination History", "2. OPV routine dose record source");
    }

    if (vaccination.opvRoutineDoses.numberOfDoses === null) {
      add("Vaccination History", "2. Number of routine OPV doses");
    }

    if (isBlank(vaccination.lastOpvDoseBeforeParalysisDate)) {
      add(
        "Vaccination History",
        "3. Date of last OPV dose before paralysis onset",
      );
    }

    if (vaccination.ipvDoses.recordSource === null) {
      add("Vaccination History", "4. IPV dose record source");
    }

    if (vaccination.ipvDoses.numberOfDoses === null) {
      add("Vaccination History", "4. Number of IPV doses");
    }

    if (isBlank(vaccination.lastIpvDoseBeforeParalysisDate)) {
      add(
        "Vaccination History",
        "5. Date of last IPV dose before paralysis onset",
      );
    }

    if (vaccination.opvGivenAfterParalysis === null) {
      add("Vaccination History", "6. Was OPV given after paralysis onset?");
    }

    if (
      vaccination.opvGivenAfterParalysis === "yes" &&
      isBlank(vaccination.opvAfterParalysisDate)
    ) {
      add("Vaccination History", "6. Date of OPV after paralysis onset");
    }
  }

  /* =========================================================
     TRAVEL HISTORY
     ========================================================= */

  const travel = data.travelHistory;

  /*
   * false means "No travel", which is valid.
   */
  if (
    travel.travelOutsideAreaLast30Days &&
    travel.notifiedToConcernedDsfpSimo &&
    isBlank(travel.notificationDate)
  ) {
    add("Travel History", "DSFP / SIMO date of notification");
  }

  /* =========================================================
     CLINICAL EXAMINATION — REFLEXES
     ========================================================= */

  const reflexes = data.clinicalExamination.reflexes;

  const reflexFields: {
    label: string;
    value: string | null;
  }[] = [
    {
      label: "RT Biceps",
      value: reflexes.scores.rightBiceps,
    },
    {
      label: "LT Biceps",
      value: reflexes.scores.leftBiceps,
    },

    {
      label: "RT Brachioradialis",
      value: reflexes.scores.rightBrachioradialis,
    },
    {
      label: "LT Brachioradialis",
      value: reflexes.scores.leftBrachioradialis,
    },

    {
      label: "RT Patellar",
      value: reflexes.scores.rightPatellar,
    },
    {
      label: "LT Patellar",
      value: reflexes.scores.leftPatellar,
    },

    {
      label: "RT Achilles",
      value: reflexes.scores.rightAchilles,
    },
    {
      label: "LT Achilles",
      value: reflexes.scores.leftAchilles,
    },

    {
      label: "RT Plantar Reflex",
      value: reflexes.rightPlantarReflex,
    },
    {
      label: "LT Plantar Reflex",
      value: reflexes.leftPlantarReflex,
    },
  ];

  reflexFields.forEach(({ label, value }) => {
    if (value === null) {
      add("Clinical Examination — Reflexes", label);
    }
  });

  /* =========================================================
     CLINICAL EXAMINATION — MUSCLE STRENGTH
     ========================================================= */

  const strength = data.clinicalExamination.muscleStrength;

  const upperLimb = [
    {
      label: "Flex wrist",
      value: strength.upperLimb.flexWrist,
    },
    {
      label: "Extend wrist",
      value: strength.upperLimb.extendWrist,
    },
    {
      label: "Flex elbow",
      value: strength.upperLimb.flexElbow,
    },
    {
      label: "Extend elbow",
      value: strength.upperLimb.extendElbow,
    },
    {
      label: "Flex shoulder",
      value: strength.upperLimb.flexShoulder,
    },
    {
      label: "Extend shoulder",
      value: strength.upperLimb.extendShoulder,
    },
    {
      label: "Hand Grip",
      value: strength.upperLimb.handGrip,
    },
  ];

  const lowerLimb = [
    {
      label: "Flex hip",
      value: strength.lowerLimb.flexHip,
    },
    {
      label: "Extend hip",
      value: strength.lowerLimb.extendHip,
    },
    {
      label: "Flex knee",
      value: strength.lowerLimb.flexKnee,
    },
    {
      label: "Extend knee",
      value: strength.lowerLimb.extendKnee,
    },
    {
      label: "Flex ankle",
      value: strength.lowerLimb.flexAnkle,
    },
    {
      label: "Extend ankle",
      value: strength.lowerLimb.extendAnkle,
    },
  ];

  upperLimb.forEach(({ label, value }) => {
    if (value.right === null) {
      add(
        "Clinical Examination — Muscle Strength",
        `Upper Limb — ${label} — Rt`,
      );
    }

    if (value.left === null) {
      add(
        "Clinical Examination — Muscle Strength",
        `Upper Limb — ${label} — Lt`,
      );
    }
  });

  lowerLimb.forEach(({ label, value }) => {
    if (value.right === null) {
      add(
        "Clinical Examination — Muscle Strength",
        `Lower Limb — ${label} — Rt`,
      );
    }

    if (value.left === null) {
      add(
        "Clinical Examination — Muscle Strength",
        `Lower Limb — ${label} — Lt`,
      );
    }
  });

  /* =========================================================
     PREVIOUS HEALTHCARE CONTACTS
     ========================================================= */

  const history = data.previousHealthcareContacts;

  history.contacts.forEach((contact, index) => {
    const contactNumber = index + 1;

    if (isBlank(contact.providerName)) {
      add(
        "Previous Healthcare Contacts",
        `Contact ${contactNumber} — Name of Hospital / Doctor / Health care provider`,
      );
    }

    if (isBlank(contact.address)) {
      add("Previous Healthcare Contacts", `Contact ${contactNumber} — Address`);
    }

    if (isBlank(contact.dateCaseVisited)) {
      add(
        "Previous Healthcare Contacts",
        `Contact ${contactNumber} — Date case visited`,
      );
    }

    if (contact.alreadyInNetwork === null) {
      add(
        "Previous Healthcare Contacts",
        `Contact ${contactNumber} — Already in network?`,
      );
    }

    if (contact.reportedCase === null) {
      add(
        "Previous Healthcare Contacts",
        `Contact ${contactNumber} — Did they report the case?`,
      );
    }

    if (isBlank(contact.actionTakenPlanned)) {
      add(
        "Previous Healthcare Contacts",
        `Contact ${contactNumber} — Action taken / planned`,
      );
    }
  });

  if (history.firstContactCategory === null) {
    add("Previous Healthcare Contacts", "Category of the first contact");
  }

  if (
    history.firstContactCategory === "Other" &&
    isBlank(history.firstContactCategoryOther)
  ) {
    add("Previous Healthcare Contacts", "Specify other first contact category");
  }

  /*
   * Only require suspected diagnosis when actual
   * diagnosis options have been supplied to the form.
   */
  if (
    options?.requireSuspectedDiagnosis &&
    isBlank(history.suspectedDiagnosis)
  ) {
    add("Previous Healthcare Contacts", "Suspected diagnosis");
  }

  /*
   * Additional Comments is intentionally not mandatory.
   */

  /* =========================================================
     ADDITIONAL INFORMATION
     ========================================================= */

  const additional = data.additionalInformation;

  if (additional.searchForAdditionalCases === null) {
    add("Additional Information", "1. Search for additional AFP cases?");
  }

  if (additional.searchForAdditionalCases === "yes") {
    if (additional.additionalCasesIdentified === null) {
      add("Additional Information", "Additional AFP cases identified?");
    }

    if (
      additional.additionalCasesIdentified === "yes" &&
      additional.numberOfAdditionalCases === null
    ) {
      add("Additional Information", "How many additional AFP cases?");
    }
  }

  if (additional.outbreakResponseImmunizationDone === null) {
    add("Additional Information", "2. Outbreak response immunization done?");
  }

  if (
    additional.outbreakResponseImmunizationDone === "yes" &&
    additional.numberOfChildrenVaccinated === null
  ) {
    add("Additional Information", "How many children vaccinated?");
  }

  if (
    additional.outbreakResponseImmunizationDone === "no" &&
    isBlank(additional.outbreakResponseExplanation)
  ) {
    add(
      "Additional Information",
      "Explain why outbreak response immunization was not done",
    );
  }

  return issues;
}
