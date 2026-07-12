# Request Reply Draft Active Parish Mutation Route - 2026-07-08

## Status

Implemented as a production-readiness hardening slice for Request Detail.

## What Changed

- Added `app/api/requests/[id]/reply-draft/route.ts`.
- Moved AI reply draft saves and Vinea email template draft saves off browser-side Supabase writes.
- Preserved staff review: the route only saves draft text for staff to inspect and edit.
- Kept the route scoped to staff authentication, selected active parish membership, and request ownership.
- Preserved explicit primary-parish fallback only when no active parish cookie exists.

## Safety Boundary

The route only updates `requests.reply_draft` after the request is proven to belong to the staff member's selected parish. It rejects malformed payloads and uses curated client-visible errors.

This change does not call AI or send communications. It does not apply migrations or change operational RLS. It does not access production, touch Google Calendar data, run exports, access storage, create signed URLs, generate certificates, make canonical or sacramental eligibility decisions, or make public trust claims.

## Verification

- Source-level route test verifies staff authentication, active parish cookie use, request ownership checks, narrow update fields, and no insert/upsert/delete/select-all behavior.
- Source-level Request Detail test verifies reply draft save paths call the server route instead of mutating `requests.reply_draft` directly from the browser.

## Completion Integrity

The update selects the minimal persisted request id and returns generic not-found guidance when no row matched. Vinea records the draft audit event only after positive persistence confirmation, so a disappearing request cannot produce a false saved-draft event.
