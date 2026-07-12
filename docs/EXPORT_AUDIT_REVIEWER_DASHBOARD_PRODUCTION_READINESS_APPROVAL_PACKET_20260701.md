# Export Audit Reviewer Dashboard Production Readiness Approval Packet - 2026-07-01

Status: Prepared as a production-readiness and product-owner approval packet only. Production was not accessed, production flags were not enabled, production navigation was not added, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, and no secrets were exposed.

Current decision state: `PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD NOT APPROVED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701`

## Purpose

This packet defines the evidence, owners, fixture labels, monitoring expectations, rollback behavior, and exact future approval language required before Vinea may expose the export audit reviewer dashboard in production.

The dashboard is a review surface only. It does not approve production export routes, production export runtime flags, staff-facing export/download buttons, reviewer disposition writes, production navigation, signed URL delivery, storage access, raw audit metadata, raw exports, migrations, operational RLS changes, Google Calendar behavior, or record mutation.

## Evidence Already Completed

The following non-production evidence must remain current before any future production dashboard exposure is considered:

- Export audit reviewer read-model plan: `docs/EXPORT_AUDIT_REVIEWER_READ_MODEL_PLAN_20260701.md`
- Export audit reviewer read-model builder implementation evidence through tests: `lib/server/exportAuditReviewerReadModel.test.ts`
- Export audit reviewer API route: `app/api/export-audit-reviewer/route.ts`
- Export audit reviewer API route tests: `lib/server/exportAuditReviewerRoute.test.ts`
- Export audit reviewer API route-level QA evidence: `docs/EXPORT_AUDIT_REVIEWER_API_NONPRODUCTION_QA_EVIDENCE_20260701.md`
- Export audit reviewer API live non-production smoke evidence: `docs/EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260701_COMPLETED.md`
- Export audit reviewer API sanitized JSON evidence: `docs/EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260701.json`
- Export audit reviewer dashboard prototype page: `app/dashboard/admin/export-audit-reviewer/page.tsx`
- Export audit reviewer dashboard prototype component: `app/dashboard/admin/export-audit-reviewer/ExportAuditReviewerDashboardPrototype.tsx`
- Export audit reviewer dashboard prototype tests: `lib/server/exportAuditReviewerDashboardPrototype.test.ts`
- Export audit reviewer dashboard live browser QA evidence: `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_QA_EVIDENCE_20260701.md`
- Trust-center readiness packet: `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`

## Required Product Decisions Before Production

Production exposure remains `NO-GO` until the product owner provides non-secret answers for:

- Production app URL label.
- Production deployment label.
- Production Supabase project label.
- Approved production rollout window.
- Rollback owner label.
- Monitoring owner label.
- Monitoring channel label.
- Support owner label.
- Security/data owner sign-off label.
- Parish operations owner sign-off label.
- Evidence storage owner label.
- Decision on whether the dashboard is direct-URL-only or visible in production navigation.

If production navigation is requested, it requires a separate navigation/UI approval packet. This packet does not approve production navigation.

## Production-Safe Fixture Requirements

The future production smoke must use labels only. Do not record raw database IDs, session cookies, passwords, service-role keys, Vercel tokens, Supabase tokens, storage paths, signed URLs, document names, raw audit metadata, raw CSV contents, notes, communications, AI payloads, or sacramental/canonical details.

Required fixture labels:

- Safe staff reviewer label: `PRODUCTION_EXPORT_AUDIT_REVIEWER_SAFE_STAFF`
- Active parish label: `PRODUCTION_EXPORT_AUDIT_REVIEWER_PARISH_A`
- Export audit downloaded event label: `PRODUCTION_EXPORT_AUDIT_REVIEWER_DOWNLOADED_EVENT`
- Export audit denied event label: `PRODUCTION_EXPORT_AUDIT_REVIEWER_DENIED_EVENT`
- Empty saved-filter label: `PRODUCTION_EXPORT_AUDIT_REVIEWER_EMPTY_FILTER_CASE`
- Cross-parish or forged-parish denial method label: `PRODUCTION_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_METHOD`
- Family or unauthenticated denial method label: `PRODUCTION_EXPORT_AUDIT_REVIEWER_FAMILY_OR_UNAUTH_DENIAL_METHOD`
- Rollback verification method label: `PRODUCTION_EXPORT_AUDIT_REVIEWER_ROLLBACK_METHOD`

Fixture requirements:

- The staff reviewer must be authorized for the active parish.
- The selected active parish must have at least one safe downloaded export audit event and one safe denied export audit event.
- Denied export events must contain only safe reviewer metadata in the read model.
- Cross-parish and family/unauthenticated denial checks must return generic denial and must not expose object IDs, tokens, storage paths, file names, or private parish data.
- Empty filters must show only the dashboard empty state.

## Production Runtime Gate Strategy

Current production behavior must remain disabled by default.

Future production exposure requires a separate implementation approval before code changes. That future implementation must:

1. Preserve the existing non-production reviewer prototype gate for QA.
2. Keep production blocked unless a production-specific reviewer gate is implemented and explicitly enabled.
3. Require a production acknowledgement value distinct from the QA acknowledgement.
4. Require a route/surface allowlist containing `export_audit_reviewer_dashboard`.
5. Require an approval id label.
6. Require an expiration timestamp inside the approved rollout window.
7. Require rollback owner and monitoring channel labels.
8. Keep `/api/export-audit-reviewer` staff-authenticated and membership-scoped.
9. Keep the dashboard read-only and dependent on the API/read-model path.
10. Keep forbidden-data checks before production exposure.

This packet does not implement the production gate. It only defines the future approval requirements.

## Production Smoke Gates

