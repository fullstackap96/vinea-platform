# Daily Queue Mutation Single-Flight Boundary

Decision: `DAILY_QUEUE_MUTATION_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without writing records or contacting an external service.

## Protected Daily Surfaces

The Communication Center now shares one synchronous browser lock across communication-touchpoint logging and follow-up-date updates. The Intake queue shares one lock across request quick triage and Mass intention quick triage.

Each lock is checked and acquired before its authenticated API command. A rapid repeat click or a click on a different visible row cannot dispatch a competing write before React renders disabled state. Locks release through existing `finally` paths after success, handled failure, or an unexpected client failure.

The open staff-reviewed form exposes accessible busy state and freezes its editable fields and action controls while persistence settles. Other row edit controls are disabled during the same interval, preventing an operator from replacing the visible editor while its reviewed snapshot is in flight.

## Preserved Server Authority

The Communication Center continues to call only the request-scoped communications API. The Intake queue continues to call only the request and Mass intention intake-triage APIs. Existing authentication, selected active-parish membership, same-parish target ownership, validation, audit metadata, ordered persistence, safe client guidance, and refresh behavior are unchanged.

## Boundary

This is immediate same-screen exclusion. It is not durable server idempotency, cross-tab/device replay protection, or database transactionality. Those stronger guarantees require separately reviewed persistence designs.

No production or shared-QA access, communication send, provider or Calendar call, record mutation, migration, operational RLS change, AI call, export, storage access, signed URL, certificate generation, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/dailyQueueMutationSingleFlightBoundary.test.ts` verifies lock ordering before every queue API command, shared exclusion within each surface, `finally` release, frozen staff-reviewed form controls, and preservation of request-scoped authenticated callers. Existing Communications and Intake route suites continue to cover active-parish authorization, target ownership, validation, audit metadata, persistence, safe errors, and same-origin enforcement.

Completed local checks:

- focused daily-queue and authorization suite: 8 files / 71 tests passed;
- full regression suite: 775 files / 3,276 tests passed;
- ESLint passed;
- all-file TypeScript check passed;
- all 15 production-sensitive gate artifacts remained linked and locked;
- Next.js 16.2.10 production build passed with all 56 static pages generated; and
- `git diff --check` passed.
