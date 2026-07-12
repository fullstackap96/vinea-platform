# Request Communications Active Parish Read Route - 2026-07-08

## Status

Implemented as a read-only Request Detail communication-history hardening slice.

## What Changed

- Added `app/api/requests/[id]/communications/route.ts`.
- Updated `app/dashboard/requests/[id]/page.tsx`.
- Updated `lib/requestDetailClientMessages.ts`.
- Added `lib/server/requestCommunicationsActiveParishReadRoute.test.ts`.

## Boundary

The Request Detail page no longer performs the initial communication-history `select('*')` from the browser. It now calls `app/api/requests/[id]/communications/route.ts`, which requires staff authentication, reads the active parish cookie, and reuses `loadStaffScopedRequestDetailAccess` before loading communication history.

The route queries communication history with the authorized `access.requestId`, not the raw route id, and returns only a server-owned communication history allowlist: `id`, `contacted_at`, `method`, `notes`, and `created_at`.

## Plain-English Summary

When staff open a request, Vinea now checks on the server that the request belongs to the selected parish before loading its communication history. The browser receives only the fields the communication-history list needs.

## Safety Notes

- This is read-only.
- It does not mutate communications.
- It does not change communication logging or email sending.
- It does not send communications.
- It does not apply migrations.
- It does not change operational RLS.
- It does not access production.
- It does not touch Google Calendar, storage, signed URLs, exports, AI, certificate generation, or public trust claims.

## Verification

- Focused source coverage: `lib/server/requestCommunicationsActiveParishReadRoute.test.ts`.
- The route uses safe server logging through `logServerError`.
- The client uses curated `loadCommunications` request-detail messages instead of raw API/database text.
