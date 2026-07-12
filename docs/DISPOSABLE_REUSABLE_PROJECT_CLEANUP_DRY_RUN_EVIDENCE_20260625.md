# Disposable Reusable Project Cleanup Dry-Run Evidence - 2026-06-25

Status: Dry-run completed. Cleanup was not executed.

Target:

- Approved reusable disposable Supabase project ref: `kikqtorplsswepqitjys`
- Host observed by the guarded script: `db.kikqtorplsswepqitjys.supabase.co`

## Safety Confirmations

- `VINEA_DISPOSABLE_RESET_CONFIRM=RESET_KIKQ_DISPOSABLE_SCHEMA` was set.
- `VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE` was set.
- `VINEA_DISPOSABLE_RESET_EXECUTE` was not set.
- The script reported `executeReset: false`.
- No database password or full connection string is recorded in this evidence file.

## Dry-Run Result

- Script status: `dry_run`
- Started at: `2026-06-25T22:23:34.002Z`
- Completed at: `2026-06-25T22:23:34.449Z`
- Approved table drops planned: `27`
- Approved function drops planned: `16`
- Approved type drops planned: `1`
- Total planned statements: `44`
- Cleanup result object: empty, because execute mode was not enabled.
- Verification result object: empty, because execute mode was not enabled.

## Baseline Existing Objects Observed

The dry-run found these approved Vinea-owned public schema objects already present in the reusable disposable project.

Existing approved tables:

- `audit_events`
- `checklist_items`
- `funeral_request_details`
- `household_members`
- `households`
- `join_parish_request_details`
- `mass_intentions`
- `ocia_request_details`
- `parish_google_integrations`
- `parish_memberships`
- `parishes`
- `parishioners`
- `people`
- `rate_limit_buckets`
- `request_communications`
- `request_documents`
- `request_notes`
- `request_portal_tokens`
- `request_workflow_steps`
- `requests`
- `sacramental_record_events`
- `sacramental_records`
- `staff_users`
- `wedding_request_details`
- `workflow_templates`

Existing approved functions:

- `check_public_intake_rate_limit(p_key text, p_limit integer, p_window_seconds integer)`
- `create_request_workflow_steps_from_active_template(p_request_id uuid)`
- `current_staff_parish_ids()`
- `household_members_before_write()`
- `is_authorized_for_parish(p_parish_id uuid)`
- `parishioners_set_parish_id_before_insert()`
- `people_households_before_write()`
- `primary_parish_id()`
- `request_belongs_to_primary_parish(p_request_id uuid)`
- `sacramental_record_events_after_write()`
- `sacramental_records_before_write()`
- `vinea_validate_schedule_not_past()`

Existing approved types:

- `sacramental_record_type`

## What Would Run In Execute Mode

The script would drop only the approved Vinea-owned `public` schema tables, functions, and type listed in `docs/DISPOSABLE_REUSABLE_PROJECT_CLEANUP_RESET_PLAN.md`.

The dry-run planned:

- `DROP TABLE IF EXISTS ... CASCADE` for approved Vinea-owned public tables.
- `DROP FUNCTION IF EXISTS ... CASCADE` for approved Vinea-owned public functions.
- `DROP TYPE IF EXISTS ... CASCADE` for the approved Vinea-owned enum type.

It did not plan or run:

- `DROP SCHEMA public`
- Supabase `auth` schema changes
- Supabase `storage` schema changes
- Production changes
- Shared QA changes
- Runtime public intake changes
- Runtime `/api/health` changes
- Files under `supabase/migrations`
- Operational RLS changes

## Decision

Do not execute cleanup until this dry-run evidence has been reviewed. The next allowed step is an explicitly confirmed execute-mode run against `kikqtorplsswepqitjys` only.

## What Changed Plain English

I tested the cleanup script in preview mode against the reusable disposable database. It showed exactly what it would remove, but it did not remove anything. This helps us confirm the script is pointed at the right disposable project and is limited to Vinea-owned test objects before we allow it to actually reset the disposable database.
