# Vinea Export Audit Reviewer Read-Model Plan - 2026-07-01

Status: Plan prepared only. Production was not accessed, production export flags were not enabled, staff-facing production export UI was not added, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this plan.

This is a non-runtime export-governance planning document. It does not create an export audit dashboard, does not wire a live API route, does not approve production exports, and does not approve staff-facing production export UI.

Current decision state: `EXPORT AUDIT REVIEWER READ MODEL PLANNED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEWER_READ_MODEL_PLAN_20260701`

## Purpose

The export audit review runbook defines how a human reviewer should review export audit events. This plan defines the future read model and saved filters that should make that review practical, repeatable, and safe.

The first reviewer surface should help a reviewer answer five questions without seeing sensitive export contents:

- Who attempted or completed an export?
- Which active parish and export route were involved?
- Was the event downloaded, denied, unavailable, or malformed?
- Did the event match an approved smoke/test/support window?
- Does the event require follow-up, rollback, or incident escalation?

## Explicit Non-Runtime Boundary

This plan does not:

- enable production export flags,
- add production export UI,
- add a staff-facing dashboard page,
- add an API route,
- apply migrations,
- change operational RLS,
- touch Google Calendar data,
- mutate records,
- query production,
- export files,
- generate signed URLs,
- expose storage paths,
- expose original filenames,
- expose document contents,
- expose notes, communications, AI material, sacramental/canonical detail, family portal tokens, token hashes, credentials, or connection strings.

## Source Events

The future read model should consume only safe `audit_events` metadata emitted by approved export routes.

Expected event families:

- `export.request_list_basic.downloaded`
- `export.request_list_basic.denied`
- `export.request_document_manifest.downloaded`
- `export.request_document_manifest.denied`
- Future `export.<approved_export_id>.downloaded`
- Future `export.<approved_export_id>.denied`

The read model must tolerate older events that do not yet have the full metadata set by classifying them as `metadata_incomplete` instead of guessing.

## Required Columns

The future reviewer read model should expose these columns only.

### Event Identity Columns

- `audit_event_id`
- `created_at`
- `event_action`
- `export_route_id`
- `export_preset_id`
- `target_object_type`
- `target_object_id_label`
- `decision`
- `http_status`
- `denied_reason_code`
- `runtime_gate_state`
- `runtime_environment_label`

### Actor And Parish Scope Columns

- `staff_user_id_label`
- `staff_email_label`
- `active_parish_id_label`
- `active_parish_name_label`
- `parish_ids_included_count`
- `membership_scope_status`
- `request_ownership_status`
- `requested_active_parish_cookie_present`

### Export Shape Columns

- `requested_fields_count`
- `blocked_fields_requested_count`
- `disallowed_fields_count`
- `row_count_bucket`
- `delivery_format`
- `csv_header_approved`
- `manifest_only`
- `safe_metadata_only`

### Safety Review Columns

- `secret_marker_scan_status`
- `file_material_marker_scan_status`
- `family_or_unauthenticated_boundary`
- `cross_parish_boundary`
- `blocked_field_boundary`
- `post_rollback_boundary`
- `metadata_completeness_status`

### Reviewer Workflow Columns

- `review_status`
- `severity`
- `reviewer_label`
- `reviewed_at`
- `evidence_reference`
- `follow_up_reference`
- `rollback_required`
- `incident_response_required`

## Explicitly Forbidden Columns

The read model must not expose:

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
- family-facing private data beyond the generic denial classification.

Counts, route ids, preset ids, generic denial reason codes, and safe non-secret labels are allowed.

## Saved Filters

The first reviewer surface should include these saved filters.

| Filter id | Purpose | Default criteria | Expected reviewer action |
|---|---|---|---|
| `exports_downloaded_recent` | Review successful export delivery | `decision = downloaded`, recent approved window | Confirm staff/parish/scope and row-count bucket |
| `exports_denied_recent` | Review blocked attempts | `decision = denied`, recent approved window | Confirm no delivery and classify severity |
| `exports_blocked_field_attempts` | Find blocked/disallowed field attempts | `denied_reason_code in blocked_or_disallowed_fields, export_permission_denied` | Confirm no query/delivery and no raw field names |
| `exports_cross_parish_or_forged_scope` | Find active-parish or membership failures | `denied_reason_code = active_parish_scope_denied` or cross-parish boundary flagged | Verify tenant boundary held |
| `exports_family_or_unauthenticated` | Find anonymous or family-facing attempts | `denied_reason_code = unauthenticated_or_non_staff` or family boundary flagged | Verify no delivery and generic error behavior |
| `exports_after_rollback` | Detect post-rollback activity | event time after rollback deadline | Any downloaded event is severity 1 |
| `exports_metadata_incomplete` | Catch malformed or old audit events | required column missing or `metadata_completeness_status = incomplete` | File engineering follow-up before production approval |
| `document_manifest_safety_review` | Review manifest-only safety | `export_preset_id = request_document_manifest` | Confirm no signed-link, storage-location, filename, file-content, note, communication, AI, or sacramental/canonical material |
| `request_list_basic_safety_review` | Review request-list safety | `export_preset_id = request_list_basic` | Confirm basic request-list fields only and same-parish scope |
| `repeated_denials_by_actor` | Detect suspicious repeated attempts | same staff label has repeated denied events within a short window | Escalate to security/data owner if unexplained |

