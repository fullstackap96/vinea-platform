# Public Intake Routing Route Safe Errors - 2026-07-07

## Status

Implemented as a scoped production-readiness hardening slice for the staff-only Public Intake Routing API.

The route now logs unexpected public-intake-routing metadata, domain, verification, and token failures through the shared safe server logging helper before returning stable staff-safe API messages.

2026-07-07 refinement: the route now detects expected Supabase unique-constraint conflicts through a small internal constraint helper while passing the original error object to the safe logger for non-conflict failures. Route response code no longer builds fallback errors from raw `insertError.message` text.

## What Changed

- Updated `app/api/parish/public-intake-routing/route.ts`.
- Updated `lib/server/publicIntakeRoutingRoute.test.ts`.
- Added source-level checks that prevent the route from returning raw `error.message`, `currentError.message`, or `updateError.message` values for unexpected failures.
- Added source-level checks that prevent the route from routing `insertError.message` through conflict-response helpers or rebuilding raw message text as `new Error(message)`.

## Staff/API Behavior

Expected validation, authorization, conflict, and DNS verification-not-yet messages remain available to staff and to the Settings client allowlist.

Expected duplicate-domain, duplicate-token-hash, and duplicate-public-slug cases still return the same stable conflict messages. Unexpected insert/update failures continue through safe server logging and generic staff-safe responses.

Unexpected Supabase/database, DNS resolver, token, route, raw id, or exception details now fall back to stable route messages such as:

- `Could not load public intake routing metadata.`
- `Could not create public intake token.`
- `Could not add public intake domain.`
- `Could not update public intake token.`
- `Could not verify public intake domain.`
- `Could not reset public intake domain verification.`
- `Could not update public intake domain.`
- `Could not update public intake routing metadata.`

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, change Public Intake Routing validation rules, change domain verification semantics, change token hash storage, change one-time token visibility on successful create, wire runtime public intake routing, enable production flags, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust claims.

Runtime public intake routing remains intentionally unwired.

## Verification

- `npm.cmd test -- lib\server\publicIntakeRoutingRoute.test.ts lib\server\publicIntakeRoutingRouteSafeErrorsDoc.test.ts` passed: 2 files, 22 tests.

Manual safe non-production QA should open Parish Settings, confirm Public Intake Routing metadata/domain/token controls still render when authorized, verify expected validation and DNS verification-not-yet messages are still staff-friendly, and if practical force a backend failure to confirm raw Supabase/database, DNS resolver, token, route, raw id, or exception details are not returned by the API.
