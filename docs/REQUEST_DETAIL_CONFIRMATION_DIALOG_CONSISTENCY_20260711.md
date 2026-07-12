# Request Detail Confirmation Dialog Consistency - 2026-07-11

Decision: `REQUEST_DETAIL_CONFIRMATION_DIALOG_CONSISTENCY_IMPLEMENTED_20260711`

Status: Implemented and verified.

## Staff Experience

Request Detail now uses the shared Vinea confirmation dialog for both reviewed actions that need an explicit decision:

- replacing an existing email draft with a parish template; and
- marking a request complete.

The completion dialog explains that the request leaves the active queue, preserves its history, and can be reopened later. It now inherits keyboard focus containment, Escape handling, focus restoration, accessible labels, and consistent Vinea styling.

## Safety Boundary

The confirmation still invokes the existing status action with `complete`. The same active-parish and request-ownership boundary, validation, audit behavior, safe errors, and reopen behavior remain unchanged. The shared dialog adds no database, provider, or browser Supabase access.

## Verification Boundary

- No production access.
- No request status was changed during verification.
- No communication, provider, Calendar, AI, export, storage, signed URL, certificate, migration, RLS, or production-sensitive flag action.

Rollback is client-only and requires no API or database rollback.
