# Vinea Build Status

Last Updated: 2026-06-21

## Current Initiative

Workflow Templates + Document Portal

## Phase 1: Workflow Template Foundation

Status: Implemented and verified.

### What Changed

- Added `workflow_templates`, `workflow_template_steps`, and `request_workflow_steps`.
- Added staff-only RLS policies using the existing `is_authorized_staff()` and `primary_parish_id()` V1 parish scope.
- Seeded active default templates for Baptism, Wedding, Funeral, and OCIA for every existing parish.
- Added default Catholic workflow steps for each seeded template.
- Added `create_request_workflow_steps_from_active_template(request_id)` database RPC.
- Backfilled request workflow steps for existing Baptism, Wedding, Funeral, and OCIA requests that did not already have workflow step instances.
- Updated public intake so new supported requests instantiate workflow steps from the active template.
- Left legacy `checklist_items` creation in place until Phase 3 replaces the request-detail checklist UI.
- Added focused unit tests for request workflow step insert mapping.

### How To Test

1. Apply Supabase migrations through the normal project migration process.
2. Submit a Baptism, Wedding, Funeral, or OCIA public intake form.
3. Confirm the request still appears in the dashboard with its legacy checklist.
4. In Supabase, verify `request_workflow_steps` has rows for the new request.
5. Verify default templates exist in `workflow_templates` and `workflow_template_steps`.
6. Run:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

### Known Risks

- V1 parish scoping still depends on `primary_parish_id()` and is not true multi-tenant tenancy.
- Existing request-detail UI still reads `checklist_items`; Phase 3 will promote workflow steps into the primary task system.
- Workflow template editing UI is not part of Phase 1 and remains unbuilt until Phase 2.
- Document upload, review, and family portal access are intentionally deferred to Phases 4 and 5.

### Verification

- `npm.cmd test` passed: 35 test files, 140 tests.
- `npm.cmd run build` passed on Next.js 16.2.2.
- `npm.cmd run lint` passed with 58 existing warnings and 0 errors.
- Build still reports the existing Next.js middleware deprecation warning; Phase 1 did not change middleware/proxy behavior.
