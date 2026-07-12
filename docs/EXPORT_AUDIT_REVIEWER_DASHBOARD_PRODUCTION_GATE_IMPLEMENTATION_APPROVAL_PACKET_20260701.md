# Export Audit Reviewer Dashboard Production Gate Implementation Approval Packet - 2026-07-01

Status: Prepared as a product-owner approval packet for a future implementation step only. Production was not accessed, production dashboard exposure was not wired, production flags were not enabled, production navigation was not added, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, and no secrets were exposed while preparing this packet.

Current decision state: `PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD GATE IMPLEMENTATION NOT APPROVED; PRODUCTION DASHBOARD EXPOSURE REMAINS NO-GO; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260701`

## Purpose

This packet defines the exact product-owner approval needed before engineering may implement production-gate code for the export audit reviewer dashboard and its read-model API.

It does not approve enabling production flags, adding production navigation, running a production smoke, accessing production, applying migrations, changing operational RLS, touching Google Calendar data, mutating records, accessing storage, creating signed URLs, exposing raw audit metadata, exposing raw exports, or exposing secrets.

The implementation goal would be narrow: add disabled-by-default production-aware gate code for `/dashboard/admin/export-audit-reviewer` and `/api/export-audit-reviewer`, while preserving the existing non-production prototype gate, preserving flag-off production blocking, and preserving the post-implementation `NO-GO` boundary before any production smoke.

## Required Prior Evidence

Do not approve implementation unless all of these remain current and passing:

