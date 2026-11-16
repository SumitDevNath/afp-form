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

The project now includes:

- SQLAlchemy asynchronous engine.
- Psycopg 3 PostgreSQL driver.
- Request-scoped asynchronous sessions.
- Explicit rollback and session cleanup.
- Environment-based database configuration.
- Alembic asynchronous migration environment.
- Local PostgreSQL connectivity verification.

### Configure PostgreSQL

Create a local PostgreSQL development database, for example:

    afp_dev

Copy .env.example to .env:

    cp .env.example .env

Edit .env and supply the actual PostgreSQL connection settings.

Never commit .env or database credentials.

### Verify Connectivity

From the backend directory with the virtual environment active:

    python -m scripts.check_database

This executes a read-only asynchronous PostgreSQL query.

### Alembic

Verify migration configuration:

    python -m alembic current
    python -m alembic heads

No AFP migrations or application tables are created.

All AFP schema creation will use reviewed Alembic revisions beginning.

### Application

Start the API:

    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Health endpoint:

    GET http://127.0.0.1:8000/health

The health endpoint reports application liveness only.

### Database Session Policy

- Use one AsyncSession per request or task.
- Never share a session across concurrent operations.
- Do not perform blocking database operations in async routes.
- Let service-layer operations explicitly manage commits.
- Roll back failed or unfinished transactions.
- Dispose of database engines during shutdown.
- Keep database logic outside HTTP route handlers.

## Async Service Layer

### Capabilities

- Atomic investigation creation and updates
- Explicit PostgreSQL transaction boundaries
- Eager relationship loading
- Stable healthcare contact identity and ordering
- Complete frontend validation before persistence
- Transaction rollback on failure

### Restrictions

These services are for isolated local development and testing only.

They are not production NDSS submission endpoints.

- Authentication and authorization are not implemented.
- Patient/case linkage has not been confirmed.
- Shared vaccination and travel service integration is pending.
- Screened-out and draft persistence are not approved.
- No public CRUD endpoints exist.

### PostgreSQL Tests

Use a separate database named afp_test.

Apply the existing migration:

    AFP_DB_NAME=afp_test python -m alembic upgrade head

Run service tests:

    AFP_DB_NAME=afp_test python -m pytest -v tests/test_afp_services.py

Run all tests:

    AFP_DB_NAME=afp_test python -m pytest -v tests/

Never run state-changing tests against the development or production database.

## Development HTTP API

Three local-development investigation routes are available:

- POST /api/v1/afp/investigations
- GET /api/v1/afp/investigations/{id}
- PUT /api/v1/afp/investigations/{id}

The original GET /health endpoint remains available.

### Restrictions

These are not approved production NDSS endpoints.

- The local API is disabled by default.
- Local access requires AFP_LOCAL_API_ENABLED=true.
- Only local development/test database names and loopback hosts are accepted.
- Requests require the X-AFP-Local-Dev: true header.
- No DGHS/NDSS user authentication has been implemented.
- No real patient data may be used.
- Shared vaccination/travel data is not persisted.
- Screened-out and draft persistence is not approved.
- POST idempotency is not implemented; do not automatically retry submissions.
- Deployment, CORS, access policies, and request-size controls require further security review.

### Run HTTP Tests

Use the dedicated afp_test database with revision 0001_afp_owned:

    AFP_LOCAL_API_ENABLED=true AFP_DB_NAME=afp_test python -m pytest -v tests/test_afp_api.py

### Run All Tests

    AFP_LOCAL_API_ENABLED=true AFP_DB_NAME=afp_test python -m pytest -v tests/

### Local Development Server

    AFP_LOCAL_API_ENABLED=true python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --no-access-log

### API Response Scope

Responses contain AFP-owned data only.

The response explicitly identifies vaccinationHistory and travelHistory as not persisted.

Authentication, authorization, reference integration, submission orchestration, and durable idempotency remain unresolved.

## NDSS Security Integration Preparation

currently contains provisional authorization scaffolding.

### Implemented

- Normalized NDSS principal representation.
- Fail-closed Bearer credential dependency.
- Provisional facility-role permission checks.
- Explicit denial of DELETE operations.
- Default denial of unconfirmed case/resource access.
- Isolated authentication and authorization tests.
- Documented outstanding production integration contracts.

### Not Yet Implemented

- Approved DGHS/NDSS identity validation.
- Production token verification.
- Confirmed production role matrix.
- Patient/case ownership checks.
- Facility-specific record access.
- Authorized production AFP routes.

### Security Status

BLOCKED — NOT PRODUCTION READY.

The existing local development API remains unchanged
and must remain disabled in deployment.

The new security modules are not wired into the existing API routes.
No production authorization claims are made.

See docs/ndss-auth-contract.md for decisions requiring NDSS approval.

### Run Security Tests

    python -m pytest -v tests/test_ndss_security_contract.py

### Full Regression Suite

Run only against the dedicated PostgreSQL test database:

    AFP_DB_NAME=afp_test AFP_LOCAL_API_ENABLED=true python -m pytest -q tests/

### Next Required Action

Obtain the approved NDSS authentication, case-linkage, and facility
ownership contracts before implementing production identity validation
or protected investigation endpoints.
