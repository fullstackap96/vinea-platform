# Membership-Aware Operational RLS Production Approval Dry Run - 2026-07-06

Status: Prepared as a repository-only, non-runtime dry-run helper. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, records were not mutated, Google Calendar data was not touched, exports were not run, AI was not called, storage was not accessed, signed URLs were not created, communications were not sent, certificates were not generated, and no public trust claims were introduced while preparing this dry run.

## Purpose

Use this dry run to evaluate the filled label-only membership-aware RLS production approval packet before asking for the separate product-owner production approval prompt.

The dry run does three things:

1. Builds the source readiness input from safe owner and fixture labels.
2. Runs the production approval readiness gate.
3. Returns sanitized pass/fail JSON that does not echo owner names, fixture labels, host labels, raw ids, tokens, database URLs, signed URLs, document details, or private parish data.

## Source Helper

- Dry-run helper: `lib/membershipAwareRlsProductionApprovalDryRun.ts`
- Dry-run tests: `lib/membershipAwareRlsProductionApprovalDryRun.test.ts`
- Input builder: `lib/membershipAwareRlsProductionApprovalInput.ts`
- Readiness gate: `lib/membershipAwareRlsProductionApprovalReadiness.ts`
- Input builder doc: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_INPUT_BUILDER_20260706.md`
- Readiness gate doc: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md`
- Go/no-go dry-run evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_TEMPLATE_20260706.md`
- Evidence package index: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md`

## Dry-Run Output Shape

The helper returns:

- `schemaVersion`
- `dryRunName`
- `generatedFrom`
- `scope`
- `decision`
- `pass`
- `safeSummary`
- `missingRequiredItems`
- `missingLabelFields`
- `missingSmokeVerificationItems`
- `unsafeLabelFindings`
- `productionNoGoBoundaries`
- `nextSafeAction`

The helper intentionally does not return raw label values. Missing fields are identified by field path, such as `owner.technical_owner`, and unsafe labels are identified by field path and category, such as `production target.databaseHostLabel: possible database url`.

## Expected Current Repository Dry Run

Using the current filled, label-only approval packet without the final product-owner approval phrase, the expected dry-run decision is:

`READY_TO_REQUEST_APPROVAL`

The expected rollout status remains:

`readyForProductionRollout: false`

That is correct. The separate exact approval phrase is still required before production rollout can be considered:

`APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT`

## Pass Criteria

The dry run passes only when:

- All required owner labels are present.
- All required fixture labels are present.
- Required evidence statuses are ready.
- Required smoke verification items are covered.
- Required scope boundaries remain true.
- No owner, fixture, or target label looks like a secret.
- The readiness gate returns `readyToRequestProductOwnerApproval: true`.

The dry run can show `READY_FOR_APPROVED_ROLLOUT` only when the exact approval phrase is supplied separately.

Record the safe dry-run summary in `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_GO_NO_GO_DRY_RUN_EVIDENCE_TEMPLATE_20260706.md` before requesting final product-owner approval. Do not paste raw labels or secrets into the evidence template.

## Production No-Go Boundary

Production RLS remains `NO-GO` after this dry run.

Do not use this dry run to access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, enable runtime public intake routing, enable AI production flags, or make public trust claims.

## What Changed Plain English

Vinea now has a safe rehearsal for the final RLS approval packet. It can say "the packet looks ready to request approval" or "something is missing" without touching production or repeating private values back into evidence.
