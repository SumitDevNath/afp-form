
"""Strict DD-MM-YYYY conversion for AFP form dates."""

import re
from datetime import date, datetime
from typing import Annotated

from pydantic import BeforeValidator, PlainSerializer
from pydantic_core import PydanticCustomError


DISPLAY_DATE = re.compile(r"\d{2}-\d{2}-\d{4}\Z")


def parse_form_date(value: object) -> date | None:
    """Convert a frontend date string to a date, or blank to None."""
    if not isinstance(value, str):
        raise PydanticCustomError("date_format", "Enter date in DD-MM-YYYY format.")
    if value == "":
        return None
    if not DISPLAY_DATE.fullmatch(value):
        raise PydanticCustomError("date_format", "Enter date in DD-MM-YYYY format.")
    try:
        return datetime.strptime(value, "%d-%m-%Y").date()
    except ValueError:
        raise PydanticCustomError("date_calendar", "Enter a valid calendar date.") from None


def format_form_date(value: date | None) -> str:
    """Serialize to the string representation expected by the frontend."""
    return value.strftime("%d-%m-%Y") if value is not None else ""


FormDate = Annotated[
    date | None,
    BeforeValidator(parse_form_date),
    PlainSerializer(format_form_date, return_type=str, when_used="json"),
]
