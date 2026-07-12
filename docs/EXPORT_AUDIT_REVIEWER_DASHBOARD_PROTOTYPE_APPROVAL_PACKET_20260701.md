# Export Audit Reviewer Dashboard Prototype Approval Packet - 2026-07-01

Status: Product-owner approval packet prepared only. Production was not accessed, production export flags were not enabled, dashboard UI was not added, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, and no secrets were exposed while preparing this packet.

Current decision state: `EXPORT AUDIT REVIEWER DASHBOARD PROTOTYPE APPROVAL PACKET PREPARED; DASHBOARD NOT IMPLEMENTED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_APPROVAL_PACKET_20260701`

## Purpose

This packet requests product-owner approval for the next safe non-production phase: a staff-facing export audit reviewer dashboard prototype that displays only safe export audit reviewer read-model data already available through the existing API/read-model path.

The dashboard prototype is intended to help staff or internal reviewers inspect downloaded and denied export activity by selected active parish, without exposing raw exports, document files, storage paths, signed URLs, original filenames, tokens, notes, communications, AI material, or sacramental/canonical details.

This packet does not approve production export monitoring, production export flags, production exports, production dashboard UI, migrations, operational RLS changes, Google Calendar changes, record mutation, storage access, signed URL creation, raw export access, or secret exposure.

## Preconditions Already Completed

- Export audit reviewer read-model plan prepared.
- Server-only export audit reviewer read-model builder implemented.
- API-only non-production export audit reviewer prototype wired.
- API route-level QA passed.
- Live non-production HTTP smoke passed.
- The API remained disabled by default.
- The API remained production-blocked.
- Authenticated staff access used selected active parish membership scope.
- Unauthenticated access was denied.
- Forged active parish access was denied.
- Saved filters returned safe JSON summaries only.
- No new export delivery audit events were created by the reviewer API.
- Rollback by disabling flags was verified.

## Recommended Approval

Approve a non-production staff-facing dashboard prototype that reads from the existing `/api/export-audit-reviewer` endpoint and displays the existing safe read-model rows.

The dashboard prototype should not query Supabase directly. It should not call export routes. It should not add new data delivery paths. It should not add production monitoring. It should not expose raw audit metadata.

## Exact Files Allowed

Future implementation may add or update only:

