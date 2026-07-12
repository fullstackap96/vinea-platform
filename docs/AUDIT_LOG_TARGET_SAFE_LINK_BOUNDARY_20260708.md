# Audit Log Target Safe Link Boundary - 2026-07-08

Status: `IMPLEMENTED - READ-ONLY AUDIT TARGET LINK HARDENING`

Completion marker: `AUDIT_LOG_TARGET_SAFE_LINK_BOUNDARY_20260708`

This slice keeps Audit Log request target links on the shared `requestDetailHref` helper plus the dashboard-only sanitizer instead of rebuilding `/dashboard/requests/...` links inside the admin page.

## What Changed

- `app/dashboard/admin/audit-log/AuditLogPage.tsx` now uses `requestDetailHref(event.target_id)` and `safeDashboardHrefOrFallback` for request-target audit events with the `activity` anchor.
- Added a source-level guard test so future edits keep request-target links on the shared dashboard-only sanitizer path.

## Why This Matters

The Audit Log is a trust and security surface. Staff and admins may open request activity from an audit event while reviewing parish work. Keeping those links dashboard-internal reduces drift and keeps audit handoffs aligned with the rest of Vinea's safe request navigation.

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
- does not touch Google Calendar data.
- does not make public trust claims.

The Audit Log API, selected active parish scope, filters, refresh behavior, and event rendering remain unchanged.

## Verification

Focused tests prove:

- Audit Log request target links use `requestDetailHref(event.target_id)` and `safeDashboardHrefOrFallback`.
- The previous local `/dashboard/requests/${...}#activity` interpolation pattern does not return.
- The shared request detail helper remains on `safeDashboardHrefOrFallback`.
- Current-state docs reference this read-only safety boundary.

Command:

```powershell
npm.cmd test -- lib\server\auditLogTargetSafeLinkBoundary.test.ts lib\server\dashboardRequestNavigationSafeLinkBoundary.test.ts lib\server\safeDashboardHrefUtility.test.ts
```

Expected result: pass.
