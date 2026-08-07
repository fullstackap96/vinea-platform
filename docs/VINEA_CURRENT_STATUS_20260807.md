# Vinea Current Status

Status date: 2026-08-07

This is the concise current-state register for Vinea. Current code, exact-head CI,
Vercel deployment metadata, and non-production Supabase evidence override older
percentage estimates or dated evidence files.

## Release Identity

- Working branch: `codex/release-integrity-20260720`.
- Published reviewed head: `b63bca33469a8e9bec80eb5be3d47f9b883e8ce6`.
- Local unpublished implementation commit:
  `eea043f68d29858761d29895313d88b8c417c281`.
- Local unpublished release-identity binding commit:
  `6a4d0da3`.
- The remote branch was re-fetched and remained at the published reviewed head;
  the local security scope is not yet published or Preview-verified.
- Draft pull request: GitHub PR `#8`, open and mergeable into `main`.
- Exact-head CI: GitHub Actions run `29819311074` passed.
- Exact-head Preview: Vercel deployment `dpl_7GN8YM279grMsFBHPUPi14LYkJTa` is
  `READY`, Preview-only, and has no production target.
- Protected Preview evidence passed health, staff sign-in, authorized parish
  switching, Onboarding, Imports history, People and Household duplicate-review
  pages, and Communications Center in read-only mode.
- Request Detail allow/deny Preview evidence remains incomplete because the
  approved Preview fixture selectors do not currently identify safe request rows.
- Recorded rollback evidence restored the production aliases to the approved
  rollback deployment at commit `c52d947b0f70ad01c8dc6920ad49979ca17d25d2`.
  This status review did not access production or change aliases.

## Current Readiness

- Engineering completion estimate: `94%`.
- Production rollout readiness estimate: `74%`.
- Overall Vinea readiness estimate: `86%`.
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

Implemented but not production-rollout-verified areas include the release-integrity
branch itself, production membership-aware RLS, production monitoring, production
AI, production exports, production public-intake routing, and broader sacramental
certificate/correction behavior.

## P0 Register

Completed on 2026-08-07: the dependency P0 moved Next.js and its aligned lint
configuration to `16.3.0`, refreshed the reviewed PostCSS and Sharp overrides,
and returned `npm audit` to zero known vulnerabilities. Both TypeScript scopes,
lint, the complete Vitest suite, and the 56-page production build pass locally.
This local remediation still requires publication, CI, and protected Preview
verification before it can replace the published exact-head evidence.

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

1. Prepare a non-applied, guarded migration-history repair plan and shared-QA
   function-privilege application packet. Completed locally on 2026-08-07;
   neither write is approved.
2. Reconcile PR `#8` with the approved dependency/database-security work, then
   rerun exact-head CI and protected Preview evidence. Local reconciliation and
   all 15 local release checks are complete; publication remains unapproved.
3. Complete production RLS, production monitoring, production-safe fixture, and
   controlled read-only smoke gates with explicit human approval.

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
