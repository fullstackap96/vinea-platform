# Vinea Current Status

Status date: 2026-08-15

This is the concise current-state register for Vinea. Current code, exact-head CI,
Vercel deployment metadata, and non-production Supabase evidence override older
percentage estimates or dated evidence files.

## Release Identity

- GitHub PR `#15` was marked ready and merged at the exact approved source head
  `7c332bcae03347bf7b836adc2a697a41703484a6` and approved base
  `af631ad17fe557ace020489ad745b93e6d2af357`.
- Remote `main` is `06e1a0557297665a69b9171dfb137565597d65bf`; its parents are the
  approved base and source head.
- Exact-head CI: GitHub Actions run `31885701023` passed.
- Exact-head Preview: Vercel deployment `dpl_FdvCXMxu6iMCxjo2N3zcJnhQ9ewX` is
  `READY`, Preview-only, and has no production target.
- Protected Preview evidence passed `/api/health`, safe staff sign-in,
  authorized Parish A/B switching, all four Daily Dashboard focus destinations,
  desktop/mobile rendering, and original-parish restoration without record
  mutation.
- The merged UX release passed its complete 15-command local release contract in
  an isolated flag-off process. The new docs-only rollout checkpoint then passed
  882 test files and 3,788 tests, both TypeScript scopes, lint, repository secret
  scanning, a zero-vulnerability dependency audit, and the Next.js 16.3.0
  56-page build.
- Vercel automatically built merged `main` as ready artifact
  `dpl_95SD3gCpqr3RSDiK8YesebMQyPQu`, but no operator deploy, alias promotion, or
  production smoke occurred and
  the public production domains remain assigned to approved rollback deployment
  `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW` at commit
  `c52d947b0f70ad01c8dc6920ad49979ca17d25d2`.
- This merge verification did not access the production application or data,
  apply migrations, change RLS, or enable production-sensitive flags.

## Current Readiness

- Engineering completion estimate: `99.8%`.
- Production rollout readiness estimate: `87.5%`.
- Overall Vinea readiness estimate: `94%`.
- Launch decision: `YELLOW` - complete the P0 gates before a real-parish pilot.

The engineering estimate reflects implemented launch-scope workflows, safety
boundaries, and verification. The rollout estimate additionally requires current
database security, tenant-isolation promotion, monitoring,
recovery, production-safe fixtures, and controlled smoke evidence. Documentation
volume does not increase these estimates.

## Verified Product Boundary

Implemented and verified areas include parish requests and workflows, the Daily
Work Hub, People and Households, sacramental records, selected-parish staff
surfaces, Communications Center, onboarding/import review, reporting/search,
private request-document architecture, Google Calendar non-production behavior,
audit logging, and the disabled-by-default production-sensitive gates.

Implemented but not production-rollout-verified areas include production
membership-aware RLS, production monitoring, production AI, production exports,
production public-intake routing, and broader sacramental certificate/correction
behavior.

## P0 Register

Completed on 2026-08-07: the dependency P0 moved Next.js and its aligned lint
configuration to `16.3.0`, refreshed the reviewed PostCSS and Sharp overrides,
and returned `npm audit` to zero known vulnerabilities. Both TypeScript scopes,
lint, the complete Vitest suite, and the 56-page production build pass locally.
This remediation is now published and exact-head CI is green. The Preview is
`READY`; exact-head health and protected staff/Request Detail allow-deny smoke
passed.

Completed on 2026-08-07: the guarded disposable function-privilege validation
passed for all 17 reviewed functions. Anonymous execution was removed, the exact
seven-function authenticated surface and four-function service-role surface
matched their reviewed call-site allowlists, the schedule trigger search path
was fixed, and transaction rollback restored the baseline. The
temporary runner was removed and the reusable target returned to inactive. This
does not approve shared-QA application.

Completed on 2026-08-07: read-only shared-QA migration/catalog reconciliation
confirmed that public-intake routing, membership-aware operational RLS, and
`parishes` RLS effects are present but all three migration versions are absent
from history. The 45 membership policies match; the helper's anonymous execution
remains the separately documented privilege drift. Do not replay the migrations.

Remaining approval-gated P0s:

1. Approve or reject the prepared hash-pinned shared-QA migration-history repair
   and function-privilege application. Neither write has been run.
2. Complete a separately approved fail-closed production rollout for current
   merged main; the checkpoint and ready artifact do not approve alias promotion
   or production smoke.
3. Complete production RLS, production monitoring, production-safe fixture, and
   controlled read-only smoke gates with their separate explicit approvals.

## Safety Boundary

Production deployment, production data access, production migrations, operational
RLS changes, production monitoring, exports, public-intake routing, customer-facing
AI, storage access, certificate generation, outbound communications, and public
trust claims remain separately gated. This status record grants none of them.

Database reconciliation evidence:
[`SHARED_QA_DATABASE_SECURITY_RECONCILIATION_20260807.md`](SHARED_QA_DATABASE_SECURITY_RECONCILIATION_20260807.md).

Disposable validation evidence:
[`FUNCTION_PRIVILEGE_HARDENING_DISPOSABLE_VALIDATION_EVIDENCE_20260807.md`](FUNCTION_PRIVILEGE_HARDENING_DISPOSABLE_VALIDATION_EVIDENCE_20260807.md).

Shared-QA migration/catalog evidence:
[`SHARED_QA_MIGRATION_HISTORY_SCHEMA_POLICY_RECONCILIATION_EVIDENCE_20260807.md`](SHARED_QA_MIGRATION_HISTORY_SCHEMA_POLICY_RECONCILIATION_EVIDENCE_20260807.md).

Shared-QA promotion approval packet:
[`SHARED_QA_DATABASE_SECURITY_PROMOTION_APPROVAL_PACKET_20260807.md`](SHARED_QA_DATABASE_SECURITY_PROMOTION_APPROVAL_PACKET_20260807.md).

Exact-head publication and Preview evidence:
[`RELEASE_INTEGRITY_EXACT_HEAD_PREVIEW_EVIDENCE_20260807.md`](RELEASE_INTEGRITY_EXACT_HEAD_PREVIEW_EVIDENCE_20260807.md).

Merged-main rollout checkpoint:
[`CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260815.md`](CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260815.md).
