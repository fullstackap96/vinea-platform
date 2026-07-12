# Next Proxy Staff Auth Current Compatibility Boundary - 2026-07-08

Current decision state: `SUPERSEDED 2026-07-11 BY MEMBERSHIP-AWARE PROXY IMPLEMENTATION; RETAINED AS HISTORICAL EVIDENCE`

> This document records the former compatibility boundary. It is not the current runtime specification. See `docs/NEXT_PROXY_STAFF_AUTH_TECHNICAL_APPROVAL_20260711.md`.

## Purpose

Document and guard the current `proxy.ts` dashboard staff authorization behavior until the approved multi-parish hardening implementation is allowed.

This is not the final desired authorization shape. It is a production-readiness guardrail that makes the current compatibility path explicit so future changes are intentional.

## Historical Source Boundary

Before the 2026-07-11 hardening, `proxy.ts` was guarded to:

- use the Next.js 16 `export async function proxy(request: NextRequest)` convention,
- protect only `/dashboard/:path*`,
- load the Supabase Auth user before dashboard access,
- redirect signed-out users to `/login` with the original `next` path,
- preserve `STAFF_ALLOWLIST_EMAILS` behavior,
- keep the known `primary_parish_id()` compatibility lookup explicit,
- check active `staff_users` rows for the normalized staff email,
- preserve the non-production development fallback through `staffAccessNotConfiguredAllowsDev()`,
- redirect unauthorized users to `/login?staff=unauthorized`,
- avoid service-role clients and service-role keys inside `proxy.ts`.

## Historical Executable Behavior Coverage

The former behavior was covered by:

- `lib/server/nextProxyStaffAuthBehavior.test.ts`
- `lib/server/nextProxyStaffAuthCurrentBoundary.test.ts`

The behavior test verifies:

- signed-out dashboard visits redirect to `/login` with the original `next` path,
- allowlisted staff can reach `/dashboard` without the database staff fallback,
- database-backed staff use the explicit `primary_parish_id()` compatibility path,
- unauthorized authenticated users redirect to `/login?staff=unauthorized`,
- the non-production development fallback works only when staff access is not configured.

## Completed Hardening Boundary

The `primary_parish_id()` compatibility lookup was removed through the approved implementation path:

- `docs/NEXT_PROXY_STAFF_AUTH_MULTI_PARISH_APPROVAL_PACKET_20260708.md`
- `docs/NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_PLAN_20260708.md`
- `docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260708.md`

The implementation is locally verified. Production dashboard auth rollout remains `NO-GO` until the non-production authenticated smoke and separate production approval are complete.
