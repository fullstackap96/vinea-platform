# Request Document Manifest Export Production Readiness Approval Packet - 2026-06-30

Status: Prepared as a production-readiness and product-owner approval packet only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT NOT APPROVED BY THIS DOCUMENT`

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630`

## Purpose

This packet defines the exact evidence, owners, production-safe fixtures, rollout steps, rollback steps, support plan, monitoring plan, staff-facing UI boundary, smoke gates, and approval language required before Vinea can run a production smoke for the `request_document_manifest` export.

The export remains manifest-only. It must never create signed URLs, expose storage paths, export original filenames, deliver document files, expose family portal tokens, expose token hashes, expose staff notes, expose communications, expose AI material, or expose sacramental/canonical details.

The packet builds on completed non-production evidence:

- Route-level QA evidence: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630.md`
- Live local non-production smoke evidence: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`
- Export policy proposal: `docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md`
- Trust-center readiness packet: `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- Route wiring approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_ROUTE_WIRING_APPROVAL_PACKET_20260630.md`
- Live smoke approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md`

This packet does not approve production export runtime flags, production staff-facing UI, bulk document file exports, signed URL delivery, sensitive note exports, communication exports, AI exports, sacramental/canonical exports, people/household exports, diocesan exports, migrations, operational RLS changes, Google Calendar behavior, or unrelated record mutation.

## Production Target Placeholders

The product owner must fill these non-secret production target labels before any future production smoke:

- Production app target label: `PRODUCTION_APP_URL`
- Production health route: `<PRODUCTION_APP_URL>/api/health`
- Production export route under approval: `<PRODUCTION_APP_URL>/api/exports/requests/documents/manifest`
- Production Supabase project label: `PRODUCTION_SUPABASE_PROJECT_LABEL`
- Production Vercel deployment label: `PRODUCTION_DEPLOYMENT_LABEL`
- Rollout window label: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW`

Do not record production database URLs, service role keys, session cookies, staff passwords, Vercel tokens, Supabase tokens, OAuth material, document storage paths, signed URLs, original filenames, raw CSV contents, parish IDs, request IDs, or family portal tokens in this packet or future evidence.

## Required Production-Safe Fixture Labels

The future production smoke must use deliberately selected safe fixtures. Use labels only; do not record raw IDs, secrets, document paths, original filenames, notes, communication bodies, AI material, sacramental/canonical details, or CSV contents.

- Safe staff fixture label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF`
- Active parish fixture label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A`
- Same-parish request fixture label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST`
- Same-parish document set fixture label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET`
- Cross-parish denial fixture label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST`
- Family/unauthenticated denial method label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD`
- Blocked-field attempt label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT`
- Audit-log inspection method label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD`
- Rollback verification method label: `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD`

Fixture requirements:

- The staff account must be an authorized production staff user for `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A`.
- The same-parish request must be safe for a manifest-only document-readiness export.
- The same-parish request must not involve a funeral, highly sensitive pastoral situation, private family crisis, canonical case, sacramental record correction, or document set whose labels would expose private details.
- The document set must use generic safe labels, such as "Birth certificate received" or "Preparation form received", and must not require exposing original filenames or storage paths.
- The same-parish document set must be sufficient to verify the approved manifest fields without opening files.
- The cross-parish denial fixture must prove a selected active parish mismatch or unauthorized parish scope fails generically.
- The family/unauthenticated method must not expose family portal tokens, token hashes, signed URLs, document paths, original filenames, or document contents.
- The blocked-field attempt must include at least `signed_url`, `storage_path`, `original_filename`, and `portal_token`.

## Staff-Facing UI Boundary

Current UI decision: `NO STAFF-FACING PRODUCTION DOCUMENT MANIFEST EXPORT UI APPROVED`

The future production smoke may call the route directly only if separately approved. A staff-facing button, menu item, download link, dashboard card, request detail action, document portal action, or production navigation entry requires a separate product-owner approval packet.

Before any production UI is approved, Vinea must define:

- Plain-language button label, such as "Download document checklist".
- Selected parish label shown before download.
- Included field summary.
- Excluded sensitive data summary.
- Warning that files, original filenames, storage paths, signed links, tokens, notes, communications, AI material, and sacramental/canonical details are not included.
- Audit notice shown to staff.
- Success state.
- Failure state.
- Support instruction for denied exports.
- Confirmation copy for older and non-technical parish staff.

## Support Handling

Support owner placeholder: `REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER`

Support handling requirements:

- Provide a support note explaining that production export remains limited to `request_document_manifest`.
- Provide a generic staff-facing denial explanation.
- Define how support should respond if a parish reports missing rows, denied access, unexpected document statuses, or unexpected CSV content.
- Define how support escalates suspected cross-parish leakage, document metadata exposure, or sensitive-data exposure.
- Define how support confirms rollback if the route is disabled.
- Support must not ask staff to send raw CSV exports, passwords, tokens, family portal links, signed URLs, storage paths, original filenames, document files, or screenshots containing sensitive pastoral or family data.

## Monitoring Owner And Channel

Monitoring owner placeholder: `REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER`

Monitoring channel placeholder: `REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL`

Monitor during and after the future production smoke:

- `/api/health` returns `checks.schema: true` before flag changes, after flag changes, and after rollback.
- Export route status codes for flag-off, allowed same-parish manifest export, denied cross-parish attempt, denied blocked-field attempt, denied family/unauthenticated attempt, and rollback.
- Audit event count for `export.request_document_manifest.downloaded`.
- Audit metadata safety for `route_id`, `export_preset_id`, `active_parish_id`, `runtime_gate_state`, `delivery_mode`, `file_type`, and safe row-count metadata.
- No raw CSV contents, document files, original filenames, storage paths, signed URLs, family portal tokens, token hashes, notes, communications, AI material, Google payloads, OpenAI payloads, credentials, parish IDs, request IDs, or raw database rows in logs or audit metadata.
- Server error rate during smoke.
- Repeated denial spikes.
- Any unexpected production log entries related to document manifest exports.

## Rollout Gates

The future production rollout is `NO-GO` unless all gates are complete:

1. Product owner approves the exact production target and rollout window.
2. Security/data owner approves the fixture labels, manifest-only boundary, blocked-field smoke, and no-file-delivery evidence.
3. Engineering owner confirms the production route still satisfies source-level export preflight and still contains no signed URL, storage, or file download API usage.
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
6. Sign in as `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF`.
7. Select `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A`.
8. Run the same-parish request document manifest export.
9. Verify the CSV includes only approved `request_document_manifest` fields.
10. Verify the CSV excludes signed URLs, storage paths, original filenames, document contents, tokens, notes, communications, AI material, and sacramental/canonical markers.
11. Verify cross-parish denial.
12. Verify blocked-field denial for `signed_url`, `storage_path`, `original_filename`, and `portal_token`.
13. Verify family/unauthenticated denial.
14. Verify safe audit metadata.
15. Verify no signed URL, storage, file preview, or file download APIs are used.
16. Observe monitoring channel for unexpected errors.
17. Roll back by disabling the flags unless the separate approval explicitly allows continued production availability.

## Rollback Owner And Rollback Steps

Rollback owner placeholder: `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER`

Rollback decision deadline placeholder: `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE`

Rollback steps:

1. Disable or unset `VINEA_EXPORT_RUNTIME`.
2. Disable or unset `VINEA_EXPORT_RUNTIME_ACK`.
3. Disable or unset `VINEA_EXPORT_RUNTIME_ENV`.
4. Redeploy or restart the production app if required by the hosting environment.
5. Verify `/api/health` still returns `checks.schema: true`.
6. Verify `/api/exports/requests/documents/manifest` returns generic unavailable behavior.
7. Verify no additional `export.request_document_manifest.downloaded` audit events occur after rollback.
8. Record rollback evidence without secrets, raw CSV, parish IDs, request IDs, session cookies, token material, document paths, signed URLs, original filenames, or document contents.

Rollback must not require a database migration, operational RLS change, Google Calendar change, storage-object mutation, document deletion, or data repair.

## Production Smoke Pass / Fail Criteria

Pass only if:

- Flag-off baseline returns generic unavailable behavior.
- Health is green before and after the smoke.
- Same-parish manifest export succeeds only for the selected active parish.
- CSV contains only approved `request_document_manifest` fields.
- CSV does not contain signed URL, storage path, original filename, file content, token, note, communication, AI, Google, or sacramental/canonical markers.
- Cross-parish denial is generic and does not deliver CSV.
- Blocked-field denial is generic and does not reveal field existence.
- Family/unauthenticated access is denied before parish scope, query, audit, or delivery.
- Safe audit metadata exists for the approved same-parish export.
- Audit metadata excludes raw CSV contents, document files, original filenames, storage paths, signed URLs, token material, notes, communications, Google payloads, OpenAI payloads, credentials, and raw database rows.
- Route source still contains no signed URL, storage, or file download API usage.
- Monitoring owner reports no unexpected server errors or leakage signals.
- Rollback verification passes unless a separate approval explicitly authorizes continued production availability.

Fail and roll back if:

