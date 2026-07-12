# Membership-Aware Operational RLS Production Evidence Package Index - 2026-06-29

Status: Evidence package index prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this index.

## Purpose

Use this index as the master table of contents for the future membership-aware operational RLS production rollout package.

This index does not approve production work. It does not verify production fixtures. It does not apply the production RLS migration. It only links the approval, rollout, rollback, fixture, smoke, monitoring, support, blocker, and sign-off documents that must be reviewed before a separate explicit production approval can be considered.

## Current Decision

Current decision: `EVIDENCE_PACKAGE_INDEX_READY_PRODUCTION_NOT_APPROVED`

Production RLS remains `NO-GO` until the product owner later provides a separate explicit approval prompt with the exact approval phrase `APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT`, safe production target labels, a production rollout window, and final go/no-go confirmation.

## Safety Boundaries

Do not use this index to access production, apply migrations, change runtime behavior, change operational RLS, touch Google Calendar data, mutate records, or expose secrets.

Do not paste passwords, database URLs, service-role keys, anon keys, OAuth secrets, access tokens, refresh tokens, authorization codes, OpenAI keys, raw family portal tokens, token hashes, signed document URLs, private document contents, internal note bodies, AI prompts, AI outputs, audit payload details, parishioner names, family names, phone numbers, emails, addresses, funeral details, pastoral details, canonical details, or real private documents.

## Required Review Order

Review in this order before any future production approval is requested:

1. Read the readiness and blocker records.
2. Confirm human owners and safe fixture labels are complete.
3. Confirm the smoke fixture verification checklist and rollout evidence crosswalk are ready.
4. Confirm rollback, support, and monitoring instructions are ready.
5. Confirm named sign-offs are complete.
6. Confirm the final go/no-go checklist is `GO`.
7. Build the source-level production approval readiness input from label-only current evidence.
8. Run the repository-only source-level approval dry run and confirm it returns sanitized pass/fail JSON with `READY_TO_REQUEST_APPROVAL`.
9. Fill the go/no-go dry-run evidence template with the sanitized dry-run summary and human approval placeholders.
10. Run the go/no-go dry-run evidence validator and confirm it returns `READY_TO_REQUEST_FINAL_APPROVAL`.
11. Run the source-level production approval readiness gate with the built input.
12. Run the evidence package consistency checker and confirm it returns `READY_FOR_FINAL_HUMAN_REVIEW`.
13. Prepare the final approval prompt.
14. Only after separate explicit approval, use the rollout evidence template during the approved rollout window.

## Evidence Package Index

