# Onboarding Client Safe Messages - 2026-07-07

## Status

Implemented as a scoped staff onboarding production-readiness hardening slice.

The Parish Onboarding page now routes failed `/api/parish/settings` setup load/completion responses and caught browser exceptions through `lib/onboardingClientMessages.ts` before showing text to staff.

## What Changed

- Added `lib/onboardingClientMessages.ts`.
- Updated `app/dashboard/onboarding/ParishOnboardingPage.tsx`.
- Added focused helper, source, and documentation validation tests.

## Staff Behavior

Staff still see allowlisted authentication, authorization, validation, setup, and completion messages, including parish name, notification email, and daily brief validation.

Unexpected raw Supabase/database, token, route, raw id, or exception details now fall back to one of:

- `Could not load parish setup. Please try again.`
- `Could not mark onboarding complete. Please try again.`

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, change onboarding completion semantics, mutate records beyond the existing staff-triggered onboarding completion save, run exports, call AI, access storage, create signed URLs, touch Google Calendar data, send communications, generate certificates, enable automation, or make public trust claims.

The Onboarding readiness checklist, selected active parish scope, go-live readiness guidance, staff directory inputs sent through the existing save path, and completion button behavior are unchanged.

## Verification

- `lib/onboardingClientMessages.test.ts`
- `lib/server/onboardingClientSafeMessagesSource.test.ts`
- `lib/server/onboardingClientSafeMessagesDoc.test.ts`

Manual safe non-production QA should open Onboarding, confirm the selected parish scope label still appears, confirm the setup checklist and go-live readiness copy render, and if practical force load/save failures to confirm no raw Supabase/database, token, route, raw id, or exception details are visible.
