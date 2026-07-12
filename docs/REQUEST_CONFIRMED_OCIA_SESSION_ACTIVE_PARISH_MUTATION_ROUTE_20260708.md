# Request Confirmed OCIA Session Active Parish Mutation Route

Date: 2026-07-08

## Status

Implemented as a production-readiness hardening slice for Request Detail.

## What Changed

- Added `app/api/requests/[id]/confirmed-ocia-session/route.ts`.
- Moved confirmed OCIA session save and clear actions in `app/dashboard/requests/[id]/page.tsx` behind the server route.
- Preserved the existing create-if-missing behavior for `ocia_request_details`, but moved it behind staff authentication and active-parish request ownership checks.
- Added safe client-message allowlist entries for confirmed OCIA session save and clear failures.

## Safety Boundary

The route requires staff authentication, reads the selected active parish cookie, and uses the active-parish-aware request detail access loader before ensuring or updating the OCIA detail row. It preserves explicit primary-parish fallback only when no active parish cookie exists.

The route verifies:

- The request is visible in the selected parish scope.
- The request is an OCIA request.
- Any missing `ocia_request_details` row is created only after request ownership is verified.
- Only `ocia_request_details.confirmed_session_at` is updated by this route.

## Explicit Non-Goals

This slice does not touch Google Calendar data, send communications, apply migrations, change operational RLS, access production, call AI, run exports, access storage, create signed URLs, generate certificates automatically, make canonical or sacramental eligibility decisions, or make public trust claims.

## Follow-Up

The broader OCIA detail editing path remains a separate candidate for future active-parish write hardening because it updates multiple intake fields and should be handled as its own scoped slice.

## Completion Integrity

The update selects the minimal updated OCIA-detail request id and returns generic not-found guidance when no row matched. Vinea writes the schedule audit event only after positive persistence confirmation, so a disappearing detail row cannot produce a false confirmed-session event.
