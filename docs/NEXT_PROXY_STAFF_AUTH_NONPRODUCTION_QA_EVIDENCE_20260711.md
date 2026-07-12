# Next Proxy Staff Auth Non-Production QA Evidence - 2026-07-11

Completion marker: `NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_20260711`

Decision: `NONPRODUCTION_MEMBERSHIP_AUTH_QA_PASS_WITH_AUTOMATED_NEGATIVE_PATHS; PRODUCTION_ROLLOUT_REMAINS_NO_GO`

## Environment

| Field | Label-only value |
| --- | --- |
| App target | Local Vinea non-production app connected to approved shared QA |
| Supabase target | Approved Vinea shared-QA project |
| Operator | Codex engineering/QA operator |
| Date/time | 2026-07-11, America/Chicago |
| Build label | Base `f5ee00b75da36607ca4409a04c1d66e1ba10f4a7` plus reviewed worktree; `proxy.ts` SHA-256 `FAA8EB198548732ECB328D5EB7DC858514F4EC0D5DED2C22647CA892B93E2E71` |

No production target, production credential, migration, operational RLS change, storage operation, export, AI call, communication, certificate generation, or Google Calendar action was used.

## Gate State

| Check | Result | Evidence |
| --- | --- | --- |
| Production untouched | PASS | Approved shared-QA labels only |
| Production-sensitive flags unchanged | PASS | Production-gate checker remained locked |
| Membership-aware proxy implementation present | PASS | Authenticated `current_staff_parish_ids()` boundary |
| Service-role-free proxy | PASS | Source preflight and exact-source test |
| Production rollout blocked | PASS | No production deploy or smoke was authorized |

## Automated Evidence

| Check | Result |
| --- | --- |
| Membership behavior: signed-out, allowlist, single/multi-parish, no membership, missing email, RPC failure, development fallback | PASS |
| Exact-source runtime preflight and Next.js proxy convention | PASS |
| Login pre-hydration credential fallback hardening | PASS |
| TypeScript | PASS |
| Lint | PASS |
| Production-sensitive gate checker | PASS, all gates locked |
| Full Vitest regression | PASS |
| Production build | PASS |

## Live Non-Production Evidence

| Step | Result | Label-only evidence |
| --- | --- | --- |
| `/api/health` | PASS | HTTP 200; `checks.schema: true` |
| Signed-out `/dashboard` | PASS | Redirected to `/login?next=/dashboard` |
| Safe staff sign-in | PASS | Dashboard loaded through database-backed active membership |
| Parish A scope | PASS | Parish A selected and dashboard labels/data matched Parish A |
| Parish B scope | PASS | Same active multi-parish staff fixture selected Parish B and dashboard labels/data changed to Parish B |
| Return to Parish A | PASS | Safe QA session restored to Parish A |
| Inactive/missing membership denial | PASS (automated) | Empty active-membership result denies generically |
| Membership RPC failure | PASS (automated) | Production behavior fails closed |
| Missing-email denial | PASS (automated) | No membership lookup or dashboard access |

Dedicated inactive and unauthorized browser accounts were not available. Their exact fail-closed branches are covered by focused executable tests; production rollout remains gated until product/security owners decide whether dedicated production-safe negative fixtures are required.

## Login Hardening Found During QA

An initial local browser attempt reached the client form before hydration and demonstrated that an HTML form without an explicit method could fall back to GET. The transient local URL was cleared immediately, the one-use credential bridge was removed, and the login form was hardened to:

- render the submit control disabled until hydration completes;
- declare `method="post"` so an impossible native fallback cannot place fields in a query string; and
- preserve the existing Supabase `signInWithPassword` path after hydration.

Focused source tests and the repeated authenticated browser smoke passed after the fix. Evidence remains label-only. Rotating the non-production fixture password is recommended as routine QA hygiene before a later rollout rehearsal.

## Forbidden-Behavior Review

| Boundary | Result |
| --- | --- |
| `primary_parish_id()` in `proxy.ts` | ABSENT |
| Service-role key/client in `proxy.ts` | ABSENT |
| Direct parish-table ordering or unrestricted scan | ABSENT |
| Raw credentials, tokens, cookies, database URLs, or raw IDs in this evidence | ABSENT |
| Production access or production behavior change | ABSENT |
| Operational RLS or record mutation | ABSENT |

## Rollback And Decision

- Rollback mechanism: revert the scoped proxy/login code; no data or schema rollback is required.
- Rollback owner label: engineering release operator, pending named production owner.
- Non-production QA: `PASS_WITH_AUTOMATED_NEGATIVE_PATHS`.
- Engineering/QA technical sign-off: `APPROVE_FOR_CONTINUED_NONPRODUCTION_AND_RELEASE_CANDIDATE_REVIEW`.
- Product-owner production sign-off: `PENDING`.
- Security/data-owner production sign-off: `PENDING`.
- Production rollout: `NO-GO`.

## Remaining Production Gates

1. Named product, security/data, monitoring/support, and rollback owners.
2. Exact production-safe staff and negative-fixture labels.
3. Approved rollout window and immutable release candidate.
4. Pre/post health and dashboard smoke evidence from that release candidate.
5. Explicit production approval language.
