# Request Document Manifest Export Route Wiring Approval Packet - 2026-06-30

Status: Prepared as a product-owner approval packet only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no live export route was wired, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

Current decision state: `APPROVAL PACKET PREPARED, NON-PRODUCTION DOCUMENT MANIFEST ROUTE WIRING NOT APPROVED BY THIS DOCUMENT`

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROUTE_WIRING_APPROVAL_PACKET_20260630`

## Purpose

This packet prepares the exact product-owner decision needed before engineering wires a non-production request document manifest export route.

It depends on:

- Request document manifest readiness packet: `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_READINESS_PACKET_20260630.md`
- Export access-control DTOs: `lib/exportAccessControl.ts`
- Disabled export runtime gate: `lib/server/exportRuntimeGate.ts`
- Future route source preflight: `lib/server/exportRouteRuntimeWiringPreflight.ts`
- Data export/access-control policy proposal: `docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md`

This packet does not approve route wiring by itself. It only records the guardrails and exact future approval language required before the route may be implemented in non-production.

## Decision Requested

Product owner is being asked to approve only this future action:

> Wire the request document manifest export route in non-production only, behind the disabled export runtime gate, using the `request_document_manifest` preset and the route candidate `app/api/exports/requests/documents/manifest/route.ts`.

This approval would allow engineering to implement the route code and tests in a later phase, but only with the runtime gate disabled by default, production blocked, and the manifest-only privacy boundary preserved.

## Pilot Surface

Pilot preset: `request_document_manifest`

Future route candidate: `app/api/exports/requests/documents/manifest/route.ts`

Future route mode: Non-production QA only.

Export purpose:

- Help staff see which required request documents are missing, received, or reviewed.
- Support follow-up without exposing document files.
- Validate document export governance before any future staff-facing export UI or production export work.

## Explicit Non-Approval Boundary

This packet does not approve:

- Production export rollout.
- Production feature flags.
- Customer-facing export claims.
- Staff-facing export UI in production.
- Bulk document file exports.
- Signed URL generation.
- Storage bucket exposure.
- Storage object path exposure.
- Direct storage path exposure.
- Original filename export.
- Uploaded file content export.
- File previews or downloads.
- Family portal token export.
- Family portal token hash export.
- Public intake token export.
- Public intake token hash export.
- Internal note export.
- Staff-only document comment export.
- Communication-history export.
- AI summary, draft, prompt, provider payload, or token-material export.
- Sacramental/canonical detail export.
- Audit/security export.
- People or household export.
- Diocesan or multi-parish rollup export.
- Support break-glass export.
- Any operational RLS change.
- Any database migration.
- Any Google Calendar behavior.
- Any record mutation beyond future approved safe audit metadata.

## Allowed Manifest Fields

The future route must use a server-owned allowlist.

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

Conditionally allowed only if product, parish operations, and security/data owners approve:

- Due date or expiration date when it does not reveal private file details.
- Standardized rejection reason category when it is non-sensitive and not free-text.

## Explicitly Blocked Fields

The future route must explicitly exclude:

- Signed URLs.
- Storage bucket names.
- Storage object paths.
- Direct storage paths.
- Original filenames.
- Uploaded file contents.
- File previews.
- File sizes if they could identify a private upload.
- MIME types if they could identify a private upload.
- Family portal tokens.
- Family portal token hashes.
- Public intake tokens.
- Public intake token hashes.
- Staff-only internal notes.
- Staff-only document comments.
- Communication bodies.
- Email addresses unless separately approved for a later export surface.
- Phone numbers unless separately approved for a later export surface.
- AI summaries.
- AI email drafts.
- Raw AI prompts.
- AI provider payloads.
- AI token material.
- Sacramental/canonical record details.
- Google OAuth tokens.
- Google Calendar payloads.
- Audit log payloads.
- Support/debug payloads.

## Required Future Implementation Gates

The future route wiring must prove these gates before any export query or file delivery:

1. `getExportRuntimeGate` is evaluated.
2. Production remains blocked.
3. Authenticated staff is required.
4. Family portal and unauthenticated surfaces are denied.
5. Selected active parish context is resolved server-side.
6. Active parish membership is validated using parish membership scope.
7. Every included request is verified to belong to the selected active parish.
8. `buildExportPermissionEvaluationDto` evaluates preset `request_document_manifest`.
9. The server-owned document manifest field allowlist is used.
10. Blocked-field requests are denied before any query work.
11. No signed URL, storage path, file preview, file download, or storage object API is called.
12. Safe audit metadata is prepared before query or delivery.
13. Audit event writing is approved before the route can deliver a manifest.
14. Same-parish request document metadata is queried only after all scope and permission gates pass.
15. Generic blocked errors are used for denied attempts.
16. The route satisfies `lib/server/exportRouteRuntimeWiringPreflight.ts` before merge.

## Required Non-Production Flags

The future route may only run when all exact flags are present in an explicitly approved non-production environment:

- `VINEA_EXPORT_RUNTIME=ENABLED`
- `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
- `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`

Production must remain blocked even if these flags are accidentally present.

