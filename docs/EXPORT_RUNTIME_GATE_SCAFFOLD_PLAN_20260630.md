# Export Runtime Gate And Route Preflight Scaffold Plan - 2026-06-30

Status: Prepared as a non-runtime trust-center readiness scaffold only. Production was not accessed, no migrations were applied, runtime export routes were not wired, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

Current export runtime state: `DISABLED BY DEFAULT, NO LIVE EXPORT ROUTES WIRED`

Completion marker: `EXPORT_RUNTIME_GATE_SCAFFOLD_PLAN_20260630`

## Purpose

This plan defines the safety gates required before any future staff-facing export route is wired in Vinea.

The runtime gate and source-level preflight tests are intentionally conservative. They do not query Supabase, generate files, create signed URLs, write audit events, or expose staff-facing export UI.

## Prepared Code Artifacts

- Disabled-by-default runtime export gate: `lib/server/exportRuntimeGate.ts`
- Runtime export gate tests: `lib/server/exportRuntimeGate.test.ts`
- Source-level future export route preflight validator: `lib/server/exportRouteRuntimeWiringPreflight.ts`
- Source-level future export route preflight tests: `lib/server/exportRouteRuntimeWiringPreflight.test.ts`
- Non-runtime export permission DTO contract: `lib/exportAccessControl.ts`
- Non-runtime export permission DTO tests: `lib/exportAccessControl.test.ts`

## Runtime Gate Rules

Future export route code must stay behind all of these non-production QA flags:

- `VINEA_EXPORT_RUNTIME=ENABLED`
- `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
- `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`

The gate must remain disabled by default.

The gate must refuse production environments even if QA flags are present.

Production export enablement requires a separate product-owner approval packet, production-safe smoke fixtures, monitoring owner, rollback owner, and explicit production rollout language.

## Future Route Wiring Order

Any future export route must prove this order before querying rows, creating export jobs, creating signed URLs, or returning files:

1. Check `getExportRuntimeGate`.
2. Authenticate and authorize staff.
3. Resolve selected active parish context.
4. Resolve membership parish ids.
5. Build `buildExportPermissionEvaluationDto`.
6. Block unsafe fields, token material, signed URL material, raw AI prompt/provider payload material, and family-portal surfaces.
7. Prepare safe export audit metadata.
8. Write the approved audit event before file delivery or export job queueing.
9. Query export rows or queue an export job.
10. Deliver the file or job response only after all gates pass.

## Source-Level Preflight Requirements

The preflight validator expects future route source to show these markers before any export query or delivery marker:

- Disabled runtime gate marker.
- Authenticated staff marker.
- Active parish scope marker.
- Membership scope marker.
- `buildExportPermissionEvaluationDto` marker.
- Blocked-field controls marker.
- Family portal exclusion marker.
- Audit metadata marker.
- Generic blocked error marker.

Each gate must satisfy one complete marker set before any export query or delivery marker. A single partial marker is not enough to pass a source-level export preflight gate.

The preflight validator intentionally uses source markers and now accepts the current helper-backed route shape: route files may delegate exact flag and acknowledgement validation to `getExportRuntimeGate(process.env)` as long as they check `gate.enabled`, return `export_unavailable` before any query/delivery, parse requested fields, deny blocked fields/family surfaces, prepare safe audit metadata, and write audit metadata before export rows are queried or delivered.

## Generic Denial Rule

Future export routes should not reveal whether a parish, record, document, token, audit event, or field exists when denying an export.

Use generic staff-safe language such as:

> Export request cannot be completed.

## Trust-Center Claim Boundary

Safe internal statement:

> Vinea has prepared a disabled-by-default export runtime gate and source-level preflight tests for future export route wiring.

Do not claim:

- Runtime export routes exist.
- Runtime export controls are complete.
- Staff-facing export UI is live.
- Production exports are enabled.
- Field-level permissions are complete.
- Diocesan exports are production-ready.
- Bulk document export is approved.