| Package area | Document | Required before approval? | Purpose | Current status |
|---|---|---:|---|---|
| Production readiness gate | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md` | Yes | Defines production readiness gates and conditions | Prepared; must be reviewed |
| Final approval readiness record | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md` | Yes | Summarizes final readiness and remaining blockers | Prepared; production still not approved |
| Blocker register | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_BLOCKER_REGISTER_20260628.md` | Yes | Lists blockers and unresolved risks | Must show no blocking production issues |
| Owner and fixture capture form | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_FIXTURE_CAPTURE_FORM_20260629.md` | Yes | Captures non-secret owner and fixture inputs | Superseded/covered by filled intake checklist where applicable |
| Human intake checklist | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_CHECKLIST_20260629.md` | Yes | Holds safe owner names and fixture labels | Filled with safe planning labels |
| Human intake validation gate | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_VALIDATION_GATE_20260629.md` | Yes | Validates the filled intake checklist before approval | Prepared and validation-ready |
| Guided worksheet | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_HUMAN_INTAKE_GUIDED_WORKSHEET_20260629.md` | Helpful | Product-owner-friendly guide for non-secret values | Filled values have been applied |
| Owner sign-off capture packet | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_OWNER_SIGNOFF_CAPTURE_PACKET_20260627.md` | Yes | Captures product, technical, QA, security/data, rollback, monitoring, support, and evidence owners | Must be confirmed before approval |
| Sign-off template | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md` | Yes | Defines sign-off fields and approval evidence | Must be completed or cross-referenced |
| Smoke-test data checklist | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md` | Yes | Lists production-safe smoke data requirements | Must be mapped to real safe records during rollout |
| Smoke fixture worksheet | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_WORKSHEET_20260627.md` | Yes | Captures fixture details and redaction rules | Must be aligned with filled intake labels |
| Smoke fixture verification checklist | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_FIXTURE_VERIFICATION_CHECKLIST_20260629.md` | Yes | Maps safe fixture labels to exact evidence and pass criteria | Prepared; production fixtures not yet verified |
| Rollout evidence crosswalk | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_CROSSWALK_20260629.md` | Yes | Maps rollout evidence template sections to fixture checklist requirements | Prepared; production not approved |
| Rollout evidence template | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md` | Yes | Captures actual rollout evidence during future approved window | Template prepared; must remain pending until rollout |
| Rollout/rollback packet | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md` | Yes | Contains forward, verification, rollback, and decision steps | Prepared; must be reviewed before approval |
| Support communication note | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SUPPORT_COMMUNICATION_NOTE_20260627.md` | Yes | Defines support owner/channel and parish-facing response posture | Must be ready before approval |
| Final go/no-go checklist | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md` | Yes | Final checklist before any product-owner approval | Must be `GO` immediately before approval |
| Production approval input builder | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md` | Yes | Converts label-only owner and fixture inputs into the source readiness input and blocks missing or secret-looking labels | Prepared; must pass before readiness gate |
| Production approval input helper | `lib/membershipAwareRlsProductionApprovalInput.ts` | Yes | Builds `MembershipAwareRlsProductionApprovalReadinessInput` from non-secret labels and exact approval phrase state | Implemented; non-runtime only |
| Production approval dry run | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md` | Yes | Defines the repository-only dry run that evaluates the filled label-only packet through the input builder and readiness gate | Prepared; production still not approved |
| Production approval dry-run helper | `lib/membershipAwareRlsProductionApprovalDryRun.ts` | Yes | Produces sanitized pass/fail JSON without echoing owner names, fixture labels, target labels, raw ids, or secrets | Implemented; non-runtime only |
| Go/no-go dry-run evidence template | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_TEMPLATE_20260706.md` | Yes | Captures sanitized dry-run JSON summary, owner/fixture/evidence status, remaining NO-GO boundaries, exact approval phrase boundary, and human approval placeholders | Prepared as template only; production still not approved |
| Go/no-go dry-run evidence validator | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md` | Yes | Defines the repository-only validator for filled sanitized go/no-go evidence before final approval is requested | Prepared; helper and tests implemented |
| Go/no-go dry-run evidence helper | `lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts` | Yes | Validates the filled go/no-go evidence record, rejects raw labels/secrets/approval phrase capture, and keeps rollout blocked until human approval | Implemented; non-runtime only |
| Go/no-go dry-run validated example | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_VALIDATED_EXAMPLE_20260706.md` | Helpful | Shows the sanitized example validator result using the current filled label-only packet without exposing raw labels or secrets | Prepared; production still not approved |
| Production approval readiness gate | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md` | Yes | Source-level label-only readiness check before requesting final approval | Prepared; must return ready before approval prompt is requested |
| Production approval readiness helper | `lib/membershipAwareRlsProductionApprovalReadiness.ts` | Yes | Evaluates owner, fixture, evidence, smoke verification, scope, and safe-label readiness | Implemented; non-runtime only |
| Evidence package consistency checker | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_CONSISTENCY_CHECKER_20260706.md` | Yes | Defines the repository-only package consistency check before requesting final approval | Prepared; production still not approved |
| Evidence package consistency helper | `lib/server/membershipAwareRlsProductionEvidencePackageConsistency.ts` | Yes | Verifies required package links, files, review order, gates, excluded scopes, hard stops, SQL safety status, and secret-like value boundaries | Implemented; non-runtime only |
| Final approval prompt template | `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_PROMPT_TEMPLATE_20260629.md` | Yes | Exact future approval language and exclusions | Template ready; approval not given |

## SQL References

| SQL artifact | Location | Production use status | Purpose |
|---|---|---|---|
| Forward migration | `supabase/migrations/20260626170000_membership_aware_operational_rls.sql` | Do not run until explicitly approved | Applies membership-aware operational RLS policy shape |
| Rollback draft | `docs/sql/membership_aware_operational_rls_rollback_draft.sql` | Do not run unless approved rollout requires rollback | Restores the previous primary-parish-scoped policy shape |
| Historical forward candidate | `docs/sql/membership_aware_operational_rls_migration_candidate.sql` | Reference only | Non-applied candidate used before migration promotion |
| Historical forward draft | `docs/sql/membership_aware_operational_rls_draft.sql` | Reference only | Earlier draft used during readiness planning |

