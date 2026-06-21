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

## Phase 2: Workflow Template Settings UI

Status: Implemented and verified.

### What Changed

- Added a staff-protected workflow template settings API at `/api/parish/workflow-templates`.
- Added a parish settings section for active Baptism, Wedding, Funeral, and OCIA workflow templates.
- Staff can edit workflow step title, description, phase, owner type, required status, due offset, and sort order.
- Workflow step updates are parish-scoped before write and recorded in `audit_events`.
- Recent admin activity now shows a readable title/detail for workflow template step updates.
- Added focused tests for workflow template step patch validation.
- Kept Phase 2 limited to template editing. Existing request detail pages still use legacy `checklist_items` until Phase 3.

### How To Test

1. Apply the Phase 1 migration so default workflow templates exist.
2. Sign in as authorized parish staff.
3. Open `/dashboard/settings`.
4. In Workflow templates, select Baptism, Wedding, Funeral, or OCIA.
5. Edit a step title, description, phase, owner, required flag, due offset, or order.
6. Save the step and refresh to confirm the change persists.
7. Check recent admin activity or `/dashboard/admin/audit-log` for the workflow step update.
8. Run:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

### Known Risks

- Phase 2 edits affect new requests created after the template change; existing request workflow step instances are not rewritten.
- The UI edits existing seeded steps only. Adding, deleting, duplicating, and reordering by drag-and-drop are not implemented yet.
- Active/inactive template management is not exposed yet; the API reads active templates only.
- Request detail pages do not yet render `request_workflow_steps`; that is Phase 3.

### Verification

- `npm.cmd test` passed: 36 test files, 143 tests.
- `npm.cmd run build` passed on Next.js 16.2.2.
- `npm.cmd run lint` passed with 58 existing warnings and 0 errors.
- Build still reports the existing Next.js middleware deprecation warning; Phase 2 did not change middleware/proxy behavior.

## Phase 3: Request Detail Workflow Step System

Status: Implemented and verified.

### What Changed

- Request detail pages now load `request_workflow_steps` for the current request.
- Added a workflow-step task section grouped by phase with owner, due date, status, and required/optional badges.
- Staff can mark workflow steps `complete`, reopen them to `not_started`, move them to `in_progress`, and skip optional steps.
- Workflow step updates use server actions and are recorded in `audit_events`.
- Request status updates now use a server action instead of direct browser writes.
- Marking a request complete is blocked server-side when required workflow steps exist and any required step is not complete.
- Legacy `checklist_items` remain as a fallback for requests that do not have workflow step instances.
- Overview now summarizes real workflow step completion when workflow steps exist.
- Added focused tests for workflow step normalization, grouping, owner/status labels, and incomplete-required counting.

### How To Test

1. Apply the Phase 1 migration so request workflow steps exist.
2. Open a Baptism, Wedding, Funeral, or OCIA request detail page.
3. Go to the Scheduling tab and review Workflow steps.
4. Mark a required step complete, reopen it, and set it in progress.
5. Confirm optional steps can be skipped.
6. Try to mark the request complete while a required workflow step is open; Vinea should block completion.
7. Complete all required workflow steps and confirm the request can be marked complete once other completion rules are satisfied.
8. Check request activity for workflow step updates.
9. Run:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

### Known Risks

- Dashboard command-center and daily brief summaries still derive checklist counts from legacy `checklist_items`; request detail is now workflow-step-first, but list-level summaries are not fully migrated yet.
- Workflow steps are loaded client-side on the request detail page; a future cleanup should move more request detail data loading server-side.
- Existing requests without workflow step instances still use the legacy checklist fallback.
- Phase 3 does not add document requirements or uploads; that remains Phase 4.

### Verification

- `npm.cmd test` passed: 37 test files, 146 tests.
- `npm.cmd run build` passed on Next.js 16.2.2.
- `npm.cmd run lint` passed with 58 existing warnings and 0 errors.
- Build still reports the existing Next.js middleware deprecation warning; Phase 3 did not change middleware/proxy behavior.

## Phase 4: Request Document Support

Status: Implemented and verified.

### What Changed

- Added private Supabase Storage bucket setup for `request-documents`.
- Added `request_documents` with staff-only RLS scoped by `is_authorized_staff()`, `primary_parish_id()`, and `request_belongs_to_primary_parish(request_id)`.
- Documents can optionally be linked to a request-specific `request_workflow_steps` row.
- Added staff-protected document APIs:
  - `GET /api/requests/[id]/documents` lists documents for a scoped request.
  - `POST /api/requests/[id]/documents` uploads a document server-side, writes metadata, and records an audit event.
  - `GET /api/requests/[id]/documents/[documentId]` returns a short-lived signed download URL.
  - `PATCH /api/requests/[id]/documents/[documentId]` approves or rejects a document with an optional review note.
- Added a request-detail “Request documents” section under Workflow steps.
- Staff can upload documents, select a document type, tie a document to a workflow step, open the private file, and approve or reject it.
- Added audit event labels for document uploads and reviews.
- Added focused unit tests for document filename sanitization, status normalization, row normalization, and file-size formatting.

### How To Test

1. Apply Supabase migrations through the normal project migration process.
2. Open a Baptism, Wedding, Funeral, or OCIA request detail page as authorized staff.
3. Go to the Scheduling tab and find Workflow steps.
4. In Request documents, upload a small PDF or image.
5. Optionally choose a workflow step before uploading.
6. Confirm the document appears in the list with `Pending review`.
7. Click Open and verify the document opens through a signed URL.
8. Add an optional review note and approve or reject the document.
9. Check request activity or `/dashboard/admin/audit-log` for document upload and review events.
10. Run:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

### Known Risks

- This phase is staff-facing only. Families cannot upload documents yet; that remains Phase 5.
- Required document rules are not yet modeled at the workflow-template level. Staff can tie uploaded files to workflow steps, but Vinea does not yet auto-block completion based on missing or rejected documents.
- Uploaded files are limited to 10 MB in the server route, but file type restrictions are intentionally broad for parish paperwork.
- Storage access is private and mediated by server-generated signed URLs; direct browser storage policies are not opened in this phase.

### Verification

- `npm.cmd test` passed: 38 test files, 149 tests.
- `npm.cmd run build` passed on Next.js 16.2.2.
- `npm.cmd run lint` passed with 58 existing warnings and 0 errors.
- Build still reports the existing Next.js middleware deprecation warning; Phase 4 did not change middleware/proxy behavior.
