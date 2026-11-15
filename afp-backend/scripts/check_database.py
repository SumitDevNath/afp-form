"""Verify asynchronous connectivity to local PostgreSQL."""

import asyncio
import sys

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.db.session import AsyncSessionLocal, engine

async def check_database() -> int:
    """Run a read-only query through an async SQLAlchemy session."""

    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                text(
                    "SELECT "
                    "current_database() AS database_name, "
                    "current_user AS role_name, "
                    "current_setting('server_version') "
                    "AS server_version"
                )
            )

            row = result.mappings().one()

            database_name = row["database_name"]
            role_name = row["role_name"]
            server_version = row["server_version"]

            await session.rollback()

        print("PostgreSQL async connection successful.")
        print(f"Database: {database_name}")
        print(f"Role: {role_name}")
        print(f"PostgreSQL server: {server_version}")

        return 0

    except SQLAlchemyError:
        print(
            "Database connection failed. Check the PostgreSQL "
            "service, database name, role, password, "
            "port and access permissions.",
            file=sys.stderr,
        )
        return 1

    finally:
        await engine.dispose()

if __name__ == "__main__":
    loop_factory = (
        asyncio.SelectorEventLoop
        if sys.platform == "win32"
        else None
    )

    with asyncio.Runner(loop_factory=loop_factory) as runner:
        raise SystemExit(runner.run(check_database()))