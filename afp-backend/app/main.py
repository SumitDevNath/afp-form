
from fastapi import FastAPI


app = FastAPI(
    title="AFP Investigation API",
    description=(
        "Acute Flaccid Paralysis (AFP) investigation "
        "backend for future NDSS integration."
    ),
)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Return the basic application liveness status."""
    return {
        "status": "ok",
        "service": "afp-backend",
        "version": "0.1.0",
    }
