# Request Suggested Dates Active Parish Mutation Route - 2026-07-08

## Status

Implemented as a production-readiness hardening slice for Request Detail suggested-date saves.

## What Changed

- Added `app/api/requests/[id]/suggested-dates/route.ts`.
- Updated `app/dashboard/requests/[id]/page.tsx` so suggested dates save through the staff-authenticated route instead of mutating request date fields directly from the browser.
- Updated `lib/requestDetailClientMessages.ts` so suggested-date API errors stay allowlisted.
- Added `lib/server/requestSuggestedDatesActiveParishMutationRoute.test.ts`.

## Safety Boundary

The route requires staff authentication, reads the selected active parish cookie, validates staff membership through `loadStaffScopedRequestDetailAccess`, and verifies the request belongs to that active parish context before updating only `suggested_date_1`, `suggested_date_2`, and `suggested_date_3`.

The route preserves the existing staff-reviewed suggested-date action. It does not confirm a sacramental date, send communications, generate certificates, call AI, run exports, access storage, create signed URLs, access production, apply migrations, or change operational RLS.

## Why This Matters

Suggested dates shape family follow-up and calendar work. Moving the save behind server-side active-parish request ownership keeps this staff action aligned with multi-parish tenancy before production RLS promotion.

## Manual QA Notes

Use a safe non-production staff session:

1. Open a same-parish baptism request detail page.
2. Enter one or more future suggested dates and save.
3. Confirm the success message appears and the existing request activity note still appears.
4. Switch to another authorized parish and confirm the original request is not accessible in that parish context.
5. Confirm no migrations, RLS changes, exports, AI calls, storage access, signed URLs, communications, or certificate generation occur.

## Production Boundary

This is safe runtime hardening for an existing staff action. It does not apply migrations or change operational RLS.

## Completion Integrity

The update selects the minimal persisted request id and returns generic not-found guidance when no row matched. Vinea records the suggested-dates audit event only after positive persistence confirmation, so a disappearing request cannot produce a false saved-schedule event.
