# Export Audit Reviewer Non-Production Prototype Approval Packet - 2026-07-01

Status: Product-owner approval packet prepared only. Production was not accessed, production export flags were not enabled, staff-facing production export UI was not added, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this packet.

This packet requests approval for a future non-production-only export audit reviewer prototype that uses the existing server-only read-model builder. It does not approve production monitoring, production export flags, production exports, production data access, migrations, operational RLS changes, Google Calendar changes, record mutation, storage access, signed URLs, raw export access, or secret exposure.

Current decision state: `EXPORT AUDIT REVIEWER PROTOTYPE APPROVAL PACKET PREPARED; PROTOTYPE NOT IMPLEMENTED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEWER_PROTOTYPE_APPROVAL_PACKET_20260701`

## Product Decision Needed

Choose exactly one future prototype path before coding:

1. Recommended: API-only non-production prototype.
2. Alternate: Dashboard-only non-production prototype backed by local fixture data.

Do not implement both in one phase. The safer next phase is the API-only prototype because it can validate staff authentication, active parish scope, membership scope, safe audit metadata mapping, saved filters, and forbidden-data boundaries before a staff-facing screen exists.

## Recommended Path: API-Only Prototype

Approve a read-only API route that returns export audit reviewer rows for the selected active parish in an approved non-production environment only.

### Exact Files

Future API-only implementation may add or update only:

- `app/api/export-audit-reviewer/route.ts`
- `lib/server/exportAuditReviewerRoute.test.ts`
- `lib/server/exportAuditReviewerReadModel.ts` only if a small builder fix is required
- `lib/server/exportAuditReviewerReadModel.test.ts` only if the builder fix needs coverage
- `docs/VINEA_BUILD_STATUS.md`
- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`

Do not add dashboard UI, navigation, settings links, production monitoring, migrations, storage helpers, Google Calendar code, export route changes, or production flags in this API-only phase.

### Required API Behavior

The API prototype must:

- require authenticated staff,
- require non-production reviewer prototype flags,
- reject production environments,
- use the selected active parish cookie only after membership validation,
- preserve explicit primary-parish fallback only when no active parish cookie exists and only if the existing active parish resolver allows it,
- query only `audit_events`,
- filter audit events to the active parish,
- filter to approved export event actions only,
- pass rows through `buildExportAuditReviewerReadModel`,
- return only read-model rows and saved-filter metadata,
- return generic public errors for denied access,
- expose no raw audit metadata object,
- expose no raw export payload,
- write no audit event,
- mutate no record.

## Alternate Path: Dashboard-Only Prototype

If product-owner approval chooses a dashboard prototype instead of API-first, it must be a local non-production prototype using mock/sanitized rows only.

### Exact Files

Future dashboard-only implementation may add or update only:

- `app/dashboard/admin/export-audit-reviewer/page.tsx`
- `app/dashboard/admin/export-audit-reviewer/ExportAuditReviewerPrototype.tsx`
- `lib/server/exportAuditReviewerReadModel.ts` only if a small builder fix is required
- `lib/server/exportAuditReviewerReadModel.test.ts` only if the builder fix needs coverage
- `docs/VINEA_BUILD_STATUS.md`
- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`

Do not query live audit events from the dashboard-only prototype without separate API approval.

## Non-Production Gate Requirements

Any prototype must be disabled unless all future prototype flags are present:

- `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE=ENABLED`
- `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK=APPROVED_EXPORT_AUDIT_REVIEWER_QA`
- `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV=NON_PRODUCTION`

The prototype must remain blocked when:

- `NODE_ENV=production`,
- `VERCEL_ENV=production`,
- any approval flag is missing,
- any approval flag has the wrong value.

These flags are for reviewer prototype QA only. They do not enable production exports.

## Active-Parish And Membership Scope Rules

The prototype must:

- use the same active parish context resolver pattern as existing selected-parish read paths,
- reject forged active parish cookies,
- reject active parish cookies that resolve through legacy fallback instead of membership,
- constrain audit-event reads to the selected active parish,
- never include audit events from unauthorized parishes,
- never broaden to all parish memberships unless a separate diocesan/cluster approval exists,
- show the selected parish label in any future dashboard prototype,
- include a saved-filter summary that is computed only from scoped rows.

## Read-Only Behavior

The prototype must not:

- insert, update, delete, or upsert any row,
- write audit events,
- write reviewer dispositions,
- call export routes,
- deliver CSV or document manifests,
- read export files,
- open Supabase Storage,
- generate signed URLs,
- call Google Calendar,
- call OpenAI,
- mutate cookies,
- enable production export flags,
- apply migrations.

## Saved-Filter UX Expectations

The prototype should make these filters visible or API-addressable:

- `exports_downloaded_recent`
- `exports_denied_recent`
- `exports_blocked_field_attempts`
- `exports_cross_parish_or_forged_scope`
- `exports_family_or_unauthenticated`
- `exports_after_rollback`
- `exports_metadata_incomplete`
- `document_manifest_safety_review`
- `request_list_basic_safety_review`
- `repeated_denials_by_actor`

