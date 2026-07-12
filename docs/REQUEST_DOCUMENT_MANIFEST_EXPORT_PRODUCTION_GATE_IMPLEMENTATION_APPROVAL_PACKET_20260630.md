# Request Document Manifest Export Production Gate Implementation Approval Packet - 2026-06-30

Status: Prepared as a product-owner approval packet for a future implementation step only. Production was not accessed, runtime production export was not wired, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this packet.

Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT GATE IMPLEMENTATION NOT APPROVED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_IMPLEMENTATION_APPROVAL_PACKET_20260630`

## Purpose

This packet defines the exact product-owner approval needed before engineering may implement production-gate code for the `request_document_manifest` export route.

It does not approve enabling production flags, adding staff-facing production export UI, running a production smoke, accessing production, applying migrations, changing operational RLS, touching Google Calendar data, mutating records beyond future approved safe audit metadata, or exposing secrets.

The implementation goal would be narrow: add production-aware gate code behind the source-level preflight scaffold while preserving the current flag-off production baseline and preserving the post-implementation `NO-GO` boundary before any production smoke.

## Required Prior Evidence

Do not approve implementation unless all of these remain current and passing:

- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_GATE_APPROVAL_PACKET_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_EVIDENCE_TEMPLATE_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630.md`
- `lib/server/exportProductionGatePreflight.ts`
- `lib/server/exportProductionGatePreflight.test.ts`
- `lib/server/exportRuntimeGate.ts`
- `lib/server/exportRuntimeGate.test.ts`
- `lib/server/exportRouteRuntimeWiringPreflight.ts`
- `lib/server/exportRouteRuntimeWiringPreflight.test.ts`
- `app/api/exports/requests/documents/manifest/route.ts`
- `lib/server/requestDocumentManifestExportRoute.test.ts`

## Exact Future Implementation Scope

If approved later, the implementation may touch only these intended files unless engineering stops and asks for separate approval:

- `lib/server/exportRuntimeGate.ts`
- `lib/server/exportRuntimeGate.test.ts`
- `lib/server/exportProductionGatePreflight.ts`
- `lib/server/exportProductionGatePreflight.test.ts`
- `app/api/exports/requests/documents/manifest/route.ts`
- `lib/server/requestDocumentManifestExportRoute.test.ts`
- `lib/server/requestDocumentManifestExportProductionGateRoutePreflight.test.ts`
- `docs/VINEA_BUILD_STATUS.md`
- Related export/trust validation tests that reference the new implementation state.

Expected implementation shape:

1. Preserve the existing non-production QA gate exactly for approved non-production smoke work.
2. Preserve production blocking by default.
3. Add a production-specific gate path that can evaluate production smoke flags only when all required production-specific values are present.
4. Require `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_PRODUCTION_SMOKE` for production smoke.
5. Require `VINEA_EXPORT_RUNTIME_ENV=PRODUCTION` for production smoke.
6. Require `VINEA_EXPORT_RUNTIME_ROUTE_ALLOWLIST` to include `request_document_manifest`.
7. Require `VINEA_EXPORT_RUNTIME_APPROVAL_ID` to match the approved production smoke approval id.
8. Require `VINEA_EXPORT_RUNTIME_EXPIRES_AT` to parse as a future UTC timestamp inside the approved rollout window.
9. Require `VINEA_EXPORT_RUNTIME_ROLLBACK_OWNER` as a non-secret owner label.
10. Require `VINEA_EXPORT_RUNTIME_MONITORING_CHANNEL` as a non-secret monitoring channel label.
11. Keep route-level staff authentication, active parish scope, membership scope, request ownership checks, export permission DTO evaluation, blocked-field controls, family/unauthenticated denial, safe audit metadata, and audit writing before any query or delivery.
12. Keep the manifest route free of signed URL, storage API, download, storage path, original filename, portal token, token hash, note, communication, AI, and sacramental/canonical detail exposure.

## Expected Tests

A future implementation must add or update tests proving:

- Default production behavior remains disabled with generic unavailable behavior.
- Existing non-production QA flags still enable only approved non-production environments.
- Existing non-production QA flags still fail closed in production.
- Production smoke flags do not enable non-production accidentally.
- Production smoke flags fail closed when the route allowlist omits `request_document_manifest`.
- Production smoke flags fail closed when the approval id is missing or mismatched.
- Production smoke flags fail closed when `VINEA_EXPORT_RUNTIME_EXPIRES_AT` is missing, invalid, or expired.
- Production smoke flags fail closed when rollback owner or monitoring channel labels are missing.
- Production smoke flags fail closed for any route other than `request_document_manifest`.
- `validateFutureExportProductionGateSource` passes on the implemented gate source.
- `validateRequestDocumentManifestProductionSafetySource` passes on the implemented manifest route source.
- Request document manifest export route tests still prove audit metadata is written before query or delivery.
- Request document manifest export route tests still prove blocked fields are denied before audit or query.
- Request document manifest export route tests still prove no signed URL, storage, file download, original filename, storage path, portal token, token hash, notes, communications, AI material, or sacramental/canonical details are exported.

Suggested future test files:

- `lib/server/exportRuntimeGate.test.ts`
- `lib/server/exportProductionGatePreflight.test.ts`
- `lib/server/requestDocumentManifestExportProductionGateRoutePreflight.test.ts`
- `lib/server/requestDocumentManifestExportRoute.test.ts`

## Required Flag-Off Production Baseline

After implementation and before any production smoke approval, the product must still behave as:

- `VINEA_EXPORT_RUNTIME` unset: export route unavailable.
- `VINEA_EXPORT_RUNTIME=ENABLED` with no production acknowledgement: export route unavailable.
- `VINEA_EXPORT_RUNTIME=ENABLED` with `APPROVED_EXPORT_RUNTIME_QA` in production: export route unavailable.
- `VINEA_EXPORT_RUNTIME=ENABLED` with production acknowledgement but no allowlist, approval id, expiry, rollback owner, or monitoring channel: export route unavailable.
- No staff-facing production UI is visible or approved.
- No production smoke has run.

The future implementation commit must record this baseline in `docs/VINEA_BUILD_STATUS.md`.

## Monitoring Requirements For Future Smoke

This implementation approval packet does not approve monitoring execution. It defines what must exist before a later production smoke approval:

- Named monitoring owner label.
- Named monitoring channel label.
- `/api/health` baseline and post-check plan.
- Audit-log inspection plan for `export.request_document_manifest.downloaded`.
- Error-log inspection plan for denied export attempts.
- Confirmation that raw CSV, signed URLs, storage paths, original filenames, document contents, tokens, notes, communications, AI material, and sacramental/canonical details are not logged.
- Clear observation window from flag-on through rollback verification.

## Rollback Behavior

Future production-gate implementation must be reversible by disabling export runtime flags only.

Rollback must not require:

- Database rollback.
- Migration rollback.
- Operational RLS rollback.
- Google Calendar changes.
- Record mutation cleanup beyond approved audit metadata evidence.
- Staff-facing production UI removal.

The future implementation must preserve generic disabled behavior when flags are removed.

## Post-Implementation NO-GO Boundary

Even if product-owner approval is later granted to implement the production gate code, production export remains `NO-GO` after that implementation until a separate future prompt explicitly approves the production smoke rollout window.

The post-implementation state must be:

`PRODUCTION GATE CODE IMPLEMENTED; PRODUCTION FLAGS DISABLED; PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT SMOKE NOT APPROVED`

Do not claim:

- Production export is enabled.
- Production smoke has run.
- Staff-facing production export UI exists.
- Bulk document export is approved.
- Signed URL, storage path, original filename, or document file delivery is approved.
- Field-level export permissions are complete.
- Diocesan exports are production-ready.

## Exact Future Approval Language

The product owner must provide this exact approval before implementation work starts:

```text
Approve implementation of the request_document_manifest production export gate code only. Implement the production-specific gate behind the existing source-level preflight scaffold, preserving the non-production QA gate, preserving flag-off production blocking, requiring route allowlist, approval id, expiration, rollback owner, and monitoring channel labels, and keeping production flags disabled after implementation. Do not enable production flags, add staff-facing production UI, access production, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond future approved safe audit metadata, or expose secrets. After implementation, production export remains NO-GO until I separately approve the production smoke rollout window.
```

Separate approval is still required later to enable the production smoke flags for an approved rollout window.

## Trust-Center Claim Boundary

Safe internal statement:

> Vinea has prepared a product-owner approval packet for future implementation of the request document manifest production export gate, but the gate code is not implemented, production flags are disabled, and production exports remain off.