- `app/dashboard/admin/export-audit-reviewer/page.tsx`
- `app/dashboard/admin/export-audit-reviewer/ExportAuditReviewerDashboardPrototype.tsx`
- `lib/server/exportAuditReviewerDashboardPrototype.test.ts`
- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PROTOTYPE_QA_EVIDENCE_20260701.md`
- `lib/server/exportAuditReviewerDashboardPrototypeQaEvidence.test.ts`
- `docs/VINEA_BUILD_STATUS.md`
- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- `lib/server/trustCenterReadinessPacket.test.ts`

Do not update navigation, production settings pages, export routes, storage helpers, Google Calendar code, OpenAI code, operational RLS, Supabase migrations, or production export gate code in this dashboard prototype phase.

If the implementation discovers the existing API/read-model response is missing a display-safe field, stop and prepare a separate approval packet instead of expanding scope inside the dashboard phase.

## Required Runtime Gate

The dashboard prototype must be disabled unless all existing non-production reviewer prototype flags are present:

- `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE=ENABLED`
- `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK=APPROVED_EXPORT_AUDIT_REVIEWER_QA`
- `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV=NON_PRODUCTION`

The dashboard prototype must remain blocked when:

- `NODE_ENV=production`
- `VERCEL_ENV=production`
- any approval flag is missing
- any approval flag has the wrong value
- the existing API returns unavailable, unauthorized, or forbidden

These flags are for non-production reviewer QA only. They do not enable production exports.

## Staff Authentication And Parish Scope

The dashboard prototype must rely on the existing API for:

- staff authentication
- selected active parish context
- membership-backed parish authorization
- forged active parish denial
- selected parish audit-event scope
- approved export audit action filtering
- saved-filter filtering

The page must not fetch audit events directly from Supabase and must not implement a second parish-scope resolver.

The dashboard should display the selected parish label returned by the API and should present a generic blocked state when the API denies access.

## Read-Only Behavior

The dashboard prototype must not:

- insert, update, delete, or upsert rows
- write audit events
- write reviewer dispositions
- call export routes
- deliver CSV files
- deliver document manifests
- read request source tables directly
- read document source tables directly
- read Supabase Storage
- generate signed URLs
- call Google Calendar
- call OpenAI
- mutate cookies
- add production export flags
- apply migrations

## Dashboard UX Expectations

The dashboard prototype should be simple, dense, and reviewer-focused:

- page title: `Export Audit Reviewer`
- selected parish label
- non-production prototype badge
- production exports `NO-GO` badge
- last reviewed or loaded timestamp
- filter tabs or segmented controls for saved filters
- compact counts for downloaded, denied, blocked-field, forged/cross-parish, family/unauthenticated, and incomplete metadata reviews
- compact table of safe read-model rows
- severity/status badges
- empty state
- loading state
- generic error state
- rollback reminder: disable reviewer prototype flags

The dashboard prototype must not include:

- export/download buttons
- raw metadata drawer
- file-open buttons
- signed URL buttons
- document preview controls
- original filename display
- storage path display
- token display
- staff action controls that mutate rows
- production enablement controls

## Saved Filters Required

The dashboard prototype must expose only the saved filters already returned by the API:

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

Filter changes should call the existing API with the selected filter id. Filter labels may be human-friendly, but the underlying filter ids must remain unchanged.

## Allowed Display Fields

The dashboard may render only safe fields from the export audit reviewer read model:

- event action
- export route id
- export preset id
- target object type
- target object id label
- decision
- HTTP status
- denied reason code label
- runtime gate state
- runtime environment label
- staff email label
- active parish label
- parish count
- membership scope status
- request ownership status
- requested active parish cookie present
- requested field count
- blocked field count
- disallowed field count
- row count bucket
- delivery format
- CSV header approved
- manifest-only flag
- safe metadata only flag
- secret marker scan status
- file material marker scan status
- family/unauthenticated boundary flag
- cross-parish boundary flag
- blocked-field boundary flag
- post-rollback boundary flag
- metadata completeness status
- review status
- severity
- reviewer label
- evidence reference
- follow-up reference
- rollback required
- incident response required
- saved filter ids
- suspicious rule ids

## Forbidden Data Checks

The dashboard prototype must not render:

- raw CSV rows
- raw export files
- raw audit metadata blobs
- raw requested field names for denied events
- raw blocked field names for denied events
- document contents
- storage paths
- signed URLs
- original filenames
- portal token values
- portal token hashes
- OAuth tokens
- email provider tokens
- database URLs
- service-role keys
- API keys
- notes
- communications
- AI prompts
- AI outputs
- sacramental/canonical detail
- family-facing private data beyond generic denial classification

Tests must serialize representative rendered output or component fixtures and prove these markers are absent.

## Required Tests

Future dashboard prototype tests must prove:

- the dashboard is hidden or unavailable when prototype flags are off
- production environments are blocked even if prototype flags are present
- the dashboard uses the existing API/read-model path
- no direct Supabase client is imported by the dashboard component
- no export route is called by the dashboard component
- no storage or signed URL helper is imported
- selected parish label is displayed
- production exports `NO-GO` is displayed
- saved-filter controls are displayed
- filter selection preserves the API filter id
- loading state is safe
- empty state is safe
- error state is generic
- table rows are built only from safe read-model fields
- forbidden markers are absent from rendered output
- no export/download controls exist
- no mutation controls exist
- rollback is achieved by disabling prototype flags

## Manual Non-Production QA Expectations

After implementation, run a non-production browser smoke only:

1. Confirm `/api/health` returns `checks.schema: true`.
2. Confirm the dashboard is unavailable with reviewer flags off.
3. Enable only the approved non-production reviewer prototype flags.
4. Sign in as safe QA staff.
5. Select safe Parish A.
6. Open the dashboard prototype.
7. Confirm the selected parish label matches Parish A.
8. Confirm production exports show `NO-GO`.
9. Confirm saved filters render and update results.
10. Confirm downloaded and denied event summaries appear.
11. Confirm forged/cross-parish and family/unauthenticated saved filters do not expose private data.
12. Confirm no export/download, file-open, storage, signed URL, raw metadata, or mutation controls exist.
13. Disable the reviewer prototype flags.
14. Confirm the dashboard becomes unavailable again.

Do not access production and do not mutate records during this QA.

## Rollback And No-Op Behavior

Rollback must be:

1. Disable or unset `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE`.
2. Disable or unset `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK`.
3. Disable or unset `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV`.
4. Restart or redeploy the non-production app if needed.
5. Verify dashboard prototype route is unavailable.
6. Verify `/api/export-audit-reviewer` is unavailable.

No database cleanup, migration rollback, storage cleanup, Google cleanup, audit-event cleanup, or production change should be required.

## Post-Implementation Boundary

After this dashboard prototype is implemented and tested:

- production exports remain `NO-GO`
- production export monitoring remains `NO-GO`
- production dashboard UI remains `NO-GO`
- production export flags remain `NO-GO`
- production RLS remains separately gated

Any production dashboard, production monitoring, reviewer disposition write, export owner workflow, or staff-facing navigation exposure requires a separate product-owner approval packet.

## Exact Approval Language For Future Prompt

Use this exact language if approving the next phase:

```text
Approve non-production implementation of the staff-facing export audit reviewer dashboard prototype only. Add only app/dashboard/admin/export-audit-reviewer/page.tsx, app/dashboard/admin/export-audit-reviewer/ExportAuditReviewerDashboardPrototype.tsx, focused tests, and QA evidence docs. Use only the existing /api/export-audit-reviewer API/read-model path and safe read-model fields. Require the existing non-production reviewer prototype flags, staff authentication through the API, selected active parish membership scope through the API, saved filters, forbidden-data checks, no export/download controls, no raw metadata, no storage, no signed URLs, no direct Supabase reads, no mutations, and rollback by disabling flags. Do not access production, enable production flags, add production navigation, apply migrations, change operational RLS, touch Google Calendar data, mutate records, access storage, create signed URLs, expose raw exports, or expose secrets. Keep production exports NO-GO after implementation.
```

## What Changed Plain English

Vinea now has a careful permission slip for a future staff-facing export audit review screen. It says the screen may only show safe audit summaries that the existing protected API already returns. It may not download files, open documents, reveal raw data, change records, or work in production.

This helps Vinea move toward trustworthy export oversight without rushing into production monitoring or exposing sensitive parish data.
