# Vinea Data Export And Access Control Policy Proposal - 2026-06-30

Status: Proposal prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this policy.

This is not yet an approved customer-facing policy, not legal advice, not a completed export permission system, and not a public trust-center claim.

Current export-control readiness: `PROPOSAL, NON-RUNTIME DTOS, DISABLED RUNTIME GATE, BASIC PILOT PLAN, APPROVAL PACKET, NON-PRODUCTION BASIC ROUTE WIRED, ROUTE-LEVEL QA PASSED, LIVE SMOKE APPROVAL PACKET PREPARED, LIVE NON-PRODUCTION SMOKE PASSED, PRODUCTION READINESS APPROVAL PACKET PREPARED, PRODUCTION SMOKE INTAKE WORKSHEET PREPARED, DOCUMENT MANIFEST READINESS PACKET PREPARED, DOCUMENT MANIFEST ROUTE WIRING APPROVAL PACKET PREPARED, NON-PRODUCTION DOCUMENT MANIFEST ROUTE WIRED, DOCUMENT MANIFEST ROUTE-LEVEL QA PASSED, REQUEST DOCUMENT MANIFEST LIVE SMOKE APPROVAL PACKET PREPARED, REQUEST DOCUMENT MANIFEST LIVE NON-PRODUCTION SMOKE PASSED, REQUEST DOCUMENT MANIFEST PRODUCTION READINESS APPROVAL PACKET PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION SMOKE INTAKE WORKSHEET PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION FINAL APPROVAL PROMPT TEMPLATE PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION SMOKE EVIDENCE TEMPLATE PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION GATE APPROVAL PACKET PREPARED, REQUEST DOCUMENT MANIFEST PRODUCTION GATE PREFLIGHT SCAFFOLD PREPARED, AND REQUEST DOCUMENT MANIFEST PRODUCTION GATE IMPLEMENTATION APPROVAL PACKET PREPARED; PRODUCTION RUNTIME EXPORT CONTROLS NOT COMPLETE`

Current outcome: `Data export and access-control policy proposal, non-runtime permission DTOs, disabled runtime gate, route preflight scaffold, same-parish basic export pilot plan, product-owner approval packet, non-production basic request-list export route wiring, route-level QA evidence, live non-production smoke approval packet, live non-production smoke evidence, production readiness approval packet, human-fillable production smoke intake worksheet, request document manifest export readiness packet, request document manifest route wiring approval packet, non-production request document manifest route, request document manifest route-level QA evidence, request document manifest live non-production smoke approval packet, request document manifest live non-production smoke evidence, request document manifest production readiness approval packet, request document manifest production smoke intake worksheet, request document manifest production final approval prompt template, request document manifest production smoke evidence template, request document manifest production gate approval packet, request document manifest production gate preflight scaffold, and request document manifest production gate implementation approval packet prepared; production approval and production implementation pending`

Completion marker: `DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630`

## Purpose

Vinea needs a conservative export and access-control model before it can confidently support larger multi-parish customers, diocesan pilots, and trust-center conversations.

Parish data exports are useful, but risky. A single CSV, PDF, document manifest, or report download can expose pastoral notes, sacramental records, family documents, private communications, AI output, audit history, or cross-parish data. Export controls must therefore be stricter than ordinary page viewing.

This proposal defines the rules Vinea should implement before expanding staff-facing downloads, bulk exports, diocesan reports, or support-assisted data packages.

## Scope Covered

This proposal covers export and download rules for:

- People and households.
- Requests and request workflow steps.
- Baptism, wedding, funeral, OCIA, join-parish, and future request types.
- Sacramental records and certificate generation history.
- Mass intentions.
- Communications and email history.
- Internal notes and staff-only comments.
- AI summaries, AI email drafts, and future AI retrieval outputs.
- Audit logs and security events.
- Documents, document manifests, and family portal uploads.
- Public intake routing metadata, domains, and token management history.
- Imports, reports, duplicate-review surfaces, and future diocesan rollups.

## Export Risk Principles

1. Export is more sensitive than view access.

   A staff member may be allowed to view a page for day-to-day work without being allowed to download bulk data from that page.

2. Every export must be scoped to an active parish or an explicitly approved multi-parish role.

   The selected active parish, staff membership, and request/object ownership must be checked server-side before export data is queried.

