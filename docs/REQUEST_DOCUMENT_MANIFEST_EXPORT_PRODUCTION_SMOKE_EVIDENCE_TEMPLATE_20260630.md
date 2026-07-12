# Request Document Manifest Export Production Smoke Evidence Template - 2026-06-30

Status: Evidence template prepared only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this template.

Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT SMOKE NOT EXECUTED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260630`

## Purpose

Use this template only during a future explicitly approved production smoke of the `request_document_manifest` export route.

This template records the evidence required by:

- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`
- `docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md`
- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`

This template does not approve production runtime flags, production export availability, staff-facing production UI, signed URL delivery, storage path exposure, original filename export, document file delivery, bulk document export, migrations, operational RLS changes, Google Calendar behavior, or any export beyond `request_document_manifest`.

## Current Runtime Gate Reality Check

Current export runtime gate status: `PRODUCTION RUNTIME EXPORT GATE IS STILL PRODUCTION-BLOCKED`

The current disabled export runtime gate is designed for non-production QA only:

- `VINEA_EXPORT_RUNTIME=ENABLED`
- `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
- `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`

The current gate blocks production environments. A future production smoke therefore requires a separate approved production-runtime gate change or production-specific enablement mechanism before this evidence template can be executed.

Do not treat this template as approval to change that gate.

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
- Raw request IDs.
- Raw document IDs.
- Raw audit event IDs.
- Family portal tokens or token hashes.
- Public intake tokens or token hashes.
- Signed URLs.
- Document storage paths.
- Original filenames.
- Document file contents.
- Raw CSV contents.
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
| Production export route | `PENDING_EXACT_PUBLIC_URL/api/exports/requests/documents/manifest` |
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
| Rollback decision deadline | `PENDING_EXACT_DATE_TIME_TIMEZONE` |
| Final pre-smoke decision | `PENDING_GO_OR_NO_GO` |

Pass criteria:

- Every owner is identified before production flags are enabled.
- The exact production app URL and rollout window match the final approval prompt.
- Monitoring owner and rollback owner are reachable during the whole rollout window.
- Final pre-smoke decision is `GO_PRODUCTION_REQUEST_DOCUMENT_MANIFEST_SMOKE`.

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

Required decision before continuing: `GO_PRODUCTION_REQUEST_DOCUMENT_MANIFEST_SMOKE`

## Production-Safe Fixture Checklist

| Fixture | Required evidence | Result |
|---|---|---|
| Safe staff fixture | Staff account label approved for production smoke; do not record password | `PENDING` |
| Staff parish membership | Staff account is authorized for the active parish fixture | `PENDING` |
| Active parish | Parish A label selected in active parish switcher | `PENDING` |
| Same-parish request | Safe same-parish request label; no raw request ID | `PENDING` |
| Same-parish document set | Safe generic document checklist labels only; no filenames, paths, or contents | `PENDING` |
| Cross-parish denial fixture | Safe denial label or route-level substitute; no raw parish/request/document IDs | `PENDING` |
| Blocked-field attempt | Attempt includes `signed_url`, `storage_path`, `original_filename`, and `portal_token` | `PENDING` |
| Family or unauthenticated denial method | Signed-out or family-facing substitute without recording token material | `PENDING` |
| Audit inspection method | Staff Audit Log filtered to `export.request_document_manifest.downloaded` | `PENDING` |
| Cleanup plan | Confirm flags disabled and no test artifacts need deletion | `PENDING` |

Pass criteria:

- Same-parish fixture is safe for manifest-only document readiness evidence.
- Document set labels are generic and safe.
- No fixture requires opening files, creating signed URLs, exposing storage paths, exporting original filenames, or recording raw IDs.
- Cross-parish and family/unauthenticated fixtures are expected to deny generically with no CSV delivery.

## Pre-Smoke Health And Flag-Off Baseline

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| `/api/health` | HTTP 200 and `checks.schema=true` | `PENDING` | `PENDING` | `PENDING` |
| Export route flag-off | `/api/exports/requests/documents/manifest` returns generic unavailable behavior before auth, query, audit, or delivery | `PENDING` | `PENDING` | `PENDING` |
| Audit-log baseline | Current `export.request_document_manifest.downloaded` count or observation captured without raw IDs | `PENDING` | `PENDING` | `PENDING` |
| Monitoring baseline | Error rate and relevant export-route logs observed without secrets | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Production health is green before any flag change.
- The route is unavailable before approved production flag-on behavior.
- Audit and monitoring baselines contain no secrets, raw IDs, raw CSV, document paths, filenames, or private content.

