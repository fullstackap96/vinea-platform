# Demo Request Safe Error Logging - 2026-07-06

Status: `IMPLEMENTED - PUBLIC ROUTE ERROR REDACTION`

Completion marker: `DEMO_REQUEST_SAFE_ERROR_LOGGING_IMPLEMENTED_20260706`

This slice hardens the public demo-request route so provider failures and unexpected exceptions use safe, redacted server logging and return a generic public fallback message. It does not enable production monitoring, add production flags, access production, apply migrations, change operational RLS, mutate records, send communications beyond the already-existing demo request email behavior, call AI, run exports, access storage, create signed URLs, generate certificates, or make public trust claims.

## What Changed

- Added `lib/server/safeErrorLogging.ts`.
- Added focused tests in `lib/server/safeErrorLogging.test.ts`.
- Added route-level tests in `lib/server/demoRequestRouteSafeErrors.test.ts`.
- Updated `app/api/demo-request/route.ts` to:
  - avoid `any` for JSON parse fallback,
  - log Resend provider failures through `logServerError`,
  - log unexpected failures through `logServerError`,
  - return a generic public fallback instead of provider error text.

## Safety Boundary

The safe logger intentionally keeps the logged error shape small:

- Error name.
- Redacted error message.
- Label-safe extras supplied by the route.

It does not serialize arbitrary provider payloads, request bodies, HTML email contents, token material, database URLs, JWTs, bearer tokens, email addresses, or service credentials.

## Verification

- Focused tests: `npm.cmd test -- lib\server\safeErrorLogging.test.ts lib\server\demoRequestRouteSafeErrors.test.ts`.

## Remaining Work

Other server routes still have raw `console.error` calls. Those should be migrated in small future slices, one route family at a time, with tests and without weakening the existing production-sensitive gates.
