# Disposable Base Schema Bootstrap Execution Packet

Status: Disposable execution packet only. Do not apply this packet to production, shared QA, or any real parish data environment.

Related docs:

- `docs/DISPOSABLE_SUPABASE_BASE_SCHEMA_BOOTSTRAP_PLAN.md`
- `docs/sql/disposable_base_schema_bootstrap_candidate.sql`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_APP_QA_EVIDENCE_20260624_PARTIAL.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`

## Purpose

This packet gives the exact order for preparing a blank disposable Supabase target with Vinea's original base intake tables, then applying the current repo migrations in sorted filename order.

It is a runbook for collecting disposable QA evidence. It is not permission to change production, shared QA, runtime public intake, runtime `/api/health`, operational RLS, or `supabase/migrations`.

## Non-Negotiable Safety Rules

- Use only a disposable Supabase branch, throwaway Supabase project, or local Supabase database.
- Do not use production.
- Do not use the current shared QA database.
- Do not copy real parish, staff, or parishioner data into the disposable target.
- Do not add `docs/sql/disposable_base_schema_bootstrap_candidate.sql` to `supabase/migrations`.
- Do not add any migration file to `supabase/migrations` during this packet.
- Do not change runtime `/api/health`.
- Do not change runtime public intake routing.
- Do not change operational RLS.
- Stop on first failure and record the failure.

## Required Inputs

- Disposable Supabase project reference, branch reference, or local database identity.
- Disposable database URL or SQL editor access.
- Current git branch and commit SHA.
- `docs/sql/disposable_base_schema_bootstrap_candidate.sql`.
- All SQL files from `supabase/migrations` in sorted filename order.
- Disposable Supabase URL, anon key, and service role key if app-based `/api/health` checks will be run.
- Safe fictional public intake test data if app regression will be run after schema verification.

## Evidence File Setup

Before executing SQL, create a run-specific evidence note and record:

- Operator.
- Date and time.
- Git branch.
- Git commit SHA.
- Disposable target name.
- Disposable target project ref or local identifier.
- Database host.
- Confirmation that the target is not production.
- Confirmation that the target is not shared QA.
- Confirmation that no real parish data is present.

## Exact Execution Order

Run these steps in order. Stop on the first failure.

1. Capture baseline environment identity.
2. Run destructive-safety confirmation.
3. Run blank-target preflight checks.
4. Apply `docs/sql/disposable_base_schema_bootstrap_candidate.sql`.
5. Verify base bootstrap tables and columns.
6. Apply every file from `supabase/migrations` in sorted filename order.
7. Run post-migration schema verification queries.
8. Start a disposable app instance pointed only at the disposable target.
9. Capture `/api/health`.
10. If `/api/health` passes with `checks.schema: true`, run public intake regression.
11. Record unresolved risks.
12. Roll back or clean up the disposable target.
13. Record final sign-off decision.

## Step 1: Baseline Environment Identity

Run:

```sql
select current_database() as database_name;
select current_user as database_user;
select now() as captured_at;
```

Record:

- Database name.
- Database user.
- Host/project reference.
- Operator.
- Timestamp.

Pass criteria:

- Target is confirmed disposable.
- Target is not production.
- Target is not shared QA.

## Step 2: Destructive-Safety Confirmation

Before applying any SQL, record a written answer to each question:

- Is this a disposable target that may be destroyed?
- Is this target separate from production?
- Is this target separate from shared QA?
- Is it acceptable to drop disposable objects during cleanup?
- Are all credentials disposable-only?

Pass criteria:

- Every answer is `Yes`.

## Step 3: Blank-Target Preflight Checks

Run:

```sql
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'parishioners',
    'requests',
    'checklist_items',
    'request_communications',
    'parishes',
    'staff_users',
    'parish_memberships',
    'workflow_templates',
    'request_documents',
    'rate_limit_buckets'
  )
order by tablename;
```

Expected result before base bootstrap:

- For a truly blank disposable target: no rows.
- If rows exist, stop and decide whether this is a reused disposable target. Do not continue unless the operator explicitly records that cleanup/reuse is acceptable.

## Step 4: Apply Base Bootstrap Candidate

Apply exactly:

```text
docs/sql/disposable_base_schema_bootstrap_candidate.sql
```

Recommended execution methods:

- Supabase SQL editor: paste the full file into the disposable project SQL editor and run it.
- `psql`: connect only to the disposable database, then run `\i docs/sql/disposable_base_schema_bootstrap_candidate.sql`.
- Disposable script: execute the file only after verifying the database URL/project ref is disposable.

Pass criteria:

- The file applies without manual edits.
- No table outside the approved base tables is created by this step.

## Step 5: Verify Base Bootstrap Tables And Columns

Run:

```sql
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'parishioners',
    'requests',
    'checklist_items',
    'request_communications'
  )