## Flag State Matrix

| Gate | Expected flag state | Actual flag state | Result |
|---|---|---|---|
| Flag-off baseline | Export runtime flags unset or disabled | `PENDING` | `PENDING` |
| Production flag-on smoke | Approved production-specific export runtime mechanism enabled only for the approved smoke window | `PENDING_NOT_APPROVED_CURRENT_GATE_IS_PRODUCTION_BLOCKED` | `PENDING` |
| Rollback | Export runtime flags unset or disabled again | `PENDING` | `PENDING` |

Pass criteria:

- Production flag-on behavior does not begin until a separate approved production-runtime enablement path exists.
- Runtime enablement is limited to the approved `request_document_manifest` smoke window.
- Rollback returns the export route to generic unavailable behavior.

## Flag-On Smoke Checks

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Health after flag enablement | `/api/health` remains HTTP 200 and `checks.schema=true` | `PENDING` | `PENDING` | `PENDING` |
| Staff authentication | Safe staff fixture is authenticated; password not recorded | `PENDING` | `PENDING` | `PENDING` |
| Active parish selection | Parish A selected before export request | `PENDING` | `PENDING` | `PENDING` |
| Same-parish manifest success | Authenticated staff receives CSV for selected active parish only | `PENDING` | `PENDING` | `PENDING` |
| Approved CSV fields | CSV contains only approved `request_document_manifest` fields | `PENDING` | `PENDING` | `PENDING` |
| CSV field exclusions | CSV excludes signed URLs, storage paths, original filenames, document contents, tokens, notes, communications, AI material, Google payloads, and sacramental/canonical markers | `PENDING` | `PENDING` | `PENDING` |
| Cross-parish denial | Cross-parish or unauthorized active parish attempt returns generic denial with no CSV | `PENDING` | `PENDING` | `PENDING` |
| Blocked signed URL field | `signed_url` blocked-field attempt returns generic denial with no CSV | `PENDING` | `PENDING` | `PENDING` |
| Blocked storage path field | `storage_path` blocked-field attempt returns generic denial with no CSV | `PENDING` | `PENDING` | `PENDING` |
| Blocked original filename field | `original_filename` blocked-field attempt returns generic denial with no CSV | `PENDING` | `PENDING` | `PENDING` |
| Blocked portal token field | `portal_token` blocked-field attempt returns generic denial with no CSV | `PENDING` | `PENDING` | `PENDING` |
| Family/unauthenticated denial | Signed-out or family-facing substitute is denied before parish scope, query, audit, or delivery | `PENDING` | `PENDING` | `PENDING` |
| No signed URL/storage/file API usage | Route source and smoke behavior do not create signed URLs, touch storage APIs, or deliver files | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Same-parish export succeeds only for the selected active parish.
- Denial cases are generic and deliver no CSV.
- No signed URLs, storage paths, original filenames, document files, tokens, notes, communications, AI material, or sacramental/canonical details are exposed.

## Audit Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Audit event action | `export.request_document_manifest.downloaded` appears for approved same-parish export | `PENDING` | `PENDING` | `PENDING` |
| Audit target | Target is safe export target, such as `export/request_document_manifest` | `PENDING` | `PENDING` | `PENDING` |
| Safe audit metadata | Metadata includes route id, export preset id, active parish context, delivery mode, file type, runtime gate state, and safe row-count metadata only | `PENDING` | `PENDING` | `PENDING` |
| Audit metadata exclusions | No raw CSV, document contents, original filenames, storage paths, signed URLs, token material, notes, communications, AI material, credentials, Google payloads, OpenAI payloads, or raw database rows | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Audit metadata proves the approved same-parish export happened.
- Audit evidence does not become a second export of sensitive data.

## Monitoring Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Health monitoring | Health remains green before, during, and after smoke | `PENDING` | `PENDING` | `PENDING` |
| Route status monitoring | Expected success and denial status codes observed | `PENDING` | `PENDING` | `PENDING` |
| Error monitoring | No unexpected server errors | `PENDING` | `PENDING` | `PENDING` |
| Leakage monitoring | No logs contain secrets, raw CSV, raw IDs, storage paths, filenames, document content, tokens, notes, communications, AI material, or sacramental/canonical details | `PENDING` | `PENDING` | `PENDING` |
| Owner observation | Monitoring owner signs off on observations | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Monitoring owner sees no unexpected errors or sensitive-data leakage signals.
- Any unexpected event triggers rollback review before continued availability.

