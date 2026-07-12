# Membership-Aware RLS Disposable QA Execution Checklist

Status: Draft execution checklist. Do not run against current QA or production.

Related docs:

- `docs/MEMBERSHIP_AWARE_RLS_QA_VALIDATION_PLAN.md`
- `docs/sql/membership_aware_operational_rls_draft.sql`
- `docs/sql/membership_aware_operational_rls_migration_candidate.sql`
- `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- `scripts/run-membership-aware-rls-disposable-validation.mjs`

## Purpose

This checklist defines the exact disposable Supabase execution flow for validating the membership-aware operational RLS forward draft and rollback draft before either draft is converted into an applied migration.

The goal is to prove three things:

1. The forward draft allows authorized multi-parish staff to access only their member parishes.
2. The forward draft denies unrelated parish access.
3. The rollback draft restores the current primary-parish policy model if the forward policy set must be reverted.

## Hard Safety Rules

- Do not run this checklist against production.
- Do not run this checklist against the current shared QA database.
- Use only a temporary Supabase branch, local Supabase database, or throwaway Supabase project.
- Do not copy real parishioner data into the disposable environment.
- Do not add the forward or rollback SQL drafts to `supabase/migrations` during this checklist.
- Do not commit generated SQL from the disposable database.
- Destroy the disposable branch/project after the checklist passes or fails.

## Required Inputs

- A disposable Supabase environment with all repository migrations applied through the current multi-parish foundation.
- Environment variables pointed at the disposable Supabase environment, not current QA or production.
- The forward candidate SQL from `docs/sql/membership_aware_operational_rls_migration_candidate.sql`.
- The rollback draft SQL from `docs/sql/membership_aware_operational_rls_rollback_draft.sql`.
- Disposable test users:
  - `qa.staff.a@example.test`
  - `qa.staff.ab@example.test`
  - `qa.staff.c@example.test`
- Disposable parishes:
  - `QA Parish A`
  - `QA Parish B`
  - `QA Parish C`

## Optional Guarded Schema/Policy Runner

The schema/policy portion of this checklist may be run with the guarded disposable-only script:

```bash
set DISPOSABLE_SUPABASE_DB_URL=<disposable database url>
set VINEA_MEMBERSHIP_RLS_DISPOSABLE_CONFIRM=MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION
node scripts/run-membership-aware-rls-disposable-validation.mjs
```

For the approved reusable disposable project `kikqtorplsswepqitjys`, also set:

```bash
set VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE
```

Script safety rules:

- Refuses the shared QA project `gnfomgsuottcuueasfvi`.
- Refuses non-local and non-Supabase database hosts.
- Refuses `kikqtorplsswepqitjys` unless the reusable-disposable confirmation is present.
- Applies `docs/sql/membership_aware_operational_rls_migration_candidate.sql`, then applies `docs/sql/membership_aware_operational_rls_rollback_draft.sql`.
- Prints sanitized JSON evidence to stdout.
- Does not write evidence files.
- Does not use Supabase anon or service-role keys.
- Does not add any file to `supabase/migrations`.

The script does not replace authenticated manual allow/deny workflow QA. It only validates forward/rollback policy application and policy-shape evidence.

## Preflight Verification

Run these checks before applying either draft.

```sql
select current_database() as database_name;

select id, name
from public.parishes
where name in ('QA Parish A', 'QA Parish B', 'QA Parish C')
order by name;

select email, parish_id, active
from public.staff_users
where email in (
  'qa.staff.a@example.test',
  'qa.staff.ab@example.test',
  'qa.staff.c@example.test'
)
order by email, parish_id;

select email, parish_id, active
from public.parish_memberships
where email in (
  'qa.staff.a@example.test',
  'qa.staff.ab@example.test',
  'qa.staff.c@example.test'
)
order by email, parish_id;

