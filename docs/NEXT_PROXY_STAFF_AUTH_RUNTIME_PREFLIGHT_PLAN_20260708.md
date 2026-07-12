# Next Proxy Staff Auth Runtime Preflight Plan - 2026-07-08

Current decision state: `SOURCE PREFLIGHT PREPARED; PROXY AUTH RUNTIME HARDENING NOT IMPLEMENTED; PRODUCTION DASHBOARD AUTH CHANGES REMAIN NO-GO`

## Purpose

Prepare source-level tests for the future approved Next.js proxy staff-auth hardening implementation.

The future runtime change is sensitive because it controls who can reach `/dashboard`. This plan does not approve or implement that change. It only defines the source-level checks that future code must satisfy before non-production QA can begin.

## Required Source-Level Preflight Tests

Future implementation work must keep and pass:

- `lib/server/nextProxyStaffAuthRuntimePreflight.ts`
- `lib/server/nextProxyStaffAuthRuntimePreflight.test.ts`

The preflight must validate that any future `proxy.ts` authorization implementation keeps the dashboard-only matcher present and keeps these authorization gates before dashboard access is allowed:

- Next.js 16 proxy convention
- Supabase Auth user loading
- staff allowlist
- membership-aware staff scope
- safe unauthenticated and unauthorized redirects
- development fallback
- fail closed behavior

The preflight must reject future proxy source that includes:

- no `primary_parish_id()` compatibility lookup
- no service-role client
- no service-role key
- no first-parish lookup through `parishes`
- no raw user/email/cookie logging

## Future Implementation Boundary

The future approved implementation may update `proxy.ts` and focused tests, and may add a small helper only if it keeps the root `proxy.ts` file aligned with the bundled Next.js 16 Proxy guidance.

Future implementation must not:

- access production,
- apply migrations,
- change operational RLS,
- mutate records,
- enable production-sensitive flags,
- touch Google Calendar data,
- run exports,
- call AI,
- access storage,
- create signed URLs,
- send communications,
- generate certificates,
- make public trust claims.

## Required Non-Production Evidence

After future implementation, record the run in:

- `docs/NEXT_PROXY_STAFF_AUTH_NONPRODUCTION_QA_EVIDENCE_TEMPLATE_20260708.md`

Evidence must remain label-only. Do not record passwords, raw user ids, raw parish ids, database URLs, keys, cookies, tokens, private contact data, or production data.

## Production NO-GO Boundary

Production dashboard auth rollout remains `NO-GO` until a separate production approval packet names production-safe staff fixtures, rollback owner, monitoring/support owner, production smoke steps, and exact approval language.
