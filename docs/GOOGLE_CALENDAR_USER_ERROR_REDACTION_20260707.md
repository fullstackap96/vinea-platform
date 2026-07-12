# Google Calendar User Error Redaction - 2026-07-07

Status: Implemented as a scoped production-readiness privacy hardening slice.

## Purpose

Google Calendar route and dashboard helpers should give staff useful reconnect guidance without echoing raw provider, OAuth, token, email, database URL, signed URL, or payload details into staff-facing messages or serialized server diagnostic strings.

## What Changed

- `userFacingGoogleCalendarErrorMessage(...)` still detects OAuth reconnect failures and returns the existing reconnect guidance.
- Unknown Google Calendar/provider failures now return a generic staff-facing message instead of raw exception text.
- Curated safe messages, such as not-connected and request-not-found messages, are preserved.
- Request detail Google Calendar conflict messages now pass through the same curated staff-message helper so the dashboard does not echo arbitrary API/provider text.
- `serializeGoogleCalendarErrorForLogs(...)` now recursively redacts sensitive values and sensitive provider keys before serializing log details.

## Safety Boundary

This change does not alter Google OAuth state, selected-parish integration selection, event create/update/delete behavior, calendar conflict handling, staff authentication, active-parish scope, operational RLS, migrations, records, exports, AI calls, storage, signed URLs, communications, certificates, production flags, or public trust claims.

## Verification

- `npm.cmd test -- lib\googleCalendarUserErrors.test.ts`

The focused tests prove:

- OAuth reconnect detection still returns the approved reconnect message.
- Unknown provider/exception text is replaced with a generic staff-facing message.
- Curated safe messages, including request detail conflict messages, are preserved.
- Serialized provider diagnostics redact emails, token-like values, bearer/token fields, database URLs, signed URLs, and sensitive nested provider keys.
