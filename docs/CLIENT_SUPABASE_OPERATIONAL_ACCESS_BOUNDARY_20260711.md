# Client Supabase Operational Access Boundary - 2026-07-11

Decision: `CLIENT_SUPABASE_OPERATIONAL_ACCESS_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified as a repository regression guard.

## Boundary

Current source discovery confirms **no Client Component performs Supabase table, storage, function, or RPC access**. Operational reads and writes use server-owned Route Handlers or Server Actions with their existing authentication, active-parish, membership, ownership, validation, audit, and recovery boundaries.

The only approved browser Supabase imports are:

- the login page for staff authentication; and
- the dashboard shell for current-session logout.

Both approved files are tested to use `supabase.auth` only and to contain no table, storage, Edge Function, RPC, or service-role access.

The browser exception is limited to login and current-session logout.

## Why This Matters

Keeping operational data access on the server makes tenant authorization, safe errors, partial-success behavior, audit ownership, and future observability consistent. It also prevents an apparently small client-side feature from bypassing the reviewed active-parish boundaries.

## Verification Boundary

- No production access.
- No runtime behavior change.
- No database, storage, RPC, provider, communication, Calendar, AI, export, or certificate action.
- No migration or operational RLS change.
- No production-sensitive flag change.

Rollback is test/docs-only. Browser authentication behavior remains unchanged.
