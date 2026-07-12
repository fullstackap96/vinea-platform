# Export Audit Reviewer Dashboard Production Smoke Evidence Template - 2026-07-01

Status: Evidence template prepared only. Production was not accessed, production dashboard exposure was not enabled, production flags were not enabled, production navigation was not added, production smoke was not run, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, and no secrets were exposed while preparing this template.

Current decision state: `PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD SMOKE NOT EXECUTED; PRODUCTION DASHBOARD EXPOSURE REMAINS NO-GO; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260701`

## Purpose

Use this template only during a future explicitly approved production smoke of the export audit reviewer dashboard and its protected read-model API.

This template records the evidence required by:

- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701.md`
- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260701.md`
- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260701.md`
- `lib/server/exportAuditReviewerDashboardProductionGatePreflight.ts`
- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_QA_EVIDENCE_20260701.md`
- `docs/EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260701_COMPLETED.md`
- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`

This template does not approve production flags, production dashboard exposure, production navigation, production exports, reviewer disposition writes, dashboard gate implementation, migrations, operational RLS changes, Google Calendar behavior, storage access, signed URL creation, raw audit metadata exposure, raw export exposure, or record mutation.

## Current Gate Reality Check

Current production dashboard gate status: `PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD GATE CODE IS NOT IMPLEMENTED`

The current export audit reviewer dashboard is a non-production prototype only. A future production smoke requires all of these before this template can be executed:

- Product-owner approval to implement the production-specific dashboard/API gate.
- Passing source-level preflight for the future gate implementation.
- Production-specific dashboard/API flags that are disabled by default.
- Exact production app URL and approved rollout window.
- Named rollback owner, monitoring owner/channel, support owner, and evidence storage owner.
- Separate product-owner approval to enable production smoke flags for the approved window.

Do not treat this template as approval to implement or enable that gate.

## Evidence Privacy Rules

Record labels, counts, pass/fail observations, timestamps, redacted screenshots, and owner names only.

Do not paste:

- Staff passwords.
- One-time codes.
- Session cookies.
- Database URLs.
- Supabase anon keys.
- Supabase service role keys.
- Vercel tokens.
- Google OAuth tokens.
- OpenAI API keys.
- Raw parish IDs.
- Raw staff IDs.
- Raw request IDs.
- Raw document IDs.
- Raw audit event IDs.
- Family portal tokens or token hashes.
- Public intake tokens or token hashes.
- Signed URLs.
- Document storage paths.
- Original filenames.
- Document names if they reveal private details.
- Document file contents.
- Raw CSV or export contents.
- Raw audit metadata.
- Internal notes.
- Communication bodies.
- AI prompts, outputs, provider payloads, or token material.
- Sacramental/canonical details.

If evidence would require copying private parishioner data, do not copy it. Record a redacted observation instead.

## Rollout Identity

| Field | Value |
|---|---|
| Evidence date | `PENDING` |
| Production app URL | `PENDING_EXACT_PUBLIC_URL` |
| Production health route | `PENDING_EXACT_PUBLIC_URL/api/health` |
| Production dashboard route | `PENDING_EXACT_PUBLIC_URL/dashboard/admin/export-audit-reviewer` |
| Production reviewer API route | `PENDING_EXACT_PUBLIC_URL/api/export-audit-reviewer` |
| Production Supabase project label | `PENDING_NON_SECRET_LABEL` |
| Production deployment label | `PENDING_NON_SECRET_LABEL` |
| Git commit or release tag | `PENDING` |
| Rollout window start | `PENDING_EXACT_DATE_TIME_TIMEZONE` |
| Rollout window end | `PENDING_EXACT_DATE_TIME_TIMEZONE` |
| QA operator | `PENDING_NAME_OR_ROLE` |
| Product owner | `PENDING_NAME_OR_ROLE` |
| Security/data owner | `PENDING_NAME_OR_ROLE` |
| Engineering owner | `PENDING_NAME_OR_ROLE` |
| Parish operations owner | `PENDING_NAME_OR_ROLE` |
| Support owner | `PENDING_NAME_OR_ROLE` |
| Monitoring owner | `PENDING_NAME_OR_ROLE` |
| Monitoring channel | `PENDING_CHANNEL_LABEL` |
| Rollback owner | `PENDING_NAME_OR_ROLE` |
| Evidence storage owner | `PENDING_NAME_OR_ROLE` |
| Rollback decision deadline | `PENDING_EXACT_DATE_TIME_TIMEZONE` |
| Final pre-smoke decision | `PENDING_GO_OR_NO_GO` |

Pass criteria:

- Every owner is identified before production flags are enabled.
- The exact production app URL and rollout window match the final approval prompt.
- Monitoring owner and rollback owner are reachable during the whole rollout window.
- Final pre-smoke decision is `GO_PRODUCTION_EXPORT_AUDIT_REVIEWER_DASHBOARD_SMOKE`.

## Pre-Smoke Approval Record

| Role | Name | Approval time | Decision | Conditions |
|---|---|---|---|---|
| Product owner | `PENDING` | `PENDING` | `PENDING_GO_OR_NO_GO` | `PENDING` |
| Security/data owner | `PENDING` | `PENDING` | `PENDING_GO_OR_NO_GO` | `PENDING` |
| Engineering owner | `PENDING` | `PENDING` | `PENDING_GO_OR_NO_GO` | `PENDING` |
| Parish operations owner | `PENDING` | `PENDING` | `PENDING_GO_OR_NO_GO` | `PENDING` |
| Support owner | `PENDING` | `PENDING` | `PENDING_GO_OR_NO_GO` | `PENDING` |
| Monitoring owner | `PENDING` | `PENDING` | `PENDING_GO_OR_NO_GO` | `PENDING` |
| Rollback owner | `PENDING` | `PENDING` | `PENDING_GO_OR_NO_GO` | `PENDING` |
| Evidence storage owner | `PENDING` | `PENDING` | `PENDING_GO_OR_NO_GO` | `PENDING` |

Required decision before continuing: `GO_PRODUCTION_EXPORT_AUDIT_REVIEWER_DASHBOARD_SMOKE`

## Production-Safe Fixture Checklist

| Fixture | Required evidence | Result |
|---|---|---|
| Safe staff reviewer | Staff account label approved for production smoke; do not record password | `PENDING` |
| Staff parish membership | Staff account is authorized for the active parish fixture | `PENDING` |
| Active parish | Parish A label selected in active parish switcher | `PENDING` |
| Downloaded audit fixture | Safe downloaded export audit event label visible through read-model only | `PENDING` |
| Denied audit fixture | Safe denied export audit event label visible through read-model only | `PENDING` |
| Empty saved-filter fixture | Saved filter expected to show a safe empty state | `PENDING` |
| Cross-parish denial fixture | Forged active parish, unauthorized parish switch, or route-level substitute denies generically | `PENDING` |
| Family or unauthenticated denial method | Signed-out or family-facing substitute without recording token material | `PENDING` |
| Forbidden-data review | Dashboard/API excludes raw metadata, raw exports, storage, signed URLs, notes, communications, AI material, and sacramental/canonical details | `PENDING` |
| Audit inspection method | Staff Audit Log or protected query filtered to reviewer dashboard/API access observations without raw IDs | `PENDING` |
| Cleanup plan | Confirm flags disabled and no test artifacts need deletion | `PENDING` |

Pass criteria:

- Fixtures use labels only and no raw IDs.
- Downloaded and denied event rows display only safe read-model fields.
- Empty filter does not reveal fallback private data.
- Cross-parish and family/unauthenticated cases deny generically and return no read-model data.

## Pre-Smoke Health And Flag-Off Baseline

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| `/api/health` | HTTP 200 and `checks.schema=true` | `PENDING` | `PENDING` | `PENDING` |
| Dashboard flag-off | `/dashboard/admin/export-audit-reviewer` returns generic unavailable behavior or protected denial | `PENDING` | `PENDING` | `PENDING` |
| API flag-off | `/api/export-audit-reviewer` returns generic unavailable behavior before audit-event reads | `PENDING` | `PENDING` | `PENDING` |
| Production navigation baseline | No production navigation link to the dashboard is visible or approved | `PENDING` | `PENDING` | `PENDING` |
| Audit-log baseline | Current reviewer-related audit-event observation captured without raw IDs | `PENDING` | `PENDING` | `PENDING` |
| Monitoring baseline | Error rate and relevant dashboard/API logs observed without secrets | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Production health is green before any flag change.
- Dashboard and API are unavailable before approved production flag-on behavior.
- No production navigation is visible.
- Audit and monitoring baselines contain no secrets, raw IDs, raw metadata, raw exports, storage paths, filenames, document content, tokens, notes, communications, AI material, or sacramental/canonical details.

## Future Gate Flag Matrix

| Gate | Expected flag state | Actual flag state | Result |
|---|---|---|---|
| Flag-off baseline | Production reviewer dashboard flags unset or disabled | `PENDING` | `PENDING` |
| Production flag-on smoke | Approved production-specific reviewer dashboard/API flags enabled only for the approved smoke window | `PENDING_NOT_APPROVED_GATE_CODE_NOT_IMPLEMENTED` | `PENDING` |
| Surface allowlist | `export_audit_reviewer_dashboard` and `export_audit_reviewer_api_read_model` are the only approved surfaces | `PENDING` | `PENDING` |
| Approval id | Non-secret approval label matches final product-owner approval | `PENDING` | `PENDING` |
| Expiration | Timeboxed expiration is inside the approved rollout window | `PENDING` | `PENDING` |
| Rollback | Production reviewer dashboard flags unset or disabled again | `PENDING` | `PENDING` |

Pass criteria:

- QA/non-production flags cannot enable production dashboard exposure.
- Production flag-on behavior does not begin until the production-specific dashboard gate exists and is separately approved.
- Runtime enablement is limited to the approved dashboard/API smoke window.
- Rollback returns the dashboard and API to generic unavailable behavior.

## Flag-On Smoke Checks

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Health after flag enablement | `/api/health` remains HTTP 200 and `checks.schema=true` | `PENDING` | `PENDING` | `PENDING` |
| Staff authentication | Safe staff reviewer is authenticated; password not recorded | `PENDING` | `PENDING` | `PENDING` |
| Active parish selection | Parish A selected before opening reviewer dashboard | `PENDING` | `PENDING` | `PENDING` |
| Dashboard loads for selected parish | Dashboard loads only after approved staff auth and selected active parish membership scope | `PENDING` | `PENDING` | `PENDING` |
| Reviewer API loads read-model rows | API returns only safe read-model rows for selected active parish | `PENDING` | `PENDING` | `PENDING` |
| Downloaded filter row | Saved filter shows downloaded export event fixture using safe labels only | `PENDING` | `PENDING` | `PENDING` |
| Denied filter row | Saved filter shows denied export event fixture using safe labels only | `PENDING` | `PENDING` | `PENDING` |
| Empty filter row | Saved filter shows safe empty state with no fallback private data | `PENDING` | `PENDING` | `PENDING` |
| Cross-parish denial | Forged parish or unauthorized parish attempt returns generic denial and no rows | `PENDING` | `PENDING` | `PENDING` |
| Unauthenticated denial | Signed-out browser receives generic denial or unavailable state and no rows | `PENDING` | `PENDING` | `PENDING` |
| Family-facing denial | Family portal or family-facing substitute cannot access dashboard/API rows | `PENDING` | `PENDING` | `PENDING` |
| Forbidden data exclusions | Dashboard and API exclude raw audit metadata, raw export contents, token material, storage paths, signed URLs, document names, notes, communications, AI material, and sacramental/canonical details | `PENDING` | `PENDING` | `PENDING` |
| Forbidden control exclusions | Dashboard renders no export, download, file-open, storage, signed URL, approve, reject, delete, merge, or mutation controls | `PENDING` | `PENDING` | `PENDING` |
| No storage or signed URL usage | Smoke behavior does not call storage APIs, create signed URLs, open files, or deliver exports | `PENDING` | `PENDING` | `PENDING` |
| Production navigation boundary | No production navigation link is added unless a separate future approval explicitly allows it | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Dashboard succeeds only for authenticated staff with selected active parish membership scope.
- Denial cases are generic and return no read-model rows.
- Dashboard stays read-only and API/read-model backed.
- No raw metadata, raw exports, storage access, signed URLs, files, tokens, internal notes, communication bodies, AI material, or sacramental/canonical details are exposed.

## Audit And Reviewer Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Dashboard/API access observation | Access can be correlated with safe route/status observations without raw metadata | `PENDING` | `PENDING` | `PENDING` |
| Downloaded event read-model | Read-model row displays approved safe fields only | `PENDING` | `PENDING` | `PENDING` |
| Denied event read-model | Read-model row displays approved safe fields only | `PENDING` | `PENDING` | `PENDING` |
| Saved filter counts | Counts are safe aggregate numbers only | `PENDING` | `PENDING` | `PENDING` |
| Audit metadata exclusions | No raw audit metadata, raw export contents, storage paths, signed URLs, token material, notes, communications, AI material, credentials, Google payloads, OpenAI payloads, or raw database rows | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Reviewer evidence proves the dashboard can inspect downloaded and denied export audit events without becoming a second export surface.
- Evidence screenshots and notes contain only safe read-model labels, counts, statuses, and redacted observations.

## Monitoring Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Health monitoring | Health remains green before, during, and after smoke | `PENDING` | `PENDING` | `PENDING` |
| Dashboard route status monitoring | Expected dashboard success and denial status behaviors observed | `PENDING` | `PENDING` | `PENDING` |
| API route status monitoring | Expected API success and denial status behaviors observed | `PENDING` | `PENDING` | `PENDING` |
| Error monitoring | No unexpected server errors | `PENDING` | `PENDING` | `PENDING` |
| Leakage monitoring | No logs contain secrets, raw metadata, raw exports, raw IDs, storage paths, filenames, document content, tokens, notes, communications, AI material, or sacramental/canonical details | `PENDING` | `PENDING` | `PENDING` |
| Owner observation | Monitoring owner signs off on observations | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Monitoring owner sees no unexpected errors or sensitive-data leakage signals.
- Any unexpected event triggers rollback review before continued availability.

## Rollback Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Flags disabled | Production reviewer dashboard flags disabled or production-specific enablement removed | `PENDING` | `PENDING` | `PENDING` |
| Health after rollback | `/api/health` remains HTTP 200 and `checks.schema=true` | `PENDING` | `PENDING` | `PENDING` |
| Dashboard after rollback | Dashboard returns generic unavailable behavior or protected denial | `PENDING` | `PENDING` | `PENDING` |
| API after rollback | API returns generic unavailable behavior before audit-event reads | `PENDING` | `PENDING` | `PENDING` |
| Navigation after rollback | No production navigation link is visible or approved | `PENDING` | `PENDING` | `PENDING` |
| Rollback owner sign-off | Rollback owner confirms rollback or approved continued disabled state | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Rollback requires no migration, operational RLS change, Google Calendar change, storage-object mutation, signed URL revocation, export file cleanup, record mutation, or production navigation removal.
- Dashboard and API return to generic unavailable behavior unless a separate approval explicitly authorizes continued availability.

## Cleanup And Deactivation

| Item | Expected | Actual | Result |
|---|---|---|---|
| Test session cleanup | Staff session closed or allowed to expire naturally | `PENDING` | `PENDING` |
| Production reviewer flags | Disabled or confirmed unavailable | `PENDING` | `PENDING` |
| Temporary artifacts | No records, documents, storage objects, export files, or navigation links created by smoke | `PENDING` | `PENDING` |
| Evidence redaction | Screenshots/log excerpts redacted for secrets and sensitive data | `PENDING` | `PENDING` |
| Support note | Support owner informed of result and boundary | `PENDING` | `PENDING` |

## Rollback Decision

Final rollback decision: `PENDING_ROLLBACK_OR_CONTINUED_NO_GO`

Allowed final outcomes:

- `SMOKE_PASSED_AND_FLAGS_DISABLED`
- `SMOKE_FAILED_AND_FLAGS_DISABLED`
- `SMOKE_NOT_RUN_NO_APPROVAL`
- `SMOKE_BLOCKED_BY_MISSING_PRODUCTION_GATE`

Any continued production dashboard availability requires a separate product-owner approval and staff-facing navigation/support decision.

## Final Sign-Off

| Role | Name | Decision | Time | Notes |
|---|---|---|---|---|
| Product owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Security/data owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Engineering owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Parish operations owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Support owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Monitoring owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Rollback owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Evidence storage owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` |

