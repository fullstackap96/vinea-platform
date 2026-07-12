# Request Confirmed Baptism Date Active Parish Mutation Route - 2026-07-08

## Status

Implemented as a production-readiness hardening slice for Request Detail.

## What Changed

- Added `app/api/requests/[id]/confirmed-baptism-date/route.ts`.
- Moved confirmed baptism date save and clear actions off browser-side Supabase writes.
- Preserved the existing staff-reviewed UI behavior, validation, success messages, and request activity logging.
- Kept the route scoped to staff authentication, selected active parish membership, and request ownership.
- Preserved explicit primary-parish fallback only when no active parish cookie exists.

## Safety Boundary

The route only updates `requests.confirmed_baptism_date` after the request is proven to belong to the staff member's selected parish. It rejects malformed payloads and non-baptism requests with generic safe errors.

This change does not apply migrations or change operational RLS. It does not access production, touch Google Calendar data, call AI, run exports, access storage, create signed URLs, generate certificates, send communications, make canonical or sacramental eligibility decisions, or make public trust claims.

## Verification

- Source-level route test verifies staff authentication, active parish cookie use, request ownership checks, baptism request-type guard, narrow update fields, and no insert/upsert/delete/select-all behavior.
- Source-level Request Detail test verifies the confirmed baptism date save and clear functions call the server route instead of mutating `requests` directly from the browser.

## Completion Integrity

The update selects the minimal updated request id and returns generic not-found guidance when no row matched. Vinea writes the schedule audit event only after positive persistence confirmation, so a disappearing request cannot produce a false confirmed-date event.
