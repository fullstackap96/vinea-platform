# Vinea Export Audit Review Runbook - 2026-06-30

Status: Runbook prepared only. Production was not accessed, production export flags were not enabled, no staff-facing production UI was added, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this runbook.

This is an internal trust-center and export-governance readiness document. It is not a customer-facing policy, not legal advice, not a completed production monitoring system, and not approval to enable production exports.

Current decision state: `EXPORT AUDIT REVIEW RUNBOOK PREPARED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEW_RUNBOOK_20260630`

## Purpose

Vinea export routes are intentionally gated because a CSV or manifest can expose more data than a normal page view. This runbook defines how Vinea should review export audit events, detect suspicious export behavior, preserve evidence, and escalate concerns after approved non-production smoke tests or future approved production export windows.

## Scope

This runbook covers audit review for:

- `request_list_basic` exports.
- `request_document_manifest` exports.
- Future same-parish basic exports.
- Future sensitive exports that require a separate approval, reason, and role review.
- Failed export attempts, denied cross-parish attempts, blocked-field attempts, and unauthenticated or family-portal attempts.

This runbook explicitly excludes:

- Bulk document file export approval.
- Signed URL generation approval.
- Storage path exposure.
- Original filename export.
- Staff-facing production export UI approval.
- Production runtime flag approval.
- Changes to operational RLS.

## Required Audit Metadata

Every approved export route should produce safe audit metadata before query or delivery. The audit event must not include raw file contents, token material, signed URL material, storage paths, original filenames, raw prompts, raw AI outputs, environment secrets, or service-role keys.

Minimum fields to review:

- `event_type`.
- `staff_user_id`.
- `active_parish_id`.
- `parish_ids_included`.
- `export_type`.
- `target_object_type`.
- `target_object_id` when applicable.
- `requested_fields`.
- `blocked_fields`.
- `row_count` or estimated row count.
- `delivery_format`.
- `export_reason` when required.
- `route_scope_source`.
- `created_at`.
- `request_id` or trace/correlation id when available.

Expected event types include:

- `export.request_list_basic.downloaded`.
- `export.request_document_manifest.downloaded`.
- `export.request_list_basic.denied`.
- `export.request_document_manifest.denied`.
- Future export events that follow the `export.<export_id>.<result>` pattern.

## Review Cadence

Non-production smoke run:

- Review audit events immediately after the smoke run.
- Capture the expected allow/deny events in the smoke evidence document.
- Confirm rollback by disabling flags and recording a denied or unavailable response.

Future approved production smoke window:

- Review audit events before enabling flags to confirm a quiet baseline.
- Review audit events immediately after each flag-on smoke case.
- Review audit events again before the rollback deadline.
- Review audit events after disabling flags to confirm no further export delivery events occur.

Ongoing production operations, after separate future approval:

- Daily review during the first week after launch.
- Weekly review after the first stable week.
- Immediate review after any parish support complaint, suspicious login, denied cross-parish export, or unusually large export.

## Review Checklist

For every export audit review, confirm:

- The staff user is authenticated and expected for the smoke or support case.
- The active parish is the selected parish intended for the export.
- The staff user has active `parish_memberships` for every parish included.
- Cross-parish denied attempts did not produce a delivery event.
- Family portal and unauthenticated attempts did not produce a delivery event.
- Blocked-field attempts did not produce a query or delivery event.
- Request ownership checks match the active parish.
- `requested_fields` contain only route-approved fields.
- `blocked_fields` are either empty for success or explain the denial.
- Row counts are reasonable for the approved fixture or rollout window.
- Document manifest exports do not include signed URLs, storage paths, original filenames, file contents, notes, communications, AI material, tokens, or sacramental/canonical detail.
- Audit metadata itself does not contain secret material.

## Suspicious Patterns

Escalate immediately if any of these appear:

- Export delivery event without a preceding approval window.
- Export delivery event while production flags are expected to be off.
- Export delivery from a family portal, anonymous request, or unauthenticated session.
- Cross-parish request included in a same-parish export.
- Export with a parish id outside the staff member's active memberships.
- `request_document_manifest` event that includes signed URL material, storage paths, original filenames, token material, notes, communications, AI material, or sacramental/canonical details.
- Repeated denied export attempts from the same staff user, IP/context, or target request.
- Unusually high row count compared with the approved fixture.
- Export audit event missing staff id, active parish id, export type, route scope source, requested fields, or created timestamp.
- Any audit metadata containing obvious credential patterns such as database URLs, service-role keys, access tokens, refresh tokens, or OpenAI keys.

## Escalation Path

Severity 1: Confirmed or likely unauthorized export delivery.

- Disable export runtime flags immediately.
- Preserve audit events and route logs.
- Notify incident commander, technical lead, data/security owner, support owner, and product owner.
- Follow `docs/INCIDENT_RESPONSE_RUNBOOK_20260627.md`.
- Prepare customer communication only through the approved incident communication flow.

Severity 2: Denied suspicious attempt with no delivery.

- Preserve audit events.
- Confirm flags and route guards behaved correctly.
- Notify technical lead and security/data owner.
- Decide whether staff follow-up, credential rotation, or monitoring is needed.

Severity 3: Missing evidence, malformed audit metadata, or unclear smoke result.

- Keep production export disabled.
- File an engineering follow-up.
- Repeat non-production QA before requesting further production approval.

## Evidence To Preserve

Store non-secret evidence with the relevant smoke or incident packet:

- Environment identity.
- Flag state before and after the review.
- Export route id.
- Staff fixture label, not password or secret.
- Active parish label/id as permitted by the evidence packet.
- Target request fixture label.
- Audit event timestamps.
- Event type list.
- Row-count summary.
- Allowed/denied result summary.
- Monitoring owner and channel labels.
- Rollback owner label.
- Cleanup/deactivation confirmation.
- Reviewer name and timestamp.

Do not store:

- Passwords.
- Supabase service-role keys.
- Database URLs.
- Google OAuth tokens.
- OpenAI API keys.
- Family portal token values.
- Signed URLs.
- Raw document contents.
- Raw export files unless explicitly approved by the evidence packet.

## Rollback Verification

Rollback for current export pilots means disabling the export runtime flags. A successful rollback review requires:

- Flag-off request returns the expected unavailable or denied response.
- No new `*.downloaded` export audit events appear after rollback.
- Any post-rollback denied/unavailable event is safe and does not include secret or file material.
- Monitoring owner confirms the review window is complete.
- Rollback owner signs the smoke or incident evidence packet.

## Open Decisions

- Who owns routine export audit review after production approval.
- Which monitoring channel will receive export anomalies.
- Which support playbook is used when a parish asks who exported data.
- Whether audit events need a staff-facing export history page before broader staff UI launch.
- Whether production export launch requires automated anomaly detection before any customer-facing export UI.

## Next Step

Before any production export smoke, link this runbook from the relevant production evidence template and require the monitoring owner to complete the review checklist during the approved rollout window.
