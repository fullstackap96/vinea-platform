# Demo Request Client Safe Messages - 2026-07-07

## Status

Implemented as a scoped public landing-page production-readiness hardening slice.

The demo request form now routes failed `/api/demo-request` responses and caught browser exceptions through `lib/demoRequestClientMessages.ts` before showing text to visitors.

## What Changed

- Added `lib/demoRequestClientMessages.ts`.
- Updated `app/_components/landing/ScheduleDemoForm.tsx`.
- Added focused helper, source, and documentation validation tests.

## Visitor Behavior

Visitors still see allowlisted public validation and availability messages, including missing required fields, invalid email, and the temporary direct-email fallback.

Unexpected raw provider, route, database, token, email, or exception details now fall back to:

`Unable to submit demo request. Please try again or email us directly.`

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, send new communications, run exports, call AI, access storage, create signed URLs, mutate records, generate certificates, enable automation, or make public trust claims.

The existing demo request route and email behavior are unchanged.

## Verification

- `lib/demoRequestClientMessages.test.ts`
- `lib/server/demoRequestClientSafeMessagesSource.test.ts`
- `lib/server/demoRequestClientSafeMessagesDoc.test.ts`

Manual safe non-production QA should submit the demo form with one expected validation failure and, if practical, force the email provider/configuration fallback to confirm no raw provider, route, database, token, email, or exception details are visible.
