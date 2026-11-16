
"""Safely diagnose the local PostgreSQL async connection."""

import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


async def main() -> int:
    from app.core.config import get_settings

    settings = get_settings()

    print("Host:", settings.afp_db_host)
    print("Port:", settings.afp_db_port)
    print("Database:", settings.afp_db_name)
    print("User:", settings.afp_db_user)
    print("Password configured:", bool(settings.afp_db_password.get_secret_value()))

    engine = create_async_engine(
        settings.database_url,
        connect_args={"connect_timeout": 5},
    )

    try:
        async with engine.connect() as connection:
            result = await connection.execute(
                text("SELECT current_database(), current_user")
            )
            database, role = result.one()

            print("Async connection successful.")
            print("Connected database:", database)
            print("Connected role:", role) 

        return 0

    except Exception as exc:
        original = getattr(exc, "orig", exc)
        sqlstate = getattr(original, "sqlstate", None)

        print("Error type:", type(exc).__name__)
        print("Driver error type:", type(original).__name__)
        print("SQLSTATE:", sqlstate or "Not available")

        if sqlstate == "28P01":
            print("Diagnosis: Invalid PostgreSQL credentials.")
        elif sqlstate == "3D000":
            print("Diagnosis: Database does not exist.")
        elif sqlstate == "42501":
            print("Diagnosis: Insufficient database privileges.")
        elif sqlstate == "28000":
            print("Diagnosis: PostgreSQL authentication rejected.")
        else:
            print(
                "Diagnosis: Check connection configuration, "
                "driver compatibility, and network connectivity."
            )

        return 1

    finally:
        await engine.dispose()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