order by tablename;
```

Expected rows:

- `checklist_items`
- `parishioners`
- `request_communications`
- `requests`

Run:

```sql
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'parishioners',
    'requests',
    'checklist_items',
    'request_communications'
  )
order by table_name, ordinal_position;
```

Required columns:

- `parishioners`: `id`, `full_name`, `email`, `phone`, `created_at`
- `requests`: `id`, `parishioner_id`, `request_type`, `child_name`, `preferred_dates`, `notes`, `status`, `created_at`
- `checklist_items`: `id`, `request_id`, `item_name`, `is_completed`, `created_at`
- `request_communications`: `id`, `request_id`, `contacted_at`, `method`, `notes`, `created_at`

## Step 6: Apply Repo Migrations In Order

Apply every `.sql` file from:

```text
supabase/migrations
```

in sorted filename order.

PowerShell file-order preview:

```powershell
Get-ChildItem -Path supabase\migrations -Filter *.sql |
  Sort-Object Name |
  Select-Object -ExpandProperty Name
```

Pass criteria:

- Every migration applies without manual edits.
- Failures are recorded with the filename and database error.
- If any migration fails, stop and do not proceed to app checks.

## Step 7: Post-Migration Schema Verification

Run:

```sql
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'parishes',
    'parishioners',
    'requests',
    'checklist_items',
    'request_communications',
    'staff_users',
    'parish_memberships',
    'audit_events',
    'workflow_templates',
    'request_workflow_steps',
    'request_documents',
    'request_portal_tokens',
    'rate_limit_buckets'
  )
order by tablename;
```

Expected rows:

- All listed tables should exist.

Run:

```sql
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'primary_parish_id',
    'request_belongs_to_primary_parish',
    'create_request_workflow_steps_from_active_template',
    'check_public_intake_rate_limit',
    'current_staff_parish_ids',
    'is_authorized_for_parish'
  )
order by proname;
```

Expected rows:

- All listed functions should exist.

## Step 8: Disposable App Instance

Start a local app instance with only disposable Supabase credentials:

```text
NEXT_PUBLIC_SUPABASE_URL=<disposable Supabase URL>
SUPABASE_URL=<disposable Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<disposable anon key>
SUPABASE_SERVICE_ROLE_KEY=<disposable service role key>
```

Do not write these keys into repo files.

## Step 9: `/api/health` Observation

Request:

```text
GET /api/health
```

Pass criteria:

```json
{
  "ok": true,
  "checks": {
    "env": true,
    "supabase": true,
    "parishes": true,
    "schema": true,
    "resend": true,
    "googleOAuth": true
  }
}
```

If email or Google OAuth variables are intentionally unset, their checks should remain true because those integrations are optional unless partially configured.

## Step 10: Public Intake Regression

Run only if `/api/health` passes.

Expected pass criteria:

- Baptism public intake submits successfully.
- Wedding public intake submits successfully.
- Funeral public intake submits successfully.
- OCIA public intake submits successfully.
- Join Parish public intake submits successfully.
- Normal public intake succeeds before the configured threshold.
- Durable public intake 429 behavior works after the threshold.

Record:

- Request type.
- HTTP status.
- Response shape.
- Whether a request id was returned.
- Whether the failure mode was clear if any request failed.

## Step 11: Unresolved Risks

Record all unresolved risks, including:

- Any migration that needed manual adjustment.
- Any missing table, column, function, or policy.
- Any `/api/health` failure.
- Any public intake failure.
- Any rate-limit failure.
- Any cleanup issue.

## Step 12: Rollback And Cleanup

Preferred cleanup:

- Destroy the disposable Supabase branch/project.
- Or reset the local Supabase database.

If the disposable target must be manually cleaned, run only after confirming it is disposable:

```sql
drop schema public cascade;
create schema public;
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;
```

Then verify:

```sql
select tablename
from pg_tables
where schemaname = 'public'
order by tablename;
```

Expected result after full cleanup:

- No Vinea app tables remain.

## Step 13: Final Decision

Record one of:

- `Pass: disposable base bootstrap and repo migrations are ready for app-level QA.`
- `Pass: disposable base bootstrap, repo migrations, health, intake, and 429 checks passed.`
- `Do Not Promote: unresolved blocker remains.`

Promotion remains blocked unless:

- Base bootstrap applies cleanly.
- Repo migrations apply cleanly.
- `/api/health` returns `checks.schema: true`.
- Public intake regression passes for all five public forms.
- Durable 429 behavior is proven.
- Cleanup or target destruction is confirmed.
