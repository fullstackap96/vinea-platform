# Workflow Templates + Document Portal Release Readiness

Last Updated: 2026-06-22

Use this checklist before treating the Workflow Templates + Document Portal milestone as ready for parish pilot or production rollout.

## Release Position

Status: Release candidate after QA.

The milestone is implemented through Phase 5 and has passed migration verification, authenticated staff QA, external integration QA, and local build/test/lint checks against the QA Supabase project `gnfomgsuottcuueasfvi`.

## Evidence From QA

- Supabase MCP verified all repository migrations are recorded in QA.
- Supabase MCP verified migration-critical objects exist:
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
  - Private storage bucket `request-documents`
- `/api/health` returned `ok: true` with `checks.schema: true`.
- Authenticated staff QA passed for Settings, Reports, Calendar, Communications, Intake, workflow steps, staff document upload, family portal link creation, AI summary, and email route execution.
- Family portal QA confirmed the family view exposes only basic request context, required family-owned workflow steps, and redacted document metadata.
- Google Calendar QA passed after reconnect:
  - Create returned HTTP 200.
  - Update returned HTTP 200.
  - Delete returned HTTP 200.
  - The disposable QA request's Google Calendar fields were null after delete.
  - Direct Google Calendar search found no active stale matching QA events.
- Latest full local checks passed:
  - `npm.cmd test`: 43 files, 160 tests.
  - `npm.cmd run build`: passed on Next.js 16.2.2.
  - `npm.cmd run lint`: passed with 58 existing warnings and 0 errors.

## Ship Gates

- [x] All Workflow Templates + Document Portal migrations are present locally.
- [x] QA database migration ledger matches repository migrations.
- [x] QA database has the additional legacy-access cleanup migration represented locally.
- [x] `/api/health` reports schema-ready.
- [x] Workflow templates exist for Baptism, Wedding, Funeral, and OCIA.
- [x] New supported intake requests instantiate request workflow steps.
- [x] Staff can view and update request workflow steps.
- [x] Required workflow steps block request completion while incomplete.
- [x] Staff can upload documents to the private `request-documents` bucket.
- [x] Staff can tie documents to request workflow steps.
- [x] Staff can approve or reject request documents.
- [x] Staff can create family portal upload links.
- [x] Family portal tokens are hashed in storage, expiring, and revocable in the database.
- [x] Family portal view is redacted and limited to family-facing context.
- [x] Family upload path creates pending-review documents in private storage.
- [x] Audit events are written for workflow step updates, document actions, family portal links, AI summary, and email route QA.
- [x] Google Calendar create/update/delete works after OAuth reconnect.
- [x] No stale active Google Calendar QA event remains from the disposable request test.
- [x] Temporary QA staff Auth users were deleted and staff rows deactivated after testing.

## Pre-Release Checklist

- [ ] Confirm the target deployment environment points at the intended Supabase project.
- [ ] Confirm all required environment variables are configured in the target host:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL`
  - `STAFF_ALLOWLIST_EMAILS` or at least one active `staff_users` admin
  - `CRON_SECRET`
- [ ] Confirm optional integration variables before demoing those features:
  - `OPENAI_API_KEY`
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_OAUTH_STATE_SECRET`
- [ ] Run the final release checks:

```bash
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

- [ ] Open `/api/health` in the target environment and confirm:

```json
{"ok":true,"checks":{"env":true,"supabase":true,"parishes":true,"schema":true}}
```

- [ ] Sign in as an authorized admin and confirm `/dashboard/settings` loads.
- [ ] Confirm at least one active admin staff row exists in `staff_users`.
- [ ] Confirm public intake still creates a request through `/api/intake`.
- [ ] Confirm anonymous clients cannot directly write to parish operational tables.
- [ ] Confirm the private storage bucket `request-documents` exists and is not public.
- [ ] Confirm Google Calendar is connected in Settings if calendar sync will be used.
- [ ] Confirm Resend sender/domain is approved before sending real emails.
- [ ] Confirm OpenAI usage is enabled only for staff-reviewed AI summaries and drafts.

## Pilot Smoke Test

Use a clearly named disposable request and safe test data.

- [ ] Submit or create a Baptism request with a confirmed future date.
- [ ] Open the request detail page as staff.
- [ ] Verify workflow steps appear and are grouped by phase.
- [ ] Mark one required staff workflow step complete.
- [ ] Reopen that step and set it back to complete.
- [ ] Verify completion is blocked while required steps are incomplete.
- [ ] Upload a small safe PDF or image as a staff document.
- [ ] Tie the document to a family-owned workflow step.
- [ ] Open the staff signed URL and verify the document loads.
- [ ] Approve or reject the uploaded document.
- [ ] Create a family portal link.
- [ ] Open the family portal in a clean session.
- [ ] Confirm the portal does not expose internal notes, AI notes, audit logs, staff-only fields, staff email, private storage paths, or arbitrary documents.
- [ ] Upload a small safe family document.
- [ ] Return to staff view and confirm the family upload appears as pending review.
- [ ] Generate an AI summary and confirm it is saved as internal staff context.
- [ ] Send a test email only to a safe test recipient.
- [ ] Create, update, and delete a Google Calendar event if the QA/pilot calendar is connected.
- [ ] Verify no stale Google Calendar test event remains after delete.

## Known Residual Risks

- V1 parish scoping still depends on `primary_parish_id()` and is not production-ready multi-parish tenancy.
- Family portal links are bearer tokens. Anyone with the link can upload until expiration or database revocation.
- Staff UI can create portal links, but does not yet expose revocation or link history.
- Required document rules are inferred from required family-owned workflow steps; there is no separate document-requirement template model yet.
- The portal intentionally does not show staff review notes to families, including rejected-document notes.
- Google OAuth can expire or be revoked again and may need reconnect.
- Google Calendar currently requests broad calendar access for create, update, delete, and conflict checks.
- Email QA used a safe fake recipient but still exercised the configured Resend route.
- Supabase security advisors still report existing warnings, including publicly executable security-definer functions and intentional RLS-with-no-policy service-role-only tables.
- Build still reports the existing Next.js middleware deprecation warning.
- Lint still has 58 existing warnings, but no errors.

## Release Recommendation

The milestone is ready for controlled pilot release after the Pre-Release Checklist is completed in the target deployment environment.

Do not position this as multi-parish/diocesan production-ready until tenant scoping is replaced with real user-to-parish membership and the security-advisor warnings are reviewed into an explicit production risk register.
