# AFP Case Investigation Backend

Backend application for the Acute Flaccid Paralysis (AFP)
Case Investigation Form.

The application is intended for future integration with
Bangladesh's National Disease Surveillance System (NDSS).

## Technology

- Python 3.13
- FastAPI
- Pydantic v2
- Uvicorn

Planned backend technologies:

- PostgreSQL
- SQLAlchemy 2.x
- Psycopg 3
- Alembic
- pytest
- HTTPX

## Project Status

The application currently provides only an HTTP health check.

Database persistence, business validation, investigation
endpoints, and NDSS security integration are not implemented.

## Local Development

Environment: Windows with Git Bash.

### 1. Create a Python virtual environment

```bash
py -3.13 -m venv .venv
```

### 2. Activate the virtual environment

```bash
source .venv/Scripts/activate
```

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Start the development server

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Local URLs

Application health:

http://127.0.0.1:8000/health

Interactive API documentation:

http://127.0.0.1:8000/docs

OpenAPI specification:

http://127.0.0.1:8000/openapi.json

## Health Check

The `/health` endpoint returns:

```json
{
  "status": "ok"
}
```

This checks the running application process only.

It does not establish database readiness or the availability
of NDSS dependencies.

## Security and Integration

The AFP backend will reuse the approved NDSS authentication
and authorization integration.

It will not introduce a separate authentication server.

Patient information and credentials must not be committed
to the repository or written to development logs.

Protected investigation endpoints must not be enabled
without approved authorization controls.
