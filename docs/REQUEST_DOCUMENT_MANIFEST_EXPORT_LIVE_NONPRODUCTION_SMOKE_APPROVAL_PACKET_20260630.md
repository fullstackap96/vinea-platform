# Request Document Manifest Export Live Non-Production Smoke Approval Packet - 2026-06-30

Status: Prepared as a product-owner approval packet only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

Current decision state: `LIVE NON-PRODUCTION DOCUMENT MANIFEST EXPORT SMOKE NOT APPROVED BY THIS DOCUMENT`

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260630`

## Purpose

This packet defines the exact approval needed before running a live HTTP/browser smoke test of the already wired `request_document_manifest` export route in a safe non-production environment.

The smoke test is intended to validate the manifest-only document checklist route through an actual app session after route-level test-harness QA has already passed.

This packet does not approve production exports, production feature flags, staff-facing production UI, signed URL delivery, storage path exposure, original filename export, document file delivery, bulk document exports, sensitive exports, diocesan exports, migrations, operational RLS changes, Google Calendar changes, or unrelated record mutations.

## Exact App Target

The product owner must fill one approved non-production app target before QA begins:

- App target label: `NON_PRODUCTION_APP_URL`
- Required format: `https://<approved-non-production-origin>` or `http://localhost:<approved-local-port>`
- Route under smoke: `/api/exports/requests/documents/manifest`
- Full route shape: `<NON_PRODUCTION_APP_URL>/api/exports/requests/documents/manifest`
- Health check route: `<NON_PRODUCTION_APP_URL>/api/health`

The app target must not be a production deployment. If the target cannot be confirmed as non-production, the smoke test is `NO-GO`.

## Exact Non-Production Runtime Flags

The live smoke may only run with these exact flags in the approved non-production environment:

