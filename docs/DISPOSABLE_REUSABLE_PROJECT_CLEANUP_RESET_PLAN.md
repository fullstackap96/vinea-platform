# Disposable Reusable Project Cleanup Reset Plan

Status: Plan only. Not executed.

Target project:

- Approved reusable disposable Supabase project ref: `kikqtorplsswepqitjys`

This plan exists because the reusable disposable project failed base schema bootstrap replay after `23` migrations. The project was not blank and already had `public.staff_users` without the expected `active` column.

## Safety Rules

- Do not run against production.
- Do not run against shared QA `gnfomgsuottcuueasfvi`.
- Do not run against any project ref except `kikqtorplsswepqitjys`.
- Require `VINEA_DISPOSABLE_RESET_CONFIRM=RESET_KIKQ_DISPOSABLE_SCHEMA`.
- Require `VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE`.
- Default to dry-run unless `VINEA_DISPOSABLE_RESET_EXECUTE=EXECUTE_RESET` is set.
- Do not change runtime public intake wiring.
- Do not change runtime `/api/health`.
- Do not add or apply files under `supabase/migrations`.
- Do not change operational RLS in repo code.
- Do not write database passwords or connection strings to evidence files.

## Approved Cleanup Scope

The cleanup may drop only repo-owned Vinea objects in the `public` schema. It must not drop the `public` schema itself, Supabase auth/storage schemas, extensions, roles, or non-public schemas.

Approved tables:

- `audit_events`
- `checklist_items`
- `funeral_request_details`
- `household_members`
- `households`
- `import_batches`
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
- `workflow_template_steps`
- `workflow_templates`

Approved functions:

- `check_public_intake_rate_limit(text, integer, integer)`
- `current_staff_parish_ids()`
- `current_staff_primary_parish_id()`
- `household_members_before_write()`
- `is_authorized_for_parish(uuid)`
- `is_authorized_staff()`
- `parishioners_set_parish_id_before_insert()`
- `people_households_before_write()`
- `primary_parish_id()`
- `request_belongs_to_primary_parish(uuid)`
- `sacramental_record_events_after_write()`
- `sacramental_records_before_write()`
- `sync_parish_membership_from_staff_user()`
- `vinea_validate_schedule_not_past()`
- `workflow_templates_touch_updated_at()`
- `create_request_workflow_steps_from_active_template(uuid)`

Approved type:

- `sacramental_record_type`

Indexes, policies, triggers, and constraints attached to approved tables may be removed through `DROP TABLE ... CASCADE`.

## Execution Shape

The guarded script must:

1. Parse `DISPOSABLE_SUPABASE_DB_URL`.
2. Refuse missing confirmations.
3. Refuse shared QA and all non-approved Supabase project refs.
4. Connect with a temporary `postgres` runner dependency.
5. Capture baseline identity and existing approved objects.
6. In dry-run mode, output the exact SQL statements that would run.
7. In execute mode, drop approved tables first, then approved functions, then approved types.
8. Capture post-cleanup remaining approved objects.
9. Output JSON to stdout.

## Pass Criteria

- Dry-run prints `status: "dry_run"` and does not modify the database.
- Execute mode prints `status: "completed"` only if all approved tables, functions, and types are absent afterward.
- The script refuses `gnfomgsuottcuueasfvi`.
- The script refuses any Supabase project ref other than `kikqtorplsswepqitjys`.
- The script refuses `kikqtorplsswepqitjys` without the reusable-project override.
- The script refuses all execution without `VINEA_DISPOSABLE_RESET_CONFIRM=RESET_KIKQ_DISPOSABLE_SCHEMA`.
- The script does not write secrets to repo files.

## Next Gate

After this plan and script are reviewed, run the cleanup first in dry-run mode. Only if the dry-run output matches this allowlist should execute mode be used.