## Suspicious Pattern Rules

The future reviewer read model should compute or display these rule outcomes.

| Rule id | Condition | Severity | Required action |
|---|---|---:|---|
| `downloaded_outside_approval_window` | Downloaded event without an approved window | 1 | Disable flags, preserve evidence, start incident review |
| `downloaded_after_rollback` | Downloaded event after rollback deadline | 1 | Disable flags, preserve evidence, start incident review |
| `downloaded_while_flags_off` | Downloaded event while export flags expected off | 1 | Disable flags, preserve evidence, start incident review |
| `cross_parish_delivery` | Export includes parish outside active staff memberships | 1 | Disable flags and escalate |
| `family_or_unauthenticated_delivery` | Delivery from family/anonymous context | 1 | Disable flags and escalate |
| `document_manifest_sensitive_material` | Manifest metadata contains signed-link, storage-location, original-filename, file-content, token, note, communication, AI, or sacramental/canonical markers | 1 | Disable flags and escalate |
| `repeated_denied_attempts` | Repeated denied attempts by same actor or source context | 2 | Preserve evidence and notify security/data owner |
| `blocked_field_attempt` | Blocked/disallowed fields denied before query/delivery | 2 | Confirm denial metadata is safe; follow up if suspicious |
| `active_parish_scope_denied` | Forged or unauthorized active-parish scope denied | 2 | Confirm no delivery and notify technical owner if repeated |
| `metadata_incomplete` | Event missing required safe metadata | 3 | Keep production disabled and file engineering follow-up |
| `row_count_unusually_high` | Row count bucket exceeds approved fixture/window expectation | 2 | Review approval scope and support rationale |
| `route_preset_mismatch` | Route id and export preset id do not match an approved pair | 2 | Preserve evidence and file engineering follow-up |

## Reviewer Workflow

1. Confirm the review window, environment, and flag state from the relevant evidence packet.
2. Open `exports_downloaded_recent` and verify every downloaded event matches the approved route, staff, active parish, and fixture/window.
3. Open `exports_denied_recent` and verify denied events are generic, safe, and did not deliver data.
4. Open the route-specific safety filters for `request_list_basic` and `request_document_manifest`.
5. Open `exports_after_rollback` and confirm there are no downloaded events after rollback.
6. Open `exports_metadata_incomplete` and file follow-up for any malformed event.
7. Classify severity using the suspicious pattern rules.
8. Record evidence using `docs/EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630.md`.
9. Escalate severity 1 or repeated severity 2 patterns using `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`.
10. Keep production exports `NO-GO` unless a separate production approval packet explicitly authorizes the next step.

## Future Implementation Shape

The first implementation should be read-only and non-destructive.

Recommended sequence:

1. Add a server-only read-model builder that converts safe `audit_events` metadata into the columns listed above.
2. Add source-level tests proving forbidden columns and forbidden markers cannot appear.
3. Add a staff-only non-production reviewer route behind an explicit non-production gate.
4. Add saved-filter query parameters or tabs using the filter ids in this plan.
5. Add browser QA in shared QA using completed non-production export drill evidence.
6. Prepare a production-readiness packet before any production reviewer UI or export runtime gate is enabled.

Do not implement a customer-facing or production-facing reviewer UI until production RLS, export production gate approval, monitoring owner, rollback owner, support owner, and production smoke evidence are complete.

## Acceptance Criteria For Future Implementation

The future implementation is acceptable only if:

- it is staff-authenticated,
- it is active-parish scoped,
- it is membership scoped,
- it reads audit metadata only,
- it never reads raw export CSV,
- it never reads document files,
- it never generates signed URLs,
- it never exposes storage paths or original filenames,
- it never exposes raw requested denied field names,
- it keeps family-facing and unauthenticated contexts out,
- it includes saved filters for downloaded, denied, blocked-field, cross-parish, family/unauthenticated, rollback, and malformed metadata review,
- it records reviewer evidence without mutating export data,
- it keeps production exports `NO-GO` until separately approved.

## What Changed Plain English

Before this plan, Vinea had an export audit runbook and evidence template, but not a concrete design for the reviewer view a staff or security reviewer would eventually use. This plan defines the safe columns, saved filters, suspicious-pattern rules, and review steps that a future export audit reviewer should have.

This helps Vinea grow because parish and diocesan customers will eventually ask not only whether exports are safe, but also whether export activity can be reviewed clearly after the fact.

## Final Decision

- Current outcome: `read-model plan prepared`
- Runtime behavior changed: `no`
- Production exports approved: `no`
- Staff-facing production UI approved: `no`
- Migrations applied: `no`
- Operational RLS changed: `no`
- Records mutated: `no`
- Secrets exposed: `no`
- Required next approval: `product-owner approval before any reviewer route, dashboard UI, production export flag, or production audit monitoring workflow is implemented`
