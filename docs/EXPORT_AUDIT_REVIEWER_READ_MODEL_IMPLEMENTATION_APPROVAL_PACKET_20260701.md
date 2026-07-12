# Export Audit Reviewer Read-Model Builder Implementation Approval Packet - 2026-07-01

Status: Product-owner approval packet prepared only. Production was not accessed, production export flags were not enabled, staff-facing production export UI was not added, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this packet.

This packet requests approval for one narrow future implementation phase: a non-production-only, server-only export audit reviewer read-model builder. It does not approve a dashboard page, live API route, production monitoring workflow, production export runtime flag, production smoke test, customer-facing export UI, or any production data access.

Current decision state: `EXPORT AUDIT REVIEWER READ MODEL BUILDER APPROVAL PACKET PREPARED; IMPLEMENTATION NOT STARTED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEWER_READ_MODEL_IMPLEMENTATION_APPROVAL_PACKET_20260701`

## Approval Request

Approve implementation of a server-only read-model builder that converts already-written safe export audit metadata into reviewer rows for non-production validation only.

The approved implementation must remain:

- read-only,
- server-only,
- non-production only,
- audit-metadata only,
- active-parish aware,
- membership scoped,
- forbidden-data checked,
- disconnected from staff-facing UI,
- disconnected from production monitoring,
- blocked from production export enablement.

## Exact Implementation Files

Future implementation may add or update only these planned files unless a follow-up packet expands scope:

- `lib/server/exportAuditReviewerReadModel.ts`
- `lib/server/exportAuditReviewerReadModel.test.ts`
- `lib/server/exportAuditReviewerReadModelFixtures.test.ts` only if fixture separation is needed
- `docs/VINEA_BUILD_STATUS.md`
- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`

Do not add these in this phase without separate approval:

- `app/api/export-audit-reviewer/*`
- `app/dashboard/*export*`
- any staff-facing dashboard UI,
- any production monitoring route,
- any migration under `supabase/migrations`,
- any storage or file access helper,
- any Google Calendar code,
- any export route mutation.

## Builder Inputs

The builder may accept only in-memory or Supabase-returned safe audit-event records shaped like:

- audit event id label,
- created timestamp,
- event action,
- actor/staff label,
- active parish label,
- route id,
- preset id,
- target object type,
- generic target object label,
- decision,
- HTTP status,
- generic denied reason code,
- runtime gate state,
- safe counts,
- safe booleans,
- safe scope status values.

The builder must not accept raw CSV, document files, storage objects, signed URLs, raw request payloads, raw denied field names, family portal token values, credentials, or connection strings.

## Builder Outputs

The builder should produce rows that match `docs/EXPORT_AUDIT_REVIEWER_READ_MODEL_PLAN_20260701.md`.

Required output groups:

- event identity columns,
- actor and parish scope columns,
- export shape columns,
- safety review columns,
- reviewer workflow columns,
- saved-filter membership flags,
- suspicious-pattern rule outcomes.

Every row must include:

- `safe_metadata_only: true`,
- `metadata_completeness_status`,
- `review_status`,
- `severity`,
- `rollback_required`,
- `incident_response_required`.

## Read-Only Safety Rules

The implementation must:

- perform no inserts, updates, deletes, storage writes, or export deliveries,
- call no export route,
- call no Google Calendar route,
- generate no signed URL,
- open no Supabase Storage object,
- read no document file content,
- read no raw CSV,
- write no audit event,
- write no reviewer disposition,
- make no production network call,
- enable no runtime flag.

The builder may classify mock or safe non-production audit metadata. A future route/page would require a separate approval packet.

## Saved-Filter Test Expectations

Tests must prove the builder can classify rows for these saved filters:

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

Tests must include both downloaded and denied event examples for:

- `request_list_basic`,
- `request_document_manifest`.

## Suspicious-Pattern Test Expectations

Tests must prove the builder flags or classifies:

- downloaded event outside an approved window,
- downloaded event after rollback,
- downloaded event while flags are expected off,
- cross-parish delivery,
- family or unauthenticated delivery,
- document-manifest sensitive-material marker,
- repeated denied attempts,
- blocked-field denial,
- active-parish scope denial,
- metadata-incomplete event,
- unusually high row-count bucket,
- route/preset mismatch.

## Forbidden Data Checks

Tests must prove the output rows and serialized fixture evidence do not include:

- raw CSV rows,
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

The implementation should use explicit output allowlists rather than copying metadata objects wholesale.

## Production And Environment Boundary

The builder may be tested with local fixtures and sanitized non-production audit metadata only.

It must not:

- read production,
- query production,
- enable production export runtime flags,
- depend on production-only environment variables,
- approve production monitoring,
- imply production export readiness.

If the builder later needs a live route, that route must be separately approved and non-production gated.

## Rollback And No-Op Behavior

Rollback for this implementation is code-level only:

- remove or stop calling the read-model builder,
- leave export routes unchanged,
- leave audit events unchanged,
- leave production flags off,
- leave staff-facing UI absent.

Because the builder is read-only and non-runtime, rollback must not require database cleanup or migration rollback.

Tests must verify no writer-like function is required for the builder to operate.

## Post-Implementation NO-GO Boundary

After the read-model builder is implemented:

- production exports remain `NO-GO`,
- staff-facing export UI remains `NO-GO`,
- production export monitoring remains `NO-GO`,
- production runtime export flags remain `NO-GO`,
- dashboard reviewer UI remains `NO-GO`,
- route/API exposure remains `NO-GO`.

The only acceptable post-implementation state is:

`SERVER-ONLY READ-MODEL BUILDER IMPLEMENTED AND TESTED; NO RUNTIME REVIEWER SURFACE; PRODUCTION EXPORTS REMAIN NO-GO`

## Required Checks After Future Implementation

Future implementation must run:

- focused read-model tests,
- trust-center linkage tests,
- forbidden-data serialization tests,
- `npm.cmd run lint`,
- `npm.cmd run build`.

If the implementation touches shared export access-control helpers, run the existing export route tests as well.

## Exact Approval Language

Use this language only when ready to approve the next coding phase:

`I approve non-production implementation of the server-only export audit reviewer read-model builder. Implement only lib/server/exportAuditReviewerReadModel.ts and focused tests, using safe audit metadata only. Do not add dashboard UI, API routes, production monitoring, production export flags, migrations, operational RLS changes, Google Calendar changes, record mutations, storage access, signed URLs, raw exports, or secrets. Keep production exports NO-GO after implementation.`

## What Changed Plain English

This packet tells Codex exactly what it may build next if approved: a behind-the-scenes tool that turns safe export audit log metadata into reviewer-friendly rows. It does not let Vinea show that data in the app yet, turn on exports in production, or monitor production.

This matters because it keeps export governance moving forward in small, reviewable steps. We can build the safe data shape before building any screen or production workflow.

## Final Decision

- Packet outcome: `approval packet prepared`
- Implementation approved now: `no`
- Runtime behavior changed: `no`
- Production exports approved: `no`
- Dashboard UI approved: `no`
- API route approved: `no`
- Production monitoring approved: `no`
- Migrations applied: `no`
- Operational RLS changed: `no`
- Records mutated: `no`
- Secrets exposed: `no`
