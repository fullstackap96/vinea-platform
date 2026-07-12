# Next Proxy Staff Auth Non-Production QA Evidence Template - 2026-07-08

Current decision state: `NEXT PROXY STAFF AUTH NON-PRODUCTION QA NOT EXECUTED; RUNTIME AUTH BEHAVIOR UNCHANGED; PRODUCTION DASHBOARD AUTH CHANGES REMAIN NO-GO`

Use this template only after the product/security-approved non-production proxy staff-auth hardening has been implemented.

This template does not approve implementation, production deployment, production access, migrations, operational RLS changes, record mutation, exports, AI calls, storage access, signed URLs, communications, certificate generation, Google Calendar activity, or public trust claims.

## Environment Identity

| Field | Label-only value |
| --- | --- |
| Non-production app target | `[FILL: approved non-production app URL label only]` |
| Supabase target | `[FILL: approved non-production database/project label only]` |
| Browser/session operator | `[FILL: operator role label only]` |
| QA date/time | `[FILL: date/time and timezone]` |
| Build/version label | `[FILL: commit/build label only]` |

## Required Flag And Gate State

| Check | Expected | Result | Notes |
| --- | --- | --- | --- |
| Production deployment untouched | `PASS` | `[PASS / FAIL]` | No production deploy or production smoke |
| Production-sensitive flags untouched | `PASS` | `[PASS / FAIL]` | No production export/AI/public-intake/monitoring flags enabled |
| Runtime auth behavior change approved for non-production | `PASS` | `[PASS / FAIL]` | Approval source label only |
| Production auth rollout still blocked | `PASS` | `[PASS / FAIL]` | Production remains NO-GO |

## Fixture Labels

Use labels only. Do not include passwords, raw user ids, raw parish ids, tokens, database URLs, cookies, or private contact data.

| Fixture | Label |
| --- | --- |
| Allowlisted staff account | `[FILL: safe allowlisted staff label]` |
| Database-backed Parish A active staff account | `[FILL: safe active staff label]` |
| Database-backed Parish B active staff account | `[FILL: safe active staff label]` |
| Inactive staff account | `[FILL: safe inactive staff label]` |
| Unauthorized email account | `[FILL: safe unauthorized account label]` |
| Selected Parish A | `[FILL: parish fixture label]` |
| Selected Parish B | `[FILL: parish fixture label]` |

## Automated Checks

| Command | Expected | Result | Notes |
| --- | --- | --- | --- |
| `npm.cmd test -- lib\server\nextProxyConventionDoc.test.ts lib\server\nextProxyStaffAuthApprovalPacket.test.ts lib\server\nextProxyStaffAuthRuntimePreflight.test.ts` | `PASS` | `[PASS / FAIL]` | Proxy convention, approval packet, and source-level preflight still valid |
| `npm.cmd run check:production-gates` | `PASS with next-proxy staff auth gate linked` | `[PASS / FAIL]` | Production-sensitive gate remains locked |
| `npm.cmd run check:release-handoff` | `PASS with proxy auth locked gate listed` | `[PASS / FAIL]` | Release handoff recognizes auth gate |
| `npm.cmd run typecheck:all` | `PASS` | `[PASS / FAIL]` | TypeScript clean |
| `npm.cmd run lint -- --quiet` | `PASS` | `[PASS / FAIL]` | Lint clean |

## Browser Smoke Checks

Run only against the approved non-production app target.

| Step | Expected | Result | Evidence label |
| --- | --- | --- | --- |
| `/api/health` | `checks.schema: true` | `[PASS / FAIL]` | `[label only]` |
| Signed-out `/dashboard` visit | Redirects to `/login?next=/dashboard` | `[PASS / FAIL]` | `[label only]` |
| Allowlisted staff login | `/dashboard` loads | `[PASS / FAIL]` | `[label only]` |
| Parish A active database staff login | `/dashboard` loads | `[PASS / FAIL]` | `[label only]` |
| Parish B active database staff login | `/dashboard` loads even when Parish B is not the oldest parish | `[PASS / FAIL]` | `[label only]` |
| Inactive staff login | Redirects or blocks with staff unauthorized state | `[PASS / FAIL]` | `[label only]` |
| Unauthorized email login | Redirects to `/login?staff=unauthorized` or equivalent safe denial | `[PASS / FAIL]` | `[label only]` |
| Selected parish switch after login | Only authorized parishes appear and switching works | `[PASS / FAIL]` | `[label only]` |

## Forbidden Behavior Checks

| Forbidden behavior | Expected | Result | Notes |
| --- | --- | --- | --- |
| Production accessed | `NO` | `[PASS / FAIL]` | |
| Service-role client used inside `proxy.ts` | `NO` | `[PASS / FAIL]` | |
| `primary_parish_id()` called from `proxy.ts` after implementation | `NO` | `[PASS / FAIL]` | |
| Raw emails/passwords/tokens printed in evidence | `NO` | `[PASS / FAIL]` | |
| Database URLs or keys captured | `NO` | `[PASS / FAIL]` | |
| Operational RLS changed | `NO` | `[PASS / FAIL]` | |
| Records mutated beyond normal sign-in/session behavior | `NO` | `[PASS / FAIL]` | |
| Exports, AI, storage, signed URLs, communications, certificates, or Google Calendar touched | `NO` | `[PASS / FAIL]` | |

## Rollback Verification

| Check | Expected | Result | Notes |
| --- | --- | --- | --- |
| Rollback owner label recorded | `PASS` | `[PASS / FAIL]` | |
| Previous known-good proxy behavior can be restored by code rollback | `PASS` | `[PASS / FAIL]` | |
| Post-rollback dashboard auth smoke repeated | `PASS` | `[PASS / FAIL]` | |
| Production auth rollout remains blocked | `PASS` | `[PASS / FAIL]` | |

## Final QA Decision

- Non-production QA decision: `[PASS / BLOCKED / FAIL]`
- Production rollout decision: `NO-GO`
- Unresolved risks:
  - `[FILL: label-only risk or NONE]`
- Required follow-up before production:
  - Product-owner production approval
  - Security/data owner production approval
  - Production-safe staff fixtures
  - Production rollback owner
  - Production monitoring/support owner
  - Exact production approval prompt

## Sign-Off Labels

| Role | Name/label | Decision | Date |
| --- | --- | --- | --- |
| Product owner | `[FILL]` | `[APPROVE / BLOCK / NEEDS WORK]` | `[FILL]` |
| Security/data owner | `[FILL]` | `[APPROVE / BLOCK / NEEDS WORK]` | `[FILL]` |
| Engineering owner | `[FILL]` | `[APPROVE / BLOCK / NEEDS WORK]` | `[FILL]` |
| QA owner | `[FILL]` | `[APPROVE / BLOCK / NEEDS WORK]` | `[FILL]` |
