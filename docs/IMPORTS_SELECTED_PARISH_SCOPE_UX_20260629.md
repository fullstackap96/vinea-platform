# Imports Selected-Parish Scope UX

Status: Completed as a safe tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, runtime authorization behavior was not changed, and no secrets were exposed.

## What Changed

- Updated `/api/imports` GET responses to return the active parish display name from the same validated parish context used to filter import history.
- Updated the Data Import page to show a display-only `Imports are scoped to ...` label when the API returns a parish name.
- Kept import preview, column mapping, commit behavior, recent import history, staff authorization, active parish authorization, write-safety parish context, migrations, RLS policies, and production behavior unchanged.

## What Changed Plain English

The Data Import page now clearly says which parish spreadsheet imports will affect. This matters because importing people, households, or sacramental records into the wrong parish would create cleanup work and could confuse staff.

## Why This Matters

Imports are a high-impact admin workflow. A visible selected-parish label helps multi-parish staff confirm the target parish before previewing or saving spreadsheet data, without changing permissions or database policy.

## How To Test

1. Sign in to a shared-QA or other approved non-production staff account with access to more than one parish.
2. Open `/dashboard/imports`.
3. Confirm the page shows `Imports are scoped to <selected parish>.`
4. Switch to another authorized parish.
5. Confirm the Imports page reloads and the label updates to the newly selected parish.
6. Confirm template download, preview, and recent import history still work.
7. Confirm no production data, migrations, operational RLS, Google Calendar data, credentials, tokens, or signed URLs are involved.

## Known Risks

- This is a UX clarity improvement only. It does not promote production RLS.
- Browser QA should still verify the Imports label updates after parish switching in shared QA or another approved non-production environment.
- Production RLS remains `NO-GO` until the human owner/fixture intake is completed and explicitly approved.

## Outcome

Current status: `IMPORTS_SELECTED_PARISH_SCOPE_UX_COMPLETE_NON_PRODUCTION_SAFE`

The Data Import page now matches the selected-parish clarity pattern used by Settings, Reports, Requests, Parish Care Calendar, Global Search, People, Households, Sacramental Records, Mass Intentions, and Audit Log.
