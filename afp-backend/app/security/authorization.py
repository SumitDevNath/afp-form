
"""Unwired, provisional AFP role policy. Not complete authorization."""

from enum import StrEnum
from typing import NoReturn

from fastapi import HTTPException, status

from app.security.principal import NDSSPrincipal


class AFPOperation(StrEnum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"


def check_provisional_facility_role(
    principal: NDSSPrincipal | None,
    operation: AFPOperation,
) -> NDSSPrincipal:
    """Check the stated facility-role rule; NEVER use alone on a route."""

    if principal is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NDSS authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if (
        principal.role != "facility"
        or principal.facility_ref is None
        or not principal.facility_ref.strip()
        or operation not in {
            AFPOperation.CREATE,
            AFPOperation.READ,
            AFPOperation.UPDATE,
        }
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AFP operation is not permitted.",
        )

    return principal


def block_unconfirmed_ndss_workflow() -> NoReturn:
    """Deny production case operations until scope and linkage are approved."""

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=(
            "NDSS case-linkage and resource-access rules "
            "are not configured."
        ),
    )
