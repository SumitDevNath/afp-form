import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import {
  Button,
  FormControl,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";

import DateField from "../fields/DateField";

import YesNoField from "../fields/YesNoField";

import YesNoUnknownField from "../fields/YesNoUnknownField";

import { FIRST_CONTACT_CATEGORY_OPTIONS } from "../constants/afpHealthcareContacts";

import {
  createInitialAFPHealthcareContact,
  useAFPForm,
} from "../context/AFPFormContext";

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
}: {
  id?: string;

  value: string;

  onChange: (value: string) => void;

  placeholder: string;

  ariaLabel: string;

  maxLength?: number;

  multiline?: boolean;

  minRows?: number;

  disabled?: boolean;
}) {
  return (
    <TextField
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled}
      fullWidth
      size="small"
      multiline={multiline}
      minRows={minRows}
      slotProps={{
        htmlInput: {
          maxLength,
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

function ContactBlock({
  contact,
  index,
  canRemove,
  onRemove,
  onTextChange,
  onDateChange,
  onNetworkChange,
  onReportChange,
  disabled = false,
}: {
  contact: AFPHealthcareContact;

  index: number;

  canRemove: boolean;

  onRemove: () => void;

  onTextChange: (
    field: ContactTextField,

    value: string,
  ) => void;

  onDateChange: (value: string) => void;

  onNetworkChange: (value: YesNoUnknown) => void;

  onReportChange: (value: YesNo) => void;

  disabled?: boolean;
}) {
  const contactNumber = index + 1;

  return (
    <div
      className="
        rounded-xl
        border
        border-[#d8e5f2]
        bg-[#f8fbff]
        p-4
        sm:p-5
      "
    >
      <div
        className="
          mb-4
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <h4
          className="
            m-0
            text-[14px]
            font-bold
            text-[#173b69]
          "
        >
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

      <div
        className="
          space-y-4
        "
      >
        <div>
          <label
            className="
              mb-1.5
              block
              text-[12px]
              font-semibold
              text-[#173b69]
            "
          >
            1. Name of Hospital/ Doctor/ Health care provider
          </label>

          <CompactTextField
            value={contact.providerName}
            onChange={(value) => onTextChange("providerName", value)}
            placeholder="Enter name"
            ariaLabel={`Contact ${contactNumber} provider name`}
            maxLength={250}
            disabled={disabled}
          />
        </div>

        <div>
          <label
            className="
              mb-1.5
              block
              text-[12px]
              font-semibold
              text-[#173b69]
            "
          >
            2. Address
          </label>

          <CompactTextField
            value={contact.address}
            onChange={(value) => onTextChange("address", value)}
            placeholder="Enter address"
            ariaLabel={`Contact ${contactNumber} address`}
            maxLength={500}
            disabled={disabled}
          />
        </div>

        <div
          className="
            grid
            gap-4
            md:grid-cols-[170px_minmax(240px,1fr)_minmax(210px,0.9fr)]
            md:items-start
          "
        >
          <div>
            <label
              className="
                mb-1.5
                block
                text-[12px]
                font-semibold
                text-[#173b69]
              "
            >
              3. Dates case visited
            </label>

            <DateField
              value={contact.dateCaseVisited}
              onChange={onDateChange}
              disabled={disabled}
              noFuture
              ariaLabel={`Contact ${contactNumber} date case visited`}
            />
          </div>

          <div>
            <label
              className="
                mb-1.5
                block
                text-[12px]
                font-semibold
                text-[#173b69]
              "
            >
              4. Already in network?
            </label>

            <YesNoUnknownField
              value={contact.alreadyInNetwork}
              onChange={onNetworkChange}
              disabled={disabled}
              ariaLabel={`Contact ${contactNumber} already in network`}
            />
          </div>

          <div>
            <label
              className="
                mb-1.5
                block
                text-[12px]
                font-semibold
                text-[#173b69]
              "
            >
              5. Did they / person report the case?
            </label>

            <YesNoField
              value={contact.reportedCase}
              onChange={onReportChange}
              disabled={disabled}
              ariaLabel={`Contact ${contactNumber} reported the case`}
            />
          </div>
        </div>

        <div>
          <label
            className="
              mb-1.5
              block
              text-[12px]
              font-semibold
              text-[#173b69]
            "
          >
            6. Action taken / planned
          </label>

          <CompactTextField
            value={contact.actionTakenPlanned}
            onChange={(value) => onTextChange("actionTakenPlanned", value)}
            placeholder="Enter action taken or planned"
            ariaLabel={`Contact ${contactNumber} action taken or planned`}
            maxLength={500}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

export default function PreviousHealthcareContactsSection({
  suspectedDiagnosisOptions = [],
}: PreviousHealthcareContactsSectionProps) {
  const { data, updateData, readOnly } = useAFPForm();

  const history = data.previousHealthcareContacts;

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

  const addContact = () => {
    updateHistory((previous) => ({
      ...previous,

      contacts: [...previous.contacts, createInitialAFPHealthcareContact()],
    }));
  };

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

  const updateContactText = (
    id: string,

    field: ContactTextField,

    value: string,
  ) => {
    updateContact(id, (contact) => ({
      ...contact,

      [field]: value,
    }));
  };

  const updateContactDate = (
    id: string,

    value: string,
  ) => {
    updateContact(id, (contact) => ({
      ...contact,

      dateCaseVisited: value,
    }));
  };

  const updateContactNetwork = (
    id: string,

    value: YesNoUnknown,
  ) => {
    updateContact(id, (contact) => ({
      ...contact,

      alreadyInNetwork: value,
    }));
  };

  const updateContactReport = (
    id: string,

    value: YesNo,
  ) => {
    updateContact(id, (contact) => ({
      ...contact,

      reportedCase: value,
    }));
  };

  const updateFirstContactCategory = (value: AFPFirstContactCategory) => {
    updateHistory((previous) => ({
      ...previous,

      firstContactCategory: value,

      firstContactCategoryOther:
        value === "Other" ? previous.firstContactCategoryOther : "",
    }));
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;

    const validOption = FIRST_CONTACT_CATEGORY_OPTIONS.find(
      (option) => option.value === value,
    );

    if (!validOption) {
      return;
    }

    updateFirstContactCategory(validOption.value);
  };

  const handleDiagnosisChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;

    const validOption = suspectedDiagnosisOptions.find(
      (option) => option.value === value,
    );

    if (!validOption) {
      return;
    }

    updateHistory((previous) => ({
      ...previous,

      suspectedDiagnosis: validOption.value,
    }));
  };

  return (
    <section
      className="
        overflow-hidden
        rounded-xl
        border
        border-[#d4e2ef]
        bg-white
        shadow-[0_1px_2px_rgba(15,23,42,0.03)]
      "
    >
      <div
        className="
          border-b
          border-[#dce7f2]
          px-5
          py-3
          sm:px-7
        "
      >
        <h2
          className="
            m-0
            text-[18px]
            font-bold
            uppercase
            leading-6
            text-[#173b69]
          "
        >
          History of Previous Contacts with Health Care Providers After Date of
          Paralysis Onset
        </h2>
      </div>

      <div
        className="
          px-5
          py-5
          sm:px-7
        "
      >
        <div
          className="
            overflow-hidden
            rounded-xl
            border
            border-[#d8e5f2]
            bg-white
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-[#d8e5f2]
              bg-[#f8fbff]
              px-4
              py-3
              sm:flex-row
              sm:items-center
            "
          >
            <h3
              className="
                m-0
                text-[16px]
                font-bold
                text-[#2563b8]
              "
            >
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

          <div
            className="
              space-y-4
              p-3
              sm:p-4
            "
          >
            {history.contacts.map((contact, index) => (
              <ContactBlock
                key={contact.id}
                contact={contact}
                index={index}
                canRemove={history.contacts.length > 1}
                onRemove={() => removeContact(contact.id)}
                onTextChange={(field, value) =>
                  updateContactText(contact.id, field, value)
                }
                onDateChange={(value) => updateContactDate(contact.id, value)}
                onNetworkChange={(value) =>
                  updateContactNetwork(contact.id, value)
                }
                onReportChange={(value) =>
                  updateContactReport(contact.id, value)
                }
                disabled={readOnly}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM FIELDS */}
        <div
          className="
            mt-5
            grid
            gap-5
            lg:grid-cols-[minmax(220px,0.75fr)_minmax(320px,1.5fr)]
          "
        >
          <div>
            <label
              className="
                mb-1.5
                block
                text-[12px]
                font-semibold
                text-[#355b88]
              "
            >
              Category of the first contact:
            </label>

            <FormControl fullWidth size="small" disabled={readOnly}>
              <Select
                value={history.firstContactCategory ?? ""}
                onChange={handleCategoryChange}
                displayEmpty
                aria-label="Category of the first contact"
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span
                        className="
                          text-[#64748b]
                        "
                      >
                        List of the Contacts
                      </span>
                    );
                  }

                  return (
                    FIRST_CONTACT_CATEGORY_OPTIONS.find(
                      (option) => option.value === selected,
                    )?.label ?? selected
                  );
                }}
                sx={{
                  minHeight: 40,

                  borderRadius: "7px",

                  backgroundColor: "#ffffff",

                  fontSize: "0.78rem",
                }}
                MenuProps={{
                  slotProps: {
                    paper: {
                      sx: {
                        "& .MuiMenuItem-root": {
                          fontSize: "0.8rem",
                        },
                      },
                    },
                  },
                }}
              >
                {FIRST_CONTACT_CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {history.firstContactCategory === "Other" && (
              <div className="mt-3">
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
                />
              </div>
            )}
          </div>

          <div>
            <label
              className="
                mb-1.5
                block
                text-[12px]
                font-semibold
                text-[#617996]
              "
            >
              Additional comments
            </label>

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
            />
          </div>
        </div>

        <div
          className="
            mt-5
            max-w-[320px]
          "
        >
          <label
            className="
              mb-1.5
              block
              text-[12px]
              font-semibold
              text-[#617996]
            "
          >
            Suspected diagnosis
          </label>

          <FormControl
            fullWidth
            size="small"
            disabled={readOnly || suspectedDiagnosisOptions.length === 0}
          >
            <Select
              value={history.suspectedDiagnosis}
              onChange={handleDiagnosisChange}
              displayEmpty
              aria-label="Suspected diagnosis"
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <span
                      className="
                        text-[#475569]
                      "
                    >
                      {suspectedDiagnosisOptions.length > 0
                        ? "Select from the list of Disease"
                        : "No diagnosis options configured"}
                    </span>
                  );
                }

                return (
                  suspectedDiagnosisOptions.find(
                    (option) => option.value === selected,
                  )?.label ?? selected
                );
              }}
              sx={{
                minHeight: 40,

                borderRadius: "7px",

                backgroundColor: "#ffffff",

                fontSize: "0.78rem",
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      maxWidth: 420,

                      "& .MuiMenuItem-root": {
                        whiteSpace: "normal",

                        fontSize: "0.8rem",
                      },
                    },
                  },
                },
              }}
            >
              {suspectedDiagnosisOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
    </section>
  );
}
