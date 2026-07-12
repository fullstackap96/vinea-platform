# Parish Settings Client Safe Messages - 2026-07-07

## Status

Implemented as a scoped Parish Settings production-readiness hardening slice.

The Settings page now routes main Settings, Daily Brief, Staff Access, Recent Activity, and Public Intake Routing admin-control load/save/send failures through `lib/parishSettingsClientMessages.ts` before showing text to staff.

This covers parish settings load/save and manual Daily Brief send failures, plus the Staff Access, Recent Activity, and Public Intake Routing metadata/domain/token admin subsections.

## What Changed

- Added `lib/parishSettingsClientMessages.ts`.
- Updated `app/dashboard/settings/ParishSettingsPage.tsx`.
- Added focused helper, source, and documentation validation tests.

## Staff Behavior

Staff still see allowlisted authentication, authorization, validation, setup, staff-access, daily-brief, audit-event, and public-intake-routing messages, including invalid parish settings fields, daily brief recipient setup, invalid staff email, parish-admin-only, self-deactivation, last-admin, staff-not-found, audit-log setup states, public slug/domain/token validation, expected DNS verification-not-yet guidance, and duplicate public-routing setup states.

Unexpected raw Supabase/database, token, route, raw id, or exception details now fall back to one of:

- `Could not load settings. Please try again.`
- `Could not save settings. Please try again.`
- `Could not send the daily brief. Please try again.`
- `Could not load staff access. Please try again.`
- `Could not add staff access. Please try again.`
- `Could not update staff access. Please try again.`
- `Could not load recent activity. Please try again.`
- `Could not load public intake routing metadata. Please try again.`
- `Could not save public intake routing metadata. Please try again.`
- `Could not add public intake domain. Please try again.`
- `Could not update public intake domain. Please try again.`
- `Could not verify public intake domain. Please try again.`
- `Could not reset public intake domain verification. Please try again.`
- `Could not create public intake token. Please try again.`
- `Could not update public intake token. Please try again.`
- `Domain verification did not pass yet.`

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, change parish settings save semantics, change staff access semantics, change public-intake-routing API semantics, mutate records beyond existing parish settings, staff access, and public-intake-routing admin saves, run exports, call AI, access storage, create signed URLs, touch Google Calendar data, send communications beyond the existing manual Daily Brief action, generate certificates, enable automation, wire runtime public intake routing, or make public trust claims.

The Settings page selected active parish label, parish settings load/save behavior, manual Daily Brief send behavior, Staff Access API authorization, parish-admin checks, staff access audit writes, Recent Activity loading behavior, Workflow Templates section, Google Calendar status, Public Intake Routing controls, domain verification workflow, token hash storage behavior, and one-time token visibility are unchanged. Runtime public intake routing remains intentionally unwired.

## Verification

- `lib/parishSettingsClientMessages.test.ts`
- `lib/server/parishSettingsClientSafeMessagesSource.test.ts`
- `lib/server/parishSettingsClientSafeMessagesDoc.test.ts`

Manual safe non-production QA should open Settings, confirm the selected parish scope label still appears, confirm parish settings fields, Daily Brief controls, Staff Access list, Recent Activity, and Public Intake Routing metadata/domain/token controls still render when authorized, and if practical force settings, Daily Brief, staff-access, audit-load, public-routing metadata, domain, token, or DNS verification failures to confirm no raw Supabase/database, token, route, raw id, storage path, or exception details are visible. Confirm token creation still displays the raw token only once after a successful create response.
