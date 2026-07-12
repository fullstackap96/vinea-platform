# Request Document Manifest Export Readiness Packet - 2026-06-30

Status: Prepared as a non-runtime export-governance packet only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no live export route was wired, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

Current decision state: `DOCUMENT MANIFEST EXPORT PLAN PREPARED, ROUTE WIRING NOT APPROVED`

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_READINESS_PACKET_20260630`

## Purpose

This packet prepares the next safe export-governance surface after `request_list_basic`: a request document manifest export.

The goal is to let staff eventually review document readiness without downloading document files. This is intentionally a manifest-only plan. It must never create signed URLs, expose storage paths, return original files, or reveal family portal token material.

This packet depends on:

- Export access-control DTOs: `lib/exportAccessControl.ts`
- Disabled export runtime gate: `lib/server/exportRuntimeGate.ts`
- Future route source preflight: `lib/server/exportRouteRuntimeWiringPreflight.ts`
- Data export policy: `docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md`

This packet does not approve runtime route wiring, production flags, staff-facing export UI, bulk document file exports, sensitive note exports, sacramental/canonical exports, migrations, operational RLS changes, Google Calendar behavior, or any record mutation beyond a future separately approved audit event.

## Recommended Future Surface

Recommended export preset: `request_document_manifest`

Recommended future route candidate: `app/api/exports/requests/documents/manifest/route.ts`

Recommended future mode: Non-production QA only, behind the disabled export runtime gate, until product owner, security/data owner, parish operations owner, and engineering owner approve route wiring.

Rationale:

- Parish staff often need to know which families have submitted required documents.
- A manifest can support follow-up without exposing document contents.
- The existing Workflow Templates + Document Portal work already links documents to requests and workflow steps.
- Manifest-only export is safer than bulk file export because it avoids signed URLs, storage paths, and uploaded file content.
- It exercises active parish scope, request ownership, workflow-step linkage, document metadata minimization, and export audit metadata.

Do not use this future surface for bulk file downloads, document content review, signed URL delivery, family portal token review, internal note export, communication export, sacramental/canonical export, audit/security export, public intake routing export, AI output export, support break-glass export, or diocesan rollup export.

## Approved Manifest Fields For A Future Pilot

The future route must use a server-owned allowlist. The client must not be allowed to submit arbitrary column names.

Allowed manifest fields:

- Request reference.
- Request type.
- Request status.
- Workflow phase.
- Workflow step title.
- Workflow step required/optional flag.
- Document family-facing label.
- Document staff-facing category label when safe.
- Document review status.
- Submitted date.
- Reviewed date.
- Reviewer display label.
- Missing/received indicator.

Conditionally allowed after security/data review:

- Document rejection reason category, only if standardized and non-sensitive.
- Document expiration or due date, only if it does not reveal private document content.

Explicitly excluded fields:

- Uploaded file contents.
- Original filename.
- File size if it could identify a private upload.
- MIME type if it could identify a private upload.
- Storage bucket name.
- Storage object path.
- Direct storage path.
- Signed URL.
- Signed URL expiration.
- Family portal token.
- Family portal token hash.
- Public intake token or token hash.
- Staff-only internal notes.
- Staff-only document comments.
- Communication bodies.
- Parishioner email addresses.
- Parishioner phone numbers.
- Full address data.
- AI summaries, prompts, drafts, provider payloads, or token material.
- Google OAuth tokens or Google Calendar payloads.
- Audit-log payloads.
- Sacramental/canonical record details.
- Certificate-generation evidence.
- Raw import payloads.
- Support/debug payloads.

## Future Route Gate Order

Any future route wiring must keep this order and fail closed before any export query or file delivery:

1. Evaluate `getExportRuntimeGate` before export query work.
2. Require authenticated staff.
3. Deny family portal or unauthenticated surfaces.
4. Resolve selected active parish context server-side.
5. Validate the active parish is in the staff member's `parish_memberships`.
6. Validate every target request belongs to the selected active parish.
7. Build `buildExportPermissionEvaluationDto` with preset `request_document_manifest`.
8. Use the server-owned document manifest field allowlist.
9. Deny blocked fields with generic errors.
10. Prepare safe audit metadata with no raw file contents, prompts, tokens, signed URLs, storage paths, original filenames, provider payloads, or full record payloads.
11. Write the audit event before query execution or file delivery.
12. Query only same-parish request document metadata for the selected active parish.
13. Return a CSV manifest only when row count is under the synchronous limit.
14. Return the file response without creating a signed URL.

The route must continue to satisfy `lib/server/exportRouteRuntimeWiringPreflight.ts` before merge.

## Required Feature Flags For Any Future Runtime QA

The future runtime route may only run in an explicitly approved non-production environment while these exact flags are present:

- `VINEA_EXPORT_RUNTIME=ENABLED`
- `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
- `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`

