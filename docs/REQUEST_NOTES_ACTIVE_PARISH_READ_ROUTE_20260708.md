# Request Notes Active Parish Read Route - 2026-07-08

## Status

Implemented as a read-only Request Detail support-data hardening slice.

## What Changed

- Added `app/api/requests/[id]/notes/route.ts`.
- Updated `app/dashboard/requests/[id]/page.tsx`.
- Updated `lib/requestDetailClientMessages.ts`.
- Added `lib/server/requestNotesActiveParishReadRoute.test.ts`.

## Boundary

The Request Detail page no longer reads `request_notes` directly from the browser. It now calls `app/api/requests/[id]/notes/route.ts`, which requires staff authentication, reads the active parish cookie, and reuses `loadStaffScopedRequestDetailAccess` before loading internal notes.

The route queries notes with the authorized `access.requestId`, not the raw route id, so the support-data read stays tied to the same active-parish-aware request detail authorization used by the page guard.

## Plain-English Summary

Internal notes are now loaded by the server after Vinea confirms the staff member may see that request in the selected parish. If that check fails, notes stay hidden.

## Safety Notes

- This is read-only.
- It does not mutate notes.
- It does not add automation.
- It does not send communications.
- It does not apply migrations.
- It does not change operational RLS.
- It does not access production.
- It does not touch Google Calendar, storage, signed URLs, exports, AI, certificate generation, or public trust claims.

## Verification

- Focused source coverage: `lib/server/requestNotesActiveParishReadRoute.test.ts`.
- The route uses safe server logging through `logServerError`.
- The client uses curated `loadRequestNotes` request-detail messages instead of raw API/database text.
