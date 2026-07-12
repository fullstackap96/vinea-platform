# Dashboard Request Navigation Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY REQUEST NAVIGATION LINK HARDENING`

Completion marker: `DASHBOARD_REQUEST_NAVIGATION_SAFE_LINK_BOUNDARY_20260708`

This slice hardens shared request navigation helpers used by dashboard request-name links, Follow-Up Queue request links, suggested actions, notification panels, and workflow reminder DTOs.

## What Changed

- `requestDetailHref` now trims and encodes request ids, falls back to `/dashboard/requests` when the id is blank, and passes generated links through the shared `safeDashboardHrefOrFallback` utility.
- `isRequestDetailHref` now checks the shared dashboard-only sanitizer before recognizing request-detail links.
- Workflow Reminder V1 request hrefs now use the same dashboard-only fallback boundary before reminder cards receive staff-facing links.
- Dashboard Follow-Up Queue request links now call the shared `requestDetailHref` helper instead of rebuilding request URLs locally in `DashboardPageCore`.

## Why This Matters

Request names, follow-up queue cards, and reminder cards are everyday staff navigation points. Keeping their links dashboard-internal makes the daily operating system safer when request ids come from imported data, test fixtures, or future integrations.

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

Workflow reminders remain staff-reviewed, dashboard-only guidance and do not send outbound communication.

## Verification

Focused tests prove:

- request detail links encode special characters.
- blank request ids fall back to `/dashboard/requests`.
- only safe request detail dashboard links are recognized as request links.
- Workflow Reminder request hrefs encode unsafe-shaped ids and stay dashboard-internal.
- Dashboard Follow-Up Queue request links use the shared request detail helper.
- source-level guard tests keep both helpers on the shared dashboard-only href utility.

Command:

```powershell
npm.cmd test -- lib/dashboardRequestNavigation.test.ts lib/workflowReminderDtos.test.ts lib/server/dashboardRequestNavigationSafeLinkBoundary.test.ts lib/server/dashboardFollowUpQueueSafeLinkBoundary.test.ts lib/server/safeDashboardHrefUtility.test.ts
```

Expected result: pass.