3. Cross-parish export must be denied by default.

   A staff member with access to Parish A should not be able to export Parish B records unless a future diocesan or cluster role explicitly grants that scope.

4. Sensitive records require higher trust and a reason.

   Sacramental/canonical records, internal notes, documents, audit logs, and family portal artifacts should require stronger role checks, export reason capture, and audit evidence.

5. Exported data should be minimized.

   Exports should default to purpose-built presets instead of dumping every database column.

6. Family-facing boundaries must be preserved.

   Family portal surfaces must never receive staff-only exports, internal notes, audit logs, AI staff outputs, token hashes, signed URL material, or private parish configuration.

7. Export controls must be auditable.

   Each export should produce a safe audit event with staff identity, parish scope, target data class, filters, row count, destination, reason, and timestamp.

8. Export controls must not rely on client UI alone.

   Buttons, labels, and confirmation modals help staff understand what is happening, but authorization must happen on the server.

## Proposed Export Permission Model

Future runtime work should separate ordinary view permission from export permission.

| Permission | Purpose | Default stance |
|---|---|---|
| `view_same_parish_records` | Staff can view records for their active parish membership | Existing operational pattern |
| `export_same_parish_basic` | Staff can export limited operational lists for the active parish | Admin/pastor/approved staff only |
| `export_same_parish_sensitive` | Staff can export sensitive same-parish records with a reason | Elevated role and reason required |
| `export_sacramental_canonical` | Staff can export sacramental/canonical records or certificate evidence | Pastor/admin/canonical owner review |
| `export_audit_security` | Staff can export audit/security evidence | Restricted to owner/admin/security role |
| `export_documents_manifest` | Staff can export document metadata without files | Admin/pastor/approved staff only |
| `export_document_files` | Staff can download actual document files in bulk | Disabled until explicit approval |
| `export_multi_parish_rollup` | Future diocesan or cluster export across several parishes | Disabled until diocesan governance exists |
| `support_break_glass_export` | Support-assisted export during incident or offboarding | Disabled by default, approval required |

## Proposed Role Defaults

These are proposal defaults only. They should be reviewed with parish operations, product ownership, and security/data ownership before implementation.

| Role | Proposed export access |
|---|---|
| Parish Admin | Same-parish basic exports; sensitive exports with reason; no raw secrets or token data |
| Pastor | Same-parish pastoral exports; sacramental/canonical exports with reason; no raw secrets or token data |
| Parish Secretary | Limited same-parish operational exports; no audit/security exports by default |
| DRE / OCIA Coordinator | Workflow-specific exports only for assigned ministry scope |
| Deacon | Pastoral workflow exports only where assigned or explicitly permitted |
| Diocese Admin / Future Cluster Admin | Multi-parish rollups only after diocesan governance and production RLS approval |
| Vinea Support Operator | No parish data exports by default; break-glass workflow only after owner approval |

## Export Controls Required Before Runtime Launch

Runtime export features should not launch until these controls exist:

- Server-side active parish and `parish_memberships` validation before export queries.
- Object-level request, document, record, household, person, or communication scope checks.
- Separate view and export authorization.
- Export reason required for sensitive data classes.
- Confirmation UI with selected parish name, export type, filters, estimated row count, and warning text.
- Export presets that minimize fields by purpose.
- Row-count and size limits for synchronous exports.
- Async export job pattern for large exports, with expiration and staff-only delivery.
- Safe audit event created before file delivery or export job queueing.
- Required download audit persistence must be positively confirmed before privileged export queries or delivery; unavailable audit persistence fails closed with generic guidance.
- Watermark or metadata on CSV/PDF exports with parish, timestamp, staff id, and export reason where practical.
- Generic denial messages for unauthorized or cross-parish export attempts.
- Monitoring for repeated export failures, unusual row counts, and support break-glass usage.

## Sensitive Data Classes

### Basic Operational Export

Examples:

- Request list summaries.
- People list contact basics.
- Household list basics.
- Mass intention list basics.
- Workflow task status summaries.

Required controls:

- Active parish membership.
- Same-parish scope.
- Export audit event.
- Purpose-built field list.

### Sensitive Parish Export

Examples:

- Internal notes.
- Communication history.
- Funeral pastoral-care details.
- Wedding preparation notes.
- OCIA journey notes.
- Follow-up queues with pastoral context.

Required controls:

