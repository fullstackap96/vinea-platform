# Public Intake Safe Error Logging - 2026-07-06

Status: Implemented as a scoped public-route production-readiness hardening slice.

## What Changed

- Updated `app/api/intake/route.ts` so unexpected public intake submission failures use `logServerError`.
- Preserved durable rate limiting before body parsing.
- Preserved public intake routing gate behavior and legacy primary-parish fallback behavior.
- Replaced unchecked route-local cleanup with the checked server-only `cleanupPartialPublicIntake` recovery helper before returning the generic public failure response.
- Expanded `lib/server/publicIntakeRuntimeRouteWiring.test.ts` so the route must keep generic server errors and cannot reintroduce raw `console.error('Public intake submission failed', error)`.

## Plain-English Summary

If a public family request fails unexpectedly, Vinea attempts every partial-row cleanup step, verifies that each expected row was actually deleted, and still gives the family a simple "Could not submit request" message. The server log uses the shared redacted logger and boolean recovery outcomes instead of printing raw ids or error details.

## Safety Boundary

This slice does not change public intake validation, routing, durable rate limiting, successful submission behavior, audit metadata, production flags, migrations, operational RLS, record creation behavior beyond the already-existing public intake submission path, AI, exports, storage, signed URLs, certificate generation, automation, Google Calendar behavior, or public trust claims.

## Verification

- Focused public intake runtime route wiring and shared redaction tests are required for this slice.
- Quiet lint, production build, and full-suite verification are required before this slice is considered complete in build status.