select
  to_regclass('public.parish_memberships') is not null as has_parish_memberships,
  to_regprocedure('public.current_staff_parish_ids()') is not null as has_current_staff_parish_ids,
  to_regprocedure('public.is_authorized_for_parish(uuid)') is not null as has_is_authorized_for_parish,
  to_regprocedure('public.request_belongs_to_primary_parish(uuid)') is not null as has_primary_request_helper;
```

Pass criteria:

- The database is the disposable database.
- All three disposable parishes exist.
- Disposable staff and membership rows exist.
- Membership foundation functions exist.
- Current primary-parish request helper exists.

Fail criteria:

- The connection points to production or shared QA.
- Any required disposable parish, staff user, membership, or helper function is missing.

## Baseline Policy Snapshot

Capture the current V1 policy state before applying the forward draft.

```sql
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'parishioners',
    'people',
    'households',
    'household_members',
    'sacramental_records',
    'sacramental_record_events',
    'mass_intentions',
    'requests',
    'checklist_items',
    'request_communications',
    'request_notes',
    'request_workflow_steps',
    'request_documents',
    'funeral_request_details',
    'wedding_request_details',
    'ocia_request_details',
    'join_parish_request_details'
  )
order by tablename, policyname;
```

Pass criteria:

- Policies currently reference `primary_parish_id()` and/or `request_belongs_to_primary_parish()` where expected.

Fail criteria:

- Baseline policies are already membership-aware or missing expected operational policy names.

## Forward Draft Application

Apply the forward candidate manually inside the disposable Supabase SQL editor or local disposable database session, or use the guarded script above.

Use:

```text
docs/sql/membership_aware_operational_rls_migration_candidate.sql
```

Do not create a migration file.

Forward verification queries:

```sql
select to_regprocedure('public.request_belongs_to_staff_parish(uuid)') is not null
  as has_membership_request_helper;

select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and (
    qual ilike '%is_authorized_for_parish%'
    or with_check ilike '%is_authorized_for_parish%'
    or qual ilike '%request_belongs_to_staff_parish%'
    or with_check ilike '%request_belongs_to_staff_parish%'
  )
order by tablename, policyname;

select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'parishioners',
    'people',
    'households',
    'household_members',
    'sacramental_records',
    'sacramental_record_events',
    'mass_intentions',
    'requests',
    'checklist_items',
    'request_communications',
    'request_notes',
    'request_workflow_steps',
    'request_documents',
    'funeral_request_details',
    'wedding_request_details',
    'ocia_request_details',
    'join_parish_request_details'
  )
  and (
    qual ilike '%primary_parish_id%'
    or with_check ilike '%primary_parish_id%'
    or qual ilike '%request_belongs_to_primary_parish%'
    or with_check ilike '%request_belongs_to_primary_parish%'
  )
order by tablename, policyname;
```

Pass criteria:

- `request_belongs_to_staff_parish(uuid)` exists.
- Direct parish tables reference `is_authorized_for_parish(parish_id)`.
- Request child tables reference `request_belongs_to_staff_parish(request_id)`.
- Operational policy rows no longer reference `primary_parish_id()` or `request_belongs_to_primary_parish()` except in unrelated non-operational policies outside the tested table list.

Fail criteria:

- The membership request helper is missing.
- Any tested operational policy still depends on `primary_parish_id()` or `request_belongs_to_primary_parish()`.
- Any tested operational table loses its staff policy.

## Forward Allow/Deny Validation

Execute the allow/deny cases from `docs/MEMBERSHIP_AWARE_RLS_QA_VALIDATION_PLAN.md` using authenticated sessions for:

- `qa.staff.a@example.test`
- `qa.staff.ab@example.test`
- `qa.staff.c@example.test`

Minimum surfaces to verify:

- People
- Households
- Sacramental Records
- Mass Intentions
- Requests
- Request notes
- Request communications
- Request workflow steps
- Request documents

Pass criteria:

- Every authorized parish read returns the expected row.
- Every authorized parish write succeeds.
- Every unauthorized parish read returns no rows.
- Every unauthorized parish write fails with a clear authorization error or inserts zero rows.
- Public intake still creates safe disposable requests.
- Family portal access still shows only family-facing request details and document upload controls.
- Staff document URLs remain mediated by server routes and signed URL logic.

Fail criteria:

- Any unrelated parish row is visible.
- Any unrelated parish mutation succeeds.
- Public intake, family portal, or staff document access breaks.
- Any staff-only data appears in family portal responses.

## Rollback Draft Application

After forward validation, apply the rollback draft manually inside the same disposable environment.

Use:

```text
docs/sql/membership_aware_operational_rls_rollback_draft.sql
```

Do not create a migration file.

Rollback verification queries:

```sql
select to_regprocedure('public.request_belongs_to_staff_parish(uuid)') is null
  as membership_request_helper_removed;

