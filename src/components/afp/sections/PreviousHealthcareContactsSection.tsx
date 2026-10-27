import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  Button,
  FormControl,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";

import { FIRST_CONTACT_CATEGORY_OPTIONS } from "../constants/afpHealthcareContacts";

import {
  createInitialAFPHealthcareContact,
  useAFPForm,
} from "../context/AFPFormContext";

import DateField from "../fields/DateField";
import ValidatedField from "../fields/ValidatedField";
import YesNoField from "../fields/YesNoField";
import YesNoUnknownField from "../fields/YesNoUnknownField";

import { useAFPValidation } from "../validation/AFPValidationContext";
import type { AFPValidationErrors } from "../validation/afpValidation";

import type {
  AFPFirstContactCategory,
  AFPHealthcareContact,
  AFPPreviousHealthcareContacts,
  AFPSuspectedDiagnosisOption,
  YesNo,
  YesNoUnknown,
} from "../types/afp.types";

interface PreviousHealthcareContactsSectionProps {
  suspectedDiagnosisOptions?: AFPSuspectedDiagnosisOption[];
}

type ContactTextField = "providerName" | "address" | "actionTakenPlanned";

type EditableContactField =
  | ContactTextField
  | "dateCaseVisited"
  | "alreadyInNetwork"
  | "reportedCase";

interface CompactTextFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  maxLength?: number;
  multiline?: boolean;
  minRows?: number;
  disabled?: boolean;
  error?: boolean;
  errorId?: string;
}

