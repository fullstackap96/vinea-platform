# Core Record Create Single-Flight Boundary

Decision: `CORE_RECORD_CREATE_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without creating or changing records.

## Protected Create Flows

- People
- Households
- Mass Intentions
- Sacramental Records

Each create page now acquires a synchronous browser lock before dispatching its existing selected-parish Server Action. Returned and thrown failures use the existing curated staff guidance and release both the lock and visible busy state for retry. Successful creation stays locked through successful navigation to the new record, preventing a second durable create while the destination loads.

The shared forms expose their saving state through `aria-busy` in addition to their existing disabled submit/cancel controls and `Saving...` label.

## Boundary

This prevents rapid duplicate dispatch from one mounted browser form. It is not durable server idempotency across tabs, devices, repeated HTTP requests, or replayed Server Action calls. A future durable idempotency design requires separate review of keys, persistence, expiration, and audit behavior.

Existing validation, active-parish authorization, membership and object scope, Server Actions, safe errors, audit behavior, navigation, and data models are unchanged. Edit forms are outside this create-only slice.

No production or shared-QA access, record creation or mutation, credential use, migration, operational RLS change, provider or Calendar call, communication, export, AI call, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/coreRecordCreateSingleFlightBoundary.test.ts` requires lock acquisition before each create action, safe release for returned and thrown failures, lock retention through successful navigation, and accessible busy semantics on each shared form.
