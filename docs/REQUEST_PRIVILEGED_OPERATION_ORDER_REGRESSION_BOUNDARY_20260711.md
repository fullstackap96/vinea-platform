# Request Privileged Operation Order Regression Boundary - 2026-07-11

Decision: `REQUEST_PRIVILEGED_OPERATION_ORDER_REGRESSION_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified in repository tests without production access or runtime behavior changes.

## Protected Order

The automatic source guard discovers all directly authenticated mutation methods under `app/api/requests/**/route.ts`. The current inventory covers **19 privileged request-mutation methods** and requires this order:

1. Authenticate the staff request.
2. Construct the server-only service-role client.
3. Resolve request scope through `loadStaffScopedRequestDetailAccess` or `loadStaffScopedRequestDocumentAccess`.
4. Return generic `Request not found.` guidance when scope resolution fails.
5. Use `access.requestId` for downstream work.
6. Complete the denial boundary before the first privileged side effect.

The recognized side effects include database insert, update, upsert, and delete operations; storage upload or cleanup; and family portal-token creation.

## Resolver Contract

Both approved resolvers require exact membership-derived active parish context when a parish is selected. They reject ignored or mismatched parish hints, load the request's parishioner relationship, and compare the parishioner's parish to the authorized parish before returning an access DTO.

## Coverage And Limits

This guard catches new directly authenticated request mutation methods automatically and fails when a method omits or reorders the approved request-scope boundary. It complements the repository-wide same-origin and service-client authentication-order guards.

It **does not replace route-specific validation** for request type, document identity, workflow-step ownership, bounded bodies, field allowlists, partial-success reporting, audit redaction, provider boundaries, or storage cleanup. Those remain covered by focused runtime and source tests.

## Verification Boundary

- No production access.
- No database or storage operation.
- No communication, provider, Calendar, export, AI, or certificate action.
- No migration or operational RLS change.
- No production-sensitive flag change.

Rollback is test/docs-only: remove the guard and this evidence file. Runtime behavior is unchanged.
