# Request Confirmed Funeral Service Active Parish Mutation Route - 2026-07-08

## Status

Implemented as a production-readiness hardening slice for Request Detail.

## What Changed

- Added `app/api/requests/[id]/confirmed-funeral-service/route.ts`.
- Moved confirmed funeral service save and clear actions off browser-side Supabase writes.
- Preserved the existing staff-reviewed UI behavior, validation, success messages, and request activity logging.
- Kept the route scoped to staff authentication, selected active parish membership, request ownership, funeral request type, and an existing funeral detail row.
- Preserved explicit primary-parish fallback only when no active parish cookie exists.

## Safety Boundary

The route only updates `funeral_request_details.confirmed_service_at` after the request is proven to belong to the staff member's selected parish. It rejects malformed payloads and non-funeral requests with generic safe errors.

This change does not touch Google Calendar data. It does not apply migrations or change operational RLS. It does not access production, call AI, run exports, access storage, create signed URLs, send communications, generate certificates, make canonical or sacramental eligibility decisions, or make public trust claims.

## Verification

- Source-level route test verifies staff authentication, active parish cookie use, request ownership checks, funeral request-type guard, funeral detail ownership check, narrow update fields, and no insert/upsert/delete/select-all behavior.
- Source-level Request Detail test verifies the confirmed funeral service save and clear functions call the server route instead of mutating `funeral_request_details` directly from the browser.

## Completion Integrity

The update selects the minimal updated funeral-detail request id and returns generic not-found guidance when no row matched. Vinea writes the schedule audit event only after positive persistence confirmation, so a disappearing detail row cannot produce a false confirmed-service event.
