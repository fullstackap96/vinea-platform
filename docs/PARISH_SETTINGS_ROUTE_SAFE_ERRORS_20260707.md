# Parish Settings Route Safe Errors - 2026-07-07

## Status

Implemented as a scoped production-readiness hardening slice for the staff-only Parish Settings API.

The route now logs unexpected Settings load, parish-row lookup, and update failures through the shared safe server logging helper and returns stable staff-safe API messages instead of raw Supabase/database or exception text.

## What Changed

- Updated `app/api/parish/settings/route.ts`.
- Updated `lib/server/parishSettingsRoute.test.ts`.
- Added source-level checks that prevent the Settings API from returning raw `parishErr.message`, `updateErr.message`, or unexpected exception messages to staff/API callers.

## Staff/API Behavior

Expected staff messages remain unchanged for authentication, authorization, invalid JSON, required parish name, invalid notification email, invalid daily brief email, and missing daily brief recipient setup.

Unexpected failures now fall back to stable messages:

- `Could not load parish settings.`
- `Could not update parish settings.`
- `Parish not found.`

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, change active-parish or membership authorization, change parish settings validation rules, change parish settings save semantics, change Daily Brief behavior, change Staff Access behavior, change Workflow Templates behavior, change Public Intake Routing behavior, mutate records beyond existing parish settings saves, run exports, call AI, access storage, create signed URLs, touch Google Calendar data, send communications, generate certificates, enable automation, or make public trust claims.

## Verification

- `lib/server/parishSettingsRoute.test.ts`

Manual safe non-production QA should open Parish Settings as authenticated staff, confirm settings still load for the selected parish, confirm validation messages remain staff-friendly, save an approved fixture settings change only in a safe environment if needed, and if practical force backend failures to confirm raw Supabase/database, route, raw id, or exception details are not returned by the API.
