# Vinea Current Status

Status date: 2026-08-07

This is the concise current-state register for Vinea. Current code, exact-head CI,
Vercel deployment metadata, and non-production Supabase evidence override older
percentage estimates or dated evidence files.

## Release Identity

- GitHub PR `#8` was marked ready and merged at the exact approved source head
  `c7626c460714aae8dab459a79a30ad4a62f44486`.
- Remote `main` is `46190a71aa46146b4df0eb0a2e60cac8040572bd`; its parents are the
  prior main head and the approved source head.
- Exact-head CI: GitHub Actions run `31215092349` passed.
- Exact-head Preview: Vercel deployment `dpl_3USyZGXXyiQ5VQCn5Qixsixixd6i` is
  `READY`, Preview-only, and has no production target.
- Protected Preview evidence passed deployment access, safe staff sign-in,
  authorized Parish A selection, same-parish Request Detail access, and generic
  cross-parish denial. Earlier published-head evidence covers Onboarding, Imports
  history, duplicate-review pages, and Communications Center in read-only mode.
- Authenticated `vercel curl` confirmed exact-deployment `/api/health` returned
  `ok: true`; environment, Supabase, parish, schema, email, and Google OAuth
  checks were all `true`.
- The complete 15-command local release contract passed after the evidence update
  in an isolated flag-off process: 879 test files and 3,775 tests passed, both
  TypeScript scopes and lint passed, the dependency audit found zero known
  vulnerabilities, and the Next.js 16.3.0 build generated 56 pages.
- Vercel automatically built merged `main` as ready artifact
  `dpl_EBrGS8ErXLVqctTqikUNUFh4mwj3`, but no operator promotion occurred and
  the public production domains remain assigned to approved rollback deployment
  `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW` at commit
  `c52d947b0f70ad01c8dc6920ad49979ca17d25d2`.
- This merge verification did not access the production application or data,
  apply migrations, change RLS, or enable production-sensitive flags.

## Current Readiness

- Engineering completion estimate: `95%`.
- Production rollout readiness estimate: `78%`.
- Overall Vinea readiness estimate: `88%`.
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
2. Complete the new fail-closed controlled rollout checkpoint for merged main;
   the merge and ready artifact do not approve alias promotion or production
   smoke.
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
[`CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260807.md`](CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260807.md).
