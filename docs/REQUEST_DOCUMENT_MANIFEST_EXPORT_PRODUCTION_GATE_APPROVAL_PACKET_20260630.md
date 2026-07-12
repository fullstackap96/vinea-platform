# Request Document Manifest Export Production Gate Approval Packet - 2026-06-30

Status: Prepared as a non-runtime production gate design and product-owner approval packet only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this packet.

Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT GATE NOT IMPLEMENTED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_APPROVAL_PACKET_20260630`

## Purpose

This packet defines the future production-specific runtime gate strategy required before Vinea can run a production smoke of the `request_document_manifest` export route.

It exists because the current export runtime gate is deliberately non-production-only and production-blocked. The current gate must stay that way until a separate approved implementation step changes it.

This packet does not approve production export runtime flags, production export availability, staff-facing production UI, signed URL delivery, storage path exposure, original filename export, document file delivery, bulk document export, migrations, operational RLS changes, Google Calendar behavior, or any export beyond `request_document_manifest`.

## Required Prior Evidence

Do not consider a production gate implementation until these artifacts remain current and passing:

- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`
- `docs/DATA_EXPORT_ACCESS_CONTROL_POLICY_PROPOSAL_20260630.md`
- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- `lib/server/exportRuntimeGate.ts`
- `lib/server/exportRuntimeGate.test.ts`
- `lib/server/exportRouteRuntimeWiringPreflight.ts`
- `lib/server/exportRouteRuntimeWiringPreflight.test.ts`
- `app/api/exports/requests/documents/manifest/route.ts`
- `lib/server/requestDocumentManifestExportRoute.test.ts`

## Current Gate Reality

Current implementation status: `CURRENT EXPORT RUNTIME GATE BLOCKS PRODUCTION`

The current gate accepts only non-production QA:

