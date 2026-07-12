# Next Proxy Membership-Aware Staff Authorization Technical Approval

Status: `NEXT_PROXY_MEMBERSHIP_AUTH_IMPLEMENTED_AND_VERIFIED`

## Technical Approval Record

**Capability:** Next.js 16 dashboard proxy membership-aware staff authorization

**Environment tested:** Local automated/build verification plus an approved shared-QA-backed authenticated browser smoke recorded in `docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_20260711.md`

**Repository state/commit:** Base commit `f5ee00b75da36607ca4409a04c1d66e1ba10f4a7` plus the reviewed 2026-07-11 worktree; initial implementation file SHA-256 `FAA8EB198548732ECB328D5EB7DC858514F4EC0D5DED2C22647CA892B93E2E71`

**Date:** 2026-07-11, America/Chicago

**Acceptance criteria:**

- Keep the Next.js 16 `proxy.ts` convention and dashboard-only matcher.
- Authenticate through the request-bound Supabase anon client before authorization.
- Preserve configured allowlist behavior.
- Authorize database-backed staff through active membership scope across every authorized parish.
- Remove `primary_parish_id()` from `proxy.ts`.
- Use no service-role client, key, or direct unrestricted table scan.
- Deny inactive, missing-membership, missing-email, and lookup-error sessions generically.
- Preserve the explicit non-production-only development fallback.
- Preserve signed-out `next` redirects and authenticated unauthorized redirects.
- Keep production rollout gated until authenticated non-production smoke evidence exists.

**Evidence collected:**

- `proxy.ts` calls authenticated `current_staff_parish_ids()` and requires at least one returned active parish.
- `supabase/migrations/20260622170000_parish_memberships_foundation.sql` defines the function as `SECURITY DEFINER`, filters by `active = true` and the current `auth.uid()` or JWT email, revokes public execution, and grants execution only to `authenticated`.
- `lib/server/nextProxyStaffAuthBehavior.test.ts` covers signed-out, allowlisted, single-parish, multi-parish, no-membership, missing-email, lookup-error, and development fallback behavior.
- `lib/server/nextProxyStaffAuthRuntimePreflight.ts` rejects primary-parish, service-role, parish-table ordering, secret logging, and allow-before-auth patterns.
- The exact current proxy source is evaluated by the runtime preflight test.

**Security and tenancy result:** The proxy no longer chooses a global or oldest parish before staff authorization. Authorization is derived from the authenticated identity's active membership set. No service-role client is present. Selected-parish authorization remains enforced again by dashboard layout and route-level membership checks.

**Failure and rollback result:** Membership RPC errors fail closed in production and return the existing generic unauthorized redirect. Signed-out and unauthorized redirect contracts are preserved. Rollback is a code rollback; no schema or data rollback is needed.

**Known limitations:**

- Dedicated inactive and unauthorized browser accounts were unavailable; those exact fail-closed branches are executable automated tests and are identified explicitly in the dated QA evidence.
- Production monitoring/support and rollback owner labels are not yet attached to a rollout window.
- The membership function retains `staff_users` as a V1 compatibility source internally; this is scoped to the authenticated email and active rows and is not the removed proxy `primary_parish_id()` dependency.

**Approval decision:** Approved with constraints

**Approved scope:** Engineering, architecture, security-control, and release-candidate approval for the membership-aware proxy implementation in local/non-production validation. This is not approval to deploy the auth behavior to production.

**Reasoning:** Automated evidence proves the implementation removes the unsafe primary-parish dependency, keeps authentication and redirects ordered before dashboard access, uses the authenticated membership function, and fails closed. Approved shared-QA-backed browser evidence also confirms health, signed-out redirect, database-backed staff admission, and authorized Parish A/Parish B switching. Production owner, fixture, rollout, and monitoring approvals remain outstanding.

**Next required action:** Bind the dated evidence to an immutable release candidate, name the production owners and safe fixtures, then run the final production go/no-go review. Do not deploy before those gates pass.

## Rollout Boundary

Production rollout remains gated. No production deployment, production credential use, migration, RLS change, record mutation, communication, export, AI call, storage operation, or external integration action was authorized by this record.

No service-role client or secret is used in `proxy.ts`.
