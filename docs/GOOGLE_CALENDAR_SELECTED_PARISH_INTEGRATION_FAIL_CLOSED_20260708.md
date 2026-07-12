# Google Calendar Selected-Parish Integration Fail-Closed - 2026-07-08

Status: Implemented as a safe multi-parish tenant-readiness hardening slice.

## What Changed

- `loadParishGoogleCalendarIntegration(...)` now requires an explicit parish id.
- Missing or blank parish ids return `null` before any Supabase query.
- The helper no longer falls back to the oldest/first parish row.
- Existing Google Calendar create/update/delete routes continue to pass `parishContext.activeParishId`.

## Why This Matters

Google Calendar reconnect and event lifecycle routes are selected-parish surfaces. If a future caller forgets to pass the selected parish id, Vinea should fail closed instead of accidentally loading another parish's Google integration.

## Safety Boundary

- No production access.
- No migrations.
- No operational RLS changes.
- No Google Calendar event create/update/delete calls.
- No Google OAuth credential submission.
- No Google Calendar data mutation.
- No record mutation.
- No secrets printed or stored.

## Verification

- Focused tests prove selected-parish integration lookup still queries `parish_google_integrations` by the selected parish id.
- Focused tests prove missing or blank parish ids return `null` without creating a Supabase service-role client or querying `parishes`.

## Follow-Up

Continue selected-parish hardening by removing or documenting any remaining first-parish fallback helpers that are not part of an explicit compatibility boundary.
