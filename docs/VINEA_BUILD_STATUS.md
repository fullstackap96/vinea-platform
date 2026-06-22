# Vinea Build Status

Last Updated: 2026-06-22

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
- Added a request-detail "Request documents" section under Workflow steps.
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

## Phase 5: Secure-Token Family Document Portal

Status: Implemented and verified.

### What Changed

- Added `request_portal_tokens` for revocable, expiring family document portal links.
- Raw family portal tokens are never stored; only SHA-256 token hashes are persisted.
- `request_portal_tokens` has RLS enabled with no anon/authenticated policies. Access is mediated through server-side routes after staff authorization or token validation.
- Added `POST /api/requests/[id]/portal-token` so authorized staff can generate a 30-day family upload link from the request detail document panel.
- Added `/family/request/[token]` as a family-facing document portal.
- Added `POST /api/family/request-portal/[token]/documents` for token-based family uploads.
- Family uploads go into the private `request-documents` bucket and create `request_documents` rows with `pending_review` status.
- The family portal exposes only:
  - Parish name.
  - Basic request label, submitted contact name, request type, child name when present, and link expiration.
  - Required workflow steps where `owner_type = 'family'`.
  - Redacted document metadata tied to those required family-owned workflow steps.
- The family portal does not expose internal notes, staff-only request fields, communication history, AI notes, audit logs, assignment data, private storage paths, staff review notes, or arbitrary documents not tied to family-facing workflow steps.
- Staff can copy the generated family upload link from the Request documents panel.
- Added audit labels for family portal link creation and family document uploads.
- Added focused tests to ensure family portal document metadata is filtered to family-facing workflow steps and staff-only document fields are redacted.

### How To Test

1. Apply Supabase migrations through the normal project migration process.
2. Open a Baptism, Wedding, Funeral, or OCIA request detail page as authorized staff.
3. Ensure the request has at least one required workflow step owned by `Family`.
4. Go to the Scheduling tab and find Request documents.
5. Click `Create family upload link`.
6. Open the generated `/family/request/[token]` link in a new browser session or private window.
7. Confirm the page shows only basic request context and required family-owned workflow steps.
8. Upload a small PDF or image for one requested document.
9. Return to the staff request detail page and confirm the document appears as `Pending review`.
10. Approve or reject the uploaded document from the staff UI.
11. Confirm invalid or expired token links show the generic unavailable-link message.
12. Run:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

### Known Risks

- Portal links are bearer tokens. Anyone with the link can upload documents until expiration or revocation in the database.
- Staff UI can create links, but revocation and link history are not exposed in the UI yet.
- Required document rules are still inferred from required family-owned workflow steps; there is no separate document-requirement template model yet.
- The portal intentionally does not expose staff review notes to families, even for rejected documents, because Phase 4 review notes may contain internal context.
- The portal does not yet send automated email invitations or upload confirmations.

### Verification

- `npm.cmd test` passed: 39 test files, 150 tests.
- `npm.cmd run build` passed on Next.js 16.2.2.
- `npm.cmd run lint` passed with 58 existing warnings and 0 errors.
- Build still reports the existing Next.js middleware deprecation warning; Phase 5 did not change middleware/proxy behavior.

## Platform QA Pass: Buttons, Links, Forms, and Workflow Triggers

Status: Completed with limited live authenticated coverage.

### What Changed

- Paused new feature work and performed a stability-focused QA pass across the current Vinea app.
- Reviewed static page and route coverage for landing, login, dashboard routes, request detail components, people, households, sacramental records, mass intentions, settings, reports, public intake, family portal, and API-backed workflows.
- Verified all literal in-app hrefs found by static scan resolve to known app routes.
- Verified all literal `/api/...` fetch targets found by static scan resolve to known route handlers.
- Verified no form-contained buttons were missing an explicit `type`, reducing accidental form submissions.
- Verified public pages render locally:
  - `/`
  - `/join-parish-request`
  - `/baptism-request`
  - `/funeral-request`
  - `/wedding-request`
  - `/ocia-request`
  - `/login`
  - `/family/request/not-a-real-token`
