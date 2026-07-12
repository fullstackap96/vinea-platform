# Next Proxy Staff Auth Multi-Parish Approval Packet - 2026-07-08

Current decision state: `NEXT PROXY STAFF AUTH MULTI-PARISH HARDENING NOT APPROVED; AUTHORIZATION BEHAVIOR UNCHANGED; PRODUCTION RLS AND PRODUCTION-SENSITIVE GATES REMAIN NO-GO`

## Purpose

Prepare an explicit product/security approval step before changing the dashboard `proxy.ts` staff-auth guard.

The current Next.js 16 proxy correctly protects `/dashboard/:path*`, but its database-backed authorization compatibility path still calls `primary_parish_id()` and checks `staff_users` inside that single parish. That is safer than bypassing auth, but it is not the final multi-parish authorization shape.

Because changing proxy authorization affects who can reach the staff dashboard, the runtime change must not be made silently.

## Current Behavior

- `proxy.ts` uses Supabase Auth to load the current user.
- `STAFF_ALLOWLIST_EMAILS` still grants staff access.
- If the email is not allowlisted, the proxy calls `primary_parish_id()`.
- The proxy then checks `staff_users` for one active row matching that email inside that primary parish.
- Development fallback still applies when staff access is not configured and the app is not running in production.

## Proposed Future Runtime Change

Implementation should update only `proxy.ts` and focused tests unless review discovers a small helper is needed.

The future implementation should:

- Keep the Next.js 16 `export async function proxy(request: NextRequest)` convention.
- Keep `config.matcher = ['/dashboard/:path*']`.
- Keep Supabase Auth user loading before dashboard access.
- Keep `STAFF_ALLOWLIST_EMAILS` behavior unchanged.
- Use the request-scoped Supabase client and the authenticated user context.
- Prefer membership-aware authorization by checking active staff membership or active `staff_users` rows for the current email across authorized parish rows.
- Avoid `primary_parish_id()` in `proxy.ts`.
- Avoid `createSupabaseServiceRoleClient()` and any service-role key in `proxy.ts`.
- Preserve the existing unauthenticated redirect to `/login?next=...`.
- Preserve the existing unauthorized redirect to `/login?staff=unauthorized`.
- Preserve development fallback only when not production and staff access is not configured.
- Fail closed if the membership/staff lookup errors unexpectedly.

## Required Approval Gates

Before implementation:

- Product owner approves the dashboard-auth behavior change.
- Security/data owner approves removing the proxy `primary_parish_id()` compatibility lookup.
- Engineering owner confirms the implementation follows the bundled Next.js 16 proxy guidance in `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.
- QA owner confirms safe non-production staff fixtures exist for:
  - allowlisted staff login
  - database-backed staff login in Parish A
  - database-backed staff login in Parish B
  - inactive staff denial
  - unauthenticated redirect
  - unauthorized email redirect

## Required Tests

Future tests should prove:

- `proxy.ts` exports `proxy`, not `middleware`.
- The `/dashboard/:path*` matcher remains unchanged.
- `primary_parish_id` is not called from `proxy.ts`.
- `createSupabaseServiceRoleClient` is not imported by `proxy.ts`.
- Allowlisted staff remain authorized.
- Active staff in a non-oldest parish can reach the dashboard.
- Inactive staff are denied.
- Unauthorized email redirects to `/login?staff=unauthorized`.
- Unauthenticated users redirect to `/login` with the original `next` path.
- Development fallback remains non-production only.

## Source-Level Preflight Tests

Before runtime proxy hardening is implemented, keep the source-level preflight scaffold in:

- `docs/NEXT_PROXY_STAFF_AUTH_RUNTIME_PREFLIGHT_PLAN_20260708.md`
- `lib/server/nextProxyStaffAuthRuntimePreflight.ts`
- `lib/server/nextProxyStaffAuthRuntimePreflight.test.ts`

The preflight must prove any future implementation keeps the Next.js 16 proxy convention and dashboard-only matcher, and keeps Supabase Auth user loading, staff allowlist, membership-aware staff scope, safe unauthenticated and unauthorized redirects, development fallback, and fail closed behavior before dashboard access is allowed.

It must also reject future source that includes no `primary_parish_id()` removal boundary violations, no service-role client, no service-role key, no first-parish lookup through `parishes`, and no raw user/email/cookie logging.

## Manual QA Checklist

Run only in an explicitly approved non-production environment:

1. Confirm `/api/health` returns `checks.schema: true`.
2. Sign in as an allowlisted staff account and open `/dashboard`.
3. Sign out.
4. Sign in as a database-backed Parish A staff account and open `/dashboard`.
5. Switch selected parish if the account has multiple memberships.
6. Sign out.
7. Sign in as a database-backed Parish B staff account that is not scoped to the oldest parish and open `/dashboard`.
8. Attempt sign-in with an inactive staff fixture and confirm the unauthorized state.
9. Attempt `/dashboard` while signed out and confirm redirect to `/login?next=/dashboard`.
10. Confirm no production data, migrations, operational RLS changes, Google Calendar data, exports, AI calls, storage, signed URLs, communications, certificate generation, or public trust claims are involved.

Record the future run in `docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260708.md` or a dated copy of that template. Evidence must remain label-only and must not include passwords, raw user ids, raw parish ids, database URLs, keys, cookies, tokens, private contact data, or production data.

## Rollback

Rollback is code rollback only:

- Revert the proxy authorization change.
- Redeploy the previous known-good build.
- Re-run the flagless dashboard auth smoke.

No database rollback is expected because this approval packet does not authorize migrations or data mutation.

## Production NO-GO Boundary

This packet does not approve production deployment of the proxy auth change.

Production remains `NO-GO` until:

- non-production implementation passes tests,
- non-production browser smoke passes,
- production-safe staff fixtures are selected,
- a rollback owner and monitoring owner are named,
- the exact production approval prompt is provided separately.

## Exact Future Approval Language

Use this exact approval language only when ready:

`Approve non-production implementation of the Next.js proxy staff-auth multi-parish hardening. Update proxy.ts so dashboard authorization no longer calls primary_parish_id(), does not use service-role clients, preserves allowlist and development fallback behavior, authorizes active staff across authorized parish rows, preserves unauthenticated and unauthorized redirects, adds focused tests, runs checks, updates docs, and keeps production deployment NO-GO until separate approval.`
