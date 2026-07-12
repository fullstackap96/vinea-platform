# public.parishes RLS Shared QA Promotion Evidence

Date: 2026-06-30

## Scope

- Target: shared QA only.
- Project ref: `gnfomgsuottcuueasfvi`.
- Migration: `supabase/migrations/20260630170000_enable_parishes_rls.sql`.
- Production touched: No.
- Disposable project touched: No.
- Runtime behavior changed: No.
- Operational RLS changed beyond `public.parishes`: No.
- Secrets printed or committed: No.

## Migration Verification

The guarded shared-QA runner `scripts/run-parishes-rls-shared-qa-promotion.mjs` completed successfully.

Verified final state:

- `public.parishes` has RLS enabled.
- `parishes_select_authorized_staff` exists.
- Policy roles include `authenticated` and `service_role`.
- Staff reads remain scoped through `public.is_authorized_for_parish(id)`.
- Server-side health/admin reads have an explicit `auth.role() = 'service_role'` bypass.
- `remainingRlsDisabledTablesAfter` is empty.

## Health and Staff Smoke

Attempted checks:

- Remote non-production `/api/health`: not reachable from this session.
- Local `/api/health` against `.env.local`: reachable but returned `503`.
- Health response body: `checks.env=true`, `checks.supabase=true`, `checks.parishes=false`, `checks.schema=false`, `error="parishes"`.
- Direct Supabase REST check using the app-configured `SUPABASE_SERVICE_ROLE_KEY`: returned `401 Unauthorized`.

Conclusion:

The database migration is applied and verified in shared QA, but app-level `/api/health`, staff sign-in, and selected parish switching cannot be honestly confirmed until the shared-QA app environment has valid Supabase API keys.

## Required Follow-Up

Set valid shared-QA app credentials for project `gnfomgsuottcuueasfvi`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Then rerun:

- `/api/health` and confirm `checks.schema: true`.
- Safe staff sign-in.
- Selected parish switcher smoke.

## What Changed Plain English

The database safety fix was successfully applied to the shared QA database. The remaining problem is not the database anymore; it is that the local app is using Supabase API keys that the shared QA project rejects. Once those keys are corrected, the health check and staff login smoke can be rerun.
