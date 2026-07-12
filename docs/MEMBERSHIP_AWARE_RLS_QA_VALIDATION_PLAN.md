# Membership-Aware RLS QA Validation Plan

Status: Draft QA plan. Do not apply operational RLS changes from this document.

Related draft: `docs/sql/membership_aware_operational_rls_draft.sql`

## Purpose

This plan defines the disposable QA checks required before Vinea converts the membership-aware operational RLS draft into a real Supabase migration.

The goal is to prove that multi-parish staff can see and write only the parishes they are authorized for, while staff from unrelated parishes remain blocked.

## Safety Rules

- Do not run this plan against production data.
- Do not apply operational RLS changes until every case below passes in QA.
- Use disposable parishes, staff users, parishioners, requests, documents, notes, and records.
- Keep existing `primary_parish_id()` policies in place while this plan is executed.
- Verify `/api/health` returns `checks.schema: true` before and after QA.
- Confirm public intake, family portal, and staff dashboard still work after any future test migration.

## QA Data Setup

Create three disposable parishes:

- `QA Parish A`
- `QA Parish B`
- `QA Parish C`

Create three disposable staff identities:

- `qa.staff.a@example.test`: active member of Parish A only.
- `qa.staff.ab@example.test`: active member of Parish A and Parish B.
- `qa.staff.c@example.test`: active member of Parish C only.

Create matching `staff_users` and `parish_memberships` rows through the staff management flow where possible. If direct database setup is required, document every manual row inserted and delete it after validation.

Create data in Parish A and Parish B for:

- People
- Households
- Sacramental Records
- Mass Intentions
- Requests
- Request notes
- Request communications
- Request workflow steps
- Request documents

## Expected Access Matrix

| User | Parish A Data | Parish B Data | Parish C Data |
| --- | --- | --- | --- |
| `qa.staff.a@example.test` | Allow read/write | Deny read/write | Deny read/write |
| `qa.staff.ab@example.test` | Allow read/write | Allow read/write | Deny read/write |
| `qa.staff.c@example.test` | Deny read/write | Deny read/write | Allow read/write |

## Required Allow/Deny Cases

### People

- Allow `qa.staff.a@example.test` to list, create, and update a Person in Parish A.
- Deny `qa.staff.a@example.test` from reading, creating, or updating a Person in Parish B.
- Allow `qa.staff.ab@example.test` to list, create, and update People in both Parish A and Parish B.
- Deny `qa.staff.c@example.test` from reading People in Parish A or Parish B.

### Households

- Allow `qa.staff.a@example.test` to list, create, and update a Household in Parish A.
- Deny `qa.staff.a@example.test` from reading, creating, or updating a Household in Parish B.
- Allow `qa.staff.ab@example.test` to list, create, and update Households in both Parish A and Parish B.
- Deny `qa.staff.c@example.test` from reading Households in Parish A or Parish B.

### Sacramental Records

- Allow `qa.staff.a@example.test` to list, create, and update a Sacramental Record in Parish A.
- Deny `qa.staff.a@example.test` from reading, creating, or updating a Sacramental Record in Parish B.
- Allow `qa.staff.ab@example.test` to list, create, and update Sacramental Records in both Parish A and Parish B.
- Deny `qa.staff.c@example.test` from reading Sacramental Records in Parish A or Parish B.

### Mass Intentions

- Allow `qa.staff.a@example.test` to list, create, and update a Mass Intention in Parish A.
- Deny `qa.staff.a@example.test` from reading, creating, or updating a Mass Intention in Parish B.
- Allow `qa.staff.ab@example.test` to list, create, and update Mass Intentions in both Parish A and Parish B.
- Deny `qa.staff.c@example.test` from reading Mass Intentions in Parish A or Parish B.

### Requests

- Allow `qa.staff.a@example.test` to list and update a Request whose parishioner belongs to Parish A.
- Deny `qa.staff.a@example.test` from reading or updating a Request whose parishioner belongs to Parish B.
- Allow `qa.staff.ab@example.test` to list and update Requests in both Parish A and Parish B.
- Deny `qa.staff.c@example.test` from reading Requests in Parish A or Parish B.

### Request Notes

- Allow `qa.staff.a@example.test` to read and add a note on a Parish A Request.
- Deny `qa.staff.a@example.test` from reading or adding a note on a Parish B Request.
- Allow `qa.staff.ab@example.test` to read and add notes on Parish A and Parish B Requests.
- Deny `qa.staff.c@example.test` from reading notes on Parish A or Parish B Requests.

### Request Communications

- Allow `qa.staff.a@example.test` to read and create communication history for a Parish A Request.
- Deny `qa.staff.a@example.test` from reading or creating communication history for a Parish B Request.
- Allow `qa.staff.ab@example.test` to read and create communication history for Parish A and Parish B Requests.
- Deny `qa.staff.c@example.test` from reading communications on Parish A or Parish B Requests.

### Workflow Steps

- Allow `qa.staff.a@example.test` to read and update workflow steps for a Parish A Request.
- Deny `qa.staff.a@example.test` from reading or updating workflow steps for a Parish B Request.
- Allow `qa.staff.ab@example.test` to read and update workflow steps for Parish A and Parish B Requests.
- Deny `qa.staff.c@example.test` from reading workflow steps on Parish A or Parish B Requests.
- Before applying operational RLS, confirm the policy draft covers `request_workflow_steps` or document why it is handled by a separate migration.

### Documents

- Allow `qa.staff.a@example.test` to list, upload, approve, reject, and open signed URLs for documents on a Parish A Request.
- Deny `qa.staff.a@example.test` from listing, uploading, reviewing, or opening documents on a Parish B Request.
- Allow `qa.staff.ab@example.test` to list, upload, approve, reject, and open documents on Parish A and Parish B Requests.
- Deny `qa.staff.c@example.test` from reading documents on Parish A or Parish B Requests.
- Confirm direct Supabase Storage access remains private and all staff file access is mediated by server routes.
- Confirm family portal token access still exposes only safe family-facing data and does not inherit staff permissions.
- Before applying operational RLS, confirm the policy draft covers `request_documents` or document why it is handled by a separate migration.

## Regression Checks

- Public Baptism, Wedding, Funeral, OCIA, and Join Parish intake submissions still create requests.
- Request detail pages still load overview, notes, communications, workflow steps, and documents.
- People, Households, Records, and Mass Intentions lists honor the active parish selector.
- Creating People, Households, Records, Mass Intentions, and request-derived People uses the selected parish where allowed.
- Dashboard, Reports, Intake Queue, Calendar, Notifications, and Communications continue to load.
- Google Calendar, Email, and AI actions are tested only with safe test credentials.

## Exit Criteria

- Every allow case succeeds for the authorized parish.
- Every deny case returns no rows, no mutation, or a clear authorization failure.
- No anonymous client can directly read or write operational parish tables.
- No family portal route exposes staff-only data.
- No service-role-only storage path leaks to a family or staff client without a signed URL.
- Full tests, lint, build, and `/api/health` pass after the QA run.

## Cleanup

After validation, remove or archive all disposable QA data:

- Staff users and parish memberships.
- Parishioners and requests.
- People, households, records, and Mass Intentions.
- Request notes, communications, workflow steps, documents, and portal tokens.
- Uploaded test files in Supabase Storage.
