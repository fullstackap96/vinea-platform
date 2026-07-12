# Google Calendar Auth Error Safe Logging - 2026-07-07

Status: Implemented as a scoped production-readiness hardening slice.

## Summary

`lib/parishGoogleCalendarServer.ts` now uses the shared `logServerError` redaction helper if Vinea fails while marking a parish Google Calendar integration as `error` after an OAuth/calendar auth failure.

The helper still attempts to store the safe serialized Google Calendar error detail on the parish integration row. Only the fallback logging path changed.

## Safety Boundary

This change does not change Google OAuth behavior, reconnect behavior, calendar event create/update/delete behavior, selected-parish authorization, database schema, operational RLS, migrations, production flags, exports, AI, storage, signed URLs, communications, certificates, or public trust-center claims.

## Verification

- Source-level test: `lib/server/parishGoogleCalendarServerSafeErrors.test.ts`
- Expected log shape: `[google-calendar] auth-error status update failed` with safe `action: mark-auth-error` metadata.
- Forbidden log content: raw Google provider payloads, refresh tokens, access tokens, database URLs, parish IDs, calendar IDs, request IDs, emails, storage paths, signed URLs, or private document data.