The future production smoke is `NO-GO` unless all gates pass:

1. `/api/health` returns `checks.schema: true` before any flag change.
2. Production dashboard route is unavailable with production reviewer flags off.
3. Staff sign-in works for the safe staff reviewer fixture.
4. Active parish selection is set to the approved active parish.
5. Production reviewer gate flags are enabled only for the approved rollout window.
6. Dashboard loads only after the production reviewer gate is approved.
7. Selected parish label matches the active parish.
8. Production exports still show `NO-GO` unless a separate production export approval exists.
9. Saved filters render and update results.
10. Downloaded and denied rows show safe reviewer fields only.
11. Empty saved filters show safe empty state.
12. Cross-parish or forged parish denial is generic.
13. Family or unauthenticated access is denied generically.
14. No export/download controls render.
15. No file-open, document-open, storage, signed URL, raw metadata, raw export, token, AI, notes, communications, sacramental/canonical, delete, approve, reject, or merge controls render.
16. Monitoring owner confirms no unexpected server errors or leakage signals.
17. Rollback by disabling flags returns the dashboard to unavailable behavior.
18. `/api/health` returns `checks.schema: true` after rollback.

## Monitoring Expectations

Monitoring owner placeholder: `EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_OWNER`

Monitoring channel placeholder: `EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL`

Monitor during the approved production smoke window:

- `/api/health` before, during, and after rollback.
- `/dashboard/admin/export-audit-reviewer` status.
- `/api/export-audit-reviewer` status.
- Unauthorized, unauthenticated, and forged active parish denial status.
- Repeated denied reviewer access.
- Server errors from the dashboard route or reviewer API.
- Any log entry containing raw audit metadata, storage paths, signed URLs, original filenames, token material, raw export contents, notes, communications, AI payloads, sacramental/canonical details, credentials, or database URLs.

## Support Handling

Support owner placeholder: `EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER`

Support must be ready to answer:

- Why the reviewer dashboard is unavailable when flags are off.
- Why a staff member sees generic unavailable behavior.
- Why a parish has no export audit summaries.
- How to escalate suspected cross-parish data exposure.
- How to roll back dashboard exposure.

Support must not ask parish staff to send screenshots containing private parishioner data, raw audit metadata, CSV exports, document links, signed URLs, storage paths, tokens, passwords, or service credentials.

## Rollback Behavior

Rollback owner placeholder: `EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER`

Rollback must be possible by disabling reviewer dashboard production flags only.

Rollback must not require:

- Database migration rollback.
- Operational RLS rollback.
- Google Calendar changes.
- Storage cleanup.
- Signed URL revocation.
- Record mutation cleanup.
- Export file cleanup.

Post-rollback verification:

1. Dashboard route returns the generic unavailable state.
2. Reviewer API returns generic unavailable behavior unless separately approved for production monitoring.
3. `/api/health` returns `checks.schema: true`.
4. No new export delivery events were created by the reviewer dashboard.
5. Evidence is recorded without secrets or raw data.

## Production UI Boundary

Current UI decision: `NO PRODUCTION NAVIGATION APPROVED`

Production direct-URL smoke may be approved later only if the product owner provides exact future approval language. Adding navigation, dashboard cards, sidebar links, settings links, or production help copy requires a separate approval packet.

The future production UI must remain:

- Read-only.
- Staff-authenticated.
- Active-parish scoped.
- Membership-scoped.
- API/read-model backed.
- Free of export/download controls.
- Free of raw metadata and file controls.
- Free of reviewer disposition writes until separately approved.

## Pass / Fail Criteria

Pass only if:

- Flag-off baseline blocks the dashboard.
- Flag-on approved production smoke displays only safe read-model fields.
- Selected active parish scope is correct.
- Downloaded and denied filters show safe rows.
- Empty filters show safe empty state.
- Unauthenticated/family access is denied.
- Cross-parish or forged active parish access is denied.
- No forbidden data or controls render.
- Monitoring is clean.
- Rollback closes the dashboard.

Fail and roll back immediately if:

- Health fails.
- Dashboard loads without the approved production gate.
- Dashboard shows data for the wrong parish.
- Dashboard renders raw metadata, token material, storage paths, signed URLs, original filenames, raw exports, notes, communications, AI material, sacramental/canonical details, or file controls.
- Dashboard includes export/download or mutation controls.
- Denial behavior reveals private details.
- Monitoring owner reports leakage, unexplained server errors, or unexpected audit activity.

## Exact Future Approval Language

Use this exact language only after the product owner fills production-safe fixture labels, owners, production target labels, rollout window, and monitoring channel:

```text
Approve production smoke preparation for the export audit reviewer dashboard only. Implement the production-specific reviewer dashboard gate behind disabled-by-default flags, preserving non-production QA behavior, preserving flag-off production blocking, requiring route/surface allowlist, approval id, expiration, rollback owner, monitoring channel, and support owner labels, and keeping production navigation disabled. Do not enable production flags, add production navigation, enable production exports, apply migrations, change operational RLS, touch Google Calendar data, mutate records, access storage, create signed URLs, expose raw exports, expose raw metadata, or expose secrets. After implementation, production dashboard exposure remains NO-GO until I separately approve the exact production smoke rollout window.
```

Separate approval is still required later to enable production smoke flags during the approved rollout window.

## What Changed Plain English

Vinea now has a careful checklist for what would be required before the hidden export-audit review screen could ever be tested in production. It does not turn anything on. It simply names the owners, safe test labels, monitoring checks, rollback steps, and approval language that must exist before production exposure is allowed.

This helps Vinea keep moving toward serious export oversight while keeping production exports and production dashboard exposure off until a human deliberately approves the next step.
