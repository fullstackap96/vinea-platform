# Same-Parish Basic Export Pilot Implementation Plan - 2026-06-30

Status: Prepared as a non-runtime implementation plan and acceptance-criteria packet only. Production was not accessed, no migrations were applied, live export routes were not wired, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

Current state: `PLAN PREPARED, LIVE EXPORT ROUTE NOT WIRED`

Completion marker: `EXPORT_ROUTE_BASIC_PILOT_IMPLEMENTATION_PLAN_20260630`

## Purpose

This packet defines the first future export route Vinea should pilot after product-owner approval. It turns the export policy, `lib/exportAccessControl.ts`, the disabled export runtime gate, and the source-level route preflight scaffold into a concrete implementation checklist without enabling any export behavior today.

The goal is to prove the safest useful pattern first:

- Same-parish only.
- Active parish selected by staff.
- Staff membership validated server-side.
- Basic operational fields only.
- No family-facing access.
- No sensitive notes, documents, sacramental/canonical data, token material, AI payloads, or audit-log payloads.
- Safe audit metadata before any query or file delivery.

## Recommended First Pilot

Recommended export preset: `request_list_basic`

Recommended future route candidate: `app/api/exports/requests/basic/route.ts`

Rationale:

- Request lists are core parish operations and useful for staff handoffs, weekly reviews, follow-up cleanup, and pastor/administrator visibility.
- The request-list export can be useful without email addresses, phone numbers, notes, uploaded documents, communications, AI outputs, or sacramental/canonical record details.
- It exercises the multi-parish active-parish model in a visible staff workflow.
- It is less sensitive than a people/households export, sacramental export, document export, or communication-history export.
- It fits the existing export preset and permission model in `lib/exportAccessControl.ts`.

Do not use the first pilot for `people_households_basic`, sacramental/canonical records, document files, document manifests, audit logs, communication history, AI outputs, public intake routing history, support break-glass exports, or diocesan rollups.

## Approved Basic Fields For Pilot

The first pilot should use a server-owned allowlist. The client should not be allowed to submit arbitrary column names.

Allowed pilot fields:

- Request reference.
- Request type.
- Request status.
- Current workflow phase or high-level workflow status.
- Assigned staff display label.
- Follow-up date.
- Created date.
- Updated date.
- Required workflow steps incomplete count.
- Optional workflow steps incomplete count.

Explicitly excluded fields:

- Parishioner email addresses.
- Parishioner phone numbers.
- Full address data.
- Internal notes.
- Communication history.
- Email bodies.
- AI summaries, prompts, drafts, provider payloads, and token material.
- Uploaded document content.
- Document storage paths.
- Signed URLs.
- Family portal tokens or token hashes.
- Public intake token hashes.
- Google OAuth tokens or Google Calendar payloads.
- Audit-log details.
- Sacramental/canonical record details.
- Certificate-generation evidence.
- Raw import payloads.
- Support/debug payloads.

## Future Route Wiring Order

The future implementation must keep this order. It should fail closed before any export query or file delivery if any precondition fails.

1. Evaluate `getExportRuntimeGate` before export query work.
2. Require authenticated staff.
3. Resolve selected active parish context.
4. Validate the active parish is in the staff member's `parish_memberships`.
5. Build `buildExportPermissionEvaluationDto` with preset `request_list_basic`.
6. Use the server-owned basic request-list field allowlist.
7. Deny blocked fields and family-portal surfaces with generic public errors.
8. Prepare safe audit metadata with no raw record payloads, prompts, tokens, signed URLs, or file contents.
9. Write the audit event before query execution or file delivery.
10. Query only same-parish request rows for the selected active parish.
11. Generate a CSV in memory only when row count is under the synchronous limit.
12. Return the file response without creating a signed URL.

The route must continue to satisfy `lib/server/exportRouteRuntimeWiringPreflight.ts` before merge.

## Required Feature Flags

The first runtime pilot may only run in an explicitly approved non-production environment while these exact flags are present:

