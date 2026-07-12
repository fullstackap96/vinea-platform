# Request Header And Intake Details Single-Flight Boundary

Decision: `REQUEST_HEADER_AND_INTAKE_DETAILS_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without changing requests.

## Protected Request Operations

### Status

The Request Detail parent now owns one synchronous status lock shared by segmented status controls and the confirmed Mark Complete path. The lock is acquired before the selected-parish status Server Action. Status controls expose a shared busy state until persistence and refresh handling finish.

### Waiting On

Waiting On save and clear use one synchronous lock. Clear no longer blanks the visible selection before persistence succeeds. Returned or thrown failures retain the prior visible value and existing curated guidance, allowing staff to retry without guessing whether the request changed.

### Intake Details

The multi-field Baptism, Funeral, Wedding, and OCIA intake-details editor acquires a synchronous lock before its existing selected-parish Server Action and releases in `finally`. Save and Cancel remain disabled while persistence is active.

## Partial-Success Guidance

Persistence and view refresh are now reported separately. If status or intake details persist but activity/view refresh fails, staff receive explicit partial-success guidance telling them the write succeeded and to refresh before editing again. This avoids encouraging a duplicate write after confirmed persistence.

## Preserved Boundaries

All changes remain staff-reviewed. Existing authentication, active-parish membership, same-parish request ownership, input validation, request-type detail persistence, audit metadata, status confirmation, and safe error allowlists remain authoritative.

This is same-page browser concurrency protection. It is not durable server idempotency, cross-tab/device replay protection, a database transaction across detail tables, or automation.

No production or shared-QA access, request mutation, credential use, communication send, AI call, export, storage access, signed URL creation, provider or Calendar call, migration, operational RLS change, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/requestHeaderAndIntakeDetailsSingleFlightBoundary.test.ts` locks parent-level status exclusion, status-control pending state, shared Waiting On save/clear exclusion, post-persistence visible clearing, intake-details acquisition/release, and partial-success guidance. Existing Request Action tests continue to cover active-parish authorization, persistence confirmation, and audit ordering.
