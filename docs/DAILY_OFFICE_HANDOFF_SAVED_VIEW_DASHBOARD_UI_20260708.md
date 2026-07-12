# Daily Office Handoff Saved-View Dashboard UI - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY DASHBOARD UI`

Completion marker: `DAILY_OFFICE_HANDOFF_SAVED_VIEW_DASHBOARD_UI_WIRED_20260708`

This slice adds a read-only staff-facing dashboard surface for Daily Office Handoff saved-view presets. The card appears on the main dashboard after the Daily Office Handoff Digest and before the Parish Health Score. It uses the existing active-parish-scoped Daily Office Handoff Digest and the existing `buildDailyOfficeHandoffSavedViewPlan` DTO.

## What Changed

- Added `app/dashboard/DashboardDailyOfficeHandoffSavedViews.tsx`.
- Wired the saved-view card into `app/dashboard/DashboardPageCore.tsx`.
- Added source-level tests in `lib/server/dashboardDailyOfficeHandoffSavedViewsUi.test.ts`.
- Reused the existing source-level preflight in `lib/server/dailyOfficeHandoffSavedViewDashboardUiPreflight.ts`.

## Staff Experience

The dashboard now shows three plain-English handoff lenses:

- Front desk opening view.
- Sacramental records handoff view.
- Administrator closeout view.

Each preset explains when to use it, what it helps with, and which existing staff-reviewed queue to open. If a preset has no visible cue, it shows a calm empty state instead of implying staff missed something.

## Handoff Rhythm Polish

The card now also shows a short `Handoff rhythm` for each preset:

- Front desk opening view tells staff to open it first, name owners for unassigned or blocked family requests, and leave urgent follow-up with a staff-reviewed next step.
- Sacramental records handoff view tells staff to use it before certificate or register work, verify request-to-record and document cues by hand, and keep correction, notation, and certificate decisions staff-reviewed.
- Administrator closeout view tells staff to use it before closing, check ownership, duplicate review, and workload balance, and leave tomorrow's first queue clear.

This is plain-English guidance only. It does not persist saved views, assign work, send reminders, mutate records, generate certificates, or make sacramental, canonical, pastoral, or eligibility decisions.

## Safety Boundary

This dashboard surface:

- does not persist saved views.
- does not save user preferences.
- does not query Supabase directly.
- does not call API routes.
- does not mutate records.
- does not send communications.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not generate certificates.
- does not merge duplicates.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

Catholic records and certificate cues remain staff-reviewed and do not make sacramental, canonical, pastoral, or eligibility decisions.

## Source-Level Verification

The focused source test verifies:

- The UI imports and uses `buildDailyOfficeHandoffSavedViewPlan`.
- The plan is derived from the existing Daily Office Handoff Digest.
- The selected active parish context remains visible.
- The approved preset labels render.
- Each preset renders a plain-English `Handoff rhythm`.
- Cue and preset links use existing staff-reviewed queues only.
- Empty states remain visible.
- No send, save, export, AI, storage, signed URL, certificate, duplicate merge, API, Supabase, or mutation controls are present.
- Dashboard placement remains after `DashboardDailyOfficeHandoffDigest` and before `DashboardParishHealthScore`.
- The existing source preflight passes with complete marker coverage.

## Browser QA Recommendation

Before treating this as pilot-ready in a non-production staff session, run a browser check that verifies:

1. `/api/health` returns HTTP 200 with `checks.schema: true`.
2. `/dashboard` shows the Daily Office Handoff Digest followed by the saved-view presets.
3. The selected parish label updates after switching between authorized parishes.
4. All three preset labels are visible.
5. Preset and cue links open only existing staff-reviewed queues.
6. Empty states appear for a fixture parish with no visible handoff cues.
7. No save, send, export, download, certificate, AI, storage, signed URL, duplicate merge, automation, or mutation controls appear.

## Current Production Boundary

This is safe dashboard polish only; production-sensitive gates remain closed. This does not approve production exports, production RLS rollout, production monitoring, public trust-center claims, runtime reminders, certificate issuance logging runtime, correction/notation runtime, AI production gates, or public intake production routing.
