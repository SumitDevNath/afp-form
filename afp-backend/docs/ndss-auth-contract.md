# AFP — NDSS Authentication and Authorization Contract

## Status

BLOCKED — Production authentication and facility ownership contracts
have not been confirmed.

Phase 7 provides a provisional role policy and fail-closed identity
dependency. It does not enable production AFP API access.

## Existing Architecture

- AFP is embedded in the existing NDSS Facility Portal.
- Users are already authenticated by the approved DGHS/NDSS system.
- No separate AFP login or independently issued AFP JWT is allowed.
- NDSS uses a microservice architecture.
- AFP deployment and case-service ownership remain to be confirmed.

## Development Proof of Concept

Previous development work used:

GET /api/auth/api/v1/auth/validate

with a Bearer token.

A development response exposed role and facility_id.

This does NOT establish that:

- The endpoint is approved for this AFP service.
- The same token can be reused by the NDSS Facility Portal.
- The token audience is suitable for AFP.
- The response is trusted without additional validation.
- The production authentication and authorization rules are finalized.

## Provisional Facility Role Permissions

The currently stated rules are:

- Create: permitted by role, subject to approved case-linkage checks.
- Read: permitted by role, subject to approved resource access.
- Update: permitted by role, subject to approved resource access.
- Delete: prohibited.

All other roles are denied until explicitly approved.

These are provisional rules, not a finalized production policy.

## Questions Requiring NDSS Confirmation

### 1. Identity Validation

- Which exact authentication mechanism does the NDSS Facility Portal use?
- What credential may this AFP service receive?
- Is token validation handled by an approved gateway or the AFP service?
- Is the development DGHS validation endpoint approved for this service?
- What is the exact production endpoint and HTTP contract, if applicable?
- What headers, timeout, and error behavior are required?
- What are the trusted issuer, audience, and token lifetime rules?
- How is token revocation handled?
- How are service-to-service requests authenticated?

### 2. Identity Response

- What is the approved user identifier field?
- What is the exact role representation?
- What is the facility identifier type and canonical format?
- Can users belong to multiple facilities?
- How are missing or inactive facilities represented?

### 3. Authorization

- What roles can create, read, and update AFP investigations?
- Is the facility role prohibited from deleting investigations?
- Can a facility user access only investigations from their own facility?
- Are referrals or transfers accessible across facilities?
- What rules govern district or national surveillance users?
- Which service is authoritative for case ownership?
- Are resource authorization checks provided by an existing NDSS API?

### 4. Investigation and Case Linking

- What is the canonical NDSS case identifier?
- Which service owns that identifier?
- How does AFP reference an existing case?
- How is the creator/owner facility established?
- How are ownership changes and record transfers handled?

### 5. Security and Operations

- Approved CORS origins and deployment topology.
- TLS and trusted reverse proxy configuration.
- Safe audit event requirements.
- Token validation timeout and outage handling.
- Request-size and rate-limit controls.
- Expected 401, 403, 404, and 503 response contracts.
- Approved mechanisms for avoiding unauthorized case disclosure.

## Rules Until Approval

- Keep the Phase 6 local development API disabled in deployment.
- Never use credentials from an unrelated application.
- Never trust role or facility_id sent in the frontend JSON body.
- Never derive authorization from a record ID alone.
- Never log authorization tokens or clinical payloads.
- Never expose a production AFP investigation route without approved
  identity and resource authorization.
- Do not add an AFP DELETE endpoint.
- Do not claim completion of secure NDSS integration.

## Required Acceptance Evidence

Before production integration, obtain:

1. Approved authentication contract.
2. Approved identity-response example with credentials redacted.
3. Approved role/operation matrix.
4. Confirmed case and facility ownership rules.
5. Approved patient/case linking contract.
6. Successful authorized and unauthorized integration tests.

## Next Action

Review this contract with the NDSS senior developer and obtain
approval of the missing identity and resource-access rules.
