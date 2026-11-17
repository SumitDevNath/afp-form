"""Local AFP investigation API.

Full frontend payload persistence is local-development-only.
Authentication and NDSS ownership integration remain pending.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import require_local_afp_api
from app.db.session import get_db_session
from app.schemas.afp import AFPFormData
from app.schemas.api import AFPInvestigationRead
from app.services.afp import AFPInvestigationNotFound
from app.services.local_complete import (
    create_local_full_afp,
    get_local_full_afp,
    update_local_full_afp,
)
from app.utils.owned_response import to_owned_read


router = APIRouter(
    prefix="/api/v1/afp/investigations",
    tags=["AFP local development"],
    dependencies=[Depends(require_local_afp_api)],
)


@router.post(
    "",
    response_model=AFPInvestigationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_afp(
    payload: AFPFormData,
    session: AsyncSession = Depends(get_db_session),
) -> AFPInvestigationRead:
    """Create and validate a complete local AFP record."""

    record = await create_local_full_afp(
        session,
        payload.model_dump(
            mode="json",
            by_alias=True,
        ),
        local_dev_mode=True,
    )

    return to_owned_read(record)


@router.get(
    "/{investigation_id}",
    response_model=AFPInvestigationRead,
)
async def read_afp(
    investigation_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> AFPInvestigationRead:
    """Retrieve the complete locally stored form."""

    record = await get_local_full_afp(
        session,
        investigation_id,
        local_dev_mode=True,
    )

    if record is None:
        raise AFPInvestigationNotFound(
            "AFP investigation not found"
        )

    return to_owned_read(record)


@router.put(
    "/{investigation_id}",
    response_model=AFPInvestigationRead,
)
async def replace_afp(
    investigation_id: UUID,
    payload: AFPFormData,
    session: AsyncSession = Depends(get_db_session),
) -> AFPInvestigationRead:
    """Atomically update the complete locally stored form."""

    record = await update_local_full_afp(
        session,
        investigation_id,
        payload.model_dump(
            mode="json",
            by_alias=True,
        ),
        local_dev_mode=True,
    )

    return to_owned_read(record)