## Rollback Evidence

| Check | Expected | Actual | Evidence location | Result |
|---|---|---|---|---|
| Flags disabled | Export runtime flags disabled or production-specific enablement removed | `PENDING` | `PENDING` | `PENDING` |
| Health after rollback | `/api/health` remains HTTP 200 and `checks.schema=true` | `PENDING` | `PENDING` | `PENDING` |
| Export route after rollback | Route returns generic unavailable behavior | `PENDING` | `PENDING` | `PENDING` |
| Audit after rollback | No unexpected new `export.request_document_manifest.downloaded` events after rollback | `PENDING` | `PENDING` | `PENDING` |
| Rollback owner sign-off | Rollback owner confirms rollback or approved continued disabled state | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Rollback requires no migration, operational RLS change, Google Calendar change, storage-object mutation, document deletion, or data repair.
- Route returns to generic unavailable behavior unless a separate approval explicitly authorizes continued availability.

## Cleanup And Deactivation

| Item | Expected | Actual | Result |
|---|---|---|---|
| Test session cleanup | Staff session closed or allowed to expire naturally | `PENDING` | `PENDING` |
| Export flags | Disabled or confirmed unavailable | `PENDING` | `PENDING` |
| Temporary artifacts | No document files, storage objects, or parish records created by smoke | `PENDING` | `PENDING` |
| Evidence redaction | Screenshots/log excerpts redacted for secrets and sensitive data | `PENDING` | `PENDING` |
| Support note | Support owner informed of result and boundary | `PENDING` | `PENDING` |

## Rollback Decision

Final rollback decision: `PENDING_ROLLBACK_OR_CONTINUED_NO_GO`

Allowed final outcomes:

- `SMOKE_PASSED_AND_FLAGS_DISABLED`
- `SMOKE_FAILED_AND_FLAGS_DISABLED`
- `SMOKE_NOT_RUN_NO_APPROVAL`
- `SMOKE_BLOCKED_BY_PRODUCTION_GATE`

Any continued production availability requires a separate product-owner approval and staff-facing UI/support decision.

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

## Sanitized Evidence JSON Template

```json
{
  "target": "production-request-document-manifest-smoke",
  "route": "/api/exports/requests/documents/manifest",
  "exportPreset": "request_document_manifest",
  "productionTouched": "PENDING",
  "migrationsApplied": false,
  "operationalRlsChanged": false,
  "googleCalendarTouched": false,
  "staffFacingProductionUiAdded": false,
  "flagOffBaseline": {
    "healthStatus": "PENDING",
    "schemaTrue": "PENDING",
    "exportRouteStatus": "PENDING",
    "genericUnavailable": "PENDING"
  },
  "flagOnSmoke": {
    "runtimeGateStatus": "PENDING_NOT_APPROVED_CURRENT_GATE_IS_PRODUCTION_BLOCKED",
    "sameParishManifestStatus": "PENDING",
    "approvedHeader": "PENDING",
    "forbiddenCsvMarkers": "PENDING_REDACTED_COUNT_ONLY",
    "crossParishDenied": "PENDING",
    "blockedFieldDenied": "PENDING",
    "familyOrUnauthenticatedDenied": "PENDING",
    "noSignedUrlStorageOrFileApiUsage": "PENDING"
  },
  "audit": {
    "action": "export.request_document_manifest.downloaded",
    "hasSafeMetadata": "PENDING",
    "forbiddenMetadataMarkers": "PENDING_REDACTED_COUNT_ONLY"
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
    "exportRouteUnavailable": "PENDING"
  },
  "finalOutcome": "PENDING"
}
```

## Remaining Risks

- This is a template only.
- Production exports remain `NO-GO`.
- The current export runtime gate is non-production-only and production-blocked.
- A production-specific runtime enablement path is not approved by this template.
- No staff-facing production export UI exists or is approved.
- Bulk document file export remains disabled and unapproved.
- Production RLS remains `NO-GO` until explicit approval, production target details, production-safe smoke evidence, monitoring evidence, and rollback readiness are complete.

## What Changed Plain English

This template gives Vinea a blank evidence form for a future production test of the document checklist export. It says exactly what to record, what not to paste, what must pass, and how to prove rollback. It does not approve the test or turn anything on.

## Next Recommended Safe Step

Production `request_document_manifest` export remains `NO-GO`. Continue safe non-production trust-center or tenant-readiness work until the product owner supplies the exact production URL, exact rollout window, explicit approval prompt, and a separate approved production-runtime gate path.
