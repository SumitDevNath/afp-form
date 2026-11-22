
"""Start the local AFP API using a Psycopg-compatible event loop."""

import asyncio
import sys

import uvicorn


def main() -> None:
    config = uvicorn.Config(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        access_log=False,
        log_level="info",
    )

    server = uvicorn.Server(config)

    # Psycopg 3 async requires SelectorEventLoop on Windows.
    loop_factory = (
        asyncio.SelectorEventLoop
        if sys.platform == "win32"
        else None
    )

    with asyncio.Runner(loop_factory=loop_factory) as runner:
        runner.run(server.serve())


if __name__ == "__main__":
    main()