Production must remain blocked even if those flags are accidentally present.

## Acceptance Criteria For Future Wiring

Flag-off baseline:

- The route returns a generic disabled response.
- No document metadata query runs.
- No file is delivered.
- No signed URL is created.
- No audit event is written unless a separate product decision approves disabled-attempt auditing.

Same-parish manifest success in non-production:

- An authenticated staff user with `export_documents_manifest` can export only the selected active parish's request document manifest.
- The selected active parish controls the explicit parish filter.
- Every included request belongs to the selected active parish.
- The response contains only approved manifest fields.
- No document file contents, original filenames, storage paths, signed URLs, token material, internal notes, communication bodies, AI material, or sacramental/canonical details appear.
- Safe audit metadata is prepared and written before query execution or file delivery.

Cross-parish denial:

- A staff user cannot export document metadata for a parish outside active membership.
- A selected active parish mismatch fails with a generic error.
- No metadata query runs for the denied parish.
- No file is delivered.

Family-portal denial:

- Family portal requests cannot access this route.
- Family-facing surfaces cannot receive staff export files or export metadata.
- Generic blocked errors are used.

Blocked-field denial:

- Any attempt to request token material, signed URLs, storage paths, original filenames, file contents, internal notes, communication bodies, AI material, or sacramental/canonical fields is denied.
- The route never echoes blocked field names back to family-facing or unauthenticated users.

Bulk-file boundary:

- `request_document_manifest` must not call Supabase Storage signed URL APIs.
- `request_document_manifest` must not return document files.
- Bulk document file export remains disabled under `request_document_files_bulk`.

Production safety:

- Production remains blocked by the runtime gate.
- No production flag rollout is allowed until a separate production approval packet exists.
- Operational RLS is unchanged.
- No migrations are required for this readiness packet.

## Required QA Fixtures Before Future Wiring

Before any future route wiring begins, engineering must identify safe non-production fixture labels for:

- QA staff account with document manifest export permission.
- Active Parish A.
- Optional Parish B or documented cross-parish denial substitute.
- Same-parish request with required document steps.
- Same-parish request document records with safe labels and mixed statuses.
- Cross-parish denied request document fixture or active-parish mismatch substitute.
- Family portal denial fixture or signed-out route-level substitute.
- Blocked-field attempt fixture.
- Audit-log inspection method.
- Rollback verification method.

Do not record passwords, database URLs, service-role keys, access tokens, refresh tokens, signed URLs, family portal tokens, storage paths, original filenames, uploaded file contents, raw fixture secrets, or raw UUIDs in this packet.

## Approval Gates Before Future Wiring

Do not wire the route until these approvals are recorded:

- Product owner approves `request_document_manifest` as the next export governance pilot surface.
- Parish operations owner approves the staff-facing manifest language and field list.
- Security/data owner approves blocked fields, audit metadata, generic denial behavior, original filename exclusion, storage path exclusion, and signed URL exclusion.
- Engineering owner approves active parish, membership scope, request ownership, preflight compliance, and rollback plan.
- Support owner approves support handling for failed or blocked manifest attempts.

Canonical/sacramental owner review is not required for this manifest-only pilot only if sacramental/canonical fields remain explicitly excluded.

## Rollback

The first rollback control is feature-flag rollback:

- Remove or disable `VINEA_EXPORT_RUNTIME`.
- Remove or disable `VINEA_EXPORT_RUNTIME_ACK`.
- Remove or disable `VINEA_EXPORT_RUNTIME_ENV`.

If a future route commit causes problems before release, revert only the route wiring commit and any route-specific tests. No database rollback is expected for this readiness packet because it does not require migrations.

## What Changed Plain English

This packet plans a safer future document export. Instead of downloading family-uploaded files, staff would eventually be able to download a simple checklist-style manifest showing which documents are missing, received, or reviewed. The plan keeps file contents, file links, storage paths, tokens, notes, and private details out of the export.

## Next Recommended Safe Step

Collect explicit product-owner approval before any non-production route wiring of `request_document_manifest`. The approval must confirm the manifest-only surface, allowed fields, blocked fields, non-production-only flags, QA fixtures, audit expectations, rollback owner, and the exact instruction that production exports, staff-facing production UI, bulk document files, migrations, operational RLS changes, and Google Calendar behavior remain out of scope.