- Elevated role.
- Export reason.
- Active parish membership.
- Object-level scope.
- Audit event with row count and filters.

### Sacramental And Canonical Export

Examples:

- Baptism records.
- Marriage records.
- Confirmation/OCIA-related sacramental records.
- Certificate issuance evidence.
- Corrections, annotations, or canonical notes.

Required controls:

- Pastor/admin/canonical owner approval pattern.
- Export reason.
- Same-parish or explicitly approved canonical scope.
- Clear distinction between operational copy and canonical record of truth.
- No automated deletion or casual bulk export assumptions.

### Document Export

Examples:

- Birth certificates uploaded by families.
- Wedding preparation documents.
- Funeral documents.
- OCIA documents.
- Request document manifests.

Required controls:

- Document manifest exports first.
- Bulk file export disabled until approved.
- Signed URL generation only after object-level authorization.
- Direct storage listing denied.
- Family-facing document labels reviewed separately from staff-only notes.
- Document export audit events must not include signed URL material.

### Audit And Security Export

Examples:

- Audit logs.
- Staff access history.
- Portal token lifecycle events.
- Domain verification events.
- Public intake routing changes.
- Import events.

Required controls:

- Restricted owner/admin/security role.
- Reason required.
- Narrow time window.
- Audit event for the audit export itself.
- No raw token material or secrets.

## Blocked By Default

The following should never be exported through normal staff export flows:

- Passwords.
- Supabase service role keys.
- Environment secrets.
- Google OAuth access tokens.
- Google OAuth refresh tokens.
- OpenAI API keys.
- Family portal token hashes.
- Public intake token hashes.
- Signed URL material.
- Raw OpenAI prompts.
- Raw OpenAI provider payloads.
- Raw AI token material.
- Internal debug payloads.
- Direct storage bucket paths that could be used as access material.
- Full database dumps from staff UI.

## Audit Metadata Requirements

Each future export should produce safe audit metadata:

- Staff user id.
- Staff email or display label where available.
- Active parish id.
- Parish ids included in export.
- Target object type.
- Export preset id.
- Filters used.
- Row count or estimated row count.
- File type or job type.
- Export reason.
- Created timestamp.
- Delivery mode.
- Outcome: allowed, denied, queued, failed, expired, or revoked.

Audit metadata must exclude raw exported file contents, raw prompts, token hashes, signed URLs, credentials, and provider payloads.

## UI Requirements

Future export UI should show:

- The selected active parish label.
- A plain-language export name.
- The data types included.
- The data types excluded.
- Row count or estimated row count.
- A reason field for sensitive exports.
- A confirmation checkbox for sensitive exports.
- Success and failure feedback.
- A clear statement that the export is audited.

For older and non-technical parish staff, export labels should avoid jargon. Use wording like:

> Download this parish's request list

instead of:

> Export operational request dataset.

## Future Implementation Roadmap

### Phase 1 - Non-Runtime Policy And Tests

Current phase.

- Prepare this proposal.
- Add validation tests.
- Update build status.
- Keep runtime behavior unchanged.

### Phase 2 - Non-Runtime Permission DTOs

Status: Completed as a non-runtime contract in `lib/exportAccessControl.ts` with validation tests in `lib/exportAccessControl.test.ts`.

- Define export permission DTOs. `Completed as non-runtime contract.`
- Define export data-class map. `Completed as non-runtime contract.`
- Define blocked-field map. `Completed as non-runtime contract.`
- Add cross-parish denial tests. `Completed as non-runtime contract.`
- Add family-facing exclusion tests. `Completed as non-runtime contract.`

The DTO layer intentionally keeps every export preset marked as not runtime-enabled. It can evaluate future export attempts for active parish scope, membership scope, role defaults, blocked fields, reason requirements, family portal exclusion, and audit metadata, but it does not query Supabase, generate files, call storage, apply migrations, or wire any route.

### Phase 3 - Disabled Runtime Gate And Route Preflight

Status: Completed as a disabled-by-default non-runtime scaffold in `lib/server/exportRuntimeGate.ts` and `lib/server/exportRouteRuntimeWiringPreflight.ts`, with tests in `lib/server/exportRuntimeGate.test.ts` and `lib/server/exportRouteRuntimeWiringPreflight.test.ts`.

