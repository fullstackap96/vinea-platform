# Membership-Aware RLS Production Evidence Package Consistency Checker - 2026-07-06

Status: Prepared as a repository-only production-readiness check. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, exports were not run, AI was not called, storage was not accessed, signed URLs were not created, communications were not sent, certificates were not generated, production flags were not enabled, public trust claims were not made, and no secrets were exposed while preparing this checker.

## Purpose

Use `checkMembershipAwareRlsProductionEvidencePackageConsistency(...)` to verify that the membership-aware operational RLS production evidence package is internally complete before final human approval is requested.

This checker is not a production rollout tool. It does not access production, apply the RLS migration, inspect production data, verify live production fixtures, or approve production rollout.

## Source Helper

- `lib/server/membershipAwareRlsProductionEvidencePackageConsistency.ts`

## Required Inputs

- Repository checkout only.
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md`.
- Linked repository docs, source helpers, SQL artifacts, and templates listed in the index.

Do not paste passwords, database URLs, service-role keys, anon keys, OAuth secrets, access tokens, refresh tokens, authorization codes, OpenAI keys, raw family portal tokens, token hashes, signed document URLs, private document contents, internal note bodies, AI prompts, AI outputs, audit payload details, parishioner names, family names, phone numbers, emails, addresses, funeral details, pastoral details, canonical details, or real private documents into the checker or evidence docs.

## What It Checks

The checker verifies:

- The evidence package index keeps the production `NO-GO` boundary.
- Required approval, rollout, rollback, smoke, monitoring, support, sign-off, and source-readiness artifacts are linked.
- Linked repository artifacts exist.
- Required review order steps are present.
- Required production approval gates are present.
- Excluded scopes are documented.
- Hard stops are documented.
- SQL artifacts have safe production-use status.
- Critical linked artifacts preserve their own approval boundaries, rollback/smoke requirements, source-readiness gates, and forbidden-data checks.
- Secret-like values are not accidentally embedded in linked non-SQL package artifacts.

Critical artifact-boundary checks currently cover:

- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_GO_NO_GO_REVIEW_CHECKLIST_20260627.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md`
- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_VALIDATOR_20260706.md`
- `lib/membershipAwareRlsProductionApprovalReadiness.ts`
- `lib/membershipAwareRlsProductionGoNoGoDryRunEvidence.ts`

## Expected Safe Result

Before requesting final human approval, the checker should return:

- `decision: READY_FOR_FINAL_HUMAN_REVIEW`
- `readyForProductionRollout: false`
- `artifactBoundaryCount` greater than `0`
- `findings: []`

`READY_FOR_FINAL_HUMAN_REVIEW` only means the repository evidence package is internally consistent enough to review. It does not mean production rollout is approved.

## Failure Handling

If the checker returns `NEEDS_ATTENTION`, stop before preparing a final approval prompt. Fix the missing link, missing file, missing boundary language, missing critical artifact boundary, missing gate, missing hard stop, missing SQL safety status, or secret-like value first.

## Production Boundary

Production membership-aware operational RLS remains `NO-GO` until the product owner later provides a separate explicit approval prompt with:

- Exact production target labels.
- Exact approved rollout window.
- Confirmed owner/sign-off labels.
- Production-safe fixture labels.
- Final go/no-go confirmation.
- The exact approval phrase `APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT`.

## Manual Testing Needed

No browser testing is needed for this repository-only checker. Future reviewers should run the checker alongside the production approval dry run and go/no-go evidence validator before asking for final product-owner approval.