- `docs/EXPORT_AUDIT_REVIEWER_READ_MODEL_PLAN_20260701.md`
- `lib/server/exportAuditReviewerReadModel.ts`
- `lib/server/exportAuditReviewerReadModel.test.ts`
- `docs/EXPORT_AUDIT_REVIEWER_PROTOTYPE_APPROVAL_PACKET_20260701.md`
- `app/api/export-audit-reviewer/route.ts`
- `lib/server/exportAuditReviewerRoute.test.ts`
- `docs/EXPORT_AUDIT_REVIEWER_API_NONPRODUCTION_QA_EVIDENCE_20260701.md`
- `docs/EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260701_COMPLETED.md`
- `app/dashboard/admin/export-audit-reviewer/page.tsx`
- `app/dashboard/admin/export-audit-reviewer/ExportAuditReviewerDashboardPrototype.tsx`
- `lib/server/exportAuditReviewerDashboardPrototype.test.ts`
- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_QA_EVIDENCE_20260701.md`
- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701.md`
- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260701.md`
- `lib/server/exportAuditReviewerDashboardProductionSmokeIntakeWorksheet.test.ts`

## Exact Future Implementation Scope

If approved later, the implementation may touch only these intended files unless engineering stops and asks for separate approval:

- `lib/server/exportAuditReviewerProductionGate.ts`
- `lib/server/exportAuditReviewerProductionGate.test.ts`
- `lib/server/exportAuditReviewerProductionGatePreflight.ts`
- `lib/server/exportAuditReviewerProductionGatePreflight.test.ts`
- `app/api/export-audit-reviewer/route.ts`
- `lib/server/exportAuditReviewerRoute.test.ts`
- `app/dashboard/admin/export-audit-reviewer/page.tsx`
- `lib/server/exportAuditReviewerDashboardPrototype.test.ts`
- `lib/server/exportAuditReviewerDashboardProductionGatePagePreflight.test.ts`
- `docs/VINEA_BUILD_STATUS.md`
- Related export/trust validation tests that reference the new implementation state.

Expected implementation shape:

1. Extract or share the reviewer gate logic so the page and API evaluate the same gate decision.
2. Preserve the existing non-production reviewer prototype gate exactly for approved non-production QA work.
3. Preserve production blocking by default.
4. Add a production-specific gate path that can evaluate production smoke flags only when all required production-specific values are present.
5. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION=ENABLED` for production smoke preparation.
6. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ACK=APPROVED_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE` for production smoke preparation.
7. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ENV=PRODUCTION` for production smoke preparation.
8. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SURFACE_ALLOWLIST` to include `export_audit_reviewer_dashboard`.
9. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SURFACE_ALLOWLIST` to include `export_audit_reviewer_api_read_model`.
10. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_APPROVAL_ID` as a non-secret approval label.
11. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EXPIRES_AT` to parse as a future UTC timestamp inside the approved rollout window.
12. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER` as a non-secret owner label.
13. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL` as a non-secret monitoring channel label.
14. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER` as a non-secret support owner label.
15. Require `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER` as a non-secret evidence owner label.
16. Keep `/api/export-audit-reviewer` staff-authenticated and membership-scoped.
17. Keep active parish scope mandatory for reviewer data.
18. Keep the dashboard read-only and dependent on the API/read-model path.
19. Keep production exports shown as `NO-GO` unless a separate production export approval exists.
20. Keep the dashboard and API free of export/download controls, storage access, signed URLs, raw metadata, raw exports, token material, notes, communications, AI material, sacramental/canonical details, and mutation controls.

## Expected Tests

A future implementation must add or update tests proving:

- Default production behavior remains disabled with generic unavailable behavior.
- Existing non-production QA flags still enable only approved non-production environments.
- Existing non-production QA flags still fail closed in production.
- Production dashboard flags do not enable non-production accidentally.
- Production dashboard flags fail closed when the surface allowlist omits `export_audit_reviewer_dashboard`.
- Production dashboard flags fail closed when the surface allowlist omits `export_audit_reviewer_api_read_model`.
- Production dashboard flags fail closed when the approval id is missing.
- Production dashboard flags fail closed when `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_EXPIRES_AT` is missing, invalid, or expired.
- Production dashboard flags fail closed when rollback owner, monitoring channel, support owner, or evidence storage owner labels are missing.
- Production dashboard flags fail closed for any surface other than the dashboard and API read-model surfaces.
- Page source preflight proves production navigation is not added.
- Page source preflight proves the dashboard remains read-only and API/read-model backed.
- API source preflight proves staff authentication stays before parish-scoped data reads.
- API source preflight proves membership-backed active parish scope stays before `audit_events` queries.
- API source preflight proves only approved export audit actions are queried.
- API source preflight proves no storage APIs, signed URL APIs, raw export delivery, or mutation paths are introduced.
- API route tests still prove unauthenticated access is denied before parish scope or audit-event reads.
- API route tests still prove forged active parish or cross-parish access is denied.
- Dashboard tests still prove no export/download, file-open, storage, signed URL, raw metadata, raw export, token, AI, notes, communications, sacramental/canonical, delete, approve, reject, or merge controls render.

Suggested future test files:

- `lib/server/exportAuditReviewerProductionGate.test.ts`
- `lib/server/exportAuditReviewerProductionGatePreflight.test.ts`
- `lib/server/exportAuditReviewerRoute.test.ts`
- `lib/server/exportAuditReviewerDashboardPrototype.test.ts`
- `lib/server/exportAuditReviewerDashboardProductionGatePagePreflight.test.ts`

## Required Flag-Off Production Baseline

After implementation and before any production smoke approval, the product must still behave as:

- `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION` unset: dashboard and API unavailable in production.
- `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION=ENABLED` with no production acknowledgement: dashboard and API unavailable in production.
- `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE=ENABLED` with `APPROVED_EXPORT_AUDIT_REVIEWER_QA` in production: dashboard and API unavailable in production.
- `VINEA_EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION=ENABLED` with production acknowledgement but no allowlist, approval id, expiry, rollback owner, monitoring channel, support owner, or evidence storage owner: dashboard and API unavailable in production.
- No production navigation is visible or approved.
- No production exports are enabled.
- No production smoke has run.

The future implementation commit must record this baseline in `docs/VINEA_BUILD_STATUS.md`.

## Monitoring Requirements For Future Smoke

This implementation approval packet does not approve monitoring execution. It defines what must exist before a later production smoke approval:

- Named monitoring owner label.
- Named monitoring channel label.
- Named support owner label.
- Named rollback owner label.
- Named evidence storage owner label.
- `/api/health` baseline and post-check plan.
- Dashboard route status monitoring for `/dashboard/admin/export-audit-reviewer`.
- API route status monitoring for `/api/export-audit-reviewer`.
- Denial monitoring for unauthenticated, family, and forged active parish checks.
- Error-log inspection plan for dashboard/API failures.
- Confirmation that raw audit metadata, raw exports, signed URLs, storage paths, original filenames, document names, token material, notes, communications, AI material, sacramental/canonical details, credentials, and database URLs are not logged.
- Clear observation window from flag-on through rollback verification.

## Rollback Behavior

Future production-gate implementation must be reversible by disabling export audit reviewer dashboard production flags only.

Rollback must not require:

- Database rollback.
- Migration rollback.
- Operational RLS rollback.
- Google Calendar changes.
- Storage cleanup.
- Signed URL revocation.
- Export file cleanup.
- Record mutation cleanup.
- Production navigation removal.

The future implementation must preserve generic disabled behavior when flags are removed.

## Post-Implementation NO-GO Boundary

Even if product-owner approval is later granted to implement the production dashboard gate code, production dashboard exposure and production exports remain `NO-GO` after that implementation until a separate future prompt explicitly approves the production smoke rollout window.

The post-implementation state must be:

`PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD GATE CODE IMPLEMENTED; PRODUCTION FLAGS DISABLED; PRODUCTION DASHBOARD SMOKE NOT APPROVED; PRODUCTION EXPORTS REMAIN NO-GO`

Do not claim:

- Production dashboard exposure is enabled.
- Production smoke has run.
- Production navigation exists.
- Production exports are enabled.
- Reviewer disposition writes are approved.
- Raw audit metadata is available in the dashboard.
- Raw exports are available in the dashboard.
- Storage access or signed URL creation is approved.
- Field-level export permissions are complete.
- Diocesan export governance is production-ready.

## Exact Future Approval Language

The product owner must provide this exact approval before implementation work starts:

```text
Approve implementation of the export audit reviewer dashboard production gate code only. Implement the production-specific gate behind disabled-by-default flags, preserving the non-production QA gate, preserving flag-off production blocking, requiring dashboard/API surface allowlist, approval id, expiration, rollback owner, monitoring channel, support owner, and evidence storage owner labels, and keeping production flags disabled after implementation. Do not enable production flags, add production navigation, run production smoke, access production, apply migrations, change operational RLS, touch Google Calendar data, mutate records, access storage, create signed URLs, expose raw exports, expose raw metadata, or expose secrets. After implementation, production dashboard exposure and production exports remain NO-GO until I separately approve the production smoke rollout window.
```

Separate approval is still required later to enable the production smoke flags for an approved rollout window.

## Trust-Center Claim Boundary

Safe internal statement:

> Vinea has prepared a product-owner approval packet for future implementation of the export audit reviewer dashboard production gate, but the gate code is not implemented, production flags are disabled, production dashboard exposure remains off, and production exports remain off.

Do not claim production export audit review is customer-ready until production smoke evidence, rollback evidence, monitoring evidence, and sign-off evidence are complete.

## What Changed Plain English

This packet says exactly what engineering would be allowed to build later: a safety switch for the export-audit review screen in production. It does not build the switch and it does not turn anything on. It simply defines the files, flags, checks, rollback plan, and approval words that must exist before implementation can start.

The point is to keep Vinea moving toward production-grade oversight without accidentally exposing a production dashboard, raw audit logs, files, exports, or parish data.
