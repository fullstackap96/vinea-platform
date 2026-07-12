# Request Backlink Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY PERSON AND RECORD REQUEST LINK HARDENING`

Completion marker: `REQUEST_BACKLINK_SAFE_LINK_BOUNDARY_20260708`

This slice keeps Person and Records request backlinks on the shared `requestDetailHref` helper instead of rebuilding `/dashboard/requests/...` links in individual pages.

## Scope

Protected request backlinks:

- Person detail linked-request cards.
- Sacramental Record detail linked-request handoff.
- New Sacramental Record prefill source-request handoff.

## Why This Matters

These links help staff move from parishioner profiles and sacramental records back to the original intake request. Keeping them on the same safe request-detail helper preserves dashboard-internal navigation and avoids accidental drift as request-to-record continuity gets deeper.

## Safety Boundary

This change:

- does not mutate records.
- does not link records automatically.
- does not generate certificates.
- does not send communications.
- does not enable automation.
- does not call AI.
- does not run exports.
- does not access storage.
- does not create signed URLs.
- does not apply migrations.
- does not change operational RLS.
- does not access production.
- does not touch Google Calendar data.
- does not make public trust claims.

Catholic records and request-to-record continuity remain staff-reviewed and do not make sacramental, canonical, pastoral, or eligibility decisions.

## Verification

Focused tests prove:

- Person detail linked-request cards call `requestDetailHref(request.id)`.
- Record detail linked-request handoff calls `requestDetailHref(record.request_id)`.
- New record prefill source-request handoff calls `requestDetailHref(prefillRequestId)`.
- The previous local `/dashboard/requests/${...}` interpolation patterns do not return.
- The shared request detail helper remains on `safeDashboardHrefOrFallback`.

Command:

```powershell
npm.cmd test -- lib\server\requestBacklinkSafeLinkBoundary.test.ts lib\server\dashboardRequestNavigationSafeLinkBoundary.test.ts lib\server\safeDashboardHrefUtility.test.ts
```

Expected result: pass.
