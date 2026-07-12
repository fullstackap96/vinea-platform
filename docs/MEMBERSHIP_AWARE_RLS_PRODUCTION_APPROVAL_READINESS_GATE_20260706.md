# Membership-Aware Operational RLS Production Approval Readiness Gate - 2026-07-06

Status: Prepared as a non-runtime production-readiness gate. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, exports were not run, AI was not called, storage was not accessed, signed URLs were not created, communications were not sent, certificates were not generated, and no secrets or public trust claims were introduced while preparing this gate.

## Purpose

Use this gate before asking for final product-owner approval to apply membership-aware operational RLS to production.

The gate turns the production RLS evidence package into a source-level readiness check. It does not approve production rollout. It does not access production. It only verifies that the owner labels, fixture labels, evidence statuses, smoke verification coverage, and scope boundaries are complete enough to ask for the separate approval prompt.

Use the label-only approval input builder first when the current approval packet is being assembled from human-filled worksheets. The builder converts safe owner and fixture labels into readiness input and blocks missing or secret-looking labels before this gate is evaluated.

Then run the repository-only dry-run helper so the review produces sanitized pass/fail JSON before any final approval prompt is requested.

## Source Artifact Chain

This gate cross-checks the following existing artifacts:

- Evidence package index: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md`
- Final approval readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`
- Human intake checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md`
- Human intake validation gate: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md`
- Smoke fixture verification checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md`
- Rollout evidence crosswalk: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_CROSSWALK_20260629.md`
- Rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Final go/no-go review checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md`
- Approval input builder doc: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md`
- Approval input builder source: `lib/membershipAwareRlsProductionApprovalInput.ts`
- Approval dry-run doc: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md`
- Approval dry-run source: `lib/membershipAwareRlsProductionApprovalDryRun.ts`
- Source helper: `lib/membershipAwareRlsProductionApprovalReadiness.ts`

## Required Owner Coverage

The source helper requires ready, complete, reviewed, approved, confirmed, passed, or `GO` statuses for:

- `product_owner`
- `technical_owner`
- `qa_owner`
- `security_data_owner`
- `rollback_owner`
- `monitoring_owner`
- `support_owner`
- `evidence_owner`

## Required Fixture Coverage

The source helper requires safe fixture labels for:

- `staff_account`
- `active_parish`
- `same_parish_request`
- `cross_parish_denied_request`
- `workflow_step`
- `staff_synthetic_document`
- `family_synthetic_document`
- `family_portal_token_plan`
- `cleanup_plan`

## Required Evidence Coverage

The source helper requires ready evidence statuses for:

- `disposable_forward_rollback_validation`
- `disposable_cross_parish_allow_deny_qa`
- `disposable_route_document_family_portal_qa`
- `nonproduction_promotion_evidence`
- `shared_qa_promotion_smoke`
- `shared_qa_active_parish_cookie_smoke`
- `human_intake_validation`
- `smoke_fixture_verification_checklist`
- `rollout_evidence_crosswalk`
- `rollout_rollback_packet`
- `support_communication_note`
- `final_go_no_go_checklist`
- `final_automated_checks`

## Required Smoke Verification Coverage

The source helper requires coverage for:

- `pre_apply_health`
- `forward_migration_sanitized_output`
- `post_apply_health`
- `policy_shape_verification`
- `active_parish_request_detail`
- `request_documents_staff_route`
- `signed_url_route_authorized_only`
- `direct_storage_privacy_denial`
- `family_portal_safety`
- `family_portal_exclusions`
- `search_report_cross_parish_absence`
- `audit_events_redacted`
- `monitoring_observation`
- `cleanup_deactivation`
- `rollback_decision`

## Required Scope Boundary Confirmations

The source helper requires all of these to remain true:

- Production access has not started before approval.
- Migrations were not applied during review.
- Operational RLS is unchanged during review.
- Runtime public intake routing is out of scope.
- AI production flags are out of scope.
- Google Calendar mutation is out of scope.
- Unrelated deployments are out of scope.

## Safe Label Rules

The source helper rejects target labels that look like:

- Database URLs.
- Service-role or anon key wording.
- Bearer tokens.
- OpenAI-style API keys.
- Signed URL signatures.
- Token material.
- Email addresses.

Production target labels should be short labels such as `Production app host label only` or `Production Supabase database host label only`, not connection strings, raw URLs with credentials, secrets, private ids, private document names, or parishioner details.

## Pass Criteria

The gate may return `readyToRequestProductOwnerApproval: true` only when:

- Every required owner status is ready.
- Every required fixture status is ready.
- Every required evidence status is ready.
- Every required smoke verification item is covered.
- Every required scope boundary confirmation is true.
- Production target labels contain no obvious secrets or private data.

The gate may return `readyForProductionRollout: true` only when the approval-request criteria are met and `explicitProductionApprovalPhraseRecorded` is true.

The exact production approval phrase remains:

`APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT`

## Production No-Go Boundary

Production RLS remains `NO-GO` unless and until the exact approval phrase is recorded separately with the approved production target labels, rollout window, rollback owner, monitoring owner/channel, and scope exclusions.

This gate does not access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust claims.

Runtime public intake routing, AI production flags, Google Calendar mutation, unrelated deployments, and production data cleanup remain out of scope.

## Next Safe Action

Run `buildMembershipAwareRlsProductionApprovalInput(...)` with label-only current approval data when the product owner believes the evidence package is complete. Then pass the built input through `buildMembershipAwareRlsProductionApprovalReadiness(...)`. If the readiness result returns `readyToRequestProductOwnerApproval: false`, fill the missing non-secret owners, fixture labels, evidence statuses, smoke coverage, and scope confirmations.

If it returns `readyToRequestProductOwnerApproval: true`, ask for the separate explicit production approval prompt. Do not treat this gate as approval by itself.

## What Changed Plain English

This gate gives Vinea a safer final checklist before a production database security rollout. It lets the team check the approval packet like a machine-readable checklist, while keeping production untouched and still requiring a separate human approval phrase before anything is applied.
