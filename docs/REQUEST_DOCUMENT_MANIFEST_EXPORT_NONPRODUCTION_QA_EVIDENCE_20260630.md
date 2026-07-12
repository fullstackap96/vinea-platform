# Request Document Manifest Export Non-Production QA Evidence - 2026-06-30

Status: Completed as non-production route-level QA for `request_document_manifest`. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated beyond the approved safe audit metadata path, and no secrets were exposed.

## QA Environment

- QA type: `route-level non-production QA harness`
- Route under test: `app/api/exports/requests/documents/manifest/route.ts`
- Export preset: `request_document_manifest`
- Runtime flag state for enabled cases:
  - `VINEA_EXPORT_RUNTIME=ENABLED`
  - `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
  - `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`
- Production boundary: production remains blocked by `lib/server/exportRuntimeGate.ts`.
- Runtime rollback method: disable or unset the export runtime flags.

## QA Results

| Gate | Expected result | Evidence | Result |
|---|---|---|---|
| Flag-off blocking | Route returns generic disabled response before staff auth, parish scope, audit, or query | `lib/server/requestDocumentManifestExportRoute.test.ts` verifies HTTP `404` with `export_unavailable` and no staff/auth/db/audit calls | Passed |
| Same-parish manifest success | Authenticated staff with selected active parish membership receives only the document manifest CSV | `lib/server/requestDocumentManifestExportRoute.test.ts` verifies HTTP `200`, CSV content type, approved manifest header, same-parish document row, and missing required document row | Passed |
| Cross-parish denial | Forged or unauthorized active parish cookie fails before audit or query | `lib/server/requestDocumentManifestExportRoute.test.ts` verifies HTTP `403`, generic blocked reason, no service-role query client, and no audit write | Passed |
| Blocked-field denial | Signed URL, storage path, original filename, token, note, communication, AI, or sacramental/canonical field attempts fail before audit or query | `lib/server/requestDocumentManifestExportRoute.test.ts` verifies blocked `signed_url` and non-allowlisted `original_filename` attempts return HTTP `403` with no service-role query client and no audit write | Passed |
| Family portal denial | Non-staff/family-facing requests cannot access the staff export route | `lib/server/requestDocumentManifestExportRoute.test.ts` verifies unauthenticated/family-style access returns HTTP `401` before parish scope, service-role query client, or audit write | Passed |
| Safe audit metadata before query/delivery | Approved safe audit metadata is written before any export query or CSV delivery | `lib/server/requestDocumentManifestExportRoute.test.ts` records event order and verifies `audit` occurs before `query:parishioners`, `query:requests`, `query:request_workflow_steps`, and `query:request_documents` | Passed |
| CSV field exclusions | Export excludes signed URLs, storage paths, original filenames, file contents, file previews, tokens, notes, communications, AI material, Google payloads, audit payloads, and sacramental/canonical details | Route allowlist contains only request reference, request type, request status, workflow phase, workflow step title, workflow step required flag, document label, document status, submitted date, reviewed date, reviewer display label, and missing/received indicator; tests verify forbidden strings are absent | Passed |
| No signed URL/storage/file API usage | Route never calls signed URL, storage path, download, preview, or file delivery APIs | `lib/server/requestDocumentManifestExportRoute.test.ts` verifies source does not contain `createSignedUrl`, `storage.from`, or `download(` and source preflight passes | Passed |
| Source-level route preflight | Route source keeps runtime gate, authentication, active parish, membership scope, DTO, blocked-field, family-portal, audit, generic-error, query, and delivery markers | `lib/server/requestDocumentManifestExportRoute.test.ts` calls `validateFutureExportRouteRuntimeWiringSource` against the actual route source | Passed |
| Rollback | Disabling flags returns the route to generic unavailable behavior | Flag-off test verifies route is blocked before auth/db/audit when runtime flags are absent | Passed |

## Commands Run

```bash
npm.cmd test -- lib/server/requestDocumentManifestExportRoute.test.ts lib/server/requestDocumentManifestExportRouteWiringApprovalPacket.test.ts lib/server/requestDocumentManifestExportReadinessPacket.test.ts lib/exportAccessControl.test.ts lib/server/exportRouteRuntimeWiringPreflight.test.ts lib/server/dataExportAccessControlPolicyProposal.test.ts lib/server/trustCenterReadinessPacket.test.ts lib/server/exportRouteBasicPilotProductOwnerApprovalPacket.test.ts
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

## Forbidden Data Review

The route-level QA did not expose or log:

- Staff passwords.
- Supabase service role keys.
- Supabase anon keys.
- Google OAuth access or refresh tokens.
- OpenAI API keys.
- Family portal tokens or token hashes.
- Public intake token hashes.
- Signed URL material.
- Storage bucket names.
- Storage object paths.
- Direct storage paths.
- Original filenames.
- Uploaded file contents.
- File previews.
- Internal notes or staff-only document comments.
- Communication bodies.
- Raw AI prompts, generated outputs, provider payloads, or token material.
- Sacramental/canonical record details.
- Google Calendar payloads.
- Audit-log payloads beyond the approved safe export audit metadata.

## Remaining Risks

- This was route-level non-production QA, not a live HTTP/browser smoke test.
- No staff-facing export UI exists.
- The route is intentionally disabled by default and production-blocked.
- The route returns manifest CSV only; it does not deliver document files.
- Bulk document file export remains disabled and unapproved.
- Broader export governance remains incomplete for sensitive exports, people/household exports, sacramental/canonical exports, audit exports, diocesan exports, and support break-glass exports.
- A future live non-production smoke can be run after product owner approves a safe app target and fixture records for direct HTTP/browser validation.

## Outcome

Current decision: `REQUEST_DOCUMENT_MANIFEST NON-PRODUCTION ROUTE-LEVEL QA PASSED, PRODUCTION EXPORTS REMAIN NO-GO`

Recommended next step: prepare a live non-production HTTP/browser smoke approval packet for `request_document_manifest` only, or continue trust-center readiness without enabling production exports.

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_NONPRODUCTION_QA_EVIDENCE_20260630`
