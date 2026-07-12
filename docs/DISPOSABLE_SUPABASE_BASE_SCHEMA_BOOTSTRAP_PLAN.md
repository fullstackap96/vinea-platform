# Disposable Supabase Base Schema Bootstrap Plan

Status: Planning artifact only. Do not apply this document to production, shared QA, or `supabase/migrations`.

Related evidence:

- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_APP_QA_EVIDENCE_20260624_PARTIAL.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`

## Purpose

Vinea's current `supabase/migrations` folder is not a complete blank-database history. It contains later incremental changes that assume the original Vinea intake tables already exist.

That is acceptable for existing QA and production environments, but it blocks disposable Supabase projects that start from a blank database. The public intake routing disposable app QA proved this: applying the migration folder alone failed because early migrations reference `public.requests` before any migration creates it.

This plan defines the repo-owned base schema contract needed before current migrations can run cleanly in a blank disposable test project.

## Safety Rules

- Do not apply this bootstrap to production.
- Do not apply this bootstrap to shared QA.
- Do not move this plan into `supabase/migrations`.
- Do not use it as an operational RLS migration.
- Use only disposable Supabase branches, throwaway projects, or local Supabase databases.
- Use only safe fictional data.
- Record disposable evidence before promotion decisions.

## Required Pre-Migration Base Tables

These are the original tables that predate the current migration folder and must exist before running `supabase/migrations` in filename order.

### `public.parishioners`

Minimum required columns:

- `id uuid primary key`
- `full_name text not null`
- `email text`
- `phone text`
- `created_at timestamptz not null default now()`

Migration-dependent additions:

- `parish_id uuid` is added later by `20260507120000_parishioners_parish_id.sql`.

Why required:

- Public intake inserts parishioner contact rows.
- `requests.parishioner_id` depends on it.
- Later parish-scoped RLS joins `requests` to `parishioners`.

### `public.requests`

Minimum required columns:

- `id uuid primary key`
- `parishioner_id uuid references public.parishioners(id) on delete cascade`
- `request_type text not null`
- `child_name text`
- `preferred_dates text`
- `notes text`
- `status text not null default 'new'`
- `created_at timestamptz not null default now()`

Migration-dependent additions:

- `assigned_to text` from `20260412120000_request_assignment.sql`
- `next_follow_up_date date` from `20260412210000_request_next_follow_up_date.sql`
- `assigned_deacon text` from `20260425095500_request_assigned_deacon.sql`
- `waiting_on text` from `20260504120000_request_waiting_on.sql`
- `waiting_on_changed_at timestamptz` from `20260618130000_request_waiting_on_changed_at.sql`
- `person_id uuid` from `20260610140000_people_households.sql`

Why required:

- The first migrations create request-specific detail tables with foreign keys to `public.requests`.
- Public intake creates one request per family submission.
- Workflow steps, documents, notes, communications, records, and portal tokens all depend on requests.

### `public.checklist_items`

Minimum required columns:

- `id uuid primary key`
- `request_id uuid not null references public.requests(id) on delete cascade`
- `item_name text not null`
- `is_completed boolean not null default false`
- `created_at timestamptz not null default now()`

Why required:

- Current public intake creates checklist rows after creating a request.
- Later RLS migrations enable policies on `public.checklist_items`.

### `public.request_communications`

Minimum required columns:

- `id uuid primary key`
- `request_id uuid not null references public.requests(id) on delete cascade`
- `contacted_at timestamptz not null default now()`
- `method text`
- `notes text`
- `created_at timestamptz not null default now()`

Why required:

- Communication history existed before the later RLS migrations.
- Later migrations enable staff-only RLS policies on `public.request_communications`.
- Public request pages and staff workflows can write communication follow-up rows.

## Tables Created By Current Migrations

Do not include these in the pre-migration base bootstrap unless a disposable test explicitly needs a simplified temporary foundation.

- `public.parishes`
- `public.parish_google_integrations`
- `public.funeral_request_details`
- `public.wedding_request_details`
- `public.ocia_request_details`
- `public.join_parish_request_details`
- `public.request_notes`
- `public.sacramental_records`
- `public.sacramental_record_events`
- `public.people`
- `public.households`
- `public.household_members`
- `public.mass_intentions`
- `public.staff_users`
- `public.audit_events`
- `public.import_batches`
- `public.workflow_templates`
- `public.workflow_template_steps`
- `public.request_workflow_steps`
- `public.request_documents`
- `public.request_portal_tokens`
- `public.rate_limit_buckets`
- `public.parish_memberships`

## Bootstrap Execution Order For Blank Disposable Projects

1. Create a disposable Supabase branch/project or local Supabase database.
2. Verify the target is disposable and not shared QA or production.
3. Apply a base schema bootstrap that creates only:
   - `public.parishioners`
   - `public.requests`
   - `public.checklist_items`
   - `public.request_communications`
4. Apply all repo migrations in sorted filename order from `supabase/migrations`.
5. Verify `/api/health` returns:
   - `checks.env: true`
   - `checks.supabase: true`
   - `checks.parishes: true`
   - `checks.schema: true`
6. Run public intake regression:
   - Baptism submits successfully.
   - Wedding submits successfully.
   - Funeral submits successfully.
   - OCIA submits successfully.
   - Join Parish submits successfully.
   - Normal public intake succeeds before the threshold.
   - Durable 429 behavior works after the threshold.
7. Record evidence.
8. Clean up or destroy the disposable target.

## Future Implementation Recommendation

Create a non-production script under `scripts/` that:

- Requires an explicit disposable DB URL.
- Refuses known shared QA and production project refs.
- Applies the base bootstrap SQL.
- Applies the repo migrations in order.
- Captures schema readiness query results.
- Never writes secrets to repository files.

The script should remain disposable-only. It should not become a production migration path.

## Promotion Gate

Public intake routing should not be promoted until a disposable target created from this base bootstrap can prove:

- Repo migrations apply cleanly from blank-plus-base.
- `/api/health` returns `checks.schema: true`.
- Public intake regression passes for Baptism, Wedding, Funeral, OCIA, and Join Parish.
- Durable rate-limit 429 behavior is observed.
- Cleanup or branch destruction is confirmed.
