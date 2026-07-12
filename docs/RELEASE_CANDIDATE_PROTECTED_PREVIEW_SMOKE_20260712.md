# Release Candidate Protected Preview Smoke

Date: `2026-07-12`

Status: `PARTIAL PASS - STAFF WORKSPACES PASSED; HEALTH CONFIGURATION BLOCKED`

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
- Exact-head CI: `PASS`
- Protected staff workspace smoke: `PASS`
- Protected health/schema smoke: `FAIL - PREVIEW CONFIGURATION`
- Merge approval: `NOT GRANTED`
- Production access or deployment: `NOT GRANTED`
- Release-candidate rollout evidence: `PARTIAL`

## Required Follow-Up

1. Run the complete local release gate against implementation commit `19b601df046de06a6a52f214e24adcdeba05b577`.
2. Push the implementation and evidence descendants to the release-candidate branch without merging.
3. Wait for exact-head CI and a fresh non-production Preview deployment.
4. Confirm `/api/health` returns HTTP `200` with `checks.schema: true` without adding a duplicated app-origin variable.
5. Recheck staff sign-in, parish switching, onboarding, imports, duplicate review, and Communications Center without performing writes.
6. Keep merge and production rollout behind separate explicit approval.
