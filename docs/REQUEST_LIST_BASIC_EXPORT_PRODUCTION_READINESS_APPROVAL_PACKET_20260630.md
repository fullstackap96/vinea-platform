# Request List Basic Export Production Readiness Approval Packet - 2026-06-30

Status: Prepared as a production-readiness and product-owner approval packet only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

Current decision state: `PRODUCTION REQUEST_LIST_BASIC EXPORT NOT APPROVED BY THIS DOCUMENT`

Completion marker: `REQUEST_LIST_BASIC_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630`

## Purpose

This packet defines the exact evidence, owners, fixtures, rollout steps, rollback steps, support plan, monitoring plan, and approval language required before Vinea can run a production smoke or expose the first `request_list_basic` export capability beyond non-production QA.

The packet builds on completed non-production evidence:

- Route-level QA evidence: `docs/REQUEST_LIST_BASIC_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630.md`
- Live local non-production smoke evidence: `docs/REQUEST_LIST_BASIC_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`
- Export policy proposal: `docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md`
- Trust-center readiness packet: `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- Human-fillable production smoke intake worksheet with recommended non-secret label draft: `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md`
- Final approval prompt template: `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md`

This packet does not approve production export runtime flags, production staff-facing UI, sensitive exports, document exports, people/household exports, diocesan exports, migrations, operational RLS changes, Google Calendar behavior, or unrelated record mutation.

## Production Target Placeholders

The product owner must fill these non-secret production target labels before any future production smoke:

- Production app target label: `PRODUCTION_APP_URL`
- Production health route: `<PRODUCTION_APP_URL>/api/health`
- Production export route under approval: `<PRODUCTION_APP_URL>/api/exports/requests/basic`
- Production Supabase project label: `PRODUCTION_SUPABASE_PROJECT_LABEL`
- Production Vercel deployment label: `PRODUCTION_DEPLOYMENT_LABEL`
- Rollout window label: `REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW`

Do not record production database URLs, service role keys, session cookies, staff passwords, Vercel tokens, Supabase tokens, or OAuth material in this packet or future evidence.

## Required Production-Safe Fixture Labels

The future production smoke must use deliberately selected safe fixtures. Use labels only; do not record raw IDs, secrets, document paths, notes, or CSV contents.

- Safe staff fixture label: `PRODUCTION_EXPORT_SAFE_STAFF`
- Active parish fixture label: `PRODUCTION_EXPORT_PARISH_A`
- Same-parish request fixture label: `PRODUCTION_EXPORT_SAME_PARISH_REQUEST`
- Cross-parish denial fixture label: `PRODUCTION_EXPORT_CROSS_PARISH_DENIED_REQUEST`
- Family/unauthenticated denial method label: `PRODUCTION_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD`
- Blocked-field attempt label: `PRODUCTION_EXPORT_BLOCKED_FIELD_ATTEMPT`
- Audit-log inspection method label: `PRODUCTION_EXPORT_AUDIT_INSPECTION_METHOD`
- Rollback verification method label: `PRODUCTION_EXPORT_ROLLBACK_VERIFICATION_METHOD`

Fixture requirements:

- The staff account must be an authorized production staff user for `PRODUCTION_EXPORT_PARISH_A`.
- The same-parish request must be safe for a basic operational request-list export.
- The same-parish request must not contain sensitive internal-note, document, sacramental/canonical, AI, communication-body, or token material that would be exposed by the approved field allowlist.
- The cross-parish denial fixture must prove a selected active parish mismatch or unauthorized parish scope fails generically.
- The family/unauthenticated method must not expose family portal tokens, token hashes, signed URLs, document paths, or document contents.
- The blocked-field attempt must include at least one token/secret-like field and one staff-only field, such as `access_token` and `internal_notes`.

## Staff-Facing UI Boundary

Current UI decision: `NO STAFF-FACING PRODUCTION EXPORT UI APPROVED`

The future production smoke may call the route directly only if separately approved. A staff-facing button, menu item, download link, dashboard card, or production navigation entry requires a separate product-owner approval packet.

Before any production UI is approved, Vinea must define:

- Plain-language button label, such as "Download this parish's request list".
- Selected parish label shown before download.
- Included field summary.
- Excluded sensitive data summary.
- Audit notice shown to staff.
- Success state.
- Failure state.
- Support instruction for denied exports.
- Confirmation copy for older and non-technical parish staff.

## Support Handling

Support owner placeholder: `REQUEST_LIST_BASIC_EXPORT_SUPPORT_OWNER`

Support handling requirements:

- Provide a support note explaining that production export remains limited to `request_list_basic`.
- Provide a generic staff-facing denial explanation.
- Define how support should respond if a parish reports missing rows, denied access, or unexpected CSV content.
- Define how support escalates suspected cross-parish leakage or sensitive-data exposure.
- Define how support confirms rollback if the route is disabled.
- Support must not ask staff to send raw CSV exports, passwords, tokens, document links, or screenshots containing sensitive pastoral or family data.

## Monitoring Owner And Channel

Monitoring owner placeholder: `REQUEST_LIST_BASIC_EXPORT_MONITORING_OWNER`

Monitoring channel placeholder: `REQUEST_LIST_BASIC_EXPORT_MONITORING_CHANNEL`

Monitor during and after the future production smoke:

- `/api/health` returns `checks.schema: true` before flag changes, after flag changes, and after rollback.
- Export route status codes for flag-off, allowed same-parish export, denied cross-parish attempt, denied blocked-field attempt, denied family/unauthenticated attempt, and rollback.
- Audit event count for `export.request_list_basic.downloaded`.
- Audit metadata safety for `route_id`, `export_preset_id`, `active_parish_id`, `runtime_gate_state`, `delivery_mode`, `file_type`, and safe row-count metadata.
- No raw CSV contents, notes, communications, documents, signed URLs, token material, Google payloads, OpenAI payloads, credentials, or raw database rows in logs or audit metadata.
- Server error rate during smoke.
- Repeated denial spikes.
- Any unexpected production log entries related to exports.

## Rollout Gates

The future production rollout is `NO-GO` unless all gates are complete:

1. Product owner approves the exact production target and rollout window.
2. Security/data owner approves the fixture labels and blocked-field smoke.
3. Engineering owner confirms the production route still satisfies source-level export preflight.
4. Parish operations owner approves the staff-facing language boundary or confirms there is no staff-facing UI.
5. Support owner approves the support handling plan.
6. Monitoring owner and channel are named.
7. Rollback owner is named.
8. Production RLS approval state is reviewed and any relevant `NO-GO` condition is acknowledged.
9. The route is smoke-tested flag-off before any production flag change.
10. Production flags are enabled only for the approved smoke window and only if rollback is ready.

## Production Flag Rollout Steps

Do not perform these steps until the product owner provides the exact future approval language.

1. Confirm all owners and fixture labels are filled.
2. Confirm no production secrets will be printed or recorded.
3. Confirm `/api/health` returns `checks.schema: true`.
4. Confirm flag-off route behavior returns generic unavailable behavior.
5. Enable only the approved production export flags for the smoke window.
6. Sign in as `PRODUCTION_EXPORT_SAFE_STAFF`.
7. Select `PRODUCTION_EXPORT_PARISH_A`.
8. Run the same-parish request-list export.
9. Verify the CSV includes only approved `request_list_basic` fields.
10. Verify cross-parish denial.
11. Verify blocked-field denial.
12. Verify family/unauthenticated denial.
13. Verify safe audit metadata.
14. Observe monitoring channel for unexpected errors.
15. Roll back by disabling the flags unless the separate approval explicitly allows continued production availability.

## Rollback Owner And Rollback Steps

Rollback owner placeholder: `REQUEST_LIST_BASIC_EXPORT_ROLLBACK_OWNER`

Rollback decision deadline placeholder: `REQUEST_LIST_BASIC_EXPORT_ROLLBACK_DECISION_DEADLINE`

Rollback steps:

1. Disable or unset `VINEA_EXPORT_RUNTIME`.
2. Disable or unset `VINEA_EXPORT_RUNTIME_ACK`.
3. Disable or unset `VINEA_EXPORT_RUNTIME_ENV`.
4. Redeploy or restart the production app if required by the hosting environment.
5. Verify `/api/health` still returns `checks.schema: true`.
6. Verify `/api/exports/requests/basic` returns generic unavailable behavior.
7. Verify no additional `export.request_list_basic.downloaded` audit events occur after rollback.
8. Record rollback evidence without secrets, raw CSV, parish IDs, request IDs, session cookies, or token material.

Rollback must not require a database migration, operational RLS change, Google Calendar change, or data repair.

## Production Smoke Pass / Fail Criteria

Pass only if:

- Flag-off baseline returns generic unavailable behavior.
- Health is green before and after the smoke.
- Same-parish export succeeds only for the selected active parish.
- CSV contains only approved `request_list_basic` fields.
- Cross-parish denial is generic and does not deliver CSV.
- Blocked-field denial is generic and does not reveal field existence.
- Family/unauthenticated access is denied before query, audit, or delivery.
- Safe audit metadata exists for the approved same-parish export.
- Audit metadata excludes raw CSV contents, notes, communications, documents, signed URLs, token material, Google payloads, OpenAI payloads, credentials, and raw database rows.
- Monitoring owner reports no unexpected server errors or leakage signals.
- Rollback verification passes unless a separate approval explicitly authorizes continued production availability.

Fail and roll back if:

- Health fails.
- Same-parish export includes unapproved fields.
- Cross-parish denial returns CSV or unsafe details.
- Blocked-field denial reveals implementation details.
- Family/unauthenticated access reaches query, audit, or delivery.
- Audit metadata contains raw content, tokens, signed URLs, credentials, document paths, or sensitive values.
- The route behaves differently from the live non-production smoke without explanation.
- Monitoring shows unexpected errors or possible data exposure.
- Any owner raises a `NO-GO`.

## Exact Approval Language

The product owner must use this exact language in a future prompt before any production smoke:

```text
Approve production smoke for request_list_basic export only. Use PRODUCTION_APP_URL=<production app URL>, PRODUCTION_SUPABASE_PROJECT_LABEL=<non-secret project label>, PRODUCTION_DEPLOYMENT_LABEL=<deployment label>, REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<rollout window>, PRODUCTION_EXPORT_SAFE_STAFF=<safe staff fixture label>, PRODUCTION_EXPORT_PARISH_A=<safe parish fixture label>, PRODUCTION_EXPORT_SAME_PARISH_REQUEST=<safe same-parish request fixture label>, PRODUCTION_EXPORT_CROSS_PARISH_DENIED_REQUEST=<safe cross-parish denial fixture label>, PRODUCTION_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=<family or unauthenticated denial method>, PRODUCTION_EXPORT_BLOCKED_FIELD_ATTEMPT=<blocked-field attempt label>, PRODUCTION_EXPORT_AUDIT_INSPECTION_METHOD=<audit inspection method>, REQUEST_LIST_BASIC_EXPORT_MONITORING_OWNER=<monitoring owner>, REQUEST_LIST_BASIC_EXPORT_MONITORING_CHANNEL=<monitoring channel>, REQUEST_LIST_BASIC_EXPORT_SUPPORT_OWNER=<support owner>, REQUEST_LIST_BASIC_EXPORT_ROLLBACK_OWNER=<rollback owner>, and REQUEST_LIST_BASIC_EXPORT_ROLLBACK_DECISION_DEADLINE=<deadline>. Run flag-off baseline first, then enable only the approved production export flags for the approved smoke window. Verify health, same-parish CSV success, CSV field exclusions, cross-parish denial, blocked-field denial, family or unauthenticated denial, safe audit metadata, monitoring observations, and rollback. Do not add staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, expose secrets, or expand exports beyond request_list_basic.
```

## Explicit Non-Approval Boundary

This packet does not approve:

- Production flag enablement.
- Continued production availability after smoke.
- Staff-facing production export UI.
- Sensitive request-note exports.
- People or household exports.
- Sacramental/canonical exports.
- Communication-history exports.
- Document manifest exports.
- Bulk document file exports.
- Audit/security exports.
- AI output exports.
- Public intake routing exports.
- Support break-glass exports.
- Diocesan or multi-parish rollup exports.
- Any operational RLS change.
- Any database migration.
- Any Google Calendar behavior.
- Any raw CSV, token, signed URL, credential, document path, internal note, or communication-body logging.

## Go / No-Go Checklist

Current recommendation: `NO-GO UNTIL PRODUCT OWNER CONFIRMS EXACT PUBLIC PRODUCTION URL, EXACT ROLLOUT WINDOW, AND EXACT FUTURE APPROVAL PROMPT`

Go only when:

- Production target labels are filled or explicitly confirmed from the recommended worksheet draft.
- Production-safe staff fixture is identified or explicitly confirmed from the recommended worksheet draft.
- Production-safe same-parish request fixture is identified or explicitly confirmed from the recommended worksheet draft.
- Cross-parish denial fixture or substitute is identified or explicitly confirmed from the recommended worksheet draft.
- Family/unauthenticated denial method is identified or explicitly confirmed from the recommended worksheet draft.
- Blocked-field attempt is identified or explicitly confirmed from the recommended worksheet draft.
- Audit inspection method is identified or explicitly confirmed from the recommended worksheet draft.
- Support owner is named or explicitly confirmed from the recommended worksheet draft.
- Monitoring owner and channel are named or explicitly confirmed from the recommended worksheet draft.
- Rollback owner and rollback decision deadline are named or explicitly confirmed from the recommended worksheet draft.
- Exact public production app URL is confirmed.
- Exact production rollout window is confirmed.
- Product owner provides the exact approval language.

No-go if:

- The production target is ambiguous.
- Any required owner is missing.
- Any safe fixture is missing.
- The same-parish fixture contains sensitive content that could be exposed by approved fields.
- The future smoke requires a migration, RLS change, Google Calendar behavior, or staff-facing UI.
- The route would export sensitive fields or broader export surfaces.
- Evidence capture would expose secrets, raw CSV, IDs, tokens, document paths, signed URLs, notes, communication bodies, or credentials.

## What Changed Plain English

This packet is the production permission checklist for Vinea's first export. It does not turn anything on. It tells us exactly who must approve, what safe production records must be chosen, what to monitor, how to roll back, and what exact prompt you would need to give later before any production smoke can happen.

## Next Recommended Safe Step

Keep production exports `NO-GO` until the product owner confirms the recommended non-secret labels in `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md`, replaces the exact public production app URL and rollout window in `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md`, and provides the exact future approval language separately.