- Prepare a disabled-by-default export runtime gate. `Completed as scaffold.`
- Require exact non-production QA flags before any future runtime export path can open. `Completed as scaffold.`
- Block production even when QA flags are present. `Completed as scaffold.`
- Add source-level future route preflight tests proving route code must check auth, active parish, membership scope, permission DTOs, blocked fields, family portal exclusion, audit metadata, and generic blocked errors before export queries or delivery. `Completed as scaffold.`

The scaffold intentionally does not wire any live export route, query Supabase, create signed URLs, return files, write audit events, or change staff UI.

### Phase 4 - Same-Parish Basic Export Pilot

Status: Prepared as a non-runtime route implementation plan and acceptance-criteria packet in `docs/EXPORT_ROUTE_BASIC_PILOT_IMPLEMENTATION_PLAN_20260630.md`.

- Pick one low-risk export surface. `Completed as plan: request_list_basic is recommended first.`
- Require active parish membership. `Completed as plan requirement.`
- Audit export attempts. `Completed as plan requirement before query execution or file delivery.`
- Keep sensitive fields excluded. `Completed as plan with a server-owned allowlist and explicit exclusions.`
- Add browser QA in shared QA only. `Defined as future acceptance criteria; not executed in this phase.`
- Prepare product-owner approval packet. `Completed as approval packet in docs/EXPORT_ROUTE_BASIC_PILOT_PRODUCT_OWNER_APPROVAL_PACKET_20260630.md.`
- Wire non-production route behind disabled export runtime gate. `Completed as route in app/api/exports/requests/basic/route.ts with tests in lib/server/requestListBasicExportRoute.test.ts.`
- Run route-level non-production QA. `Completed as evidence packet in docs/REQUEST_LIST_BASIC_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630.md with tests in lib/server/requestListBasicExportNonproductionQaEvidence.test.ts.`
- Prepare live non-production HTTP/browser smoke approval packet. `Completed as approval packet in docs/REQUEST_LIST_BASIC_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md with tests in lib/server/requestListBasicExportLiveSmokeApprovalPacket.test.ts.`
- Run live non-production HTTP smoke. `Completed as evidence packet in docs/REQUEST_LIST_BASIC_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md with tests in lib/server/requestListBasicExportLiveSmokeEvidence.test.ts.`
- Prepare production readiness and approval packet. `Completed as approval packet in docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md with tests in lib/server/requestListBasicExportProductionReadinessApprovalPacket.test.ts.`
- Prepare human-fillable production smoke intake worksheet. `Completed as worksheet in docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md with tests in lib/server/requestListBasicExportProductionSmokeIntakeWorksheet.test.ts.`
- Prepare next export-governance packet for document manifests. `Completed as manifest-only readiness packet in docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_READINESS_PACKET_20260630.md with tests in lib/server/requestDocumentManifestExportReadinessPacket.test.ts.`

The original implementation plan intentionally did not wire any live export route, query Supabase, return files, write audit events, change staff UI, apply migrations, or change operational RLS.

The product-owner approval packet intentionally does not approve production rollout, live route wiring by itself, staff-facing production UI, sensitive exports, document exports, diocesan exports, migrations, operational RLS changes, Google Calendar changes, or record mutations beyond future approved audit metadata.

The non-production route wiring intentionally remains disabled by default, production-blocked by the export runtime gate, staff-only, active-parish scoped, membership-scoped, limited to `request_list_basic`, and unavailable from any staff-facing production UI.

The live non-production smoke approval packet intentionally does not approve executing the smoke by itself. It requires a separate product-owner prompt with an approved non-production app target, safe staff fixture, same-parish request fixture, cross-parish denial fixture, blocked-field attempt, family-portal or unauthenticated denial method, audit-log inspection method, rollback owner, and monitoring expectations.

The live non-production smoke evidence verifies flag-off baseline, QA-flagged same-parish CSV success, blocked-field denial, forged active parish cookie denial, unauthenticated/family substitute denial, safe audit metadata, and rollback to disabled behavior. It does not approve production exports, production flags, staff-facing production UI, or broader export surfaces.

The production readiness approval packet intentionally does not enable production flags or approve production exports by itself. It defines the future product-owner approval language, production-safe fixture labels, monitoring owner/channel, rollback owner, support owner, staff-facing UI boundary, production smoke pass/fail gates, and rollback requirements for a later explicitly approved production smoke.

