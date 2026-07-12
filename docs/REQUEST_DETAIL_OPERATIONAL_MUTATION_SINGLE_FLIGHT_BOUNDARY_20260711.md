# Request Detail Operational Mutation Single-Flight Boundary

Decision: `REQUEST_DETAIL_OPERATIONAL_MUTATION_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without changing requests or notes.

## Protected Staff Actions

- Internal Notes creation
- Assignment save
- Next Follow-Up save and clear
- Care Cadence suggested follow-up acceptance

Each component now acquires a synchronous browser lock before calling its existing selected-parish Server Action. Rapid repeat clicks cannot dispatch a second write before React renders the disabled state. Next Follow-Up save and clear share one lock, so competing date decisions cannot overlap.

Returned and thrown failures use the same curated Request Detail guidance and release for retry. Successful operations clear or close their existing drafts, release after persistence, and invoke the existing refresh callback. Editable controls expose an accessible busy state and are disabled while their write is active.

## Preserved Boundaries

All actions remain staff-reviewed. Vinea does not select assignments, create notes, or accept follow-up recommendations automatically. Existing authentication, active-parish membership, same-parish request ownership, validation, persistence confirmation, audit metadata, refresh behavior, and safe error allowlists remain authoritative.

This is same-page browser concurrency protection. It is not durable server idempotency, cross-tab/device replay protection, scheduled automation, or a database transaction.

No production or shared-QA access, request/note mutation, credential use, communication send, provider or Calendar call, AI call, export, storage access, signed URL creation, migration, operational RLS change, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/requestDetailOperationalMutationSingleFlightBoundary.test.ts` locks acquisition before each action, shared save/clear exclusion, thrown and returned failure guidance, retry release, and accessible pending controls. Existing Request Action suites continue to cover selected-parish authorization, persistence confirmation, and audit ordering.
