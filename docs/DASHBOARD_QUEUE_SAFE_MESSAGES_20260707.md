# Dashboard Queue Safe Messages - 2026-07-07

Status: Implemented for the staff Communications Center and Intake Queue quick-save actions.

## Scope

- Added `lib/dashboardQueueClientMessages.ts`.
- Updated `app/dashboard/communications/actions.ts`.
- Updated `app/dashboard/communications/DashboardCommunicationsPageClient.tsx`.
- Updated `app/dashboard/intake/actions.ts`.
- Updated `app/dashboard/intake/DashboardIntakePageClient.tsx`.
- Added focused helper and source-level tests.

## Staff-Facing Behavior

The Communications Center and Intake Queue now use curated safe messages for:

- Communication touchpoint logging failures.
- Communication follow-up date update failures.
- Intake first-contact communication logging failures.
- Request quick-triage update failures.
- Mass intention quick-triage update failures.

Expected validation messages remain visible, including missing request/intention id and invalid follow-up or Mass date messages.

## Safety Boundary

This slice prevents raw Supabase/database, network, provider, token, or exception details from being returned by these queue Server Actions or wrapped into visible row messages.

It preserves:

- Existing staff authentication checks.
- Existing selected active parish scope inherited by the page loaders.
- Existing communication insert behavior.
- Existing request update behavior.
- Existing Mass intention update behavior.
- Existing `revalidatePath` behavior.
- Existing success and validation messages.

## No-Go Boundaries

This slice does not access production, apply migrations, change operational RLS, change communication logging semantics, send communications, enable automation, mutate records beyond the already-existing staff-triggered quick-save actions, run exports, call AI, access storage, create signed URLs, touch Google Calendar data, generate certificates, enable production flags, or make public trust claims.

## Verification

- Focused tests cover the shared message helper and source-level server-action/client wiring.
- Broader typecheck, lint, build, and release-handoff checks should be run before using this slice in release review.