The production smoke intake worksheet intentionally collects only non-secret labels and owner names before any future production approval prompt. It tells the product owner not to record passwords, database URLs, service role keys, raw IDs, tokens, signed URLs, document paths, notes, communication bodies, raw CSV contents, or sacramental/canonical details.

Request document manifest export readiness packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_READINESS_PACKET_20260630.md`

The document manifest readiness packet is manifest-only and intentionally does not approve bulk file downloads, signed URL delivery, storage path exposure, production flags, staff-facing production UI, migrations, operational RLS changes, Google Calendar behavior, or record mutations.

Request document manifest route wiring approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_ROUTE_WIRING_APPROVAL_PACKET_20260630.md`

The document manifest route wiring approval packet defines the exact future product-owner approval language for non-production-only route wiring. It intentionally does not approve live route wiring by itself, production flags, staff-facing production UI, signed URL delivery, storage path exposure, original filename export, document file delivery, tokens, notes, communications, AI material, sacramental/canonical details, migrations, operational RLS changes, Google Calendar behavior, or record mutations beyond future approved safe audit metadata.

Non-production request document manifest export route: `app/api/exports/requests/documents/manifest/route.ts`

The request document manifest route is wired only behind the disabled export runtime gate. It remains production-blocked, staff-authenticated, active-parish scoped, membership-scoped, request-ownership checked, manifest-only, and audited before query/delivery. It does not create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or mutate records beyond approved safe audit metadata.

Request document manifest route-level QA evidence: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630.md`

The route-level QA evidence verifies flag-off blocking, flag-on same-parish manifest CSV success, cross-parish denial, blocked-field denial, family-portal or unauthenticated denial, safe audit metadata before query/delivery, CSV field exclusions, no signed URL/storage/file API usage, source-level route preflight, and rollback by disabling flags. It does not approve live HTTP/browser smoke, production flags, staff-facing production UI, migrations, operational RLS changes, Google Calendar behavior, document file delivery, or production exports.

Request document manifest live non-production smoke approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630.md`

The document manifest live non-production smoke approval packet intentionally does not approve executing the smoke by itself. It requires a separate product-owner prompt with an approved non-production app target, safe staff fixture, active parish fixture, same-parish request/document fixture, cross-parish denial fixture, blocked-field attempts, family-portal or unauthenticated denial method, audit-log inspection method, rollback owner, and monitoring expectations. It preserves the manifest-only boundary and does not approve production flags, staff-facing production UI, signed URL delivery, storage path exposure, original filename export, document file delivery, token export, notes, communications, AI material, sacramental/canonical details, operational RLS changes, migrations, Google Calendar behavior, or record mutation beyond approved safe audit metadata.

Request document manifest live non-production smoke evidence: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`

The document manifest live non-production smoke evidence verifies flag-off baseline, QA-flagged same-parish manifest CSV success, cross-parish denial, blocked-field denial, family-portal/unauthenticated denial, safe audit metadata, no signed URL/storage/file API usage, sacramental/canonical marker filtering, and rollback to disabled behavior. It does not approve production exports, production flags, staff-facing production UI, bulk document files, or broader export surfaces.

Request document manifest production readiness approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`

The document manifest production readiness approval packet defines production-safe fixture labels, monitoring owner/channel, rollback owner, support handling, staff-facing UI boundary, production smoke gates, exact approval language, manifest-only pass/fail criteria, and no-file-delivery rollback requirements. It does not approve production flags, staff-facing production UI, signed URL delivery, storage path exposure, original filename export, document file delivery, migrations, operational RLS changes, Google Calendar behavior, or production export execution.

Request document manifest production smoke intake worksheet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md`

The document manifest production smoke intake worksheet collects only non-secret labels and owner names before any future production approval prompt. It tells the product owner not to record passwords, database URLs, service role keys, raw IDs, family portal tokens, signed URLs, storage paths, original filenames, document contents, notes, communication bodies, raw CSV contents, AI material, or sacramental/canonical details.

Request document manifest production final approval prompt template: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md`

The document manifest production final approval prompt template converts the worksheet into copy/paste approval language while intentionally leaving production exports `NO-GO` until the product owner supplies the exact public production URL, exact rollout window, and explicit future approval prompt. It does not enable production flags, approve staff-facing production UI, create signed URLs, expose storage paths, export original filenames, deliver document files, or expand beyond `request_document_manifest`.

