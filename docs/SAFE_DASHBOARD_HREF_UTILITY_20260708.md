# Safe Dashboard Href Utility - 2026-07-08

Status: `IMPLEMENTED - SHARED READ-ONLY LINK SANITIZER`

Completion marker: `SAFE_DASHBOARD_HREF_UTILITY_20260708`

This slice consolidates the repeated dashboard-only link sanitizer into `lib/safeDashboardHref.ts`. The shared utility is used by read-only dashboard DTOs that surface staff-facing links:

- Daily Office Handoff Digest
- Daily Office Handoff saved-view presets
- Today View
- Role Work Hub
- Main dashboard command center
- Daily Work Hub overview
- Daily Operating Signal Inputs
- Parish Health Score
- Operational Intelligence Brief
- Workflow Reminder candidates
- Workflow Reminder disposition DTOs
- Sacramental continuity cards and handoffs
- Person and Records request backlinks
- Relationship Intelligence record prefill links
- Parish onboarding readiness checklist
- Notifications Center
- Parish Care Calendar
- Parish Communication Center
- Parish Intake Queue
- Audit Log request target links
- Ownership Health
- Parish Ops Brief
- Communication Commitments
- Care Cadence
- Request Workflow detail links
- Care Timeline
- Global Search result links
- Dashboard Request Navigation
- Follow-Up Queue request links
- Email Dashboard Link Safety Boundary
- AI Source Path Safe Link Boundary
- Request relationship suggestion links
- Request linked-person profile links
- Record detail linked-person handoffs
- Entity directory detail and edit links
- Entity create/edit success and cancel navigation
- Mass intention detail and edit navigation

The utility preserves only links that normalize under `/dashboard` and drops blank, external, protocol-relative, API, JavaScript, login, dashboard-lookalike, dot-segment traversal, raw or encoded backslash, control-character, sensitive query/hash payload markers, or other non-dashboard destinations. Callers that need a guaranteed link use `safeDashboardHrefOrFallback`, which now falls back to `/dashboard` if both the candidate and supplied fallback are unsafe.

## Why This Matters

Staff dashboard cards and staff-facing readiness cues should guide people to normal Vinea dashboard queues, not to exports, API routes, outside websites, storage, signed URLs, login pages, action-like destinations, token-bearing destinations, raw AI payload references, or paths that only appear to start under the dashboard before browser normalization. A shared utility keeps that rule consistent across daily handoff, today-view request handoffs, role-prioritized work handoffs, main command center request handoffs, health score, insights, reminders, Catholic records continuity, person and records request backlinks, relationship intelligence record prefill links, request relationship suggestion links, request linked-person profile links, record detail linked-person handoffs, entity directory detail and edit links, entity create/edit success and cancel navigation, Mass intention detail and edit navigation, onboarding, notifications, parish work queues, audit log request target links, ownership cues, follow-up commitments, communication commitment card links, care cadence request handoffs, follow-up queue request links, request detail handoffs, care timelines, global search results, shared request navigation, generated staff email links, and AI source-display paths.

## Safety Boundary

This change:

- does not mutate records.
- does not send communications.
- does not enable automation.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not generate certificates.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not make public trust claims.

Catholic records, certificate, and continuity cues remain staff-reviewed and do not make sacramental, canonical, pastoral, or eligibility decisions.

## Verification

Focused tests prove:

- `/dashboard` links are preserved.
- unsafe links are dropped or replaced with a safe fallback.
- dashboard lookalikes and traversal paths such as `/dashboardevil`, `/dashboard/../api`, encoded dot-segment variants, and encoded backslash variants are dropped.
- sensitive query/hash payload markers such as tokens, signed URLs, storage paths, original filenames, raw AI prompts/outputs, and provider payloads are dropped.
- unsafe fallback values collapse to `/dashboard`.
- read-only dashboard DTOs still emit only dashboard-internal links.
- source-level boundary tests point to the shared utility and request workflow href helper instead of duplicate local copies.
- Catholic records continuity and onboarding readiness links stay dashboard-internal.

Command:

```powershell
npm.cmd test -- lib/safeDashboardHref.test.ts lib/dailyWorkHubOverview.test.ts lib/dailyOperatingSystemSignals.test.ts lib/dailyOfficeHandoffDigest.test.ts lib/dailyOfficeHandoffSavedViews.test.ts lib/parishHealthScore.test.ts lib/operationalIntelligenceBrief.test.ts lib/workflowReminderDtos.test.ts lib/workflowReminderDispositionDtos.test.ts lib/sacramentalRecordContinuity.test.ts lib/sacramentalRecordContinuityHandoff.test.ts lib/parishOnboardingReadiness.test.ts lib/server/dailyWorkHubSafeLinkBoundary.test.ts lib/server/dailyOperatingSignalSafeLinkBoundary.test.ts lib/server/dailyOfficeHandoffDigestSafeLinkBoundary.test.ts lib/server/parishHealthOperationalIntelligenceSafeLinkBoundary.test.ts lib/server/sacramentalRecordContinuitySafeLinkBoundary.test.ts lib/server/safeDashboardHrefUtility.test.ts
```

Expected result: pass.