- `VINEA_EXPORT_RUNTIME=ENABLED`
- `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
- `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`

Flag-off baseline must be captured first. Production must remain blocked even if these flags are accidentally present.

## Safe Staff Fixture

The product owner must identify a safe staff fixture without recording secrets:

- Staff fixture label: `SAFE_DOCUMENT_MANIFEST_EXPORT_QA_STAFF`
- Staff account must be an authenticated Vinea staff user.
- Staff account must have membership in active Parish A.
- Staff account must have only the minimum permissions needed for this non-production smoke.
- Passwords, one-time codes, session cookies, refresh tokens, and browser secrets must not be recorded in this packet or evidence.

## Same-Parish Request And Document Fixture

The product owner must identify safe same-parish fixtures without recording sensitive data:

- Active parish fixture label: `SAFE_DOCUMENT_MANIFEST_EXPORT_PARISH_A`
- Same-parish request fixture label: `SAFE_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST`
- Same-parish document fixture label: `SAFE_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET`
- The request must belong to Parish A through the existing parishioner/request relationship.
- The request should have required document workflow steps.
- The document set should include safe labels and mixed missing, received, and reviewed statuses where practical.
- The exported CSV must include only the approved `request_document_manifest` fields:
  - Request reference.
  - Request type.
  - Request status.
  - Workflow phase.
  - Workflow step title.
  - Workflow step required or optional flag.
  - Document family-facing label.
  - Document safe category label.
  - Document review status.
  - Submitted date.
  - Reviewed date.
  - Reviewer display label.
  - Missing or received indicator.

## Cross-Parish Denial Fixture

The product owner must identify a safe denial fixture:

- Cross-parish fixture label: `SAFE_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST`
- Denial substitute allowed: an active Parish B switch plus a Parish A request, or a Parish B request while active Parish A is selected.
- Expected result: generic denial, no CSV delivery, no document manifest query, no signed URL or storage API call, and no unsafe audit metadata.

## Blocked-Field Attempt

The smoke must include explicit blocked-field attempts:

- Example blocked URL: `/api/exports/requests/documents/manifest?fields=request_reference,signed_url`
- Example blocked URL: `/api/exports/requests/documents/manifest?fields=request_reference,storage_path`
- Example blocked URL: `/api/exports/requests/documents/manifest?fields=request_reference,original_filename`
- Example blocked URL: `/api/exports/requests/documents/manifest?fields=request_reference,portal_token`
- Expected result: generic denial before document query, storage API access, or CSV delivery.
- The response must not reveal whether a forbidden field exists in the database.

## Family-Portal Or Unauthenticated Denial Method

The smoke must verify family-facing access cannot use the staff export route:

- Preferred method: open the route from a browser context that is not authenticated as staff.
- Optional method: use a safe family portal browser session or safe family portal fixture URL, then attempt direct route access.
- Expected result: HTTP `401` or equivalent generic unauthenticated denial before parish scope, audit writing, export query, storage API access, or CSV delivery.
- Do not record family portal tokens, token hashes, signed URLs, document paths, original filenames, or document contents.

## Audit-Log Inspection Method

The smoke must verify only safe audit metadata is recorded for approved manifest delivery:

- Audit action: `export.request_document_manifest.downloaded`
- Audit target type: `export`
- Audit target id: `request_document_manifest`
- Required safe metadata:
  - `export_preset_id`
  - `active_parish_id`
  - `route_id`
  - `runtime_gate_state`
  - `delivery_mode`
  - `file_type`
  - `request_count`
  - `row_count` or safe row-count substitute
  - `field_list_id`
- Metadata must not include raw CSV contents, signed URLs, storage bucket names, storage object paths, original filenames, uploaded file contents, document previews, tokens, notes, communications, AI material, Google payloads, OpenAI payloads, credentials, audit payloads, sacramental/canonical details, or raw database payloads.
- Inspection may use the staff audit log UI, a safe non-production admin query, or an existing audit evidence helper if available.

## Monitoring Expectations

During the smoke window, monitor:

- `/api/health` returns `checks.schema: true` before and after the smoke.
- Export route status codes for flag-off, allowed, denied, blocked-field, family/unauthenticated, and rollback cases.
- Audit event count for the approved same-parish document manifest export.
- No signed URL, storage, preview, download, or file-delivery API calls are observed.
- No unexpected server errors.
- No repeated denial spikes.
- No sensitive values in browser output, server logs, audit metadata, or CSV output.

## Rollback Owner And Rollback Steps

Rollback owner placeholder: `ROLLBACK_OWNER_NAME`

Rollback steps:

1. Disable or unset `VINEA_EXPORT_RUNTIME`.
2. Disable or unset `VINEA_EXPORT_RUNTIME_ACK`.
3. Disable or unset `VINEA_EXPORT_RUNTIME_ENV`.
4. Restart or redeploy the non-production app if needed.
5. Verify `/api/exports/requests/documents/manifest` returns generic unavailable behavior.
6. Verify no additional export delivery audit events are created after rollback.

Rollback must not require a database migration, RLS change, Google Calendar change, storage change, or production change.

## Required Smoke Sequence

1. Confirm app target is explicitly non-production.
2. Confirm `/api/health` returns `checks.schema: true`.
3. With flags off, verify `/api/exports/requests/documents/manifest` returns generic unavailable behavior.
4. Enable only the exact non-production export QA flags.
5. Sign in as `SAFE_DOCUMENT_MANIFEST_EXPORT_QA_STAFF`.
6. Select `SAFE_DOCUMENT_MANIFEST_EXPORT_PARISH_A`.
7. Run same-parish document manifest export and verify CSV field exclusions.
8. Run cross-parish denial fixture and verify generic denial.
9. Run blocked-field attempts and verify generic denial.
10. Run family-portal or unauthenticated denial method.
11. Inspect audit log for safe metadata only.
12. Verify no signed URL, storage, preview, download, or file-delivery API usage.
13. Disable flags and verify rollback behavior.
14. Capture non-secret evidence and unresolved risks.

## Explicit Non-Approval Boundary

This packet does not approve:

- Production export runtime flags.
- Production export smoke.
- Staff-facing production UI.
- Signed URL generation.
- Storage bucket exposure.
- Storage object path exposure.
- Direct storage path exposure.
- Original filename export.
- Uploaded file content export.
- File previews or downloads.
- Bulk document file exports.
- Family portal token export.
- Family portal token hash export.
- Public intake token export.
- Public intake token hash export.
- Staff-only internal note export.
- Staff-only document comment export.
- Communication-history export.
- AI summary, draft, prompt, provider payload, or token-material export.
- Sacramental/canonical detail export.
- Audit/security export.
- People or household export.
- Public intake routing export.
- Support break-glass export.
- Diocesan or multi-parish rollup export.
- Any operational RLS change.
- Any database migration.
- Any Google Calendar behavior.
- Any record mutation beyond approved safe audit metadata.

## Exact Approval Language

The product owner should use this exact language in a future prompt to approve the live non-production smoke:

```text
Approve live non-production HTTP/browser smoke for the request_document_manifest export route only. Use NON_PRODUCTION_APP_URL=<approved non-production app URL>, SAFE_DOCUMENT_MANIFEST_EXPORT_QA_STAFF=<safe staff fixture label>, SAFE_DOCUMENT_MANIFEST_EXPORT_PARISH_A=<safe parish fixture label>, SAFE_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST=<safe same-parish request fixture label>, SAFE_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET=<safe same-parish document fixture label>, SAFE_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST=<safe cross-parish denial fixture label>, and ROLLBACK_OWNER_NAME=<rollback owner>. Run flag-off baseline first, then enable only VINEA_EXPORT_RUNTIME=ENABLED, VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA, and VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION in non-production. Verify same-parish manifest CSV success, cross-parish denial, blocked-field denial, family-portal or unauthenticated denial, safe audit metadata, CSV field exclusions, no signed URL/storage/file API usage, monitoring expectations, and rollback by disabling flags. Keep the export manifest-only and do not create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or mutate records beyond approved audit metadata. Do not access production, enable production flags, add production UI, apply migrations, change operational RLS, touch Google Calendar data, or expose secrets.
```

## Go / No-Go Checklist

Current recommendation: `NO-GO UNTIL PRODUCT OWNER FILLS FIXTURES AND APPROVES THE EXACT FUTURE PROMPT`

Go only when:

- App target is confirmed non-production.
- Safe staff fixture is identified.
- Active parish fixture is identified.
- Same-parish request fixture is identified.
- Same-parish document fixture is identified.
- Cross-parish denial fixture or substitute is identified.
- Blocked-field attempts are approved.
- Family-portal or unauthenticated denial method is approved.
- Audit-log inspection method is approved.
- Rollback owner is named.
- Monitoring expectations are acknowledged.
- Product owner provides the exact approval language.

No-go if:

- The app target is production or ambiguous.
- The smoke requires production data.
- The smoke requires production flags.
- Safe fixtures are missing.
- The route would export sensitive fields.
- The route would create signed URLs.
- The route would expose storage paths, original filenames, or file contents.
- The route would mutate records beyond approved audit metadata.
- Rollback owner is missing.
- Audit inspection would expose raw secrets or sensitive record content.

## What Changed Plain English

This packet is the permission slip for testing the document checklist export through a real non-production app. It says which safe app, staff account, parish, request, document set, denial cases, audit check, monitoring, and rollback plan must be named before the test can run. It still does not turn on production exports or expose document files.

## Next Recommended Safe Step

After the product owner fills the fixture labels and approves the exact future prompt, run the live non-production smoke and record the results in a separate evidence document. Production exports remain `NO-GO`.
