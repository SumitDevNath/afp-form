"""Independent, local-development-only ORI persistence."""

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.afp import ORIRecord
from app.schemas.validation import validate_ori_form
from app.services.afp import AFPValidationFailure


def _validated_payload(payload: dict[str, Any]) -> dict[str, Any]:
    result = validate_ori_form(payload)
    if not result.is_valid:
        raise AFPValidationFailure(result.errors)
    assert result.data is not None
    return result.data.model_dump(mode="json", by_alias=True)


async def create_ori_record(
    session: AsyncSession, payload: dict[str, Any]
) -> ORIRecord:
    snapshot = _validated_payload(payload)
    async with session.begin():
        record = ORIRecord(payload=snapshot)
        session.add(record)
        await session.flush()
        record_id = record.id
    return (await session.execute(select(ORIRecord).where(ORIRecord.id == record_id))).scalar_one()


async def get_ori_record(session: AsyncSession, record_id: UUID) -> ORIRecord | None:
    return await session.get(ORIRecord, record_id)


async def update_ori_record(
    session: AsyncSession, record_id: UUID, payload: dict[str, Any]
) -> ORIRecord | None:
    snapshot = _validated_payload(payload)
    async with session.begin():
        record = (await session.execute(
            select(ORIRecord).where(ORIRecord.id == record_id).with_for_update()
        )).scalar_one_or_none()
        if record is None:
            return None
        record.payload = snapshot
        record.updated_at = datetime.now(timezone.utc)
        await session.flush()
    return (await session.execute(select(ORIRecord).where(ORIRecord.id == record_id))).scalar_one()