- Verified unauthenticated `/dashboard` redirects to `/login?next=%2Fdashboard`.
- Verified empty public intake submissions are blocked by required-field validation and focus the first invalid input.
- Reviewed request workflow server actions for status updates, assignment updates, follow-up dates, waiting-on blockers, workflow steps, playbook application, notes, and intake edits.
- Reviewed people, households, sacramental records, and mass intention server actions for structured validation and error returns.
- Fixed broken mojibake fallback text in the request detail header funeral fields by replacing `â€”` with the intended missing-value dash.
- Kept the Phase 5 portal hardening from the interrupted turn: family portal document loading now exposes only required family-owned workflow steps.

### Broken Or Suspicious Items Found

- Request detail funeral header fallback values had visible broken characters (`â€”`) in several fields.
- Live authenticated dashboard mutation testing could not be completed because the local browser session was unauthenticated and no staff credentials were available in this QA pass.
- Google Calendar, outbound email, and AI actions were reviewed statically but not live-clicked, because they can create external side effects and require configured providers.

### How To Test

1. Start the app locally with:

```bash
npm.cmd run dev -- -p 3000
```

2. Open `/` and confirm landing navigation reaches public request forms and `/login`.
3. Open each public intake form and click `Submit request` with empty fields; validation should block the submission.
4. Open `/dashboard` while signed out; Vinea should redirect to `/login?next=%2Fdashboard`.
5. Sign in with an authorized staff account.
6. Manually verify authenticated workflows:
   - Open the dashboard and navigate all sidebar items.
   - Open a request detail page from the request list.
   - Update request status, assignment, follow-up date, waiting-on blocker, workflow step status, internal notes, and documents.
   - Create, edit, and view people, households, sacramental records, and mass intentions.
   - Generate a certificate for a supported record.
   - Use search, filters, and sort controls.
   - Test Google Calendar, email, and AI actions only against safe configured test accounts.
7. Run:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

### Known Risks

- Authenticated manual QA still needs to be run with a real staff session and safe test data.
- Google Calendar, email, AI, certificate downloads, and family document uploads should be tested against configured non-production credentials before demos.
- The app still reports the existing Next.js middleware deprecation warning during build.
- Lint still reports 58 existing warnings, all warnings and no errors.

### Verification

- Static route scan passed: 67 literal app hrefs checked, 0 missing route targets.
- Static API scan passed: all literal `/api/...` fetch targets checked, 0 missing route handlers.
- Static form-button scan passed: 0 form-contained buttons missing explicit `type`.
- Browser smoke test passed for landing, public intake pages, login, unauthenticated dashboard redirect, and invalid family portal token page.
- `npm.cmd test` passed: 39 test files, 150 tests.
- `npm.cmd run build` passed on Next.js 16.2.2.
- `npm.cmd run lint` passed with 58 existing warnings and 0 errors.

## Authenticated Staff QA Pass: Safe Test Data

Status: Completed with migration gaps documented.

### What Changed

- Created a temporary authenticated QA staff session and verified staff dashboard access in the browser.
- Created a safe Baptism QA request through `/api/intake` and verified it appears in the authenticated request list.
- Verified request list search finds the QA request and the request detail route opens correctly.
- Verified request status update, assignment update, internal note creation, legacy checklist completion, and completion readiness guarding on the QA request.
- Fixed public intake so valid submissions do not fail when the workflow-template RPC is not present in the connected database yet.
- Fixed request follow-up date saving so the visible date input value is used at save time; this prevents silent blank saves from date-input/browser state quirks.
- Fixed authenticated route-handler staff authorization in local development when the `staff_users` table has not been migrated yet, without weakening production behavior.
- Replaced raw Supabase schema-cache errors with staff-readable messages for missing document storage, family portal token, and audit-event migrations.
- Verified create, edit, and view flows for People, Households, Sacramental Records, and Mass Intentions using clearly named QA records.
- Verified a supported record detail page exposes the `Generate certificate` action.
- Verified authenticated navigation loads Dashboard, Requests, People, Households, Records, Mass Intentions, Settings, Reports, Calendar, Communications, and Intake routes.

### Broken Or Suspicious Items Found

- The connected QA database is missing several migrations/tables/columns:
  - `create_request_workflow_steps_from_active_template`
  - `public.staff_users`
  - `public.request_documents`
  - `public.request_portal_tokens`
  - `public.audit_events`
  - `parishes.daily_ops_brief_enabled`
  - `requests.waiting_on_changed_at`
