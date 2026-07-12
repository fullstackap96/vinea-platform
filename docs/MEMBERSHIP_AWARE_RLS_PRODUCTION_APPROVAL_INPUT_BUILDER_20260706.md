# Membership-Aware Operational RLS Production Approval Input Builder - 2026-07-06

Status: Prepared as a non-runtime, label-only production-readiness helper. Production was not accessed, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, records were not mutated, Google Calendar data was not touched, exports were not run, AI was not called, storage was not accessed, signed URLs were not created, communications were not sent, certificates were not generated, and no public trust claims were introduced while preparing this helper.

## Purpose

Use this helper before running the production approval readiness gate for membership-aware operational RLS.

The input builder turns the human-filled, non-secret owner and fixture labels into the source-level readiness input expected by `buildMembershipAwareRlsProductionApprovalReadiness(...)`. It is intentionally boring: if a required label is missing, the corresponding owner or fixture stays `PENDING`; if a label looks like a secret, the packet is blocked before a production approval prompt is requested.

## Source Helper

- Input builder: `lib/membershipAwareRlsProductionApprovalInput.ts`
- Readiness gate: `lib/membershipAwareRlsProductionApprovalReadiness.ts`
- Source tests: `lib/membershipAwareRlsProductionApprovalInput.test.ts`
- Repository-only dry run: `lib/membershipAwareRlsProductionApprovalDryRun.ts`
- Dry-run doc: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_DRY_RUN_20260706.md`
- Readiness gate doc: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_APPROVAL_READINESS_GATE_20260706.md`
- Evidence package index: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_EVIDENCE_PACKAGE_INDEX_20260629.md`

## Required Label Inputs

The builder expects safe, non-secret labels for every required owner:

- `product_owner`
- `technical_owner`
- `qa_owner`
- `security_data_owner`
- `rollback_owner`
- `monitoring_owner`
- `support_owner`
- `evidence_owner`

The builder expects safe, non-secret labels for every production smoke fixture:

- `staff_account`
- `active_parish`
- `same_parish_request`
- `cross_parish_denied_request`
- `workflow_step`
- `staff_synthetic_document`
- `family_synthetic_document`
- `family_portal_token_plan`
- `cleanup_plan`

The builder also expects evidence statuses, smoke verification coverage, production target labels, and explicit scope-boundary confirmations.

## Safe Label Rules

Safe labels should describe the item without exposing secrets or private data. Examples:

- `Production RLS smoke staff account label only`
- `Production RLS Smoke Parish A`
- `Production RLS Smoke Request A - non-sensitive`
- `Create during smoke window; do not record raw token; deactivate immediately after smoke`

Do not paste:

- Database URLs.
- Passwords.
- Service-role keys or anon keys.
- Bearer tokens.
- OpenAI-style API keys.
- Signed URL signatures.
- Family portal tokens or token hashes.
- Staff or parishioner email addresses.
- Raw production ids.
- Private document contents, filenames, notes, audit payloads, or pastoral/canonical details.

## Approval Phrase Boundary

The builder records `explicitProductionApprovalPhraseRecorded: true` only when the exact phrase is present:

`APPROVE_PRODUCTION_MEMBERSHIP_AWARE_RLS_ROLLOUT`

The phrase must still be provided separately by the product owner. This helper does not approve production rollout by itself.

## Pass Criteria

The approval input builder is acceptable when:

- No required owner label is missing.
- No required fixture label is missing.
- Evidence statuses are ready.
- Smoke verification items are covered.
- Scope-boundary confirmations remain true.
- No owner, fixture, or target label looks like a secret.
- The readiness gate returns `readyToRequestProductOwnerApproval: true`.

After the builder passes, run the repository-only dry run with `runMembershipAwareRlsProductionApprovalDryRun(...)` and confirm it returns sanitized pass/fail JSON without echoing owner names, fixture labels, target labels, raw ids, or secrets.

`readyForProductionRollout` must remain false until the separate product-owner approval phrase is provided.

## Production No-Go Boundary

Production RLS remains `NO-GO` after this helper is prepared.

Do not use this helper to access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, enable runtime public intake routing, enable AI production flags, or make public trust claims.

## What Changed Plain English

This helper is like a safer intake form for the final production RLS checklist. It takes the friendly labels people can safely write down, checks whether anything is missing or secret-looking, and then feeds the real readiness gate. It keeps the future rollout process tidy without touching production.
