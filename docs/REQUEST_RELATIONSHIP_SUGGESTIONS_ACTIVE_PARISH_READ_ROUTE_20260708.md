# Request Relationship Suggestions Active Parish Read Route - 2026-07-08

## Status

Implemented as a read-only Request Detail production-readiness hardening slice.

## What Changed

- Added `GET /api/requests/[id]/relationship-suggestions`.
- Moved Request Detail People-directory linked-person lookup and relationship suggestion lookup off direct browser Supabase reads.
- Kept suggestion data scoped to the staff member's selected active parish through `loadStaffScopedRequestDetailAccess`.
- Preserved legacy primary-parish fallback only when no active parish cookie is available.
- Returned only display DTOs needed by the existing Request Detail UI:
  - linked person display label
  - existing profile for the intake contact
  - person match suggestions
  - linked-person household suggestions

## Safety Boundary

This route is staff-authenticated, active-parish-aware, and read-only. It does not mutate records, link people, create people, generate certificates, send communications, call AI, run exports, access storage, create signed URLs, apply migrations, change operational RLS, access production, or make public trust claims.

The staff-reviewed link/create buttons use Server Actions. A follow-up hardening slice now verifies selected active-parish request ownership before those actions load request contact rows or write person links.

## Verification

- Source tests assert the browser components call `/relationship-suggestions` with credentials and no longer import the browser Supabase client.
- Source tests assert the route verifies request detail access, uses the active parish cookie, preserves no-cookie fallback behavior, and scopes `people` and `household_members` reads to the verified request parish.
