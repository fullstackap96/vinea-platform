# Release Integrity Exact-Head Preview Evidence

Evidence date: 2026-08-07

## Scope

- Branch: `codex/release-integrity-20260720`
- Exact reviewed head: `a92f6b82a26ef159b8e5e159b1db15594bca7e0f`
- Draft pull request: GitHub PR `#8`
- GitHub Actions run: `31211255259`
- Non-production Vercel deployment:
  `dpl_4XR99w6RUyC6MwsQq5mUZjPZdG8p`
- Deployment target: Preview only; no production target

This evidence records publication, clean-checkout CI, deployment identity, and a
small protected-Preview read-only smoke. It does not authorize merge or any
production-sensitive action.

## Publication And CI

- The remote branch was fetched immediately before publication and still pointed
  to the approved base `b63bca33469a8e9bec80eb5be3d47f9b883e8ce6`.
- Exactly three reviewed commits advanced the branch to the exact head above.
- The push used an exact expected-base lease and completed successfully.
- PR `#8` remained open, draft, unmerged, and mergeable after publication.
- GitHub Actions run `31211255259` completed with `success`.
- The successful job covered repository secret scanning, dependency auditing,
  tests, both TypeScript scopes, release and production-boundary evidence gates,
  lint, and the Next.js production build.

## Preview Identity

- Vercel reported the exact deployment as `READY`.
- Deployment metadata bound it to the exact reviewed head and draft PR `#8`.
- The deployment had no production target and the branch Preview alias remained
  non-production.
- Authenticated deployment-protection access opened the Vinea landing page.

## Protected Preview Read-Only Smoke

All evidence below uses labels and pass/fail outcomes only. No credentials,
request identifiers, or parish data were recorded.

| Check | Result |
| --- | --- |
| `/api/health` returns `ok: true` | PASS |
| Health environment, Supabase, parish, schema, email, and Google OAuth checks | PASS |
| Safe QA staff authentication | PASS |
| Authorized Parish A selection | PASS |
| Same-parish request detail fixture loads | PASS |
| Cross-parish request fixture denies generically | PASS |
| Cross-parish response avoids request data | PASS |
| Record mutation | NOT PERFORMED |
| Production access | NOT PERFORMED |

## Health Verification

The browser automation client could not render the protected JSON endpoint
directly, so the supported authenticated `vercel curl` path was used without
disabling deployment protection. The exact Preview returned `ok: true`, with
`env`, `supabase`, `parishes`, `schema`, `resend`, and `googleOAuth` all `true`.
No secret or raw response identifier was recorded.

## Post-Publication Local Release Contract

After the Preview smoke, the repository's complete 15-command local release
runner passed against the evidence-update working tree. The run used an isolated
process with the previously configured non-production AI-summary QA gates removed
from that process only; no saved environment value was changed.

- Repository secret scan: PASS; no findings.
- Dependency audit: PASS; zero known vulnerabilities.
- Release environment: PASS; production-sensitive runtime flags disabled in the
  verification process.
- RLS, monitoring, production-gate, CSP, trust-center, handoff, and local-evidence
  boundary checks: PASS; their production approvals remain false.
- TypeScript: PASS for both configured scopes.
- ESLint: PASS.
- Vitest: PASS; 879 files and 3,775 tests.
- Next.js 16.3.0 production build: PASS; 56 pages generated.

The first release-runner attempt correctly refused inherited non-production AI QA
flag residue. The final pass demonstrates the intended fail-closed gate and the
clean release environment; it does not approve those AI gates for production.

## Safety Result

No merge, production deployment, production data access, migration, RLS change,
storage access, signed URL creation, export, email, Calendar call, AI call,
certificate generation, record mutation, or production-sensitive flag change
occurred.

## Decision

**PASS** for exact-head publication, CI, deployment identity, health, protected
Preview authentication, authorized parish selection, and Request Detail
allow/deny behavior.

Production and all separately locked capabilities remain `NO-GO`.
