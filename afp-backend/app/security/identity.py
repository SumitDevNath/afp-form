
"""Fail-closed identity dependency pending the NDSS production contract."""

from typing import Annotated

from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.security.principal import NDSSPrincipal


ndss_bearer = HTTPBearer(
    auto_error=False,
    scheme_name="NDSSBearer",
)


async def get_verified_ndss_principal(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Security(ndss_bearer),
    ],
) -> NDSSPrincipal:
    """Never trust an unvalidated bearer token or a caller-supplied role."""

    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NDSS authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # No network call is performed here.
    #
    # The production endpoint, response schema, token audience,
    # trust boundary, and approved token source have not been confirmed.
    #
    # A supplied Bearer token is NOT sufficient to authenticate a user.

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Approved NDSS identity validation is not configured.",
    )
