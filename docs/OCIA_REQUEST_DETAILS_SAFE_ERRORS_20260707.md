# OCIA Request Details Safe Errors - 2026-07-07

Status: Implemented as a scoped Catholic-records production-readiness hardening slice.

## Summary

`lib/ensureOciaRequestDetails.ts` now returns stable staff-safe messages when it cannot select or create the placeholder `ocia_request_details` row needed by the request detail page. It no longer returns raw Supabase/database insert, select, or race-condition error text to the request detail client.

## Covered Behavior

- Missing request id remains a stable validation message.
- OCIA detail select failures return `Could not access the OCIA intake record. Please try again.`
- OCIA placeholder insert/race failures return `Could not prepare the OCIA intake record. Please try again.`
- Successful existing-row and successful placeholder-insert behavior is unchanged.

## Safety Boundary

This change does not mutate additional records, generate certificates, make sacramental/canonical eligibility decisions, alter request authorization, alter selected active parish scope, apply migrations, change operational RLS, enable production flags, call AI, run exports, access storage, create signed URLs, send communications, touch Google Calendar data, or make public trust claims.

## Verification

- `npm.cmd test -- lib\ensureOciaRequestDetails.test.ts` passed: 1 file, 4 tests.

Manual safe non-production QA should open an OCIA request detail page with and without an existing detail row, confirm the page still loads or creates the placeholder row as before, and if practical simulate a failed detail-row select/insert to confirm staff see only the stable guidance above.
