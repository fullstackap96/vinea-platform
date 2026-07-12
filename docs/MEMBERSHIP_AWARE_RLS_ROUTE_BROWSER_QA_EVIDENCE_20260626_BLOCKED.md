# Membership-Aware RLS Route/Browser QA Evidence - Blocked 2026-06-26

Status: Blocked before route/browser execution. No app server was started against shared QA, no migrations were applied, and no operational RLS changes were applied.

Related docs:

- `docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md`
- `docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md`
- `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
- `docs/sql/membership_aware_operational_rls_rollback_draft.sql`

## Requested Gate

Perform the final non-production promotion-readiness gate for membership-aware operational RLS:

- Capture `/api/health`.
- Route/browser QA request detail loading.
- Route/browser QA staff request document access.
- Verify signed URL access remains mediated by server routes.
- Verify direct Supabase Storage privacy.
- Verify family portal safe-data behavior.
- Do not apply operational RLS to shared QA or production.

## Safety Confirmation

- Production touched: `No`
- Shared QA project `gnfomgsuottcuueasfvi` touched by this gate: `No`
- Approved reusable disposable project `kikqtorplsswepqitjys` modified by this gate: `No`
- App server started: `No`
- Browser QA performed: `No`
- Runtime public intake routing changed: `No`
- Runtime `/api/health` changed: `No`
- `supabase/migrations` changed: `No`
- Operational RLS applied to shared QA or production: `No`
- Secret printed or committed: `No`

## Environment Check Results

The real Windows user environment contained:

```text
DISPOSABLE_SUPABASE_DB_URL: present for db.kikqtorplsswepqitjys.supabase.co
DISPOSABLE_SUPABASE_URL: missing
DISPOSABLE_SUPABASE_ANON_KEY: missing
DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY: missing
```

The local `.env.local` file points at:

```text
gnfomgsuottcuueasfvi.supabase.co
```

That project is the shared QA project, so it was not used for this gate.

## Blocker

Route/browser QA requires a disposable local app instance pointed at the approved disposable project. The session has the disposable database URL, but it does not have the disposable Supabase app URL, anon key, or service-role key.

Because the only local app environment points at shared QA, running the app as-is would violate the request's safety boundary.

## Second Attempt

A later prompt stated that `DISPOSABLE_SUPABASE_URL`, `DISPOSABLE_SUPABASE_ANON_KEY`, and `DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY` were set in Windows user scope for `kikqtorplsswepqitjys`.

The real Windows user environment was checked again without printing secret values.

Safe environment check result:

```text
DISPOSABLE_SUPABASE_DB_URL: present for db.kikqtorplsswepqitjys.supabase.co
DISPOSABLE_SUPABASE_URL: missing
DISPOSABLE_SUPABASE_ANON_KEY: missing
DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY: missing
Matching disposable/Supabase/Vinea variable names found: DISPOSABLE_SUPABASE_DB_URL only
```

The final route/browser QA gate was not executed on the second attempt because the disposable app credentials still were not visible to the Codex command environment.

## Final Pre-Summary Environment Check

The Windows user environment registry was checked directly again without printing secret values:

```text
DISPOSABLE_SUPABASE_DB_URL: present for db.kikqtorplsswepqitjys.supabase.co
DISPOSABLE_SUPABASE_URL: missing
DISPOSABLE_SUPABASE_ANON_KEY: missing
DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY: missing
```

The route/browser QA gate remains blocked.

## Third Attempt

A later prompt stated that the exact disposable app variables now existed in Windows user scope for `kikqtorplsswepqitjys`.

The values were checked by name only across Windows process, user, and machine environment scopes without printing secret values:

```text
Process DISPOSABLE_SUPABASE_URL: missing
Process DISPOSABLE_SUPABASE_ANON_KEY: missing
Process DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY: missing
Process DISPOSABLE_SUPABASE_DB_URL: missing
User DISPOSABLE_SUPABASE_URL: missing
User DISPOSABLE_SUPABASE_ANON_KEY: missing
User DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY: missing
User DISPOSABLE_SUPABASE_DB_URL: present for db.kikqtorplsswepqitjys.supabase.co
Machine DISPOSABLE_SUPABASE_URL: missing
Machine DISPOSABLE_SUPABASE_ANON_KEY: missing
Machine DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY: missing
Machine DISPOSABLE_SUPABASE_DB_URL: missing
```

The final route/browser QA gate was not executed on the third attempt because the disposable app credentials still were not visible to the Codex command environment.

## Third Attempt Automated Check Outputs

- Focused blocked-evidence test: `Pass` (`1` file, `3` tests)
- Full test suite: `Pass` (`134` files, `545` tests)
- Lint: `Pass` (`0` errors, `56` existing warnings)
- Production build: `Pass` (Next.js `16.2.2`)

## Fourth Attempt

A later prompt again stated that the exact disposable app variables existed in Windows user scope for `kikqtorplsswepqitjys`.

The environment was checked without printing secret values in all places Codex can safely inspect:

```text
Windows process scope: app credentials missing
Windows user scope: app credentials missing; DISPOSABLE_SUPABASE_DB_URL present for db.kikqtorplsswepqitjys.supabase.co
Windows machine scope: app credentials missing
HKCU:\Environment: DISPOSABLE_SUPABASE_DB_URL only
HKCU:\Volatile Environment: no matching Supabase/disposable/Vinea names
HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment: no matching Supabase/disposable/Vinea names
```

The final route/browser QA gate was not executed on the fourth attempt because the disposable app credentials still were not visible to Codex.

## Fourth Attempt Automated Check Outputs

- Environment and registry safety checks: `Pass` (no secret values printed)
- Route/browser QA: `Not run`
- `/api/health` against a disposable app: `Not run`
- Focused blocked-evidence test: `Pass` (`1` file, `3` tests)
- Full test suite: `Pass` (`134` files, `545` tests)
- Lint: `Pass` (`0` errors, `56` existing warnings)
- Production build: `Pass` (Next.js `16.2.2`)

## Second Attempt Automated Check Outputs

- Focused blocked-evidence test: `Pass` (`1` file, `3` tests)
- Full test suite: `Pass` (`134` files, `545` tests)
- Lint: `Pass` (`0` errors, `56` existing warnings)
- Production build: `Pass` (Next.js `16.2.2`)

## What Was Not Run

- `/api/health` against a disposable local app: `Not run`
- Request detail route/browser QA: `Not run`
- Staff document upload/review/signed URL route QA: `Not run`
- Direct Supabase Storage privacy check: `Not run`
- Family portal safety route/browser QA: `Not run`
- Operational RLS forward candidate in shared QA or production: `Not run`

## Automated Check Outputs

- Focused blocked-evidence test: `Pass` (`1` file, `3` tests)
- Full test suite: `Pass` (`134` files, `545` tests)
- Lint: `Pass` (`0` errors, `56` existing warnings)
- Production build: `Pass` (Next.js `16.2.2`)

## Required Input To Unblock

Set the following Windows user environment variables for the approved reusable disposable project only:

```text
DISPOSABLE_SUPABASE_URL=https://kikqtorplsswepqitjys.supabase.co
DISPOSABLE_SUPABASE_ANON_KEY=<disposable anon key>
DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY=<disposable service role key>
```

Do not commit these values to the repo.

After the variables are available, run the final route/browser QA against a temporary local app process that maps them to the app's expected environment names:

```text
NEXT_PUBLIC_SUPABASE_URL=$env:DISPOSABLE_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$env:DISPOSABLE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$env:DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY
```

## Final Decision

- Decision: `Do Not Promote`
- Reason: Database-level authenticated RLS QA has passed, but final route/browser QA could not run without disposable app credentials.
