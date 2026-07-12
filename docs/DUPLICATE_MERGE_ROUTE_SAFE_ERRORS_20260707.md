# Duplicate Merge Route Safe Errors - 2026-07-07

## Status

Implemented as a scoped production-readiness hardening slice for the People and Household duplicate review APIs.

The duplicate review load and merge routes now log unexpected database failures through the shared safe server logging helper and return stable staff-safe API messages instead of raw database error text.

## What Changed

- Updated `app/api/people/duplicates/route.ts`.
- Updated `app/api/households/duplicates/route.ts`.
- Updated `lib/server/peopleDuplicatesRoute.test.ts`.
- Updated `lib/server/householdDuplicatesRoute.test.ts`.
- Added source-level checks that prevent duplicate load/merge failure paths from returning raw Supabase/database `.message` values.

## Staff/API Behavior

Expected staff messages remain unchanged for authentication, authorization, parish setup, invalid merge requests, missing records, required person names, and required household names.

Unexpected load or merge failures now fall back to stable messages:

- `Could not load duplicate review.`
- `Could not merge these people.`
- `Could not load household review.`
- `Could not merge these households.`

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, change active-parish or membership authorization, change duplicate candidate detection, change merge semantics, add new merge actions, mutate records beyond the existing staff-triggered duplicate merge routes, run exports, call AI, access storage, create signed URLs, touch Google Calendar data, send communications, generate certificates, enable automation, or make public trust claims.

## Verification

- `lib/server/peopleDuplicatesRoute.test.ts`
- `lib/server/householdDuplicatesRoute.test.ts`

Manual safe non-production QA should open People duplicate review and Household duplicate review, confirm Find Duplicates still loads when authorized, confirm successful merge behavior only in an approved fixture environment, and if practical force backend failures to confirm raw Supabase/database, route, raw id, or exception details are not returned by the APIs.
