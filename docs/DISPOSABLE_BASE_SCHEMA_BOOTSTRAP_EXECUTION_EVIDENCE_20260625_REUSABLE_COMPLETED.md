# Disposable Base Schema Bootstrap Execution Evidence - Reusable Project Completed - 2026-06-25

Status: Completed against the approved reusable disposable project.

Target:

- Approved reusable disposable Supabase project ref: `kikqtorplsswepqitjys`
- Host observed by the guarded script: `db.kikqtorplsswepqitjys.supabase.co`

## Safety Confirmations

- `VINEA_DISPOSABLE_BOOTSTRAP_CONFIRM=DISPOSABLE_BASE_SCHEMA_BOOTSTRAP` was set.
- `VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE` was set.
- Shared QA project `gnfomgsuottcuueasfvi` remained hard-blocked by the runner.
- The runner classified the target as `supabase_disposable`.
- No database password or full connection string is recorded in this evidence file.

## Execution Result

- Script status: `completed`
- Started at: `2026-06-25T23:00:33.136Z`
- Completed at: `2026-06-25T23:00:34.894Z`
- Baseline relevant tables before bootstrap: `0`
- Base schema bootstrap applied: `docs/sql/disposable_base_schema_bootstrap_candidate.sql`
- Repo migrations applied: `36`
- Missing required tables after migration replay: `0`
- Missing required functions after migration replay: `0`

## Base Tables Verified After Bootstrap

The bootstrap candidate created the original Vinea base tables that predate the current migration folder:

- `checklist_items`
- `parishioners`
- `request_communications`
- `requests`

## Repo Migration Replay

The runner applied all `36` SQL files from `supabase/migrations` in sorted order, ending with:

- `20260622170000_parish_memberships_foundation.sql`
- `20260622173000_staff_users_memberships_sync.sql`

## Schema Verification

Required post-migration tables found:

- `audit_events`
- `checklist_items`
- `parish_memberships`
- `parishes`
- `parishioners`
- `rate_limit_buckets`
- `request_communications`
- `request_documents`
- `request_portal_tokens`
- `request_workflow_steps`
- `requests`
- `staff_users`
- `workflow_templates`

Required post-migration functions found:

- `check_public_intake_rate_limit`
- `create_request_workflow_steps_from_active_template`
- `current_staff_parish_ids`
- `is_authorized_for_parish`
- `primary_parish_id`
- `request_belongs_to_primary_parish`

Missing required tables: none.

Missing required functions: none.

## Notices Observed

Postgres reported expected notices for idempotent migration operations such as existing extensions, missing policies, missing triggers, and missing constraints. These notices did not stop the replay, and the final verification passed.

## Scope Boundaries

This execution did not change:

- Production
- Shared QA project `gnfomgsuottcuueasfvi`
- Runtime public intake wiring
- Runtime `/api/health`
- Files under `supabase/migrations`
- Operational RLS in repo code

The replay touched only the approved reusable disposable project `kikqtorplsswepqitjys`.

## Remaining Work

- Run a disposable local app instance against `kikqtorplsswepqitjys`.
- Observe `/api/health` against that disposable app instance.
- Run public intake regression for Baptism, Wedding, Funeral, OCIA, Join Parish, normal rate-limit behavior, and durable 429 behavior.
- Keep runtime public intake routing unwired until disposable app QA evidence passes.

## What Changed Plain English

The disposable database was rebuilt from a clean state. First, Vinea's original base tables were created. Then every repo migration was applied in order. The final check found all required tables and functions, which means the database setup path now works in the reusable disposable project.