- Because of those migration gaps, workflow-step instances, document upload, family portal links, Settings, Reports, Calendar, Communications, and Intake could not be fully live-verified against this database.
- Google Calendar, outbound email, and AI generation were not live-clicked because no safe external test provider credentials were confirmed for this QA pass.
- The login form works, but its email/password controls are placeholder-only in the rendered UI; adding explicit accessible labels would improve usability.

### How To Test

1. Apply all Supabase migrations through the normal project migration process, especially the staff access, audit-event, workflow-template, document, and portal-token migrations.
2. Start the app:

```bash
npm.cmd run dev -- -p 3000
```

3. Sign in with an authorized staff test account.
4. Submit a safe public intake request and confirm it appears in `/dashboard/requests`.
5. Open the request detail page and verify:
   - Status update.
   - Assignment update.
   - Follow-up date save.
   - Internal note save.
   - Workflow/checklist status updates.
   - Completion remains unavailable until required readiness items are done.
   - Document upload and family upload link after Phase 4/5 migrations are present.
6. Create, edit, and view one safe QA person, household, sacramental record, and Mass intention.
7. Open a Baptism record detail and verify the certificate generation action is present.
8. Test Google Calendar, email sending, and AI generation only with confirmed safe provider credentials.

### Known Risks

- The connected QA database is behind the repository migrations, so several modules fail due schema drift rather than current code paths.
- Document upload and family portal token creation are now safe/friendly when migrations are absent, but still require the Phase 4/5 database objects and storage bucket to work end-to-end.
- Google Calendar, email, and AI actions still need a dedicated non-production credential pass.

### Verification

- Authenticated browser QA passed for request list/detail navigation, request status, assignment, follow-up, notes, checklist readiness, people, households, records, certificates, Mass intentions, search, and filters.
- Document portal live execution was blocked by missing Phase 4/5 migrations; staff-facing errors now identify the missing setup clearly.
- `npm.cmd test` passed: 41 test files, 155 tests.
- `npm.cmd run build` passed on Next.js 16.2.2.
- `npm.cmd run lint` passed with 58 existing warnings and 0 errors.

## QA Database Migration Application Attempt

Status: Blocked before migration execution.

### What Changed

- Verified the repository contains all expected Supabase migration files through:
  - `20260618130000_request_waiting_on_changed_at.sql`
  - `20260619120000_daily_ops_brief_settings.sql`
  - `20260620100000_staff_users_authorization.sql`
  - `20260620110000_parish_admin_readiness.sql`
  - `20260620113000_audit_event_target_index.sql`
  - `20260621100000_workflow_templates_phase1.sql`
  - `20260621130000_request_documents_phase4.sql`
  - `20260621140000_request_portal_tokens_phase5.sql`
- Checked local tooling and environment for safe migration execution.
- Confirmed this workspace currently has Supabase API keys, but not a direct Postgres connection string.
- Confirmed neither `supabase` CLI nor `psql` is available in the local shell.
- Confirmed the QA database does not expose an admin SQL RPC such as `exec_sql`, `execute_sql`, `run_sql`, or `sql`.

### Blocker

The current workspace cannot apply DDL migrations to the QA Supabase database. Supabase service-role API access can query and mutate rows, but it cannot create tables, alter columns, create RLS policies, create functions, or apply migration SQL without one of:

- A direct Postgres connection string (`SUPABASE_DB_URL` / `DATABASE_URL`) usable by `psql`.
- Supabase CLI installed and authenticated to the target QA project.
- A Supabase access token/project ref workflow that can run migrations through the official CLI.
- A pre-existing privileged SQL execution RPC in the QA database.

### QA Impact

Authenticated QA for Settings, Reports, Calendar, Communications, Intake, Workflow Steps, Document Upload, and Family Portal should be rerun after migrations are applied. Running those flows before migration application would only reproduce the known schema-drift failures already documented above.

Google Calendar, email, and AI actions still also require confirmed safe non-production provider credentials before live-click testing.

### Next Step

Provide one safe migration path for the QA database:

```bash
SUPABASE_DB_URL=postgresql://...
```

or install/authenticate the Supabase CLI for this project, then rerun the migration and authenticated QA prompt.

## Health Schema Readiness Guard

Status: Completed.

### What Changed

