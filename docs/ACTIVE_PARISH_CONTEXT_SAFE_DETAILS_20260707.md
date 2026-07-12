# Active Parish Context Safe Technical Details - 2026-07-07

Status: Implemented as a scoped production-readiness privacy hardening slice.

## Purpose

The staff active-parish read and write context helpers may return `technicalDetail` or `fallbackReason` fields to explain why membership lookup or display-name lookup fell back. Those details now pass through the shared sensitive-log redaction helper before they leave the helper.

## What Changed

- `lib/server/staffParishContext.ts` redacts error-derived `technicalDetail` values.
- `lib/server/staffParishContext.ts` redacts error-derived `fallbackReason` values.
- `lib/server/staffWriteParishContext.ts` redacts error-derived `technicalDetail` values.
- `lib/server/staffWriteParishContext.ts` redacts error-derived `fallbackReason` values.

## Safety Boundary

This change does not alter staff authentication, active-parish membership checks, primary-parish fallback eligibility, selected-parish behavior, route responses, operational RLS, migrations, records, exports, AI calls, storage, signed URLs, communications, certificates, Google Calendar data, production flags, or public trust claims.

## Verification

- `npm.cmd test -- lib\server\staffParishContext.test.ts lib\server\staffWriteParishContext.test.ts lib\server\safeErrorLogging.test.ts`

The focused tests prove that simulated membership/display lookup errors containing emails, token-like values, bearer tokens, and database URLs are redacted before returning `technicalDetail` or `fallbackReason`.
