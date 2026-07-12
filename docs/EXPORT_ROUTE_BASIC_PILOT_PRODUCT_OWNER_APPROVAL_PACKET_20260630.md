# Same-Parish Basic Export Pilot Product-Owner Approval Packet - 2026-06-30

Status: Prepared as a product-owner approval packet only. Production was not accessed, no migrations were applied, live export routes were not wired, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

Current decision state: `APPROVAL PACKET PREPARED, NON-PRODUCTION ROUTE WIRING NOT APPROVED BY THIS DOCUMENT`

Completion marker: `EXPORT_ROUTE_BASIC_PILOT_PRODUCT_OWNER_APPROVAL_PACKET_20260630`

## Purpose

This packet prepares the exact product-owner decision needed before engineering wires the first same-parish basic request-list export route in a non-production environment.

It depends on:

- Export access-control DTOs: `lib/exportAccessControl.ts`
- Disabled export runtime gate: `lib/server/exportRuntimeGate.ts`
- Future route source preflight: `lib/server/exportRouteRuntimeWiringPreflight.ts`
- Basic pilot implementation plan: `docs/EXPORT_ROUTE_BASIC_PILOT_IMPLEMENTATION_PLAN_20260630.md`

This packet does not authorize production export behavior, staff-facing export UI, sensitive exports, document exports, diocesan exports, operational RLS changes, migrations, or Google Calendar changes.

## Decision Requested

Product owner is being asked to approve only this future action:

> Wire the first same-parish basic request-list export pilot in non-production only, behind the disabled export runtime gate, using the `request_list_basic` preset and the route candidate `app/api/exports/requests/basic/route.ts`.

This approval would allow engineering to implement the route code and tests in a later phase, but only with the runtime gate disabled by default and production still blocked.

## Explicit Non-Approval Boundary

This packet does not approve:

- Production export rollout.
- Production feature flags.
- Customer-facing export claims.
- Staff-facing export UI in production.
- Sensitive request-note exports.
- People and household exports.
- Sacramental/canonical exports.
- Communication-history exports.
- Document manifest exports.
- Bulk document file exports.
- Audit/security exports.
- Public intake routing exports.
- AI output exports.
- Support break-glass exports.
- Diocesan or multi-parish rollup exports.
- Any operational RLS change.
- Any database migration.
- Any Google Calendar behavior.

## Approved Pilot Surface

Pilot preset: `request_list_basic`

Future route candidate: `app/api/exports/requests/basic/route.ts`

Future route mode: Non-production QA only.

Primary user value:

- Help parish staff review open requests.
- Support weekly follow-up cleanup.
- Help pastors and administrators see request status without needing sensitive notes or documents.
- Provide a safe first proof point for export governance.

## Allowed Fields

The future route must use a server-owned allowlist. The client must not be allowed to submit arbitrary column names.

Allowed fields:

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

## Explicitly Blocked Fields

The first pilot must not include:

- Parishioner email addresses.
- Parishioner phone numbers.
- Full address data.
- Internal notes.
- Communication history.
- Email bodies.
- AI summaries, prompts, drafts, provider payloads, or token material.
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

## Required Future Implementation Gates

The future route wiring must prove these gates before any export query or file delivery:

1. `getExportRuntimeGate` is evaluated.
2. Production remains blocked.
3. Authenticated staff is required.
4. Selected active parish context is resolved server-side.
5. Active parish membership is validated using parish membership scope.
6. `buildExportPermissionEvaluationDto` evaluates preset `request_list_basic`.
7. The server-owned field allowlist is used.
8. Blocked field requests are denied.
9. Family portal surfaces are denied.
10. Safe audit metadata is prepared before query or delivery.
11. Audit event writing is approved before the route can deliver files.
12. Same-parish request rows are queried only after all gates pass.
13. File delivery happens only after source preflight passes.
14. Generic blocked errors are used for denied attempts.

The source-level export preflight must require complete marker sets for each gate. A route must not pass the preflight by including only one partial marker from a runtime gate, scope gate, blocked-field gate, family-portal gate, audit-metadata gate, or generic-denial gate.

