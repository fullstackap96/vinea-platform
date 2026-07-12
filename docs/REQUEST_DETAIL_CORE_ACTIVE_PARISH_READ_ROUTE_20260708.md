# Request Detail Core Active Parish Read Route - 2026-07-08

Status: Implemented as read-only Request Detail core-data hardening.

## What Changed

- Extended `app/api/requests/[id]/detail-access/route.ts` so it returns allowlisted request and parishioner fields only after staff authentication and active-parish-aware request ownership verification.
- Updated `app/dashboard/requests/[id]/page.tsx` so the initial Request Detail load no longer reads the core `requests` or `parishioners` rows directly from the browser.
- Added `lib/server/requestDetailCoreActiveParishReadRoute.test.ts`.

## Plain-English Summary

When staff open a request, Vinea now loads the main request row and the linked parishioner row through the same server check that verifies the selected parish. Staff see the same page, but the browser no longer asks Supabase directly for the broad request and parishioner records during the initial load.

## Safety Boundary

- This slice is read-only.
- The server route uses server-owned field allowlists for request and parishioner data.
- It preserves active parish scope and keeps primary-parish fallback only when no active parish cookie exists.
- It does not mutate records, send communications, call AI, run exports, access storage, create signed URLs, generate certificates, make canonical or sacramental decisions, access production, enable production flags, apply migrations, or change operational RLS.

## Verification

- Source-level tests guard the route allowlists, active parish authorization, and removal of browser-side initial core table reads.
