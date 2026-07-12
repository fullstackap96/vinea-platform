# Audit Log Client Safe Messages - 2026-07-07

## Status

Implemented as a scoped admin-surface production-readiness hardening slice.

The Audit Log page now routes failed `/api/audit-events` responses and caught browser exceptions through `lib/auditLogClientMessages.ts` before showing text to staff.

## What Changed

- Added `lib/auditLogClientMessages.ts`.
- Updated `app/dashboard/admin/audit-log/AuditLogPage.tsx`.
- Added focused helper, source, and documentation validation tests.

## Staff Behavior

Staff still see allowlisted authentication, authorization, setup, and load messages, including parish-admin requirements and missing audit-event migration guidance.

Unexpected raw Supabase/database, token, storage, route, raw id, or exception details now fall back to:

`Could not load audit log. Please try again.`

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, mutate records, run exports, call AI, access storage, create signed URLs, touch Google Calendar data, send communications, generate certificates, enable automation, or make public trust claims.

The Audit Log API, selected active parish scope, authorization behavior, filters, links, and event rendering are unchanged.

## Verification

- `lib/auditLogClientMessages.test.ts`
- `lib/server/auditLogClientSafeMessagesSource.test.ts`
- `lib/server/auditLogClientSafeMessagesDoc.test.ts`

Manual safe non-production QA should open the Audit Log as an admin, switch filters, confirm the active parish scope label still appears, and if practical force a load failure to confirm no raw Supabase/database, token, storage, route, raw id, or exception details are visible.
