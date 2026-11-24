"""Local-development ORI API, entirely separate from AFP investigations."""

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import APIProblem, require_local_afp_api
from app.db.session import get_db_session
from app.models.afp import ORIRecord
from app.schemas.afp import ORIFormData
from app.schemas.api import ORIRecordRead
from app.services.ori import create_ori_record, get_ori_record, update_ori_record

router = APIRouter(
    prefix="/api/v1/ori/records",
    tags=["ORI local development"],
    dependencies=[Depends(require_local_afp_api)],
)


def _response(record: ORIRecord) -> ORIRecordRead:
    return ORIRecordRead.model_validate({
        "id": record.id,
        "createdAt": record.created_at,
        "updatedAt": record.updated_at,
        "data": ORIFormData.model_validate(record.payload),
    })


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ORIRecordRead)
async def create_ori(
    payload: ORIFormData,
    session: AsyncSession = Depends(get_db_session),
) -> ORIRecordRead:
    return _response(await create_ori_record(
        session, payload.model_dump(mode="json", by_alias=True)
    ))


@router.get("/{record_id}", response_model=ORIRecordRead)
async def read_ori(
    record_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> ORIRecordRead:
    record = await get_ori_record(session, record_id)
    if record is None:
        raise APIProblem(404, "ORI record not found.")
    return _response(record)


@router.put("/{record_id}", response_model=ORIRecordRead)
async def replace_ori(
    record_id: UUID,
    payload: ORIFormData,
    session: AsyncSession = Depends(get_db_session),
) -> ORIRecordRead:
    record = await update_ori_record(
        session, record_id, payload.model_dump(mode="json", by_alias=True)
    )
    if record is None:
        raise APIProblem(404, "ORI record not found.")
    return _response(record)