Request document manifest production smoke evidence template: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260630.md`

The document manifest production smoke evidence template provides a blank future evidence record for flag-off baseline, flag-on checks, same-parish manifest success, cross-parish denial, blocked-field denial, family/unauthenticated denial, audit evidence, monitoring, rollback, cleanup, and final sign-off. It also records that the current export runtime gate remains non-production-only and production-blocked, so production export runtime remains `NO-GO` until a separate production-runtime enablement path is approved.

Request document manifest production gate approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_APPROVAL_PACKET_20260630.md`

The document manifest production gate approval packet defines the future production-specific runtime flag strategy, safety checks, rollback behavior, and source-level preflight tests required before the current production-blocked export gate can be deliberately extended for a production smoke. It does not wire runtime production export, enable production flags, approve staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records, or expose secrets.

Request document manifest production gate preflight scaffold: `lib/server/exportProductionGatePreflight.ts`

Request document manifest production gate preflight scaffold tests: `lib/server/exportProductionGatePreflight.test.ts`

The document manifest production gate preflight scaffold validates the future production flag shape and the existing manifest route safety markers at source level. It proves that QA flags cannot enable production, future production flags must be route-allowlisted and timeboxed, approval/rollback/monitoring labels are required, and manifest safety checks remain before query or delivery. It does not implement or enable the production gate.

