
"""An identity already verified by an APPROVED NDSS source (future)."""

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class NDSSPrincipal:
    # Values are normalized by the approved NDSS adapter,
    # not obtained directly from client-supplied fields.
    role: str
    facility_ref: str | None
    subject_ref: str | None = None
