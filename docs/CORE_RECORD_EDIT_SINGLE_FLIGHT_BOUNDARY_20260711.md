# Core Record Edit Single-Flight Boundary

Decision: `CORE_RECORD_EDIT_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without changing records.

## Protected Edit Flows

- People
- Households, including mutually exclusive save and add-member operations
- Mass Intentions
- Sacramental Records, including the record update and person-link update sequence

Each edit page now acquires a synchronous browser lock before its first selected-parish Server Action. Returned and thrown failures retain the existing operation-specific, curated staff guidance and release the lock for retry. Successful saves remain visibly pending through detail-page navigation.

Household save and add-member operations share one lock so they cannot overlap. The Household form disables save, cancel, and add-member controls while either operation is active. The existing sequential member updates and partial-success guidance remain intact.

Sacramental Record edits keep the record update and person-link update inside one guarded sequence. A failure in either step retains the existing staff guidance; Vinea does not claim transactionality or hide a possible first-step success.

## Boundary

This is same-page browser concurrency protection. It is not durable server idempotency, a database transaction across multi-step writes, or cross-tab/device replay protection. Those stronger guarantees require separate persistence and data-integrity review.

Existing validation, active-parish authorization, membership and object ownership checks, Server Actions, compensation behavior, audit behavior, navigation, and data models remain unchanged.

No production or shared-QA access, record mutation, credential use, migration, operational RLS change, provider or Calendar call, communication, export, AI call, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/coreRecordEditSingleFlightBoundary.test.ts` locks acquisition order, failure release, Household operation exclusion, multi-step ordering, accessible busy controls, and operation-specific partial-success guidance. Existing action suites continue to cover selected-parish ownership and data-integrity behavior.