## Required Non-Production Flags

The future route may only run when all exact flags are present in an explicitly approved non-production environment:

- `VINEA_EXPORT_RUNTIME=ENABLED`
- `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
- `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`

Production must remain blocked even if these flags are accidentally present.

## Required QA Fixtures Before Wiring

Before route wiring begins, engineering must identify safe non-production fixture labels for:

- QA staff account with same-parish export permission.
- Active Parish A.
- Optional Parish B or documented cross-parish denial substitute.
- Same-parish request list fixture.
- Cross-parish denied request or parish-scope fixture.
- Family portal denial fixture or documented route-level substitute.
- Blocked-field attempt fixture.
- Audit-log inspection method.
- Rollback verification method.

Do not record passwords, database URLs, service-role keys, access tokens, refresh tokens, signed URLs, family portal tokens, or raw fixture secrets in this packet.

## Required Acceptance Evidence After Future Wiring

The future implementation will not be considered complete until evidence proves:

- Flag-off baseline returns generic disabled behavior.
- No export query runs while the flag is off.
- Same-parish non-production export succeeds with only approved fields.
- Cross-parish export attempt is denied without file delivery.
- Family portal attempt is denied without file delivery.
- Blocked-field attempt is denied.
- Audit metadata is written before query execution or file delivery.
- Audit metadata excludes raw record payloads, token material, signed URLs, prompts, provider payloads, file contents, and secrets.
- Source-level export route preflight passes.
- Rollback by disabling flags returns the route to disabled behavior.
- No production flags are enabled.

## Required Owners

Product owner:

- Approves the pilot surface, allowed fields, and non-production-only scope.

Security/data owner:

- Approves blocked fields, generic denial behavior, and audit metadata.

Engineering owner:

- Approves active parish scope, membership scope, preflight compliance, and rollback plan.

Parish operations owner:

- Approves staff-facing language and practical usefulness.

Support owner:

- Approves how blocked or failed export attempts will be handled during QA.

Canonical/sacramental owner:

- Not required for this first pilot only if sacramental/canonical fields remain explicitly excluded.

## Exact Future Approval Language

The product owner should use this exact language in a future prompt if they want engineering to wire the non-production pilot:

```text
Approve non-production route wiring for the first same-parish basic request-list export pilot. Wire app/api/exports/requests/basic/route.ts behind the disabled export runtime gate using request_list_basic, preserve production blocking, require authenticated staff, selected active parish scope, parish membership scope, export permission DTO evaluation, blocked-field controls, family-portal denial, safe audit metadata before query or delivery, source-level route preflight compliance, and rollback by disabling flags. Do not enable production flags, do not add staff-facing production UI, do not apply migrations, do not change operational RLS, do not touch Google Calendar data, do not mutate records beyond approved audit metadata, and do not expose secrets.
```

## Go / No-Go Checklist

Current recommendation: `NO-GO FOR ROUTE WIRING UNTIL PRODUCT OWNER EXPLICITLY APPROVES THE FUTURE PROMPT`

Go only when:

- Product owner approves the exact future prompt.
- Required non-production QA fixtures are identified.
- Audit-write behavior is approved for the pilot.
- Rollback owner is named.
- Monitoring or evidence owner is named.
- Engineering confirms no production flags will be enabled.

No-go if:

- The target is production.
- The requested export includes people, household, sacramental/canonical, document, communication, AI, audit-log, token, signed URL, or Google Calendar fields.
- Product owner approval language is incomplete.
- Safe QA fixtures are missing.
- Audit metadata expectations are not approved.
- Rollback owner is missing.

## What Changed Plain English

This packet gives Vinea a safe approval form for the first future export test. It says exactly what can be built later, what must stay blocked, what evidence is needed, and what words the product owner should use before engineering touches the live route code.

## Next Recommended Safe Step

After product-owner approval, wire the non-production route behind the disabled export runtime gate and immediately prove flag-off behavior, same-parish scope, cross-parish denial, family portal denial, blocked-field denial, audit metadata safety, source preflight compliance, and flag rollback.
