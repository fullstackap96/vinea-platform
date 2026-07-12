# Google Calendar Mutation Single-Flight Boundary

Decision: `GOOGLE_CALENDAR_MUTATION_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without calling Google Calendar.

## Protected Actions

Request Detail now uses one synchronous browser lock across:

- Create Google Calendar Event
- Create anyway after staff review of a conflict
- Update Calendar Event
- Delete Calendar Event

The lock is checked before local eligibility validation and acquired after validation but before the authenticated Calendar route call. A rapid repeat click or a competing Calendar action cannot dispatch another provider mutation before React renders its disabled state. The lock releases in every existing `finally` path after success, provider failure, safe parse failure, conflict response, or unexpected client failure.

The Calendar section continues to derive one visible busy state from create, update, and delete state. Every mutation control is disabled together, and the section now exposes that busy state accessibly.

## Preserved Authorization And Behavior

The browser still sends only the request-bound command data already required by each route. The server remains authoritative for staff authentication, selected active parish membership, same-parish request ownership, selected-parish Google integration lookup, and safe generic denial.

Confirmed sacramental scheduling requirements, staff-reviewed conflict override, provider behavior, conflict display, saved event links, and success/failure guidance are unchanged.

## Boundary

This prevents immediate competing Calendar writes from one mounted Request Detail screen. It is not provider-level idempotency, durable server idempotency, cross-tab/device replay protection, or a transaction spanning Google Calendar and Vinea persistence. Stronger guarantees require a separately reviewed durable provider-operation design.

No production or shared-QA access, Google credential use, provider call, Calendar/request/integration/audit mutation, migration, operational RLS change, communication send, AI call, export, storage access, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/googleCalendarMutationSingleFlightBoundary.test.ts` verifies shared lock acquisition before all three Calendar route calls, release through `finally`, conflict override reuse, request-bound payloads, shared control disabling, accessible busy state, and the documented no-idempotency boundary. Existing selected-parish Calendar route tests continue to cover authentication, active-parish membership, request ownership, integration selection, conflicts, and safe failures.
