# Public Intake Client Notification Safe Logging - 2026-07-07

Status: Implemented as a scoped production-readiness hardening slice.

## Summary

Public intake pages still submit requests the same way and still attempt the staff notification side-call after the request is saved. If that side-call fails, the browser now logs only a coarse development-only status label through `lib/publicIntakeNotificationClient.ts`.

The pages no longer log raw notification response bodies or caught error objects in the visitor browser console.

## Covered Pages

- `/baptism-request`
- `/wedding-request`
- `/funeral-request`
- `/ocia-request`
- `/join-parish-request`

## Safety Boundary

This change does not alter public intake routing, runtime feature flags, request creation, staff notification delivery behavior, rate limiting, operational RLS, migrations, exports, AI, storage, signed URLs, communications settings, certificates, or public trust-center claims.

## Verification

- Source-level test: `lib/server/publicIntakeClientNotificationLogging.test.ts`
- Expected production behavior: no client console notification warning from the helper.
- Expected development behavior: label-only warning with `statusLabel`, never raw response text, error objects, request bodies, contact details, tokens, IDs, provider payloads, or secrets.

## Manual QA

In a non-production browser session, submit one public intake form while forcing `/api/request-notifications` to fail. Confirm the request still shows the normal success message after the request is saved, and confirm the browser console does not show raw response text, provider details, request body fields, contact details, tokens, or stack traces.