## Required QA Fixtures Before Wiring

Before route wiring begins, engineering must identify safe non-production fixture labels for:

- QA staff account with request document manifest export permission.
- Active Parish A.
- Optional Parish B or documented cross-parish denial substitute.
- Same-parish request with required document workflow steps.
- Same-parish document records with safe labels and mixed missing/received/reviewed statuses.
- Cross-parish denied request document fixture or active-parish mismatch fixture.
- Family portal denial fixture or signed-out denial substitute.
- Blocked-field attempt fixture that asks for signed URL, storage path, original filename, token, note, communication, AI, or sacramental/canonical fields.
- Audit-log inspection method.
- Rollback verification method.

Fixture labels must be non-secret. Do not record raw credentials, token values, signed URLs, storage paths, original filenames, or private document contents in evidence.

## Required Acceptance Evidence After Future Wiring

The future implementation will not be considered complete until evidence proves:

- Flag-off baseline returns generic disabled behavior.
- No export query runs while the flag is off.
- Same-parish non-production manifest export succeeds with only approved fields.
- The manifest contains no signed URLs, storage paths, original filenames, file contents, tokens, notes, communications, AI material, or sacramental/canonical details.
- Cross-parish manifest attempt is denied without query or file delivery.
- Family portal or unauthenticated attempt is denied without query or file delivery.
- Blocked-field attempt is denied before query work.
- No storage signed URL API, storage path API, file preview API, or file download API is called.
- Audit metadata is written before query execution or manifest delivery.
- Audit metadata contains only safe values: staff id, active parish id, preset id, request count, field list id, target object type, decision, blocked reason when applicable, and timestamp.
- Source-level export route preflight passes.
- Rollback by disabling flags restores disabled behavior.
- Production remains blocked.

## Required Owners

Product owner:

- Approves the pilot surface, allowed fields, manifest-only boundary, and non-production-only scope.

Security/data owner:

- Approves blocked fields, generic denial behavior, audit metadata, original filename exclusion, storage path exclusion, signed URL exclusion, and token exclusion.

Engineering owner:

- Approves active parish scope, membership scope, request ownership checks, route preflight compliance, and rollback plan.

Parish operations owner:

- Approves staff-facing manifest language and whether due dates, expiration dates, or standardized rejection categories are useful enough for the pilot.

Support owner:

- Approves support handling for blocked manifest attempts and failed QA runs.

Canonical/sacramental owner:

- Review is not required for this manifest-only pilot only if sacramental/canonical fields remain explicitly excluded.

## Exact Future Approval Language

The product owner should use this exact language in a future prompt if they want engineering to wire the non-production pilot:

```text
Approve non-production route wiring for the request_document_manifest export pilot only. Wire app/api/exports/requests/documents/manifest/route.ts behind the disabled export runtime gate using request_document_manifest, preserve production blocking, require authenticated staff, selected active parish scope, parish membership scope, request ownership checks for every included request, export permission DTO evaluation, server-owned manifest field allowlist, blocked-field controls, family-portal and unauthenticated denial, safe audit metadata before query or delivery, source-level route preflight compliance, and rollback by disabling flags. Keep the export manifest-only and do not create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or mutate records beyond approved audit metadata. Do not enable production flags, do not add staff-facing production UI, do not apply migrations, do not change operational RLS, do not touch Google Calendar data, and do not expose secrets.
```

## Go / No-Go Checklist

Current recommendation: `NO-GO FOR DOCUMENT MANIFEST ROUTE WIRING UNTIL PRODUCT OWNER EXPLICITLY APPROVES THE FUTURE PROMPT`

Go only when:

- Product owner approves the exact future prompt.
- Required non-production QA fixture labels are identified.
- Audit-write behavior is approved for the pilot.
- Rollback owner is named.
- Monitoring or evidence owner is named.
- Engineering confirms source-level route preflight can enforce the manifest-only boundary.

No-go if:

- The request asks for production flags.
- The request asks for staff-facing production UI.
- The request asks for signed URLs, storage paths, original filenames, or file contents.
- The request asks to expose tokens, notes, communications, AI material, or sacramental/canonical details.
- The request asks to change operational RLS or apply migrations.
- The request asks to touch Google Calendar data.
- The request asks to mutate records beyond approved safe audit metadata.

## Rollback

The future rollback must be feature-flag rollback:

- Remove or disable `VINEA_EXPORT_RUNTIME`.
- Remove or disable `VINEA_EXPORT_RUNTIME_ACK`.
- Remove or disable `VINEA_EXPORT_RUNTIME_ENV`.

Because this approval packet does not wire the route, no rollback action is needed for this phase.

## What Changed Plain English

Vinea now has a clear permission slip for a future document checklist export. The future export would show staff a safe checklist of document statuses, but it would not download the files or reveal file links, storage paths, original filenames, tokens, notes, communications, AI content, or sacramental/canonical details.

## Next Recommended Safe Step

If the product owner is ready, use the exact future approval language above to authorize non-production-only route wiring. Otherwise, continue trust-center readiness with export QA fixture planning, staff-visible audit-history planning, or restore-drill evidence ownership.
