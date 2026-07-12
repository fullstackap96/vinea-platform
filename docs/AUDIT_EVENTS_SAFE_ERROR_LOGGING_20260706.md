# Audit Events Safe Error Logging - 2026-07-06

Status: Implemented as a scoped authenticated staff-route production-readiness hardening slice.

## What Changed

- Updated `app/api/audit-events/route.ts` so unexpected audit-event read failures use `logServerError`.
- Updated `app/api/audit-events/route.ts` so unexpected audit-event write failures use `logServerError`.
- Kept the existing missing-`audit_events` migration guidance responses unchanged.
- Added focused route coverage in `lib/server/auditEventsRoute.test.ts` proving raw database error text is not returned to the client and sensitive-looking log values are redacted.

## Plain-English Summary

If Vinea cannot load or save audit events because of an unexpected server/database error, staff now see a plain failure message instead of raw database/provider details. Developers still get a safe redacted log entry for troubleshooting.

## Safety Boundary

This slice does not change audit-event authorization, active-parish scope, request ownership checks, RLS, migrations, exports, AI, storage, document access, public intake routing, Google Calendar behavior, certificate generation, automation, production monitoring, or public trust claims.

## Verification

- Focused audit-event and shared redaction tests passed: `npm.cmd test -- lib\server\auditEventsRoute.test.ts lib\server\safeErrorLogging.test.ts` with 2 files and 12 tests.
- Quiet lint, production build, and full-suite verification are required before this slice is considered complete in build status.

## Manual QA

- Optional non-production smoke: sign in as safe staff, temporarily force an unexpected audit-event query/write failure, and confirm the API returns a generic message while server logs contain only redacted details.
