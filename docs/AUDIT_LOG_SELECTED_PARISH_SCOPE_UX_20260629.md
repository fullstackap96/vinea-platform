# Audit Log Selected-Parish Scope UX

Status: Completed as a safe tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, runtime authorization behavior was not changed, and no secrets were exposed.

## What Changed

- Updated `/api/audit-events` to return the active parish display name from the same validated parish context used to filter audit events.
- Updated the admin Audit Log page to show a display-only `Audit log is scoped to ...` label when the API returns a parish name.
- Kept audit event filtering, action filters, refresh behavior, staff authorization, active parish authorization, request-target audit attribution, migrations, RLS policies, and production behavior unchanged.

## What Changed Plain English

The Audit Log page now clearly says which parish's activity history staff are reviewing. When staff serve more than one parish, this makes it easier to confirm they are looking at the right parish before interpreting staff changes, settings changes, intake activity, or request activity.

## Why This Matters

Audit logs are a trust and security surface. A clear selected-parish label makes multi-parish review safer without changing permissions or database policy.

## How To Test

1. Sign in to a shared-QA or other approved non-production staff account with access to more than one parish.
2. Open `/dashboard/admin/audit-log`.
3. Confirm the page shows `Audit log is scoped to <selected parish>.`
4. Switch to another authorized parish.
5. Confirm the Audit Log page reloads and the label updates to the newly selected parish.
6. Confirm filters and Refresh still work.
7. Confirm no production data, migrations, operational RLS, Google Calendar data, credentials, tokens, or signed URLs are involved.

## Known Risks

- This is a UX clarity improvement only. It does not promote production RLS.
- Browser QA should still verify the Audit Log label updates after parish switching in shared QA or another approved non-production environment.
- Production RLS remains `NO-GO` until the human owner/fixture intake is completed and explicitly approved.

## Outcome

Current status: `AUDIT_LOG_SELECTED_PARISH_SCOPE_UX_COMPLETE_NON_PRODUCTION_SAFE`

The Audit Log page now matches the selected-parish clarity pattern used by Settings, Reports, Requests, Parish Care Calendar, Global Search, People, Households, Sacramental Records, and Mass Intentions.
