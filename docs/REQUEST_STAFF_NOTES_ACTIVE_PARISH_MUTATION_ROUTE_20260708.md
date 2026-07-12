# Request Staff Notes Active Parish Mutation Route - 2026-07-08

## Status

Implemented as a production-readiness hardening slice for Request Detail staff notes.

## What Changed

- Added `app/api/requests/[id]/staff-notes/route.ts`.
- Updated `app/dashboard/requests/[id]/page.tsx` so staff notes save through the staff-authenticated route instead of mutating `requests.staff_notes` directly from the browser.
- Updated `lib/requestDetailClientMessages.ts` with curated staff-notes API and fallback messages.
- Added `lib/server/requestStaffNotesActiveParishMutationRoute.test.ts`.

## Safety Boundary

The route requires staff authentication, reads the selected active parish cookie, validates staff membership through `loadStaffScopedRequestDetailAccess`, and verifies the request belongs to that active parish context before updating `requests.staff_notes`.

The route preserves the existing staff-reviewed note-taking action. It does not send communications, generate certificates, call AI, run exports, access storage, create signed URLs, access production, apply migrations, or change operational RLS.

## Why This Matters

Staff notes are internal pastoral and operations context. Moving the save behind server-side active-parish request ownership reduces the chance that a browser-side request can update notes outside the selected parish context.

## Manual QA Notes

Use a safe non-production staff session:

1. Open a same-parish request detail page.
2. Edit and save staff notes.
3. Confirm the success message appears and the existing request activity note still appears.
4. Switch to another authorized parish and confirm the original request is not accessible in that parish context.
5. Confirm no migrations, RLS changes, exports, AI calls, storage access, signed URLs, communications, or certificate generation occur.

## Production Boundary

This is safe runtime hardening for an existing staff action. It does not apply migrations or change operational RLS.

## Completion Integrity

The update selects the minimal persisted request id and returns generic not-found guidance when no row matched. Vinea records the staff-notes audit event only after positive persistence confirmation, so a disappearing request cannot produce a false saved-notes event.