Request document manifest production gate implementation approval packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260630.md`

Request document manifest production gate implementation approval packet tests: `lib/server/requestDocumentManifestExportProductionGateImplementationApprovalPacket.test.ts`

The document manifest production gate implementation approval packet defines the exact future implementation files, expected tests, flag-off production baseline, monitoring requirements, rollback-by-flag behavior, and post-implementation `NO-GO` boundary before any production smoke. It does not implement the production gate, enable production flags, add staff-facing production UI, access production, apply migrations, change operational RLS, touch Google Calendar data, mutate records, or expose secrets.

### Phase 5 - Sensitive Export Controls

- Add reason capture.
- Add elevated role checks.
- Add row-count limits.
- Add export-job expiration.
- Add staff-visible audit history.

### Phase 6 - Diocesan And Offboarding Governance

- Add diocesan/cluster export roles only after production membership-aware RLS is approved.
- Add parish offboarding export package rules.
- Add support break-glass approval flow.
- Add trust-center public language after evidence exists.

## Acceptance Criteria For Future Runtime Work

Future export code should not be considered complete until it proves:

- Staff cannot export outside active parish membership.
- A selected active parish controls the explicit parish filter.
- Cross-parish export attempts fail with generic errors.
- Family-facing surfaces cannot access staff export routes.
- Sensitive exports require elevated permission and reason capture.
- Sacramental/canonical exports preserve canonical exception warnings.
- Audit events are written before file delivery or job queueing.
- Export metadata excludes raw file content, token material, signed URLs, prompts, provider payloads, and secrets.
- Tests cover allowed same-parish export, cross-parish denial, disabled parish denial, family portal denial, sacramental/canonical restrictions, and audit metadata requirements.

## Approval Gates

Do not implement runtime export controls until these approvals are complete:

- Product owner approves export surfaces and role defaults.
- Parish operations owner approves staff-facing language and workflows.
- Security/data owner approves audit metadata and blocked fields.
- Canonical/sacramental owner approves sacramental export restrictions.
- Engineering owner approves active parish and membership-scope implementation plan.
- Support owner approves break-glass/offboarding process.

## Trust-Center Claim Boundary

Safe internal statement:

> Vinea has prepared a conservative export-control proposal covering active parish scope, role separation, sensitive data restrictions, and export audit metadata.

Updated safe internal statement after Phase 2:

> Vinea has prepared a conservative export-control proposal and a non-runtime export permission DTO contract covering active parish scope, role defaults, blocked fields, family portal exclusion, sensitive/canonical restrictions, and safe audit metadata expectations.

Updated safe internal statement after Phase 3:

> Vinea has prepared a conservative export-control proposal, non-runtime export permission DTOs, a disabled-by-default export runtime gate, and source-level preflight tests for future route wiring.

Updated safe internal statement after Phase 4:

> Vinea has prepared a conservative export-control proposal, non-runtime export permission DTOs, a disabled-by-default export runtime gate, source-level preflight tests, and a non-runtime implementation plan for a future same-parish basic request-list export pilot.

Updated safe internal statement after Phase 4 approval packet:

> Vinea has prepared a conservative export-control proposal, non-runtime export permission DTOs, a disabled-by-default export runtime gate, source-level preflight tests, a non-runtime implementation plan, and a product-owner approval packet for a future same-parish basic request-list export pilot.

Updated safe internal statement after non-production route wiring:

> Vinea has prepared a conservative export-control proposal, non-runtime export permission DTOs, a disabled-by-default export runtime gate, source-level preflight tests, a product-owner approval packet, and a non-production-only same-parish basic request-list export route behind disabled-by-default flags.

Updated safe internal statement after live non-production smoke and production readiness packet:

> Vinea has passed a live local non-production smoke for the first same-parish basic request-list export route and has prepared a production readiness approval packet, but production exports remain off until a separate production approval, smoke, monitoring, rollback, and staff-facing UI decision are complete.

Updated safe internal statement after production smoke intake worksheet:

> Vinea has prepared a human-fillable production smoke intake worksheet for the first same-parish basic request-list export route, but production exports remain off until the worksheet is filled with non-secret labels and a separate exact approval prompt is provided.

Updated safe internal statement after document manifest readiness packet:

> Vinea has prepared a manifest-only readiness packet for a future request document manifest export, but route wiring, production flags, staff-facing UI, signed URL delivery, bulk document files, and production exports remain unapproved.

Updated safe internal statement after document manifest approval packet:

> Vinea has prepared a manifest-only readiness packet and product-owner approval packet for a future non-production request document manifest export route, but the route is not wired, production flags are not enabled, staff-facing production UI is not approved, signed URL delivery and bulk document files remain blocked, and production exports remain unapproved.

Updated safe internal statement after document manifest non-production route wiring:

> Vinea has wired a non-production-only request document manifest export route behind disabled-by-default export flags. The route is manifest-only and audited before query/delivery, while production flags, staff-facing production UI, signed URL delivery, original filenames, storage paths, document files, bulk document export, and production exports remain unapproved.

Updated safe internal statement after document manifest route-level QA:

> Vinea has completed route-level non-production QA for the request document manifest export route. The route remains disabled by default, production-blocked, manifest-only, and unapproved for staff-facing production UI or live production exports.

Updated safe internal statement after document manifest live smoke approval packet:

> Vinea has prepared the approval packet for a future live non-production smoke of the request document manifest export route. The smoke is not approved yet, production exports remain off, and the route remains manifest-only with signed URLs, storage paths, original filenames, document files, tokens, notes, communications, AI material, and sacramental/canonical details excluded.

Updated safe internal statement after document manifest production smoke intake worksheet:

> Vinea has prepared a human-fillable production smoke intake worksheet for the request document manifest export route, but production exports remain off until the worksheet is filled with non-secret labels and a separate exact approval prompt is provided.

Updated safe internal statement after document manifest production final approval prompt template:

> Vinea has prepared a final production approval prompt template for the request document manifest export route, but production exports remain off until the product owner supplies the exact public production URL, exact rollout window, and submits the approval prompt as a separate explicit instruction.

Updated safe internal statement after document manifest production smoke evidence template:

> Vinea has prepared a production smoke evidence template for the request document manifest export route, but production exports remain off and the current export runtime gate remains production-blocked until a separate production-runtime enablement path and explicit product-owner approval are provided.

Updated safe internal statement after document manifest production gate approval packet:

> Vinea has prepared a production export gate design and approval packet for the request document manifest export route, but the current export runtime gate remains production-blocked and production exports remain off until a separate implementation approval and production smoke approval are provided.

Updated safe internal statement after document manifest production gate preflight scaffold:

> Vinea has prepared source-level preflight scaffolding for the future request document manifest production export gate, but the production gate is still not implemented and production exports remain off.

Updated safe internal statement after document manifest production gate implementation approval packet:

> Vinea has prepared a product-owner approval packet for future implementation of the request document manifest production export gate, but the gate code is not implemented, production flags are disabled, and production exports remain off.

Do not claim:

- Runtime export controls are complete.
- Production export controls are complete.
- Field-level permissions are complete.
- Diocesan exports are production-ready.
- Bulk document export is approved.
- Sacramental/canonical export policy is legally or canonically approved.
- Public trust-center export claims are ready.