## Production Approval Gate Checklist

All items must be true before the final approval prompt can be pasted:

| Gate | Required result |
|---|---|
| Production target labels are safe | App host and database host labels contain no credentials or connection strings |
| Human intake is complete | Owner names, fixture labels, monitoring owner/channel, rollback owner, and evidence location are non-secret and validated |
| Fixture evidence map is complete | Every safe fixture label maps to required evidence and pass criteria |
| Rollout evidence crosswalk is complete | Every rollout evidence section maps to a checklist or readiness source |
| Smoke-test data is production-safe | Staff account, request, workflow step, documents, and family portal token plan avoid real private records and raw tokens in evidence |
| Named sign-offs are complete | Product, technical, QA, security/data, rollback, monitoring, support, and evidence owners are confirmed |
| Rollback is rehearsable | Rollback owner, rollback deadline, rollback SQL, and post-rollback checks are known |
| Monitoring is ready | Monitoring owner/channel and 30-minute observation expectations are documented |
| Support posture is ready | Support owner/channel and customer communication posture are known |
| Final go/no-go is `GO` | Final review checklist is updated immediately before approval |
| Source readiness input builder passes | `buildMembershipAwareRlsProductionApprovalInput(...)` returns no missing labels and no unsafe owner, fixture, or target label findings |
| Repository dry run passes | `runMembershipAwareRlsProductionApprovalDryRun(...)` returns sanitized pass/fail JSON with `decision: READY_TO_REQUEST_APPROVAL` before approval is requested |
| Go/no-go dry-run evidence template is filled | Sanitized dry-run summary, owner/fixture/evidence status, NO-GO boundaries, approval phrase boundary, and human approval placeholders are recorded without secrets |
| Go/no-go dry-run evidence validator passes | `validateMembershipAwareRlsProductionGoNoGoDryRunEvidence(...)` returns `READY_TO_REQUEST_FINAL_APPROVAL` while `readyForProductionRollout` remains `false` |
| Source readiness gate passes | `buildMembershipAwareRlsProductionApprovalReadiness(...)` returns `readyToRequestProductOwnerApproval: true` with safe labels only |
| Evidence package consistency checker passes | `checkMembershipAwareRlsProductionEvidencePackageConsistency(...)` returns `READY_FOR_FINAL_HUMAN_REVIEW` while `readyForProductionRollout` remains `false` |
| Explicit approval phrase is present | Approval text includes `APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT` |

## Excluded Scopes

The future production RLS approval package must not include:

- Runtime public intake routing enablement.
- Public intake production runtime flags.
- AI production flag enablement.
- Google Calendar data mutation.
- Staff membership cleanup.
- Operational table schema redesign.
- Production data cleanup.
- Pricing, billing, marketing, or customer communication changes.
- Any unrelated deployment or feature rollout.

## Monitoring And Evidence Requirements

The rollout evidence package must include safe labels for:

- Pre-apply `/api/health`.
- Forward migration sanitized output.
- Post-apply `/api/health`.
- Policy-shape verification.
- Active-parish-cookie request detail smoke.
- Request document route smoke.
- Signed URL access through approved route only.
- Direct storage privacy denial.
- Family portal safety smoke.
- Family portal exclusion checks for internal notes, staff-only notes, AI notes, audit logs, token hashes, signed URLs, and private parish data.
- Audit event names and timestamps without private payloads.
- 30-minute monitoring observations.
- Cleanup and deactivation.
- Rollback decision.
- Final outcome.

## Hard Stops

Do not proceed to production approval or rollout if any of these occur:

- The final go/no-go checklist is not `GO`.
- Any required owner or sign-off is missing.
- Any production fixture label cannot be mapped to safe evidence.
- Production target information includes a database URL, password, service-role key, session cookie, signed URL, or raw token.
- The rollout is bundled with public intake routing, AI production flags, Google Calendar mutation, unrelated deployments, or unrelated data cleanup.
- Rollback owner, rollback deadline, rollback SQL, or post-rollback checks are missing.
- Monitoring owner/channel or support posture is missing.
- The explicit production approval phrase is missing.

## What Changed Plain English

This index is the front page for the future production RLS evidence packet. It points to every document needed for approval, rollout, rollback, smoke testing, monitoring, support, and sign-off, so the future rollout process is easier to follow and harder to misuse.
