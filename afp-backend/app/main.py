
"""AFP FastAPI entry point.

Investigation routes are local-development-only until NDSS integration.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.api.dependencies import APIProblem
from app.api.routes.afp import router as afp_router
from app.db.session import engine

from app.services.afp import (
    AFPIntegrationPending,
    AFPInvestigationNotFound,
    AFPValidationFailure,
)

from app.utils.error_mapping import request_errors


@asynccontextmanager
async def lifespan(
    _app: FastAPI,
) -> AsyncGenerator[None]:
    """Dispose of async database connections on shutdown."""

    try:
        yield
    finally:
        await engine.dispose()


app = FastAPI(
    title="AFP Investigation API",
    description=(
        "Local-only AFP-owned development API; "
        "not approved NDSS integration."
    ),
    version="0.1.0",
    lifespan=lifespan,
    debug=False,
)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Basic liveness endpoint; does not check database readiness."""

    return {
        "status": "ok",
        "service": "afp-backend",
    }


@app.exception_handler(RequestValidationError)
async def invalid_request(
    _request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Return safe, frontend-compatible request validation errors."""

    if any(
        item.get("type") == "json_invalid"
        for item in exc.errors()
    ):
        return JSONResponse(
            status_code=400,
            content={"message": "Malformed JSON request."},
        )

    return JSONResponse(
        status_code=422,
        content={"errors": request_errors(exc)},
    )


@app.exception_handler(AFPValidationFailure)
async def invalid_afp(
    _request: Request,
    exc: AFPValidationFailure,
) -> JSONResponse:
    """Return AFP business-rule errors by frontend field ID."""

    return JSONResponse(
        status_code=422,
        content={"errors": exc.errors},
    )


@app.exception_handler(AFPIntegrationPending)
async def pending_integration(
    _request: Request,
    _exc: AFPIntegrationPending,
) -> JSONResponse:
    """Do not claim unapproved shared-service persistence."""

    return JSONResponse(
        status_code=503,
        content={
            "message": (
                "Approved NDSS integration is not configured "
                "for this operation."
            )
        },
    )


@app.exception_handler(AFPInvestigationNotFound)
async def missing_investigation(
    _request: Request,
    _exc: AFPInvestigationNotFound,
) -> JSONResponse:
    return JSONResponse(
        status_code=404,
        content={"message": "AFP investigation not found."},
    )


@app.exception_handler(APIProblem)
async def api_problem(
    _request: Request,
    exc: APIProblem,
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message},
    )


@app.exception_handler(IntegrityError)
async def database_conflict(
    _request: Request,
    _exc: IntegrityError,
) -> JSONResponse:
    """Never expose constraint names, SQL or database values."""

    return JSONResponse(
        status_code=409,
        content={"message": "Database constraint conflict."},
    )


@app.exception_handler(SQLAlchemyError)
async def database_unavailable(
    _request: Request,
    _exc: SQLAlchemyError,
) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"message": "Database operation unavailable."},
    )


@app.exception_handler(Exception)
async def internal_error(
    _request: Request,
    _exc: Exception,
) -> JSONResponse:
    """Return no clinical values, SQL details, or traceback."""

    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error."},
    )


app.include_router(afp_router)