- Health fails.
- Same-parish manifest includes unapproved fields.
- Same-parish manifest contains signed URL, storage path, original filename, file content, token, note, communication, AI, Google, or sacramental/canonical markers.
- Cross-parish denial returns CSV or unsafe details.
- Blocked-field denial reveals implementation details.
- Family/unauthenticated access reaches parish scope, query, audit, or delivery.
- Audit metadata contains raw content, tokens, signed URLs, credentials, document paths, original filenames, notes, communications, or sensitive values.
- The route behaves differently from the live non-production smoke without explanation.
- Monitoring shows unexpected errors or possible data exposure.
- Any owner raises a `NO-GO`.

## Exact Approval Language

The product owner must use this exact language in a future prompt before any production smoke:

```text
Approve production smoke for request_document_manifest export only. Use PRODUCTION_APP_URL=<production app URL>, PRODUCTION_SUPABASE_PROJECT_LABEL=<non-secret project label>, PRODUCTION_DEPLOYMENT_LABEL=<deployment label>, REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<rollout window>, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF=<safe staff fixture label>, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A=<safe parish fixture label>, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST=<safe same-parish request fixture label>, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET=<safe same-parish document set fixture label>, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST=<safe cross-parish denial fixture label>, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=<family or unauthenticated denial method>, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT=<blocked-field attempt label>, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD=<audit inspection method>, REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER=<monitoring owner>, REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL=<monitoring channel>, REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER=<support owner>, REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER=<rollback owner>, and REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE=<deadline>. Run flag-off baseline first, then enable only the approved production export flags for the approved smoke window. Verify health, same-parish manifest CSV success, CSV field exclusions, cross-parish denial, blocked-field denial, family or unauthenticated denial, safe audit metadata, no signed URL/storage/file API usage, monitoring observations, and rollback. Keep the export manifest-only. Do not add staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, expose secrets, create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or expand exports beyond request_document_manifest.
```

## Explicit Non-Approval Boundary

This packet does not approve:

- Production flag enablement.
- Continued production availability after smoke.
- Staff-facing production export UI.
- Signed URL delivery.
- Storage path exposure.
- Original filename export.
- Document file delivery.
- Bulk document file exports.
- Family portal token export.
- Token hash export.
- Staff-only note export.
- Communication-history export.
- AI output export.
- Sacramental/canonical export.
- People or household exports.
- Audit/security exports.
- Public intake routing exports.
- Support break-glass exports.
- Diocesan or multi-parish rollup exports.
- Any operational RLS change.
- Any database migration.
- Any Google Calendar behavior.
- Any raw CSV, token, signed URL, credential, document path, original filename, internal note, communication body, AI material, or document-file logging.

## Go / No-Go Checklist

Current recommendation: `NO-GO UNTIL PRODUCT OWNER CONFIRMS PRODUCTION-SAFE DOCUMENT MANIFEST FIXTURES, EXACT PUBLIC PRODUCTION URL, EXACT ROLLOUT WINDOW, AND EXACT FUTURE APPROVAL PROMPT`

Go only when:

- Production target labels are filled.
- Production-safe staff fixture is identified.
- Production-safe active parish fixture is identified.
- Production-safe same-parish request fixture is identified.
- Production-safe same-parish document set fixture is identified.
- Cross-parish denial fixture or substitute is identified.
- Family/unauthenticated denial method is identified.
- Blocked-field attempt is identified.
- Audit inspection method is identified.
- Support owner is named.
- Monitoring owner and channel are named.
- Rollback owner and rollback decision deadline are named.
- Exact public production app URL is confirmed.
- Exact production rollout window is confirmed.
- Product owner provides the exact approval language.

No-go if:

- The production target is ambiguous.
- Any required owner is missing.
- Any safe fixture is missing.
- The same-parish request or document set contains sensitive labels that could be exposed by approved fields.
- The future smoke requires a migration, RLS change, Google Calendar behavior, storage behavior, document-file delivery, or staff-facing UI.
- The route would export sensitive fields or broader export surfaces.
- Evidence capture would expose secrets, raw CSV, IDs, tokens, document paths, signed URLs, original filenames, document contents, notes, communication bodies, AI material, or credentials.

## What Changed Plain English

This packet is the production permission checklist for Vinea's document checklist export. It does not turn anything on. It tells us exactly who must approve, what safe production records and document labels must be chosen, what to monitor, how to roll back, and what exact prompt you would need to give later before any production smoke can happen.

## Next Recommended Safe Step

Keep production exports `NO-GO` until the product owner fills non-secret production fixture labels, names the monitoring/support/rollback owners, confirms the exact public production app URL and rollout window, and provides the exact future approval language separately.
