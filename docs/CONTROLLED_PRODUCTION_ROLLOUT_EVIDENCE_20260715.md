# Controlled Production Rollout Evidence - 2026-07-15

Status: `STOPPED_PRE_PROMOTION`

Decision: `ROLLBACK_NO_OP`

This record contains control-plane identifiers, approved fixture labels, and pass/fail outcomes only. It must not contain credentials, tokens, customer content, parishioner details, raw production record identifiers, private documents, or raw audit metadata.

## Approved Boundary

| Item | Approved value |
| --- | --- |
| Production app | `https://vineaplatform.com` |
| Exact main commit | `f134b598308ddd78b5b6b81ee447bf5b1fb15937` |
| Candidate deployment | `dpl_4xKH41v7z7dHTqwQEdTjfXbhzrqG` |
| Rollback deployment | `dpl_FuhBvEBrbZjNzQ6dLp4qHbi5j7UW` |
| Rollout window | `July 15, 2026, 8:00 PM-8:30 PM America/Chicago` |
| Observation end | `July 15, 2026, 9:00 PM America/Chicago` |
| Family portal | `NOT_INCLUDED` |

## Owner And Channel Labels

| Responsibility | Approved label |
| --- | --- |
| Product | `Alex Perez - Product Owner` |
| Engineering rollout | `Alex Perez - Engineering Rollout Owner` |
| Security/data | `Alex Perez - Security/Data Owner` |
| QA | `Alex Perez - QA Owner` |
| Monitoring | `Alex Perez - Monitoring Owner` |
| Support | `Alex Perez - Support Owner` |
| Rollback | `Alex Perez - Rollback Owner` |
| Evidence | `Alex Perez - Evidence Owner` |
| Monitoring channel | `Vercel dashboards and controlled rollout Codex task` |
| Support channel | `Controlled rollout Codex task` |
| Evidence location | `Vinea controlled rollout repository evidence record` |

## Approved Read-Only Fixture Labels

- `Production smoke staff account - password not recorded`
- `Production smoke authorized parish A`
- `Production smoke authorized parish B`
- `Production smoke same-parish request - approved read-only fixture`
- `Production smoke cross-parish request - generic denial expected`
- `Production smoke Parish A Onboarding view - read-only`
- `Production smoke Parish A Imports history - read-only, no upload or commit`
- `Production smoke Parish A People duplicate review page - read-only, no discovery or merge`
- `Production smoke Parish A Household duplicate review page - read-only, no discovery or merge`
- `Production smoke Parish A Communications Center - read-only, no touchpoint, follow-up, email, or SMS mutation`

## Pre-Window Evidence

Captured at `2026-07-15 06:52 America/Chicago`. No production alias, application route, data, setting, migration, RLS policy, or feature flag was changed or accessed during this pre-window control-plane review.

| Check | Result | Sanitized evidence |
| --- | --- | --- |
| Explicit approval matches prepared prompt | `PASS` | Exact commit, deployment pair, window, owners, fixtures, exclusions, and stop criteria were supplied. |
| Remote `main` identity | `PASS` | Remote `main` equals the approved exact commit. |
| Required commit status | `PASS` | GitHub reports the Vercel status check as `success` for the approved exact commit. |
| Candidate identity | `PASS` | Candidate is `READY`, belongs to the Vinea project, and carries the approved exact commit. |
| Rollback identity | `PASS` | Rollback deployment is `READY` and remains the currently served production alias target. |
| Production alias before window | `PASS` | `vineaplatform.com` resolves through the Vercel control plane to the approved rollback deployment. |
| Locked feature gates | `PASS` | Production environment-variable names contain no separately locked `VINEA_*` runtime gate variables. Values were not read or printed. |
| Vercel operator credentials | `PASS` | Required Vercel credential variables are present by name only. Values were not read or printed. |
| Staff smoke session | `PENDING_WINDOW` | Use only the approved production-safe staff fixture or an already authenticated approved browser session. Stop if unavailable. |
| Fixture selection | `PENDING_WINDOW` | Confirm only the approved labels in the authenticated staff UI. Stop if a safe fixture cannot be identified without exposing private data. |
| Promotion | `NOT_RUN` | Scheduled for the approved window only. |

## Window Execution Evidence

Complete only during the approved rollout and observation window.

| Step | Result | Sanitized evidence |
| --- | --- | --- |
| Window and owner availability recheck | `PASS` | Execution began inside the approved promotion window; the approved owner and channel labels were unchanged. |
| Remote main and deployment identity recheck | `PASS` | Remote `main`, candidate identity, candidate commit, and rollback identity matched the approval; both deployments were `READY`. |
| Required commit status recheck | `PASS` | GitHub reported the Vercel status check as `success` for the exact approved commit. |
| Locked production gate name/scope recheck | `PASS` | Production variable names contained no separately locked `VINEA_*` runtime gate variables; values were not read or printed. |
| Approved staff-smoke session prerequisite | `FAIL` | No approved authenticated browser session was available. Dedicated `PRODUCTION_SMOKE_*` credential and fixture-selector variables were absent by name only. Existing QA variables were not reused. |
| Candidate promotion | `NOT_RUN` | Fail-closed stop occurred before promotion. |
| Production alias points to candidate | `NOT_RUN` | Candidate never received production traffic. |
| `/api/health` HTTP 200 | `NOT_RUN` | Production application smoke was not allowed after the pre-promotion stop. |
| `/api/health` `checks.schema: true` | `NOT_RUN` | Production application smoke was not allowed after the pre-promotion stop. |
| Safe staff sign-in | `NOT_RUN` | Required approved session was unavailable. |
| Authorized parish A/B switching | `NOT_RUN` | Required approved session was unavailable. |
| Same-parish request read | `NOT_RUN` | Required approved session was unavailable. |
| Cross-parish request generic denial | `NOT_RUN` | Required approved session was unavailable. |
| Onboarding read-only view | `NOT_RUN` | Required approved session was unavailable. |
| Imports history read-only view | `NOT_RUN` | Required approved session was unavailable. |
| People duplicate review read-only view | `NOT_RUN` | Required approved session was unavailable. |
| Household duplicate review read-only view | `NOT_RUN` | Required approved session was unavailable. |
| Communications Center read-only view | `NOT_RUN` | Required approved session was unavailable. |
| Forbidden-action review | `PASS` | No migration, RLS, flag, provider, export, storage, settings, routing, family-portal, or record action occurred. |
| Runtime monitoring observation | `NOT_RUN` | No candidate traffic existed to observe. |
| Rollback target remains ready | `PASS` | Vercel reported the rollback deployment `READY`. |

## Stop And Rollback Record

| Field | Value |
| --- | --- |
| Stop criterion observed | `Approved staff-smoke session/credentials and fixture selectors unavailable` |
| Rollback invoked | `NO_OP` |
| Rollback control-plane result | `No command required because promotion never occurred` |
| Production alias after decision | `Approved rollback deployment remains live` |

## Final Decision

Final outcome: `ROLLBACK`

Decision recorded at `2026-07-15 20:03 America/Chicago`. This is a no-op rollback decision: the fail-closed prerequisite check stopped execution before promotion, and Vercel control-plane verification confirmed that `vineaplatform.com` remained on the approved rollback deployment. No production application route or production data was accessed.

## Forbidden Actions Confirmation

During this rollout, do not apply migrations, change operational RLS, change settings or routing, enable production-sensitive flags, send communications, run imports or merges, access storage or signed URLs, call Google Calendar or AI, run exports, generate certificates, mutate records, test family portal tokens, or make public trust claims.
