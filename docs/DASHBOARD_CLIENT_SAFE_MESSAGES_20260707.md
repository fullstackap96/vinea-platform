# Dashboard Client Safe Messages - 2026-07-07

Status: Implemented for staff-facing Daily Work Hub follow-up and care-plan row actions.

## Scope

- Added `lib/dashboardClientMessages.ts`.
- Updated `app/dashboard/DashboardPageCore.tsx`.
- Added focused helper and source-level tests for dashboard row action messages.

## Staff-Facing Behavior

The dashboard now uses curated safe messages when these actions fail:

- Drafting a follow-up email.
- Saving a follow-up draft.
- Sending a follow-up email.
- Logging or summarizing a sent follow-up.
- Marking a follow-up as contacted.
- Logging a care-plan touchpoint.
- Updating funeral care dates after a touchpoint.
- Updating request follow-up summary fields after a touchpoint.

Existing successful messages and staff validation prompts remain visible, including missing recipient email, missing draft text, and missing next follow-up date prompts.

## Safety Boundary

This slice prevents raw AI route, email provider, database, network, or exception text from being rendered in the staff dashboard row messages for follow-up and care-plan actions.

It preserves:

- Existing staff authentication and dashboard authorization.
- Selected active parish scope inherited by the dashboard loaders.
- Existing email send behavior.
- Existing communication logging behavior.
- Existing request summary update behavior.
- Existing care-plan touchpoint behavior.
- Existing successful and validation messages.

## No-Go Boundaries

This slice does not access production, apply migrations, change operational RLS, change email delivery semantics, send new communications, enable automation, call AI differently, run exports, access storage, create signed URLs, touch Google Calendar data, generate certificates, mutate records beyond the existing staff-triggered dashboard actions, enable production flags, or make public trust claims.

## Verification

- Focused tests cover the curated message helper and source-level dashboard wiring.
- Broader typecheck, lint, build, and release-handoff checks should be run before using this slice in release review.
