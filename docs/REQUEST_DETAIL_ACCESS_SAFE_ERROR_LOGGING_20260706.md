# Request Detail Access Safe Error Logging - 2026-07-06

Status: Implemented as a scoped authenticated staff-route production-readiness hardening slice. `app/api/requests/[id]/detail-access/route.ts` now uses `logServerError` for unexpected request detail access verification failures and returns a generic staff-facing error message.

## What Changed

- Updated the request detail access route catch block to log unexpected verification failures through the shared redacted server error helper.
- Kept the log context intentionally small: route label, whether a request id was present, and whether an active parish cookie was present.
- Expanded `lib/server/requestDetailAccessRouteWiring.test.ts` with source-level checks for safe logging and this documentation boundary.

## What Changed Plain English

If the request detail guard has an unexpected server problem, staff now see a simple message instead of raw database or internal error text. Developers still get a redacted troubleshooting log.

## Safety Boundary

- Preserved active-parish-aware request detail authorization.
- Preserved the existing `Request not found.` response for denied or missing request detail access.
- Preserved explicit primary parish fallback only when no active parish cookie exists.
- This does not change request detail authorization, selected parish behavior, request ownership checks, production flags, production access, migrations, operational RLS, records, public intake, AI, exports, storage, signed URLs, certificate generation, automation, Google Calendar behavior, or public trust claims.

## Verification

- Focused request detail access route wiring, shared redaction, and docs validation tests passed: `npm.cmd test -- lib\server\requestDetailAccessRouteWiring.test.ts lib\server\safeErrorLogging.test.ts` with 2 files and 7 tests.
- Quiet lint passed: `npm.cmd run lint -- --quiet`.
- Production build and TypeScript passed: `npm.cmd run build`.
- Full-suite verification passed: `npm.cmd test -- --reporter=dot` with 418 test files and 1,790 tests.
