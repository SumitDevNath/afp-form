
"""No live DGHS requests. Test provisional rules and fail-closed default."""

from typing import Annotated

import pytest
from fastapi import Depends, FastAPI, HTTPException
from httpx import ASGITransport, AsyncClient

from app.security.authorization import (
    AFPOperation,
    block_unconfirmed_ndss_workflow,
    check_provisional_facility_role,
)
from app.security.identity import get_verified_ndss_principal
from app.security.principal import NDSSPrincipal


def principal(
    role: str = "facility",
    facility: str | None = "facility-A",
) -> NDSSPrincipal:
    return NDSSPrincipal(
        role=role,
        facility_ref=facility,
        subject_ref="test-only",
    )


def test_unverified_identity_cannot_pass_role_check():
    with pytest.raises(HTTPException) as exc:
        check_provisional_facility_role(
            None,
            AFPOperation.READ,
        )

    assert exc.value.status_code == 401
    assert exc.value.headers == {
        "WWW-Authenticate": "Bearer"
    }


@pytest.mark.parametrize(
    "role, facility",
    [
        ("viewer", "facility-A"),
        ("admin", "facility-A"),
        ("facility", None),
        ("facility", ""),
    ],
)
def test_unapproved_roles_or_missing_facility_denied(
    role,
    facility,
):
    with pytest.raises(HTTPException) as exc:
        check_provisional_facility_role(
            principal(role, facility),
            AFPOperation.CREATE,
        )

    assert exc.value.status_code == 403


@pytest.mark.parametrize(
    "operation",
    [
        AFPOperation.CREATE,
        AFPOperation.READ,
        AFPOperation.UPDATE,
    ],
)
def test_facility_role_provisional_operation_only(operation):
    identity = principal()

    assert (
        check_provisional_facility_role(identity, operation)
        is identity
    )

    with pytest.raises(HTTPException) as exc:
        block_unconfirmed_ndss_workflow()

    assert exc.value.status_code == 503


def test_facility_delete_always_denied():
    with pytest.raises(HTTPException) as exc:
        check_provisional_facility_role(
            principal(),
            AFPOperation.DELETE,
        )

    assert exc.value.status_code == 403


def test_no_case_ownership_guess_even_for_matching_facility():
    with pytest.raises(HTTPException) as exc:
        block_unconfirmed_ndss_workflow()

    assert exc.value.status_code == 503


def probe_app() -> FastAPI:
    """Create a temporary application used only in these tests."""

    application = FastAPI()

    @application.get("/probe")
    async def probe(
        identity: Annotated[
            NDSSPrincipal,
            Depends(get_verified_ndss_principal),
        ],
    ):
        check_provisional_facility_role(
            identity,
            AFPOperation.READ,
        )

        block_unconfirmed_ndss_workflow()

    return application


@pytest.mark.asyncio
async def test_no_bearer_returns_401():
    application = probe_app()

    async with AsyncClient(
        transport=ASGITransport(app=application),
        base_url="http://test",
    ) as client:
        response = await client.get("/probe")

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


@pytest.mark.asyncio
async def test_unverified_bearer_returns_503_not_authenticated():
    application = probe_app()

    async with AsyncClient(
        transport=ASGITransport(app=application),
        base_url="http://test",
    ) as client:
        response = await client.get(
            "/probe",
            headers={
                "Authorization": "Bearer dummy-test-token"
            },
        )

    assert response.status_code == 503
    assert "dummy-test-token" not in response.text


@pytest.mark.asyncio
async def test_test_only_identity_override_does_not_grant_case_access():
    application = probe_app()

    async def test_identity():
        return principal()

    application.dependency_overrides[
        get_verified_ndss_principal
    ] = test_identity

    async with AsyncClient(
        transport=ASGITransport(app=application),
        base_url="http://test",
    ) as client:
        response = await client.get("/probe")

    assert response.status_code == 503

    application.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_test_only_wrong_role_returns_403():
    application = probe_app()

    async def test_identity():
        return principal("unapproved-role")

    application.dependency_overrides[
        get_verified_ndss_principal
    ] = test_identity

    async with AsyncClient(
        transport=ASGITransport(app=application),
        base_url="http://test",
    ) as client:
        response = await client.get("/probe")

    assert response.status_code == 403

    application.dependency_overrides.clear()
