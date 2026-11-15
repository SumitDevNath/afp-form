"""Asynchronous PostgreSQL engine and session management."""

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

settings = get_settings()

# create_async_engine() supplies asynchronous PostgreSQL connections; async_sessionmaker() creates independent sessions.
engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_pre_ping=True,
    connect_args={
        "connect_timeout": 5,
    },
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    expire_on_commit=False,
)

async def get_db_session() -> AsyncIterator[AsyncSession]:
    """Provide an isolated database session per request."""

    async with AsyncSessionLocal() as session:
        try:
            yield session

        except Exception:
            await session.rollback()
            raise

        finally:
            if session.in_transaction():
                await session.rollback()
