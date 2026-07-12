# Release Candidate Technical Approval - 2026-07-11

Completion marker: `RELEASE_CANDIDATE_TECHNICAL_APPROVAL_20260711`

## Technical Approval Record

**Capability:** Vinea repository integrity and local release-candidate readiness

**Environment tested:** Local Windows repository; production-clean child process; no external services

**Repository state/commit:** `codex/release-candidate-20260711` at `495cb1dda70a039116927f89b818ffe0a195ee2a`; initial consolidation commit `d1a7bab20145ff2f50100de577be151d430c1ee4`

**Date:** 2026-07-11

**Post-approval hardening addendum:** Commit `037c5c964cb233ed6305dd3393cb9907d050286b` updates the release-source aggregate to `4865365E244756008022788AD375698900390857D1138899A6F3132A2AF24A95` across the same `1,439` source files. The local release runner now forces its final build to be credential-free even when `.env.local` exists. The full 12-command local runner passed in 301.5 seconds, the credential-free Next.js 16.2.10 build generated 56 pages, and the repository secret scan covered 2,097 files with zero findings. GitHub Actions run `29178995424` passed all 22 steps against this exact commit, and matching non-production Vercel preview `dpl_DocXHSgUah5T87sC5KmoCUz2tidL` is `READY`. This addendum does not expand the constrained approval scope or authorize merge/production.

**Local/CI parity addendum:** Commit `e6ec46541ea1eeb3a84a8530e97454147e2af28a` updates the source aggregate to `B9511A0D7CA4E38ADC0D46171382448B8A10FC45E53FF846020667C621E92FD0` and expands the one-command local gate to include secret scanning, dependency security, and completed-evidence validation. The corrected full 15-command run passed in 299.9 seconds after an initial stale-test failure was fixed and rerun from the beginning. GitHub Actions run `29179833235` passed against the exact commit, and matching non-production Vercel preview `dpl_HEPmAhSzomhL6c7iiHjXokgHCd26` is `READY`. This addendum does not authorize merge, production, or any separately gated capability.

**Bounded health-probe addendum:** Commit `1f8155f65885244bc511c0ac3692a340421c592c` updates the source aggregate to `C8B08F87AE5ED34D6B097F33B2F67F7ABBEC80D8C8349918081E17DB8CA9A709` and applies one eight-second abort deadline to the complete Supabase health phase. Stalled database work now returns a controlled unhealthy response while production details remain redacted. Focused tests, the complete local release gate, GitHub Actions run `29180435998`, and matching non-production Vercel preview `dpl_H9awFsMtrSZRouoepkUeo4ucjgJY` passed. This addendum does not authorize merge, production, or any separately gated capability.

**Acceptance criteria:** Exact reviewed source scope; secret-free commit; immutable source identity; empty Git index; commit-aware scope verification; production-sensitive environment residue refused; RLS, monitoring, CSP, trust-claim, production-gate, and release-handoff evidence internally consistent; both TypeScript scopes, lint, complete tests, and Next.js production build pass.

**Evidence collected:**

- Release source aggregate: `07E172B228A7E055038454DE785178C0FF42D218A1BF4F94D3A0B2F29E44083B` across `1439` source files.
- Initial mechanically reviewed scope: `1801` unique candidate paths, `57` excluded paths, four intentional deletions, zero missing paths, and zero unexpected staged paths.
- Repository secret scan: `PASS`; local scan findings `0`; GitHub clean-checkout scan findings `0`; no secret values printed.
- Staged whitespace check: `PASS` after normalizing the files identified by Git.
- Full local runner: `LOCAL_RELEASE_READINESS_PASSED`; all `12` commands completed.
- Full Vitest: `809` test files and `3441` tests passed.
- TypeScript production/source and all-file scopes: `PASS`.
- Full ESLint output: `PASS`; zero errors and zero warnings.
- Next.js `16.2.10` optimized production build: `PASS`; `56` static pages generated and all App Router routes compiled.
- Evidence checkers: RLS `34/34`, monitoring `20/20`, production gates `15/15`, CSP `8/8`, trust areas `11`, release handoff `141/141`; findings `0`.
- GitHub Actions: run `29178125486`, run number `6`, conclusion `success`, exact head `495cb1dda70a039116927f89b818ffe0a195ee2a`.
- Vercel preview: deployment `dpl_CmCcXTYqyz8D55w3KgA2ZkwB6wbu`, state `READY`, target `null` (non-production).
- Credential-free build boundary: OpenAI and browser Supabase clients initialize only when an actual runtime operation requests them; CI build requires no provider credentials.

**Security and tenancy result:** Repository secret scan passed; membership-aware proxy and active-parish regression guards passed in the complete test suite; all production-sensitive runtime flags and public claims remained disabled. This record does not replace production RLS smoke evidence.

**Failure and rollback result:** Guarded staging and successive remote runs failed closed while duplicate/rename, cross-platform hash, clean-checkout, lint-parity, and import-time credential defects were found. No failed run was waived. OpenAI and Supabase browser clients were made lazy, and run `29178125486` then passed from a clean Linux checkout. Local rollback remains ordinary branch deletion or Git revert after review; no production rollback was exercised.

**Known limitations:** Fifty-seven intentionally excluded sales, CSV, generated, binary, temporary, and unrelated artifacts remain outside the release candidate. Preview `/api/health` and authenticated staff smoke remain blocked by Vercel Deployment Protection; the protected endpoint returned a 302 SSO redirect. Production smoke, monitoring, RLS rollout, exports, public-intake routing, customer-facing AI, public trust claims, and final production cutover were not approved or executed.

**Approval decision:** Approved with constraints

**Approved scope:** Engineering, architecture, QA, release-candidate, rollback-readiness, remote-CI, and non-production preview-build approval for commit `495cb1dda70a039116927f89b818ffe0a195ee2a`. Approved to advance to authenticated preview health/staff smoke and human branch review. Not approved for merge, production deployment, or any gated production-sensitive capability.

**Reasoning:** The exact committed source is reproducibly identified, contains no detected repository secrets, passes every local release command, and preserves all sensitive no-go gates. The initial failed checks produced concrete tooling fixes and were rerun from a clean start, demonstrating fail-closed behavior rather than waived evidence.

**Next required action:** Use an approved authenticated Vercel preview-access path to verify `/api/health` and isolated staff/browser smoke, then open the release-candidate branch for human review. Production cutover still requires named accountable owners, exact production-safe fixtures/window, and explicit production approval for each sensitive gate.

## Safety Boundary

No production access, migration application, operational RLS change, record mutation, provider call, email send, Google Calendar action, export, AI call, storage access, signed URL creation, certificate generation, production flag enablement, production deployment, public claim, or customer communication occurred during this approval. A branch push and protected non-production preview build did occur.
