# Request Type Support Active Parish Read Route - 2026-07-08

Status: Implemented as read-only Request Detail hardening.

## What Changed

- Added `app/api/requests/[id]/type-support/route.ts`.
- Updated `app/dashboard/requests/[id]/page.tsx` so initial funeral, wedding, OCIA, join-parish, and linked sacramental-record support reads go through that route.
- Updated `lib/requestDetailClientMessages.ts` with a safe user-facing fallback for request-specific support data.
- Added `lib/server/requestTypeSupportActiveParishReadRoute.test.ts`.

## Plain-English Summary

When staff open a request, Vinea now checks the staff session and selected active parish on the server before loading request-specific support details. The browser gets only the fields needed to display those sections.

## Safety Boundary

- This route is read-only and does not insert, update, delete, or upsert request detail rows.
- It preserves the explicit primary-parish fallback only when no active parish cookie exists.
- It does not send communications, call AI, run exports, access storage, create signed URLs, generate certificates, make canonical or sacramental decisions, apply migrations, or change operational RLS.
- The existing OCIA helper that creates a missing OCIA detail row remains available only in existing staff-initiated save flows; the initial page-load support route does not create missing OCIA rows.

## Verification

- Source-level tests guard staff auth, active parish scope, server-owned field allowlists, safe error logging, and the removal of initial browser-side type-support reads.