- `VINEA_EXPORT_RUNTIME=ENABLED`
- `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
- `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`

The current gate returns `blocked_production_environment` when `NODE_ENV=production` or `VERCEL_ENV=production`, even when QA flags are present.

That behavior must remain true until a separate production-gate implementation is explicitly approved.

## Future Production-Specific Runtime Flag Strategy

Future production export enablement must use a separate production-specific gate instead of reusing the QA acknowledgement.

Proposed future production smoke flags:

- `VINEA_EXPORT_RUNTIME=ENABLED`
- `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_PRODUCTION_SMOKE`
- `VINEA_EXPORT_RUNTIME_ENV=PRODUCTION`
- `VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST=request_document_manifest`
- `VINEA_EXPORT_RUNTIME_APPROVAL_ID=REQUEST_DOCUMENT_MANIFEST_PRODUCTION_SMOKE_<YYYYMMDD>`
- `VINEA_EXPORT_RUNTIME_EXPIRES_AT=<UTC timestamp inside approved rollout window>`
- `VINEA_EXPORT_RUNTIME_ROLLBACK_OWNER=<non-secret owner label>`
- `VINEA_EXPORT_RUNTIME_MONITORING_CHANNEL=<non-secret channel label>`

Production smoke enablement must fail closed unless all of these are true:

1. `NODE_ENV=production` or `VERCEL_ENV=production` is detected.
2. The production acknowledgement is exactly `APPROVED_EXPORT_RUNTIME_PRODUCTION_SMOKE`.
3. The environment marker is exactly `PRODUCTION`.
4. The route allowlist includes exactly `request_document_manifest` for this smoke.
5. The approval id matches the final product-owner approval prompt.
6. The current time is before `VINEA_EXPORT_RUNTIME_EXPIRES_AT`.
7. Rollback owner and monitoring channel are present as non-secret labels.
8. The route still passes source-level preflight.
9. The production smoke evidence template is ready for live evidence capture.
10. The flag-off baseline has already been captured in the rollout window.

Do not use this packet as permission to add or enable those flags. It only defines the future shape.

## Future Safety Checks Before Query Or Delivery

The future production gate must not be the only safety layer. The route must still prove every existing export safety check before any query, CSV creation, audit delivery metadata, or file delivery:

- Authenticated staff session.
- Selected active parish context.
- Membership scope for the active parish.
- Request ownership check for every included request.
- `request_document_manifest` export permission DTO evaluation.
- Server-owned manifest field allowlist.
- Blocked-field denial for signed URL, storage path, original filename, portal token, token hash, internal note, communication body, AI material, and sacramental/canonical detail requests.
- Family portal and unauthenticated denial.
- Generic blocked error messages.
- Safe audit metadata prepared before query or delivery.
- Safe audit event written before query or delivery.
- No signed URL creation.
- No Supabase Storage download or signed URL API usage.
- No storage path exposure.
- No original filename export.
- No document file delivery.
- No raw CSV contents in logs or audit evidence.

## Future Source-Level Preflight Tests

Before any production-gate code is merged, add source-level preflight tests that fail unless the future route and gate source preserve these markers:

1. `getExportRuntimeGate` still blocks production unless the production-specific acknowledgement is present.
2. The QA acknowledgement `APPROVED_EXPORT_RUNTIME_QA` still cannot enable production.
3. `APPROVED_EXPORT_RUNTIME_PRODUCTION_SMOKE` cannot enable non-production QA accidentally.
4. `VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST` is checked before route-specific export logic.
5. `VINEA_EXPORT_RUNTIME_APPROVAL_ID` is checked before route-specific export logic.
6. `VINEA_EXPORT_RUNTIME_EXPIRES_AT` is checked before route-specific export logic.
7. `requireStaffFromRequest` appears before export query and delivery markers.
8. Active parish context appears before export query and delivery markers.
9. Membership parish ids appear before export query and delivery markers.
10. Request ownership checks appear before manifest row queries.
11. `buildExportPermissionEvaluationDto` appears before manifest row queries.
12. Blocked field controls appear before manifest row queries.
13. Family portal exclusion appears before manifest row queries.
14. Safe audit metadata appears before manifest row queries.
15. Audit writing appears before manifest row queries and delivery.
16. No signed URL, storage path, file download, original filename, token, notes, communications, AI, or sacramental/canonical detail markers appear in the manifest production path.
17. Rollback-by-flag behavior is preserved.

Suggested future test files:

- `lib/server/exportRuntimeProductionGate.test.ts`
- `lib/server/exportRouteProductionRuntimeWiringPreflight.test.ts`
- `lib/server/requestDocumentManifestExportProductionGateRoutePreflight.test.ts`

Prepared non-runtime scaffold:

- `lib/server/exportProductionGatePreflight.ts`
- `lib/server/exportProductionGatePreflight.test.ts`

The prepared scaffold is source-level only. It validates the future production gate shape and the current `request_document_manifest` route safety markers without wiring runtime production export, enabling production flags, adding staff-facing production UI, applying migrations, changing operational RLS, touching Google Calendar data, mutating records, or exposing secrets.

The scaffold proves:

- The current QA acknowledgement cannot enable production.
- Future production flags must be route-allowlisted to `request_document_manifest`.
- Future production flags must be timeboxed through `VINEA_EXPORT_RUNTIME_EXPIRES_AT`.
- Future production smoke must require approval id, rollback owner, and monitoring channel labels.
- The document manifest route must keep staff auth, active parish scope, membership scope, export permission DTOs, blocked-field controls, family/unauthenticated denial, safe audit metadata, and audit writing before export query or delivery.
- The document manifest route must not use signed URL, storage, download, original filename, storage path, portal token, or token-hash markers.

The future runtime production gate remains intentionally unimplemented. The suggested future runtime test files above are still required before any approved production-gate implementation is merged.

## Rollout And Rollback Behavior

Future rollout must be reversible by disabling production export flags only. No database rollback, migration rollback, RLS rollback, Google Calendar change, or record mutation should be required for this smoke.

Rollback must happen immediately if any of these occur:

- `/api/health` does not return `checks.schema: true`.
- Flag-off baseline does not return generic unavailable behavior.
- Production gate enables any route other than `request_document_manifest`.
- Same-parish manifest export returns unsafe fields.
- Cross-parish denial returns CSV content.
- Blocked-field denial returns CSV content.
- Family or unauthenticated denial returns CSV content.
- Audit metadata is missing, late, or contains raw IDs/secrets/private content.
- Logs contain raw CSV contents, signed URLs, storage paths, original filenames, document contents, tokens, notes, communications, AI material, or sacramental/canonical details.
- Monitoring owner or rollback owner is unreachable.
- Any parish staff report unexpected export availability.

Rollback evidence must be recorded in `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260630.md`.

## Product-Owner Approval Required Later

Exact future approval language must be provided in a separate prompt before any implementation:

```text
Approve production export gate implementation for request_document_manifest only. Implement the production-specific export runtime gate described in docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_APPROVAL_PACKET_20260630.md, preserving the existing non-production QA gate, preserving production blocking until the new production smoke flags are explicitly set, adding source-level preflight tests, and keeping production flags disabled after implementation. Do not enable production export flags, add production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved safe audit metadata, or expose secrets.
```

Separate future approval is also required to enable the production smoke flags in the approved rollout window.

## Trust-Center Claim Boundary

Safe internal statement:

> Vinea has prepared a production export gate design and approval packet for a future request document manifest production smoke, but the current export runtime gate remains production-blocked and production exports remain off.

Do not claim:

- Production export runtime gate is implemented.
- Production exports are enabled.
- Production smoke has run.
- Staff-facing production export UI exists.
- Bulk document export is approved.
- Signed URL, storage path, original filename, or document file delivery is approved.
- Field-level export permissions are complete.
- Diocesan exports are production-ready.
