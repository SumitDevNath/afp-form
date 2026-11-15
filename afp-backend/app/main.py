"""FastAPI application entry point for AFP investigations."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.session import engine


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Release database connection resources on shutdown."""

    try:
        yield
    finally:
        await engine.dispose()


app = FastAPI(
    title="AFP Investigation API",
    description=(
        "Acute Flaccid Paralysis (AFP) investigation "
        "backend for future NDSS integration."
    ),
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Return basic application liveness status."""

    return {
        "status": "ok",
        "service": "afp-backend",
    }