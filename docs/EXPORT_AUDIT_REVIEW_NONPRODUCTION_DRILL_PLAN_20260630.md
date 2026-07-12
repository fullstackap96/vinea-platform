# Vinea Export Audit Review Non-Production Drill Plan - 2026-06-30

Status: Drill plan prepared only. Production was not accessed, production export flags were not enabled, no staff-facing production UI was added, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this plan.

This plan rehearses `docs/EXPORT_AUDIT_REVIEW_RUNBOOK_20260630.md` using `docs/EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630.md`. It is not approval to enable production exports, not automated monitoring, not a customer-facing trust-center claim, and not permission to run a drill without a separately approved non-production target.

Current decision state: `EXPORT AUDIT REVIEW NON-PRODUCTION DRILL PLAN PREPARED; DRILL NOT EXECUTED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_PLAN_20260630`

## Purpose

The export audit runbook and evidence template define how Vinea should review export activity. This drill plan defines how to rehearse that review safely in non-production before any production export rollout is considered.

The goal is to prove that the team can:

- Find expected export audit events.
- Recognize missing or suspicious audit metadata.
- Confirm denied attempts did not deliver data.
- Confirm rollback stops export delivery.
- Preserve useful evidence without copying secrets, raw exports, document contents, signed URLs, storage paths, original filenames, family portal tokens, notes, communications, AI material, or sacramental/canonical details.

## Drill Scope

Allowed non-production export scenarios:

- `request_list_basic` same-parish success.
- `request_list_basic` cross-parish denial.
- `request_list_basic` blocked-field denial.
- `request_list_basic` family portal or unauthenticated denial.
- `request_document_manifest` same-parish manifest success.
- `request_document_manifest` cross-parish denial.
- `request_document_manifest` blocked-field denial.
- `request_document_manifest` family portal or unauthenticated denial.
- Flag-off baseline and rollback verification for both approved pilot routes.

Explicitly out of scope:

- Production access.
- Production export flags.
- Staff-facing production export UI.
- Runtime behavior changes.
- New export route wiring.
- Migrations.
- Operational RLS changes.
- Google Calendar data.
- Record mutation beyond approved safe audit metadata from already-approved non-production export smoke routes.
- Signed URL creation.
- Storage path exposure.
- Original filename export.
- Document file delivery.
- Bulk document export.
- Customer-facing trust-center publication.

## Required Preconditions

Do not start the drill unless all preconditions are true:

- A non-production app target is explicitly approved for the drill.
- The target is labeled as shared QA, staging, local non-production, or another approved non-production environment.
- Production app URLs, production Supabase projects, and production flags are explicitly excluded.
- Safe staff, parish, same-parish request, document-set, cross-parish denial, blocked-field, and unauthenticated/family denial fixture labels are selected.
- No passwords, service-role keys, database URLs, OpenAI keys, Google OAuth tokens, family portal token values, signed URLs, or raw document contents are copied into the drill packet.
- The reviewer has `docs/EXPORT_AUDIT_REVIEW_RUNBOOK_20260630.md` open.
- The reviewer has a blank copy of `docs/EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630.md`.
- The rollback owner and monitoring owner are named by label.
- The non-production export runtime flags are disabled before the baseline check.

## Execution Steps

1. Record environment identity using labels only.
2. Confirm production is not the target.
3. Confirm production export flags are not enabled.
4. Confirm the non-production flag-off baseline returns unavailable or denied behavior for each pilot route.
5. Enable only the approved non-production export QA flags for the drill, if a separate drill approval explicitly permits it.
6. Run the same-parish success scenario for `request_list_basic`.
7. Run the cross-parish, blocked-field, and family/unauthenticated denial scenarios for `request_list_basic`.
8. Run the same-parish manifest success scenario for `request_document_manifest`.
9. Run the cross-parish, blocked-field, and family/unauthenticated denial scenarios for `request_document_manifest`.
10. Review audit events using the runbook checklist.
11. Fill the evidence template with non-secret labels, event counts, pass/fail results, and redacted observations.
12. Disable the non-production export QA flags.
13. Recheck both pilot routes after rollback.
14. Confirm no new `*.downloaded` audit events appear after rollback.
15. Record unresolved risks and required follow-up before any future production approval.

## Pass Criteria

The drill passes only if:

- Flag-off baseline is unavailable or denied.
- Same-parish success events exist only for approved fixtures.
- Cross-parish attempts are denied before delivery.
- Blocked-field attempts are denied before query or delivery.
- Family portal or unauthenticated attempts are denied before delivery.
- `request_document_manifest` evidence confirms no signed URLs, storage paths, original filenames, document file contents, portal tokens, notes, communications, AI material, or sacramental/canonical details.
- Safe audit metadata exists before query or delivery for the approved success paths.
- Denial events include safe, generic blocked reasons without secret or file material.
- Rollback by disabling non-production flags is verified.
- No new `*.downloaded` events appear after rollback.
- The evidence template is completed without secrets or raw export material.

## Fail Criteria

Stop the drill, disable non-production export flags, and record a blocked evidence result if any of these happen:

- The target appears to be production.
- A production flag is required to continue.
- A staff user can export outside the selected active parish.
- A cross-parish request appears in a same-parish export.
- A blocked-field attempt reaches query or delivery.
- A family portal or unauthenticated request receives export data.
- Audit metadata contains credential-shaped material, token material, signed URL material, storage paths, original filenames, raw document content, notes, communications, AI material, or sacramental/canonical details.
- Rollback does not stop delivery.
- The reviewer cannot find enough audit metadata to complete the evidence template.

## Evidence To Capture

Use `docs/EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630.md` and capture only:

- Environment label.
- Export route ids.
- Staff fixture label.
- Active parish label.
- Same-parish request fixture label.
- Cross-parish denial fixture label.
- Document set label.
- Flag names and state labels.
- Audit event type counts.
- Success/denial summaries.
- Suspicious-pattern pass/fail results.
- Rollback verification result.
- Monitoring owner label.
- Rollback owner label.
- Reviewer sign-off.

Do not capture raw CSV contents, raw manifests, database URLs, service-role keys, passwords, OpenAI keys, Google OAuth tokens, family portal token values, signed URLs, storage paths, original filenames, document file contents, notes, communications, AI prompts, AI outputs, or sacramental/canonical details.

## Rollback Rehearsal

Rollback for this drill means disabling the non-production export runtime flags and proving:

- Flag-off requests return unavailable or denied behavior.
- No `*.downloaded` audit events appear after rollback.
- Any post-rollback denied/unavailable event remains safe and generic.
- Monitoring owner confirms the drill window is complete.
- Rollback owner signs the evidence template.

## Open Decisions Before Production Progression

- Who owns recurring export audit review after production approval.
- Which monitoring channel receives export anomalies.
- Whether export audit review needs automated anomaly alerts before staff-facing production UI.
- Whether support staff need a read-only export history page before broader rollout.
- Whether sacramental/canonical export review requires a named parish operations or canonical reviewer.

## Next Step

Execute this drill only after a separate product-owner prompt approves the exact non-production target, fixture labels, monitoring owner, rollback owner, and allowed export route ids. Production exports remain `NO-GO`.