For an API prototype, the response should include:

- available filter ids,
- selected filter id,
- row count,
- severity counts,
- rows returned after filtering.

For a dashboard prototype, the UI should be restrained and reviewer-focused:

- selected parish label,
- filter tabs or segmented controls,
- compact row table,
- severity badges,
- empty state,
- generic error state,
- no export/download button,
- no raw metadata drawer.

## Forbidden Data Checks

The prototype must not expose:

- raw CSV rows,
- raw export files,
- raw audit metadata blobs,
- raw requested field names for denied events,
- raw blocked field names for denied events,
- document contents,
- storage paths,
- signed URLs,
- original filenames,
- portal token values,
- portal token hashes,
- OAuth tokens,
- email provider tokens,
- database URLs,
- service-role keys,
- API keys,
- notes,
- communications,
- AI prompts,
- AI outputs,
- sacramental/canonical detail,
- family-facing private data beyond generic denial classification.

Tests must serialize the API response or rendered dashboard fixture output and assert these markers are absent.

## Required Tests For API-Only Prototype

If API-only is approved, tests must prove:

- flag-off returns unavailable before auth/query,
- production environment is blocked even with flags,
- unauthenticated requests are denied,
- staff auth is required,
- selected active parish cookie is membership-validated,
- forged active parish cookie is denied,
- audit-event query is constrained to selected parish,
- only export audit actions are selected,
- rows pass through `buildExportAuditReviewerReadModel`,
- saved-filter selection works,
- forbidden data markers are absent,
- no write-like calls are made,
- rollback is achieved by disabling flags.

## Required Tests For Dashboard-Only Prototype

If dashboard-only is approved, tests must prove:

- prototype is non-production gated,
- selected parish label is displayed,
- saved-filter controls are present,
- severity/status labels are present,
- empty state is safe,
- error state is generic,
- raw metadata is not rendered,
- forbidden data markers are absent,
- no export/download controls exist,
- no route/API or database dependency is introduced.

## Rollback And No-Op Behavior

Rollback must be simple:

- disable prototype flags,
- leave export routes unchanged,
- leave audit events unchanged,
- leave production flags off,
- leave production exports disabled,
- remove the prototype route/page if needed.

No database cleanup, migration rollback, storage cleanup, Google cleanup, or audit-event cleanup should be required.

## Post-Implementation NO-GO Boundary

After any future prototype implementation:

- production exports remain `NO-GO`,
- production export monitoring remains `NO-GO`,
- production runtime export flags remain `NO-GO`,
- staff-facing production export UI remains `NO-GO`,
- broader export dashboard rollout remains `NO-GO`,
- production RLS remains separately gated,
- customer-facing trust-center claims remain limited to documented evidence.

Acceptable post-implementation state:

`NON-PRODUCTION EXPORT AUDIT REVIEWER PROTOTYPE IMPLEMENTED AND TESTED; PRODUCTION MONITORING AND PRODUCTION EXPORTS REMAIN NO-GO`

## Exact Approval Language

For API-only prototype:

`I approve non-production implementation of the export audit reviewer API-only prototype. Add only app/api/export-audit-reviewer/route.ts and focused tests, using the existing export audit reviewer read-model builder and safe audit_events metadata only. Require staff authentication, non-production prototype flags, active parish membership scope, read-only behavior, saved filters, forbidden-data checks, and rollback by disabling flags. Do not add dashboard UI, production monitoring, production export flags, migrations, operational RLS changes, Google Calendar changes, record mutations, storage access, signed URLs, raw exports, or secrets. Keep production exports NO-GO after implementation.`

For dashboard-only prototype:

`I approve non-production implementation of the export audit reviewer dashboard-only prototype using sanitized/local read-model rows only. Add only app/dashboard/admin/export-audit-reviewer/page.tsx, app/dashboard/admin/export-audit-reviewer/ExportAuditReviewerPrototype.tsx, and focused tests. Do not add API routes, live audit-event queries, production monitoring, production export flags, migrations, operational RLS changes, Google Calendar changes, record mutations, storage access, signed URLs, raw exports, or secrets. Keep production exports NO-GO after implementation.`

## What Changed Plain English

This packet defines the next possible reviewer prototype and keeps it boxed in. It says Vinea may later build either a safe test-only API or a safe test-only page, but not both at once, and not in production.

This matters because export governance is easier to sell and trust when reviewers can eventually see safe audit summaries. The packet keeps that future review tool from accidentally becoming an export tool or a production monitoring claim too early.

## Final Decision

- Packet outcome: `approval packet prepared`
- Prototype implemented now: `no`
- API route approved now: `no`
- Dashboard UI approved now: `no`
- Production monitoring approved: `no`
- Production export flags approved: `no`
- Production exports approved: `no`
- Migrations applied: `no`
- Operational RLS changed: `no`
- Records mutated: `no`
- Secrets exposed: `no`