interface ContactBlockProps {
  contact: AFPHealthcareContact;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onTextChange: (field: ContactTextField, value: string) => void;
  onDateChange: (value: string) => void;
  onNetworkChange: (value: YesNoUnknown) => void;
  onReportChange: (value: YesNo) => void;
  errors: AFPValidationErrors;
  disabled?: boolean;
  compactLayout?: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

interface OptionsSelectProps {
  value: string | null;
  options: readonly SelectOption[];
  onChange: (event: SelectChangeEvent<string>) => void;
  placeholder: string;
  placeholderClassName: string;
  ariaLabel: string;
  disabled: boolean;
  wrapMenuItems?: boolean;
  error?: boolean;
  errorId?: string;
}

// =========================================================
// SHARED STYLING
// =========================================================

const contactLabelClass =
  "mb-1.5 block text-[12px] font-semibold text-[#173b69]";

const sideLabelClass = "mb-1.5 block text-[12px] font-semibold text-[#617996]";

const selectSx = {
  minHeight: 40,
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  fontSize: "0.78rem",
};

const errorSpacing = "[&_.MuiFormHelperText-root]:mt-2!";

// =========================================================
// TEXT QUESTIONS
// =========================================================

const textQuestions = [
  {
    field: "providerName",
    label: "1. Name of Hospital/ Doctor/ Health care provider",
    placeholder: "Enter name",
    ariaSuffix: "provider name",
    maxLength: 250,
  },
  {
    field: "address",
    label: "2. Address",
    placeholder: "Enter address",
    ariaSuffix: "address",
    maxLength: 500,
  },
  {
    field: "actionTakenPlanned",
    label: "6. Action taken / planned",
    placeholder: "Enter action taken or planned",
    ariaSuffix: "action taken or planned",
    maxLength: 500,
  },
] as const satisfies readonly {
  field: ContactTextField;
  label: string;
  placeholder: string;
  ariaSuffix: string;
  maxLength: number;
}[];

// =========================================================
// COMPACT TEXT FIELD
// Native MUI error property added.
// =========================================================

function CompactTextField({
  id,
  value,
  onChange,
  placeholder,
  ariaLabel,
  maxLength = 250,
  multiline = false,
  minRows,
  disabled = false,
  error = false,
  errorId,
}: CompactTextFieldProps) {
  return (
    <TextField
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
      error={error}
      fullWidth
      size="small"
      multiline={multiline}
      minRows={minRows}
      slotProps={{
        htmlInput: {
          maxLength,
          "aria-describedby": error ? errorId : undefined,
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          minHeight: multiline ? undefined : 40,
          borderRadius: "8px",
          backgroundColor: "#ffffff",
        },
        "& input": {
          fontSize: "0.78rem",
        },
        "& textarea": {
          fontSize: "0.78rem",
          lineHeight: 1.5,
        },
      }}
    />
  );
}

// =========================================================
// OPTIONS SELECT
// MUI FormControl error support added.
// =========================================================

function OptionsSelect({
  value,
  options,
  onChange,
  placeholder,
  placeholderClassName,
  ariaLabel,
  disabled,
  wrapMenuItems = false,
  error = false,
  errorId,
}: OptionsSelectProps) {
  return (
    <FormControl fullWidth size="small" disabled={disabled} error={error}>
      <Select<string>
        value={value ?? ""}
        onChange={onChange}
        displayEmpty
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
        renderValue={(selected) =>
          !selected ? (
            <span className={placeholderClassName}>{placeholder}</span>
          ) : (
            (options.find((option) => option.value === selected)?.label ??
            selected)
          )
        }
        sx={selectSx}
        MenuProps={{
          slotProps: {
            paper: {
              sx: {
                ...(wrapMenuItems ? { maxWidth: 420 } : {}),
                "& .MuiMenuItem-root": {
                  ...(wrapMenuItems ? { whiteSpace: "normal" } : {}),
                  fontSize: "0.8rem",
                },
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// =========================================================
// STABLE CONTACT VALIDATION ID
// =========================================================

const contactFieldId = (contactId: string, field: string) =>
  `previousHealthcareContacts.contacts.${contactId}.${field}`;

// =========================================================
// REUSABLE CONTACT TEXT QUESTION
// =========================================================

function ContactTextQuestion({
  question,
  contact,
  contactNumber,
  onTextChange,
  disabled,
  errors,
}: {
  question: (typeof textQuestions)[number];
  contact: AFPHealthcareContact;
  contactNumber: number;
  onTextChange: ContactBlockProps["onTextChange"];
  disabled: boolean;
  errors: AFPValidationErrors;
}) {
  const fieldId = contactFieldId(contact.id, question.field);

  const error = errors[fieldId] ?? "";

  return (
    <ValidatedField fieldId={fieldId} error={error} className={errorSpacing}>
      <label className={contactLabelClass}>{question.label}</label>

      <CompactTextField
        value={contact[question.field]}
        onChange={(value) => onTextChange(question.field, value)}
        placeholder={question.placeholder}
        ariaLabel={`Contact ${contactNumber} ${question.ariaSuffix}`}
        maxLength={question.maxLength}
        disabled={disabled}
        error={Boolean(error)}
        errorId={`${fieldId}-error`}
      />
    </ValidatedField>
  );
}

// =========================================================
// INDIVIDUAL HEALTHCARE CONTACT
// =========================================================

function ContactBlock({
  contact,
  index,
  canRemove,
  onRemove,
  onTextChange,
  onDateChange,
  onNetworkChange,
  onReportChange,
  errors,
  disabled = false,
  compactLayout = false,
}: ContactBlockProps) {
  const contactNumber = index + 1;

  const dateId = contactFieldId(contact.id, "dateCaseVisited");

  const networkId = contactFieldId(contact.id, "alreadyInNetwork");

  const reportId = contactFieldId(contact.id, "reportedCase");

  const dateError = errors[dateId] ?? "";
  const networkError = errors[networkId] ?? "";
  const reportError = errors[reportId] ?? "";

  return (
    <div className="w-full min-w-0 rounded-xl border border-[#d8e5f2] bg-[#f8fbff] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="m-0 text-[14px] font-bold text-[#173b69]">
          Contact {contactNumber}
        </h4>

        {canRemove && (
          <Button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            startIcon={<DeleteOutlinedIcon />}
            size="small"
            sx={{
              color: "#b42318",
              fontSize: "0.72rem",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#fff1f0",
              },
            }}
          >
            Remove
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* QUESTIONS 1 & 2 */}

        {textQuestions.slice(0, 2).map((question) => (
          <ContactTextQuestion
            key={question.field}
            question={question}
            contact={contact}
            contactNumber={contactNumber}
            onTextChange={onTextChange}
            disabled={disabled}
            errors={errors}
          />
        ))}

        {/* QUESTIONS 3, 4 & 5 */}

        <div
          className={`grid gap-4 md:grid-cols-[170px_minmax(0,240px)_minmax(0,240px)] md:items-start ${
            compactLayout ? "lg:grid-cols-1 2xl:grid-cols-2" : ""
          }`}
        >
          {/* QUESTION 3 — DATE */}

          <ValidatedField
            fieldId={dateId}
            error={dateError}
            showMessage={false}
            className="min-w-0 [&_.MuiFormHelperText-root]:whitespace-nowrap"
          >
            <label className={contactLabelClass}>3. Dates case visited</label>

            <DateField
              value={contact.dateCaseVisited}
              onChange={onDateChange}
              disabled={disabled}
              noFuture
              ariaLabel={`Contact ${contactNumber} date case visited`}
              errorMessage={dateError}
            />
          </ValidatedField>

          {/* QUESTION 4 — NETWORK */}

          <ValidatedField
            fieldId={networkId}
            error={networkError}
            className={`min-w-0 ${errorSpacing}`}
          >
            <label className={contactLabelClass}>4. Already in network?</label>

            <YesNoUnknownField
              value={contact.alreadyInNetwork}
              onChange={onNetworkChange}
              disabled={disabled}
              ariaLabel={`Contact ${contactNumber} already in network`}
              error={Boolean(networkError)}
              errorId={`${networkId}-error`}
            />
          </ValidatedField>

          {/* QUESTION 5 — REPORTED CASE */}

          <ValidatedField
            fieldId={reportId}
            error={reportError}
            className={`min-w-0 ${errorSpacing}`}
          >
            <label className={contactLabelClass}>
              5. Did they / person report the case?
            </label>

            <YesNoField
              value={contact.reportedCase}
              onChange={onReportChange}
              disabled={disabled}
              ariaLabel={`Contact ${contactNumber} reported the case`}
              error={Boolean(reportError)}
              errorId={`${reportId}-error`}
            />
          </ValidatedField>
        </div>

        {/* QUESTION 6 */}

        <ContactTextQuestion
          question={textQuestions[2]}
          contact={contact}
          contactNumber={contactNumber}
          onTextChange={onTextChange}
          disabled={disabled}
          errors={errors}
        />
      </div>
    </div>
  );
}

// =========================================================
// PREVIOUS HEALTHCARE CONTACTS SECTION
// =========================================================

export default function PreviousHealthcareContactsSection({
  suspectedDiagnosisOptions = [],
}: PreviousHealthcareContactsSectionProps) {
  const { data, updateData, readOnly } = useAFPForm();

  const { errors } = useAFPValidation();

  const history = data.previousHealthcareContacts;

  // =======================================================
  // EXISTING UPDATE FUNCTIONS — UNCHANGED
  // =======================================================

  const updateHistory = (
    updater: (
      previous: AFPPreviousHealthcareContacts,
    ) => AFPPreviousHealthcareContacts,
  ) => {
    updateData((previous) => ({
      ...previous,
      previousHealthcareContacts: updater(previous.previousHealthcareContacts),
    }));
  };

  // Update contact by ID
  const updateContact = (
    id: string,
    updater: (contact: AFPHealthcareContact) => AFPHealthcareContact,
  ) => {
    updateHistory((previous) => ({
      ...previous,
      contacts: previous.contacts.map((contact) =>
        contact.id === id ? updater(contact) : contact,
      ),
    }));
  };

  // Shared contact field updater
  const updateContactField = <K extends EditableContactField>(
    id: string,
    field: K,
    value: AFPHealthcareContact[K],
  ) => {
    updateContact(id, (contact) => ({
      ...contact,
      [field]: value,
    }));
  };

  // Add contact
  const addContact = () => {
    updateHistory((previous) => ({
      ...previous,
      contacts: [...previous.contacts, createInitialAFPHealthcareContact()],
    }));
  };

  // Remove contact
  const removeContact = (id: string) => {
    updateHistory((previous) => {
      if (previous.contacts.length <= 1) {
        return previous;
      }

      return {
        ...previous,
        contacts: previous.contacts.filter((contact) => contact.id !== id),
      };
    });
  };

  // First contact category
  const updateFirstContactCategory = (value: AFPFirstContactCategory) => {
    updateHistory((previous) => ({
      ...previous,
      firstContactCategory: value,
      firstContactCategoryOther:
        value === "Other" ? previous.firstContactCategoryOther : "",
    }));
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const option = FIRST_CONTACT_CATEGORY_OPTIONS.find(
      (item) => item.value === event.target.value,
    );

    if (option) {
      updateFirstContactCategory(option.value);
    }
  };

  // Suspected diagnosis
  const handleDiagnosisChange = (event: SelectChangeEvent<string>) => {
    const option = suspectedDiagnosisOptions.find(
      (item) => item.value === event.target.value,
    );

    if (!option) return;

    updateHistory((previous) => ({
      ...previous,
      suspectedDiagnosis: option.value,
    }));
  };

  // =======================================================
  // VALIDATION FIELD IDS
  // =======================================================

  const categoryId = "previousHealthcareContacts.firstContactCategory";

  const categoryOtherId =
    "previousHealthcareContacts.firstContactCategoryOther";

  const commentsId = "previousHealthcareContacts.additionalComments";

  const diagnosisId = "previousHealthcareContacts.suspectedDiagnosis";

  // =======================================================
  // UI — ORIGINAL LAYOUT PRESERVED
  // =======================================================

  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}

      <div className="border-b border-[#dce7f2] px-5 py-3 sm:px-7">
        <h2 className="m-0 text-[18px] font-bold uppercase leading-6 text-[#173b69]">
          History of Previous Contacts with Health Care Providers After Date of
          Paralysis Onset
        </h2>
      </div>

      <div className="px-0">
        {/* CONTACTS CONTAINER */}

        <div className="mx-0 w-full overflow-hidden border border-[#d8e5f2] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#d8e5f2] bg-[#f8fbff] px-4 py-3 sm:flex-row sm:items-center">
            <h3 className="m-0 text-[16px] font-bold text-[#2563b8]">
              CONTACTS
            </h3>

            <Button
              type="button"
              variant="contained"
              onClick={addContact}
              disabled={readOnly}
              sx={{
                width: "fit-content",
                borderRadius: "9px",
                backgroundColor: "#2864d7",
                px: 2.5,
                py: 0.9,
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#1f56bf",
                  boxShadow: "none",
                },
              }}
            >
              + Add more contacts
            </Button>
          </div>

          {/* CONTACT LIST — RESPONSIVE GRID */}

          <div
            className={
              history.contacts.length > 1
                ? "grid grid-cols-1 items-start gap-4 p-3 sm:p-4 lg:grid-cols-2"
                : "space-y-4 p-3 sm:p-4"
            }
          >
            {history.contacts.map((contact, index) => (
              <ContactBlock
                key={contact.id}
                contact={contact}
                index={index}
                canRemove={history.contacts.length > 1}
                onRemove={() => removeContact(contact.id)}
                onTextChange={(field, value) =>
                  updateContactField(contact.id, field, value)
                }
                onDateChange={(value) =>
                  updateContactField(contact.id, "dateCaseVisited", value)
                }
                onNetworkChange={(value) =>
                  updateContactField(contact.id, "alreadyInNetwork", value)
                }
                onReportChange={(value) =>
                  updateContactField(contact.id, "reportedCase", value)
                }
                disabled={readOnly}
                compactLayout={history.contacts.length > 1}
                errors={errors}
              />
            ))}
          </div>
        </div>

        {/* ===================================================
            BOTTOM FIELDS
           =================================================== */}

        <div className="m-5 grid gap-5 lg:grid-cols-[minmax(220px,0.75fr)_minmax(320px,1.5fr)]">
          {/* FIRST CONTACT CATEGORY */}

          <div>
            <ValidatedField
              fieldId={categoryId}
              error={errors[categoryId]}
              className={errorSpacing}
            >
              <label className="mb-1.5 block text-[12px] font-semibold text-[#355b88]">
                Category of the first contact:
              </label>

              <OptionsSelect
                value={history.firstContactCategory ?? ""}
                options={FIRST_CONTACT_CATEGORY_OPTIONS}
                onChange={handleCategoryChange}
                placeholder="List of the Contacts"
                placeholderClassName="text-[#64748b]"
                ariaLabel="Category of the first contact"
                disabled={readOnly}
                error={Boolean(errors[categoryId])}
                errorId={`${categoryId}-error`}
              />
            </ValidatedField>

            {/* OTHER CATEGORY */}

            {history.firstContactCategory === "Other" && (
              <ValidatedField
                fieldId={categoryOtherId}
                error={errors[categoryOtherId]}
                className={`mt-3 ${errorSpacing}`}
              >
                <CompactTextField
                  value={history.firstContactCategoryOther}
                  onChange={(value) =>
                    updateHistory((previous) => ({
                      ...previous,
                      firstContactCategoryOther: value,
                    }))
                  }
                  placeholder="Specify other"
                  ariaLabel="Specify other first contact category"
                  maxLength={150}
                  disabled={readOnly}
                  error={Boolean(errors[categoryOtherId])}
                  errorId={`${categoryOtherId}-error`}
                />
              </ValidatedField>
            )}
          </div>

          {/* ADDITIONAL COMMENTS */}

          <ValidatedField
            fieldId={commentsId}
            error={errors[commentsId]}
            className={errorSpacing}
          >
            <label className={sideLabelClass}>Additional comments</label>

            <CompactTextField
              value={history.additionalComments}
              onChange={(value) =>
                updateHistory((previous) => ({
                  ...previous,
                  additionalComments: value,
                }))
              }
              placeholder="Enter comments"
              ariaLabel="Additional comments"
              maxLength={1000}
              multiline
              minRows={3}
              disabled={readOnly}
              error={Boolean(errors[commentsId])}
              errorId={`${commentsId}-error`}
            />
          </ValidatedField>

          {/* SUSPECTED DIAGNOSIS */}

          <ValidatedField
            fieldId={diagnosisId}
            error={errors[diagnosisId]}
            className={`max-w-[320px] ${errorSpacing}`}
          >
            <label className={sideLabelClass}>Suspected diagnosis</label>

            <OptionsSelect
              value={history.suspectedDiagnosis}
              options={suspectedDiagnosisOptions}
              onChange={handleDiagnosisChange}
              placeholder={
                suspectedDiagnosisOptions.length > 0
                  ? "Select from the list of Disease"
                  : "No diagnosis options configured"
              }
              placeholderClassName="text-[#475569]"
              ariaLabel="Suspected diagnosis"
              disabled={readOnly || suspectedDiagnosisOptions.length === 0}
              wrapMenuItems
              error={Boolean(errors[diagnosisId])}
              errorId={`${diagnosisId}-error`}
            />
          </ValidatedField>
        </div>
      </div>
    </section>
  );
}