- `VINEA_EXPORT_RUNTIME=ENABLED`
- `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
- `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`

Production must remain blocked even if those flags are accidentally present.

## Acceptance Criteria

Flag-off baseline:

- When the export runtime gate is off, the route returns a generic disabled response.
- No export query runs.
- No file is delivered.
- No signed URL is created.
- No audit event is written unless a future product decision explicitly approves disabled-attempt auditing.

Same-parish success in non-production:

- An authenticated staff user with `export_same_parish_basic` can export only the selected active parish's basic request list.
- The selected active parish controls the explicit parish filter.
- The response contains only approved basic request-list fields.
- Audit metadata is prepared and written before query execution or file delivery.
- The audit event includes staff identity, active parish id, export preset id, target object type, row count or estimate, destination, export reason when provided, decision, and timestamp.

Cross-parish denial:

- A staff user cannot export a parish outside active membership.
- A selected active parish mismatch fails with a generic error.
- No export query runs for the denied parish.
- No file is delivered.

Family-portal denial:

- Family portal requests cannot access this route.
- Family-facing surfaces cannot receive export files or export metadata.
- Generic blocked errors are used.

Blocked-field denial:

- Any attempt to request token material, secrets, signed URLs, raw AI material, document paths, internal notes, communications, or sacramental/canonical fields is denied.
- The route never echoes blocked field names back to family-facing or unauthenticated users.

Production safety:

- Production remains blocked by the runtime gate.
- No production flag rollout is allowed until a separate production approval packet exists.
- Operational RLS is unchanged.
- No migrations are required for this first pilot plan.

QA acceptance:

- Source-level export route preflight passes.
- Flag-off browser/API regression passes.
- Flag-on non-production same-parish export passes.
- Cross-parish denial passes.
- Family-portal denial passes.
- Blocked-field denial passes.
- Audit metadata inspection passes.
- Rollback by disabling flags passes.

## Manual QA Checklist For Future Pilot

1. Confirm environment is non-production.
2. Confirm `/api/health` returns expected schema health before testing.
3. Confirm staff user is authenticated.
4. Select Parish A.
5. Confirm Parish A request list is visible.
6. Run flag-off export attempt and confirm generic disabled response.
7. Enable non-production export flags.
8. Export Parish A basic request list.
9. Confirm CSV has only approved fields.
10. Confirm no internal notes, communications, documents, AI output, token material, signed URLs, or sacramental/canonical fields appear.
11. Switch to Parish B or use a denied cross-parish fixture.
12. Confirm cross-parish export denial and no file delivery.
13. Attempt from a family portal context and confirm denial.
14. Attempt blocked fields and confirm denial.
15. Confirm audit metadata exists and excludes raw payloads, tokens, signed URLs, prompts, provider payloads, and file contents.
16. Disable export flags.
17. Confirm export returns to disabled behavior.

## Rollback

The first rollback control is feature-flag rollback:

- Remove or disable `VINEA_EXPORT_RUNTIME`.
- Remove or disable `VINEA_EXPORT_RUNTIME_ACK`.
- Remove or disable `VINEA_EXPORT_RUNTIME_ENV`.

If a future route commit causes problems before release, revert only the route wiring commit and any route-specific tests. No database rollback is expected for this pilot because this plan does not require migrations.

## Approval Gates Before Wiring

Do not wire the route until these approvals are recorded:

- Product owner approves `request_list_basic` as the first pilot surface.
- Parish operations owner approves the staff-facing export language and allowed fields.
- Security/data owner approves blocked fields, audit metadata, and generic denial behavior.
- Engineering owner approves active parish and membership-scope implementation details.
- Support owner approves support handling for failed/blocked export attempts.

Canonical/sacramental owner review is not required for the first pilot only if sacramental/canonical fields remain explicitly excluded.

## What Changed Plain English

This plan chooses the safest first export Vinea should eventually test: a simple same-parish request list. It explains exactly what fields can appear, what sensitive information must stay out, what checks must happen before any data is downloaded, and how the feature can be turned off immediately.

## Next Recommended Safe Step

Collect explicit product-owner approval using `docs/EXPORT_ROUTE_BASIC_PILOT_PRODUCT_OWNER_APPROVAL_PACKET_20260630.md` before any non-production route wiring of `request_list_basic`. The approval must confirm the pilot surface, allowed fields, non-production-only flags, QA fixtures, audit expectations, rollback owner, and the exact instruction that live route wiring is still not approved for production.
