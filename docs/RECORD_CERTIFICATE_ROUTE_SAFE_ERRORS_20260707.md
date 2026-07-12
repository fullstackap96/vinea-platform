# Record Certificate Route Safe Errors - 2026-07-07

## Status

Implemented as a scoped production-readiness hardening slice for the existing baptism certificate route.

The route now logs unexpected sacramental-record load, certificate-event logging, and certificate-generation failures through the shared safe server logging helper and returns stable staff-safe API messages instead of raw database or exception text.

## What Changed

- Updated `app/api/records/[id]/certificate/route.ts`.
- Added `lib/server/recordCertificateRouteSafeErrors.test.ts`.
- Added source-level checks that prevent the certificate route from returning raw `rowErr.message`, `eventErr.message`, or unexpected exception messages to staff/API callers.

## Staff/API Behavior

Expected staff messages remain unchanged for missing record id, unauthenticated access, record not found, and non-baptism record type.

Unexpected failures now fall back to stable messages:

- `Could not load sacramental record.`
- `Could not log certificate generation.`
- `Could not generate certificate.`

The existing baptism-only certificate PDF behavior remains unchanged. The route still logs the existing `certificate_generated` sacramental record event before returning the PDF.

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, change staff authentication, broaden certificate eligibility, generate certificates automatically, add certificate types, add correction or notation behavior, mutate sacramental records beyond the existing `certificate_generated` event for staff-triggered baptism certificate generation, run exports, call AI, access storage, create signed URLs, touch Google Calendar data, send communications, enable automation, or make public trust claims.

## Verification

- `lib/server/recordCertificateRouteSafeErrors.test.ts`

Manual safe non-production QA should open an existing same-parish baptism record as authenticated staff, generate the existing baptism certificate, confirm the PDF still renders, confirm the `certificate_generated` event is still written, and if practical force backend failures to confirm raw Supabase/database, route, raw id, or exception details are not returned by the API.
