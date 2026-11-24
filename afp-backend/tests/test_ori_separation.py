"""Verify strict physical separation of AFP and standalone ORI storage.

Run ONLY against a local test database after Alembic 0005.
"""

import pytest
from sqlalchemy import text

from app.core.config import get_settings
from app.db.session import engine
from app.models.afp import AFPInvestigation, ORIRecord


LEGACY_ORI_COLUMNS = {
    "search_for_additional_cases",
    "additional_cases_identified",
    "number_of_additional_cases",
    "outbreak_response_immunization_done",
    "number_of_children_vaccinated",
    "outbreak_response_explanation",
}


def test_afp_orm_has_no_ori_columns():
    columns = set(AFPInvestigation.__table__.columns.keys())
    assert LEGACY_ORI_COLUMNS.isdisjoint(columns)
    assert "payload" in ORIRecord.__table__.columns
    assert "investigation_id" not in ORIRecord.__table__.columns


@pytest.mark.asyncio
async def test_postgresql_has_no_embedded_ori_or_legacy_columns():
    settings = get_settings()
    assert settings.afp_db_name == "afp_test", "Use afp_test only."
    assert settings.afp_db_host in ("localhost", "127.0.0.1", "::1")

    async with engine.connect() as conn:
        columns = (await conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'afp_investigations'
        """))).scalars().all()
        assert LEGACY_ORI_COLUMNS.isdisjoint(set(columns))

        embedded = (await conn.execute(text("""
            SELECT COUNT(*)
            FROM afp_investigations
            WHERE frontend_payload ? 'additionalInformation'
        """))).scalar_one()
        assert embedded == 0

        archive = (await conn.execute(text("""
            SELECT to_regclass('public.legacy_afp_ori_archive')
        """))).scalar_one()
        assert archive is not None

        ori_table = (await conn.execute(text("""
            SELECT to_regclass('public.ori_records')
        """))).scalar_one()
        assert ori_table is not None

    await engine.dispose()
