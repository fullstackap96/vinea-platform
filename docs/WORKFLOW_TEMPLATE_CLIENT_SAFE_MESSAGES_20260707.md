# Workflow Template Client Safe Messages - 2026-07-07

## Status

Implemented as a scoped Settings admin-surface production-readiness hardening slice.

The Workflow Template Settings section now routes failed `/api/parish/workflow-templates` load/save responses and caught browser exceptions through `lib/workflowTemplateSettingsClientMessages.ts` before showing text to staff.

## What Changed

- Added `lib/workflowTemplateSettingsClientMessages.ts`.
- Updated `app/dashboard/settings/SettingsWorkflowTemplatesSection.tsx`.
- Added focused helper, source, and documentation validation tests.

## Staff Behavior

Staff still see allowlisted authentication, authorization, validation, setup, and load/save messages, including required title/phase validation and same-parish not-found states.

Unexpected raw Supabase/database, token, route, raw id, or exception details now fall back to one of:

- `Could not load workflow templates. Please try again.`
- `Could not save workflow step. Please try again.`

## Safety Boundary

This slice does not access production, apply migrations, change operational RLS, change workflow template editing semantics, mutate records beyond existing staff-triggered saves, run exports, call AI, access storage, create signed URLs, touch Google Calendar data, send communications, generate certificates, enable automation, or make public trust claims.

The Workflow Template Settings API, selected active parish scope, staff write context, same-parish template ownership checks, audit writes, filters, and step rendering are unchanged.

## Verification

- `lib/workflowTemplateSettingsClientMessages.test.ts`
- `lib/server/workflowTemplateClientSafeMessagesSource.test.ts`
- `lib/server/workflowTemplateClientSafeMessagesDoc.test.ts`

Manual safe non-production QA should open Parish Settings, load Workflow Templates, confirm the selected parish scope label still appears, save a safe approved step only if the environment permits it, and if practical force load/save failures to confirm no raw Supabase/database, token, route, raw id, or exception details are visible.
