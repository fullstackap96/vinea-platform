# Daily Brief Manual Send Single-Flight Boundary

Decision: `DAILY_BRIEF_MANUAL_SEND_SINGLE_FLIGHT_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without sending email or calling the provider.

## Protected Staff Action

The Parish Settings manual Daily Brief action now acquires a synchronous browser lock after staff confirmation and before calling `POST /api/parish/daily-brief`. A rapid repeated confirmation cannot dispatch a second provider request before React renders pending state. The lock is now shared with Parish Settings save so recipient/configuration persistence cannot overlap delivery.

The shared confirmation dialog remains visible during delivery, displays `Sending brief...`, and disables confirm, cancel, close, and Escape dismissal while the request is in flight. After the existing route result and settings refresh settle, the lock releases through `finally`, the dialog closes, and the existing staff-visible success or safe failure guidance remains available.

## Preserved Server Authority

The existing authenticated, selected-parish Daily Brief route remains authoritative for parish scope, configured recipient resolution, content, provider delivery, provider message-id confirmation, parish state persistence, audit behavior, and partial-success guidance. Scheduled delivery settings and automation behavior are unchanged.

## Boundary

This prevents immediate duplicate dispatch from one mounted Parish Settings screen. It is not provider-level idempotency, durable server idempotency, cross-tab/device replay protection, or automatic resend protection.

No production or shared-QA access, email or communication send, credential use, provider or Calendar call, settings/request/audit mutation, migration, operational RLS change, AI call, export, storage access, certificate action, production-sensitive flag change, or public trust claim occurred.

## Verification

`lib/server/dailyBriefManualSendSingleFlightBoundary.test.ts` verifies lock acquisition before route dispatch, `finally` release, busy confirmation behavior, post-settlement close, and preserved result guidance. Existing Daily Brief route and confirmation tests continue to cover authorization, selected-parish behavior, recipient safety, delivery persistence, partial success, and staff confirmation.

Completed local checks:

- focused Daily Brief, delivery persistence, and same-origin suite: 5 files / 43 tests passed;
- ESLint passed;
- all-file TypeScript check passed;
- all 15 production-sensitive gate artifacts remained linked and locked;
- Next.js 16.2.10 production build passed with all 56 static pages generated; and
- `git diff --check` passed.

The immediately preceding repository-wide baseline also passed 775 files / 3,276 tests before this focused caller-only change.
