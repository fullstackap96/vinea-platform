# Public Intake Client Safe Messages - 2026-07-07

## Status

Implemented as a scoped public-form production-readiness hardening slice.

The Baptism, Wedding, Funeral, OCIA, and Join Parish public intake forms now route failed `/api/intake` responses through `lib/publicIntakeClientMessages.ts` before showing text to families.

## What Changed

- Added `lib/publicIntakeClientMessages.ts`.
- Updated `app/baptism-request/page.tsx`.
- Updated `app/wedding-request/page.tsx`.
- Updated `app/funeral-request/page.tsx`.
- Updated `app/ocia-request/page.tsx`.
- Updated `app/join-parish-request/page.tsx`.
- Added focused source and documentation validation tests.

## Staff And Family Behavior

Families still see allowlisted public validation and rate-limit messages, including missing required fields, invalid email, unavailable public intake forms, and too many submissions.

Unexpected backend, route, database, provider, token, storage, or exception-shaped errors now fall back to:

`Could not submit your request. Please try again or contact the parish office.`

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, enable runtime public intake routing, send new communications, run exports, call AI, access storage, create signed URLs, mutate staff records, generate certificates, or make public trust claims.

Notification behavior remains best-effort and unchanged. Public intake submission behavior remains unchanged except for the visible client error boundary.

## Verification

- `lib/publicIntakeClientMessages.test.ts`
- `lib/server/publicIntakeClientSafeMessagesSource.test.ts`
- `lib/server/publicIntakeClientSafeMessagesDoc.test.ts`

Manual safe non-production QA should submit each public form with one expected validation failure and, if practical, force a backend failure to confirm no raw Supabase/database, route, provider, token, storage, or exception details are shown.