- Added schema readiness checks to `/api/health` so deployments can identify the exact pending Supabase migrations that block QA and production readiness.
- The health check now verifies the migration-critical objects for the current Workflow Templates + Document Portal work:
  - `staff_users`
  - `audit_events`
  - `workflow_templates`
  - `request_workflow_steps`
  - `request_documents`
  - `request_portal_tokens`
  - Daily-brief columns on `parishes`
  - `waiting_on_changed_at` on `requests`
  - `create_request_workflow_steps_from_active_template`
- Added focused unit tests for missing table, missing column, missing RPC, and unexpected database errors.
- Confirmed Supabase MCP is installed and OAuth-authenticated in the Codex CLI config, but this active Codex session still does not expose callable Supabase MCP tools through tool discovery.

### Why This Was The Next Safe Phase

- The roadmap file is still absent, but the single-source doc and build status show Workflow Templates + Document Portal as the highest-priority active initiative.
- The next incomplete work is not another feature surface; it is migration readiness and authenticated QA after schema alignment.
- Since this active session cannot call Supabase MCP tools and has no `SUPABASE_DB_URL`, adding a non-destructive readiness guard is the safest code-side step that directly supports the incomplete initiative.

### How To Test

1. Ensure the app has Supabase env vars configured.
2. Run:

```bash
npm.cmd run dev -- -p 3000
```

3. Open `/api/health`.
4. If migrations are missing, the response should include:
   - `checks.schema: false`
   - `error: "schema"`
   - `missingSchema` labels identifying the missing migration-critical objects.
5. After all migrations are applied, `/api/health` should report `checks.schema: true`.

### Known Risks

- `/api/health` remains unauthenticated by design and now exposes non-secret schema readiness labels. It does not expose connection strings, keys, or data values.
- The health check cannot apply migrations; it only identifies schema readiness.
- Supabase MCP tools may require a fresh Codex session before they become callable, despite successful CLI OAuth registration.

### Verification

- `npm.cmd test` passed: 42 test files, 158 tests.
- `npm.cmd run build` passed on Next.js 16.2.2.
- `npm.cmd run lint` passed with 58 existing warnings and 0 errors.

## QA Migration Verification + Authenticated Retest

Status: Completed with one external integration blocker.

### What Changed

- Used the Supabase MCP server for project `gnfomgsuottcuueasfvi`.
- Verified the remote migration ledger records all 32 repository migrations.
- Verified one additional remote migration is present: `20260622142000_cleanup_legacy_permissive_policies`.
- Verified migration-critical schema objects exist in QA:
  - `staff_users`
  - `audit_events`
  - `workflow_templates`
  - `workflow_template_steps`
  - `request_workflow_steps`
  - `request_documents`
  - `request_portal_tokens`
  - `requests.waiting_on_changed_at`
  - `parishes.daily_ops_brief_enabled`
  - `parishes.daily_ops_brief_email`
  - `create_request_workflow_steps_from_active_template(uuid)`
  - private Supabase Storage bucket `request-documents`
- Fixed `/api/health` schema readiness to check `parishes.daily_ops_brief_email`, matching `20260619120000_daily_ops_brief_settings.sql`, instead of the non-existent `daily_ops_brief_recipients`.
- Added a focused test to prevent daily-brief health-check column drift.
- Verified `/api/health` returns `ok: true` and `checks.schema: true` locally against the QA Supabase project.
- Created a temporary safe QA staff account and safe Baptism QA request.
- Verified authenticated staff pages load without visible alert errors:
  - Settings
  - Reports
  - Calendar
  - Communications
  - Intake
- Verified request detail workflow steps instantiate from the active template and a staff workflow step can be marked complete.
- Verified staff document upload through the authenticated route into the private `request-documents` bucket.
- Verified staff family portal link creation and the family-facing portal view.
- Verified the family portal exposes only basic request context, family-owned required workflow steps, and redacted document metadata; it did not expose staff email, audit activity, AI summary, internal notes, or staff-only notes in the checked view.
- Verified AI summary generation through the authenticated request detail UI; the summary was saved and audited.
- Verified email sending through the authenticated request detail UI using a fake `example.com` family address; the communication and audit entries were created.
- Attempted Google Calendar event creation on the QA request. The route returned the expected user-facing failure because the stored Google Calendar connection is expired or revoked.
- Cleaned up the temporary QA staff access after testing by deleting the Supabase Auth user, marking its `staff_users` row inactive, and revoking the generated family portal token.

### How To Test

