"""Asynchronous Alembic migration environment."""

import asyncio
from logging.config import fileConfig
import sys

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings
from app.db.base import Base


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Generate PostgreSQL migration SQL without connecting."""

    context.configure(
        dialect_name="postgresql",
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Execute migrations with a synchronous Alembic context."""

    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Connect to PostgreSQL using an async engine."""

    connectable = create_async_engine(
        get_settings().database_url,
        poolclass=pool.NullPool,
        echo=False,
    )

    try:
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)
    finally:
        await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations using a compatible async event loop."""

    loop_factory = (
        asyncio.SelectorEventLoop
        if sys.platform == "win32"
        else None
    )

    with asyncio.Runner(loop_factory=loop_factory) as runner:
        runner.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
