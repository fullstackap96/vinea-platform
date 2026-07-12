# Request Workflow Detail Href Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY REQUEST DETAIL LINK HARDENING`

Completion marker: `REQUEST_WORKFLOW_DETAIL_HREF_SAFE_LINK_BOUNDARY_20260708`

This slice hardens the shared `requestWorkflowDetailHref` helper used by request workflow cues, main dashboard command center request links, and staff-facing care plan handoffs.

## What Changed

- `requestWorkflowDetailHref` now trims request ids, encodes request ids, and falls back to `/dashboard/requests` when no usable request id is available.
- The helper passes generated links through the shared `safeDashboardHrefOrFallback` dashboard-only utility.
- The main dashboard command center consumes `StaffCommandCenter` DTO-provided `detailHref` values instead of rebuilding request URLs in the component.
- Funeral bereavement care plans now use the shared request workflow detail helper instead of building request detail links directly.

## Why This Matters

Several daily staff surfaces point people back to request detail sections. Keeping those links behind one shared dashboard-internal helper reduces drift across the Daily Work Hub, staff command center, care cadence, and bereavement care handoff cues.

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

Catholic records, certificate, and request workflow cues remain staff-reviewed and do not make sacramental, canonical, pastoral, or eligibility decisions.

## Verification

Focused tests prove:

- shared request workflow detail links encode unsafe request id characters.
- blank request ids fall back to the safe request dashboard.
- funeral bereavement care plans use the shared request workflow detail helper.
- source-level guard tests keep the helper and command center handoff documented as dashboard-internal and read-only.

Command:

```powershell
npm.cmd test -- lib/requestWorkflowV2.test.ts lib/carePlans.test.ts lib/careCadence.test.ts lib/staffCommandCenter.test.ts lib/server/requestWorkflowDetailHrefSafeLinkBoundary.test.ts lib/server/dashboardCommandCenterSafeLinkBoundary.test.ts lib/server/safeDashboardHrefUtility.test.ts
```

Expected result: pass.
