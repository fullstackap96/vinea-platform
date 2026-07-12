# Release Candidate Protected Preview Smoke

Date: `2026-07-12`

Status: `PASS - REPAIRED PREVIEW HEALTH AND STAFF WORKSPACES VERIFIED`

## Approved Scope

- Environment: Vercel `Preview` only
- Deployment: `dpl_BGJQsoNhtTSN9sDxDStUer1AUCJL`
- Release commit: `9899f8e7fc6fed898e13a73f0beb522dcacd848b`
- Branch: `codex/release-candidate-20260711`
- Data target: existing approved non-production/shared-QA fixtures only
- Browser access: authenticated protected-preview Chrome session

No production environment was accessed. No migration, operational RLS change, provider send, import commit, duplicate merge, communication write, record mutation, export, AI call, Google Calendar mutation, or production-sensitive flag change occurred.

## Build And Deployment Evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| GitHub Actions | `PASS` | Run `29202547374`, job `Test, lint, and build`, completed successfully with security scan, install, dependency audit, tests, both typecheck scopes, evidence gates, lint, and build all successful |
| Vercel deployment | `PASS` | Exact release commit is `READY` in Preview; Vercel commit status is `success` |
| Preview service-role name | `PASS` | `SUPABASE_SERVICE_ROLE_KEY` is present for Production and Preview; no value was read or recorded |
| Preview app-origin name | `FAIL` | Vercel environment-variable search returned no result for `NEXT_PUBLIC_APP_URL`; no value was created or changed |

## Browser And Runtime Evidence

| Check | Result | Sanitized observation |
| --- | --- | --- |
| `/api/health` | `FAIL` | Authorized exact-deployment probe returned HTTP `503` with `ok: false`; `checks.env`, `checks.supabase`, `checks.parishes`, and `checks.schema` were false while optional provider checks remained true |
| Staff sign-in | `PASS` | Safe QA staff authentication reached `/dashboard` and rendered the authenticated shell |
| Active-parish switching | `PASS` | The same session switched from `St Ann` to the approved Parish B fixture and then to Parish A; selected labels and scoped data changed |
| Onboarding | `PASS` | `/dashboard/onboarding` rendered Parish B scope, setup progress, setup steps, and migration readiness guidance |
| Imports | `PASS` | `/dashboard/imports` rendered Parish B scope, reviewed-preview guidance, upload controls, and recent-import empty state; no file was selected or committed |
| People duplicate review | `PASS` | `/dashboard/people/duplicates` rendered Parish B scope and the staff-reviewed discovery empty state; `Find duplicates` and merge controls were not used |
| Communications Center | `PASS` | `/dashboard/communications` rendered Parish B scope and safe fixture rows, then changed to Parish A scope and Parish A rows after switching; no touchpoint was logged |
| Browser console | `PASS` | No warning or error entries were captured during the authenticated staff-workspace smoke |

## Health Diagnosis

The deployment build and authenticated staff reads prove that the configured Supabase URL, anon key, service-role key, staff credentials, and shared-QA fixture access are functional. The deployed health route fails before its database phase because Preview has no `NEXT_PUBLIC_APP_URL` variable. Vinea's canonical origin resolver and same-origin mutation guard already accept Vercel's trusted system deployment hostnames, so the health-only requirement was an inconsistent false-negative rather than a missing runtime capability.

Immutable follow-up commit `19b601df046de06a6a52f214e24adcdeba05b577` aligns health with that existing Vercel-origin policy. It accepts only exact HTTPS origins derived from trusted Vercel system variables, rejects credentials, paths, queries, fragments, and malformed hostnames, and does not change OAuth redirect behavior. A fresh Preview deployment and health rerun are still required before the release-candidate smoke can be marked fully green.

## Decision

- Engineering implementation: `PASS`
- Original exact-head CI: `PASS`
- Protected staff workspace smoke: `PASS`
- Repaired protected health/schema smoke: `PASS`
- Merge approval: `NOT GRANTED`
- Production access or deployment: `NOT GRANTED`
- Release-candidate Preview rollout evidence: `PASS`

## Repaired Preview Rerun

| Gate | Result | Sanitized evidence |
| --- | --- | --- |
| Implementation commit | `PASS` | `19b601df046de06a6a52f214e24adcdeba05b577` aligns health with Vinea's established trusted Vercel-origin policy |
| Evidence head | `PASS` | `d3daf3faa6ea3fc2f3d5de27dfb9e577cf3c6044` contains the reviewed implementation descendant and completed sanitized evidence |
| Source manifest | `PASS` | Aggregate `965D52668D4803437C25F22980FD1D741C612607D370AFF7896AD565D5EEADCA` binds `1,468` release-source files |
| Complete local release gate | `PASS` | All `15` checks passed in `304.9` seconds; zero secret findings, zero vulnerabilities, both TypeScript scopes, lint, `832` test files / `3,546` tests, and the credential-free `56`-page build |
| Clean-checkout CI | `PASS` | GitHub Actions run `29207351611` completed every security, test, typecheck, evidence, lint, and build step successfully against evidence head `d3daf3fa` |
| Vercel Preview | `PASS` | Exact-head deployment `dpl_DCLZ9b1vthZmGfvKZUKQLnwLYZP2` reached `READY` with target `Preview` and commit status `success` |
| `/api/health` | `PASS` | Exact-head runtime evidence recorded `GET /api/health 200`; the route can return `200` only after `ok`, Supabase, parishes, and schema readiness are true |
| Staff authentication | `PASS` | The approved safe QA staff session remained authenticated across every repaired-Preview page |
| Active parish | `PASS` | Communications changed from approved Parish A scope to Parish B scope and the Parish B selection persisted |
| Onboarding | `PASS` | Parish B setup checklist settled with the selected-parish label and setup steps |
| Imports | `PASS` | Parish B import workspace rendered; no file selection, preview, or commit occurred |
| Duplicate review | `PASS` | Parish B People duplicate-review workspace rendered; no discovery or merge occurred |
| Communications Center | `PASS` | Parish B Communications Center rendered; no touchpoint or follow-up write occurred |
| Browser console | `PASS` | No warning or error entries were captured during the repaired-Preview smoke |

## Required Follow-Up

1. Keep the release-candidate PR open for human review; do not merge without explicit approval.
2. Keep production rollout, production RLS, monitoring, exports, public-intake routing, customer-facing AI, and public trust claims behind their existing owner gates.
