# API Route Safe Error Regression Guard - 2026-07-07

## Status

Implemented as a source-level production-readiness regression guard.

The guard scans all `app/api/**/route.ts` files and fails the test suite if a route handler returns likely raw database, provider, or exception `.message` text in a 5xx response.

## What Changed

- Added `lib/server/apiRouteSafeErrorRegressionGuard.test.ts`.
- The test recursively scans `app/api`.
- The test blocks common unsafe response patterns:
  - direct `.message` values in 5xx `NextResponse.json(...)` error bodies.
  - catch-derived `message` variables returned in 5xx JSON error bodies.
  - `messageFromError(...)` helpers returned in route JSON error bodies.
  - raw `.message` values returned through plain `Response` bodies.

## Why This Matters

Many production-readiness slices now depend on the same principle: staff, families, and direct API callers should not receive raw Supabase, provider, token, route, raw-id, or exception details when the server fails.

This guard turns that principle into a repeatable test. Future route handlers can still return expected validation, authentication, authorization, conflict, and not-found messages, but unexpected 5xx failures must use stable safe messages and log private details through safe server logging.

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, change route behavior, change staff authentication, change active-parish or membership authorization, mutate records, run exports, call AI, access storage, create signed URLs, touch Google Calendar data, send communications, generate certificates, enable automation, or make public trust claims.

## Verification

- `npm.cmd test -- lib\server\apiRouteSafeErrorRegressionGuard.test.ts`

Manual review should use this guard as a source-level signal, not as a replacement for route-specific QA. Routes that legitimately need user-facing validation details should keep those details outside unexpected 5xx failure paths.