1. Ensure local `.env.local` points at QA Supabase project `gnfomgsuottcuueasfvi`.
2. Start the app:

```bash
npm.cmd run dev -- -p 3000
```

3. Open `/api/health` and confirm:
   - `ok: true`
   - `checks.schema: true`
4. Sign in as an authorized staff test account.
5. Open `/dashboard/settings`, `/dashboard/reports`, `/dashboard/calendar`, `/dashboard/communications`, and `/dashboard/intake`.
6. Submit or create a safe Baptism request.
7. Open the request detail page and verify:
   - Workflow steps appear and can be updated.
   - A document can be uploaded and tied to a family-owned workflow step.
   - A family upload link can be created.
   - The family portal only shows basic context, family-owned required workflow steps, and redacted document metadata.
   - AI summary generation saves an internal summary.
   - Email sending logs a communication and audit event when using a safe test recipient.
8. Reconnect Google Calendar in Settings, then retry create/update/delete calendar event QA on a disposable future-dated request.
9. Run:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

### Known Risks

- Google Calendar live event creation is blocked until the parish reconnects Google Calendar; the current stored connection appears expired or revoked.
- QA created disposable test data in the QA project: a Baptism QA request and a document row/storage object. The temporary staff auth user was deleted, its `staff_users` row was deactivated, and the family portal token was revoked after testing.
- Email QA used a fake `example.com` address, but it still exercised the configured Resend route.
- Supabase security advisors still report existing warnings, including publicly executable security-definer functions and several intentional RLS-with-no-policy service-role-only tables. These were not changed in this QA pass.
- A transient Supabase refresh-token console error appeared during the browser sign-in session, but the authenticated session remained usable and all checked dashboard pages loaded.

### Verification

- Supabase MCP `list_migrations` showed all repo migrations recorded in QA.
- Supabase object checks confirmed migration-critical tables, columns, RPC, RLS, and private document bucket are present.
- `/api/health` returned:

```json
{"ok":true,"checks":{"env":true,"supabase":true,"parishes":true,"schema":true,"resend":true,"googleOAuth":true}}
```

- `npm.cmd test` passed: 42 test files, 159 tests.
- `npm.cmd run build` passed on Next.js 16.2.2.
- `npm.cmd run lint` passed with 58 existing warnings and 0 errors.

## Repo Migration Parity + Legacy Access Cleanup

Status: Implemented.

### What Changed

- Added the missing local migration file for the QA-applied migration version `20260622142000_cleanup_legacy_permissive_policies`.
- The migration removes legacy anonymous insert policies from public-intake-era direct table writes.
- The migration revokes direct anonymous table privileges across parish operational tables.
- The migration revokes inherited `PUBLIC` execution of parish-scoping helper functions, then explicitly grants authenticated staff the helper execution needed by RLS.
- The migration revokes direct browser-role execution of trigger/helper functions while preserving authenticated staff RLS and service-role route handlers.
- Added a focused static test to ensure the migration remains present and keeps the expected cleanup statements.

### Why This Was The Next Safe Phase

- Workflow Templates + Document Portal is complete through Phase 5.
- Authenticated QA passed after migrations, with Google Calendar blocked only by an expired/revoked external connection.
- The highest-value incomplete foundation item was repo/database drift: QA had an additional security cleanup migration that was not yet represented in the repository.
- Capturing that migration locally prevents future environments from missing the same security hardening.

### How To Test

1. Apply repository Supabase migrations to a disposable or QA Supabase project.
2. Confirm public intake still works through `/api/intake`.
3. Confirm anonymous clients cannot write directly to parish operational tables.
4. Confirm authenticated staff can still load dashboard data through existing RLS policies.
5. Run:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

### Known Risks

- This migration should be applied only after the earlier server-intake migration, because it assumes public forms no longer write directly through anon Supabase table policies.
- Authenticated staff RLS still depends on `primary_parish_id()`, `request_belongs_to_primary_parish(uuid)`, and `is_authorized_staff()` execution for the authenticated role; this migration does not revoke those authenticated grants.
- The QA database already records this migration version, so this file primarily restores repo parity for future environments and local migration history.

### Verification

- `npm.cmd test` passed: 43 test files, 160 tests.
- `npm.cmd run build` passed on Next.js 16.2.2.
- `npm.cmd run lint` passed with 58 existing warnings and 0 errors.
