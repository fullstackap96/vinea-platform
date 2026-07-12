# Disposable Base Schema Bootstrap Execution Evidence - Reusable Project Failed Run 2026-06-25

Status: Failed during repo migration replay against the approved reusable disposable project.

Related docs:

- `docs/DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_PACKET.md`
- `docs/sql/disposable_base_schema_bootstrap_candidate.sql`
- `scripts/run-disposable-base-schema-bootstrap.mjs`

## Target

- Supabase project ref: `kikqtorplsswepqitjys`
- Target class: `supabase_disposable`
- Reusable disposable override: `VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE`
- Bootstrap confirmation: `VINEA_DISPOSABLE_BOOTSTRAP_CONFIRM=DISPOSABLE_BASE_SCHEMA_BOOTSTRAP`

No database password or secret value is recorded in this evidence file.

## Safety Confirmation

- Script executed: `Yes`
- Temporary runner dependency installed: `Yes`
- Temporary runner dependency removed after run: `Yes`
- Approved reusable disposable database modified: `Yes`
- Production touched: `No`
- Shared QA touched: `No`
- Runtime public intake wiring changed: `No`
- Runtime `/api/health` changed: `No`
- `supabase/migrations` changed: `No`
- Operational RLS changed: `No`

## Result

The guarded runner connected to the approved reusable disposable project, captured baseline table state, applied the base bootstrap candidate, then replayed repo migrations in sorted order until migration replay failed.

The run failed after `23` repo migration files had been applied.

The next migration was:

```text
20260620100000_staff_users_authorization.sql
```

Failure:

```text
column "active" does not exist
```

## Interpretation

The reusable disposable project was not blank. It already contained several Vinea tables before the run began, including:

- `checklist_items`
- `parish_memberships`
- `parishes`
- `parishioners`
- `rate_limit_buckets`
- `request_communications`
- `request_documents`
- `requests`
- `staff_users`
- `workflow_templates`

Because `public.staff_users` already existed without the expected `active` column, the `CREATE TABLE IF NOT EXISTS public.staff_users (...)` statement in `20260620100000_staff_users_authorization.sql` did not add that missing column. The later index/policy statements that expect `staff_users.active` then failed.

This means the reusable project needs either a disposable cleanup/reset step or a stricter preflight that refuses non-blank reusable targets before migration replay.

## Captured Schema Verification JSON

```json
{
  "status": "failed",
  "host": "db.kikqtorplsswepqitjys.supabase.co",
  "safety": {
    "hardBlockedProjectRefs": ["gnfomgsuottcuueasfvi"],
    "reusableDisposableProjectRef": "kikqtorplsswepqitjys",
    "reusableDisposableProjectAllowed": true,
    "confirmationAccepted": true,
    "targetClass": "supabase_disposable"
  },
  "baseline": {
    "identity": {
      "database_name": "postgres",
      "database_user": "postgres"
    },
    "existingRelevantTables": [
      "checklist_items",
      "parish_memberships",
      "parishes",
      "parishioners",
      "rate_limit_buckets",
      "request_communications",
      "request_documents",
      "requests",
      "staff_users",
      "workflow_templates"
    ]
  },
  "bootstrap": {
    "appliedPath": "docs/sql/disposable_base_schema_bootstrap_candidate.sql",
    "tables": [
      "checklist_items",
      "parishioners",
      "request_communications",
      "requests"
    ]
  },
  "migrations": {
    "appliedCount": 23,
    "lastAppliedFile": "20260619120000_daily_ops_brief_settings.sql",
    "failedNextFile": "20260620100000_staff_users_authorization.sql"
  },
  "verification": {},
  "error": {
    "message": "column \"active\" does not exist"
  }
}
```

## What Was Not Run

- Full repo migration replay: `Failed before completion`
- Final required table/function verification: `Not completed`
- `/api/health` disposable app check: `Not run`
- Public intake regression: `Not run`
- Durable 429 regression: `Not run`
- Cleanup/reset: `Not run`

## Final Decision

Decision: `Do Not Promote`

Reason: The reusable disposable database is non-blank and failed migration replay before schema verification could complete.
