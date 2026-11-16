
"""Sanitized FastAPI request errors mapped to frontend field IDs."""

import re
from typing import Any

from fastapi.exceptions import RequestValidationError


def request_errors(
    exc: RequestValidationError,
) -> dict[str, str]:
    """Convert validation errors without exposing submitted values."""

    raw: Any = exc.body
    result: dict[str, str] = {}

    for item in exc.errors():
        parts = list(item.get("loc", ()))

        if parts and parts[0] == "body":
            parts.pop(0)

        path: list[str] = []

        for part in parts:
            if (
                isinstance(part, int)
                and path[-2:] == [
                    "previousHealthcareContacts",
                    "contacts",
                ]
            ):
                history = (
                    raw.get("previousHealthcareContacts", {})
                    if isinstance(raw, dict)
                    else {}
                )

                contacts = (
                    history.get("contacts", [])
                    if isinstance(history, dict)
                    else []
                )

                contact = (
                    contacts[part]
                    if isinstance(contacts, list)
                    and 0 <= part < len(contacts)
                    else {}
                )

                contact_id = (
                    contact.get("id")
                    if isinstance(contact, dict)
                    else None
                )

                if (
                    isinstance(contact_id, str)
                    and re.fullmatch(
                        r"[A-Za-z0-9_-]{1,255}",
                        contact_id,
                    )
                ):
                    path.append(contact_id)
                else:
                    path.append(str(part))

            elif (
                isinstance(part, int)
                and path == [
                    "signsSymptoms",
                    "siteOfParalysis",
                ]
            ):
                # The frontend has one checkbox-group field ID.
                continue

            else:
                path.append(str(part))

        field = ".".join(path) or "__root__"
        kind = item.get("type", "")

        if kind == "missing":
            message = "Required field is missing."

        elif kind == "date_format":
            message = "Enter date in DD-MM-YYYY format."

        elif kind == "date_calendar":
            message = "Enter a valid calendar date."

        elif kind in {"string_too_long", "too_long"}:
            message = "Value exceeds the allowed length."

        elif kind in {
            "greater_than_equal",
            "less_than_equal",
        }:
            message = "Enter a value in the permitted range."

        else:
            message = "Enter a valid value."

        result.setdefault(field, message)

    return result
