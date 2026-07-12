# Disposable Reusable Project Cleanup Execution Evidence - 2026-06-25

Status: Completed against the approved reusable disposable project.

Target:

- Approved reusable disposable Supabase project ref: `kikqtorplsswepqitjys`
- Host observed by the guarded script: `db.kikqtorplsswepqitjys.supabase.co`

## Safety Confirmations

- `VINEA_DISPOSABLE_RESET_CONFIRM=RESET_KIKQ_DISPOSABLE_SCHEMA` was set.
- `VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE` was set.
- `VINEA_DISPOSABLE_RESET_EXECUTE=EXECUTE_RESET` was set.
- The script reported `executeReset: true`.
- The script reported `status: "completed"`.
- No database password or full connection string is recorded in this evidence file.

## Execution Result

- Script status: `completed`
- Started at: `2026-06-25T22:31:19.661Z`
- Completed at: `2026-06-25T22:31:21.412Z`
- Approved statements executed: `44`
- Approved table drop statements included: `27`
- Approved function drop statements included: `16`
- Approved type drop statements included: `1`

## Baseline Existing Objects Observed Before Cleanup

Existing approved tables before cleanup:

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

Existing approved functions before cleanup:

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

Existing approved types before cleanup:

- `sacramental_record_type`

## Verification After Cleanup

The guarded script reported:

- Remaining approved tables: `0`
- Remaining approved functions: `0`
- Remaining approved types: `0`

This means the approved reusable disposable project is ready for a clean disposable base schema bootstrap replay.

## Scope Boundaries

This execution did not change:

- Production
- Shared QA project `gnfomgsuottcuueasfvi`
- Runtime public intake wiring
- Runtime `/api/health`
- Files under `supabase/migrations`
- Operational RLS in repo code

The reset touched only the approved reusable disposable project `kikqtorplsswepqitjys`.

## Notices Observed

Postgres reported expected notices for a few missing objects that were already absent, including `import_batches`, `workflow_template_steps`, `current_staff_primary_parish_id()`, `is_authorized_staff()`, `sync_parish_membership_from_staff_user()`, and `workflow_templates_touch_updated_at()`.

Postgres also reported expected cascade notices for dependent constraints and policies attached to approved Vinea-owned public schema objects.

## What Changed Plain English

The reusable disposable database was cleaned so it can be used like a fresh test database. The reset removed only Vinea-owned test tables, functions, and one enum type from that disposable project. It did not touch production, shared QA, live app behavior, or the migration folder. This clears the path to rerun the base schema bootstrap and all repo migrations in order.
