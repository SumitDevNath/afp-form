
"""AFP FastAPI entry point.

Investigation and ORI routes are local-development-only
until NDSS integration is approved.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.api.dependencies import APIProblem
from app.api.routes.afp import router as afp_router
from app.api.routes.ori import router as ori_router
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
        "Local-only AFP and ORI development API; "
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
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Return frontend-compatible validation errors."""

    if any(
        item.get("type") == "json_invalid"
        for item in exc.errors()
    ):
        return JSONResponse(
            status_code=400,
            content={"message": "Malformed JSON request."},
        )

    errors = request_errors(exc)

    if request.url.path.startswith("/api/v1/ori/records"):
        # ORI UI uses historical additionalInformation field IDs,
        # but the standalone ORI API receives an unwrapped object.
        errors = {
            f"additionalInformation.{field}": message
            for field, message in errors.items()
        }

    return JSONResponse(
        status_code=422,
        content={"errors": errors},
    )


@app.exception_handler(AFPValidationFailure)
async def invalid_afp(
    _request: Request,
    exc: AFPValidationFailure,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"errors": exc.errors},
    )


@app.exception_handler(AFPIntegrationPending)
async def pending_integration(
    _request: Request,
    _exc: AFPIntegrationPending,
) -> JSONResponse:
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
    """Never expose constraint names or database values."""

    return JSONResponse(
        status_code=409,
        content={"message": "Database constraint conflict."},
    )



@app.exception_handler(SQLAlchemyError)
async def database_unavailable(
    _request: Request,
    exc: SQLAlchemyError,
) -> JSONResponse:
    """Temporary local diagnostic; never expose database details to clients."""

    original = getattr(exc, "orig", None)
    diagnostic = getattr(original, "diag", None)

    print("\n=== AFP LOCAL DATABASE ERROR ===")
    print("SQLAlchemy exception:", type(exc).__name__)
    print(
        "PostgreSQL exception:",
        type(original).__name__ if original else "N/A",
    )
    print(
        "SQLSTATE:",
        getattr(original, "sqlstate", None),
    )
    print(
        "Table:",
        getattr(diagnostic, "table_name", None),
    )
    print(
        "Column:",
        getattr(diagnostic, "column_name", None),
    )
    print(
        "Constraint:",
        getattr(diagnostic, "constraint_name", None),
    )
    print("================================\n")

    return JSONResponse(
        status_code=503,
        content={
            "message": "Database operation unavailable."
        },
    )



@app.exception_handler(Exception)
async def internal_error(
    _request: Request,
    _exc: Exception,
) -> JSONResponse:
    """Do not expose clinical data, SQL details, or tracebacks."""

    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error."},
    )


app.include_router(afp_router)
app.include_router(ori_router)