select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'parishioners',
    'people',
    'households',
    'household_members',
    'sacramental_records',
    'sacramental_record_events',
    'mass_intentions',
    'requests',
    'checklist_items',
    'request_communications',
    'request_notes',
    'request_workflow_steps',
    'request_documents',
    'funeral_request_details',
    'wedding_request_details',
    'ocia_request_details',
    'join_parish_request_details'
  )
  and (
    qual ilike '%primary_parish_id%'
    or with_check ilike '%primary_parish_id%'
    or qual ilike '%request_belongs_to_primary_parish%'
    or with_check ilike '%request_belongs_to_primary_parish%'
  )
order by tablename, policyname;

select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'parishioners',
    'people',
    'households',
    'household_members',
    'sacramental_records',
    'sacramental_record_events',
    'mass_intentions',
    'requests',
    'checklist_items',
    'request_communications',
    'request_notes',
    'request_workflow_steps',
    'request_documents',
    'funeral_request_details',
    'wedding_request_details',
    'ocia_request_details',
    'join_parish_request_details'
  )
  and (
    qual ilike '%is_authorized_for_parish%'
    or with_check ilike '%is_authorized_for_parish%'
    or qual ilike '%request_belongs_to_staff_parish%'
    or with_check ilike '%request_belongs_to_staff_parish%'
  )
order by tablename, policyname;
```

Pass criteria:

- `request_belongs_to_staff_parish(uuid)` is removed.
- Direct parish tables again reference `primary_parish_id()`.
- Request child tables again reference `request_belongs_to_primary_parish(request_id)`.
- Tested operational policies no longer reference `is_authorized_for_parish()` or `request_belongs_to_staff_parish()`.

Fail criteria:

- The membership request helper still exists after rollback.
- Any tested operational policy still references membership-aware helpers.
- Any tested operational policy is missing after rollback.

## Rollback Behavior Validation

After applying the rollback draft:

- Confirm an existing single-primary-parish staff user can still sign in.
- Confirm the staff user can load Dashboard, Requests, People, Households, Records, Mass Intentions, Settings, Reports, Calendar, Communications, and Intake.
- Confirm `/api/health` returns `checks.schema: true`.
- Run app checks against the disposable environment:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

Pass criteria:

- Single-parish staff access works.
- `/api/health` is green.
- Tests, build, and lint complete with no new errors.

Fail criteria:

- Staff sign-in or core dashboard access breaks.
- `/api/health` reports `checks.schema: false`.
- Tests or build fail.

## Final Go/No-Go

The future operational RLS migration may be promoted only when all of these are true:

- Forward draft applies cleanly in a disposable environment.
- Forward allow/deny cases pass.
- Rollback draft applies cleanly after the forward draft.
- Rollback behavior validation passes.
- No staff-only data is exposed through public intake or family portal routes.
- No operational draft SQL has been added to `supabase/migrations` before final approval.

If any fail criterion occurs, do not promote the migration. Fix the draft, rerun this checklist from a clean disposable environment, and document the failure.

## Cleanup

After pass or fail:

- Export only sanitized notes needed for development.
- Delete all disposable parish, staff, request, document, and storage data.
- Destroy the temporary Supabase branch/project.
- Restore local environment variables to the normal development or QA target.
