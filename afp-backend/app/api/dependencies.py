
"""Fail-closed local API gate until approved NDSS authentication exists."""

from fastapi import Header, Request

from app.core.config import get_settings


class APIProblem(Exception):
    """A safe, explicitly classified HTTP error."""

    def __init__(self, status_code: int, message: str) -> None:
        self.status_code = status_code
        self.message = message


async def require_local_afp_api(
    request: Request,
    x_afp_local_dev: str | None = Header(
        default=None,
        alias="X-AFP-Local-Dev",
    ),
) -> None:
    """Allow explicit local development access only."""

    settings = get_settings()

    if (
        not settings.afp_local_api_enabled
        or settings.afp_db_name not in {"afp_dev", "afp_test"}
        or settings.afp_db_host not in {"127.0.0.1", "localhost", "::1"}
    ):
        raise APIProblem(503, "Local AFP API is disabled.")

    if (
        request.client is None
        or request.client.host not in {"127.0.0.1", "::1"}
        or x_afp_local_dev != "true"
    ):
        raise APIProblem(403, "Local development access denied.")