## Sanitized Evidence JSON Template

```json
{
  "target": "production-export-audit-reviewer-dashboard-smoke",
  "dashboardRoute": "/dashboard/admin/export-audit-reviewer",
  "apiRoute": "/api/export-audit-reviewer",
  "productionTouched": "PENDING",
  "productionDashboardExposureEnabled": "PENDING",
  "productionExportsEnabled": false,
  "productionNavigationAdded": false,
  "migrationsApplied": false,
  "operationalRlsChanged": false,
  "googleCalendarTouched": false,
  "storageAccessed": false,
  "signedUrlsCreated": false,
  "recordsMutated": false,
  "flagOffBaseline": {
    "healthStatus": "PENDING",
    "schemaTrue": "PENDING",
    "dashboardUnavailable": "PENDING",
    "apiUnavailable": "PENDING",
    "navigationAbsent": "PENDING"
  },
  "flagOnSmoke": {
    "runtimeGateStatus": "PENDING_NOT_APPROVED_GATE_CODE_NOT_IMPLEMENTED",
    "staffAuthenticated": "PENDING",
    "selectedParishScoped": "PENDING",
    "downloadedFilterVisible": "PENDING",
    "deniedFilterVisible": "PENDING",
    "emptyFilterSafe": "PENDING",
    "crossParishDenied": "PENDING",
    "familyOrUnauthenticatedDenied": "PENDING",
    "forbiddenDataMarkers": "PENDING_REDACTED_COUNT_ONLY",
    "forbiddenControlMarkers": "PENDING_REDACTED_COUNT_ONLY"
  },
  "monitoring": {
    "healthGreen": "PENDING",
    "unexpectedErrors": "PENDING",
    "leakageSignals": "PENDING"
  },
  "rollback": {
    "flagsDisabled": "PENDING",
    "healthStatus": "PENDING",
    "schemaTrue": "PENDING",
    "dashboardUnavailable": "PENDING",
    "apiUnavailable": "PENDING",
    "navigationAbsent": "PENDING"
  },
  "finalOutcome": "PENDING"
}
```

## Remaining Risks

- This is a template only.
- Production export audit reviewer dashboard exposure remains `NO-GO`.
- Production exports remain `NO-GO`.
- Production navigation remains unapproved.
- Production reviewer dashboard gate code is not implemented.
- A production-specific dashboard/API runtime enablement path is not approved by this template.
- Reviewer disposition writes remain unapproved.
- Production RLS remains `NO-GO` until explicit approval, production target details, production-safe smoke evidence, monitoring evidence, and rollback readiness are complete.

## What Changed Plain English

This template gives Vinea a blank evidence form for a future production test of the export-audit review screen. It says exactly what to record, what not to paste, what must pass, and how to prove rollback. It does not approve the test, build the production gate, add navigation, or turn anything on.

## Next Recommended Safe Step

Production export audit reviewer dashboard exposure remains `NO-GO`. Continue safe non-production trust-center or tenant-readiness work until the product owner approves production gate implementation, the gate implementation passes checks, and the product owner later approves the exact production smoke rollout window.
