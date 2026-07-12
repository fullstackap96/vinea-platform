# Google Calendar Event Body Size Boundary

Status: `GOOGLE_CALENDAR_EVENT_BODY_SIZE_BOUNDARY_IMPLEMENTED_20260709`

## Purpose

The staff-only Google Calendar event create, update, and delete routes now enforce a `16 KiB` JSON ceiling after staff authentication and before active-parish resolution, database reads, Google client construction, or event mutation.

## Preserved Authorization

- Staff authentication remains before bounded parsing.
- Active-parish membership, request ownership, and selected-calendar checks remain unchanged.
- Invalid JSON returns generic HTTP `400`.
- Oversized JSON returns generic HTTP `413`.
- Rejected bodies cannot reach Google Calendar client construction or request calendar-field writes.

## Safety Boundaries

- No Google Calendar event was created, updated, or deleted during verification.
- This change does not access production or any real parish calendar.
- This change does not apply migrations or change operational RLS.
- This change does not alter OAuth credentials, integration selection, or calendar ownership.
- This change does not enable a production-sensitive feature flag or make a public trust claim.

## Verification

Source-level tests pin authentication-before-body ordering, the 16 KiB ceiling, generic 400/413 handling, active-parish checks, and Google mutation placement after all protected steps. Existing create/update/delete parish-scope tests remain in force.

## Plain-English Summary

Normal staff calendar commands still work. Malformed or abnormally large commands now stop before Vinea checks parish records or contacts Google Calendar.
