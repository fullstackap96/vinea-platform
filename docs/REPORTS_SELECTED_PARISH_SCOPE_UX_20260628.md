# Reports Selected-Parish Scope UX

Status: Completed as a code-only tenant-readiness hardening phase. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar was not touched, and no secrets were exposed.

## Purpose

The Reports page already loaded dashboard request data through the selected active parish id. This phase makes that selected parish visible to staff so the reporting surface is easier to trust during multi-parish QA and future multi-parish staff use.

## What Changed

- `app/dashboard/reports/page.tsx` now passes the selected active parish display name into the reports client component.
- `app/dashboard/reports/DashboardReportsPage.tsx` now shows a small scope label in the page header when the selected parish name is available.
- The data-loading path still passes the selected active parish id into `loadDashboardRequests`.
- No report query behavior, RLS policy, migration, Google Calendar route, or production setting changed.

## What Changed Plain English

Before this update, the reports page could be filtered by the selected parish, but staff had to trust the parish selector at the top of the app. Now the reports page itself says which parish the numbers belong to.

## Why This Matters

Multi-parish staff need confidence that reports are showing the right parish. A visible scope label reduces mistakes during demos, QA, and future parish-cluster work.

## Validation

- Source validation confirms the server page derives the selected parish name from the active parish switcher.
- Source validation confirms the reports client displays `Reports are scoped to`.
- Source validation confirms report loading still passes `activeParishId` to `loadDashboardRequests`.
- Source validation confirms this phase does not touch Google Calendar code, migrations, operational RLS, or production secrets.

## Remaining Risks

- This is a UX clarity hardening step only. It does not promote production RLS.
- Manual browser verification is still useful after the next shared-QA app session to confirm the label appears with the cleaned QA parish names.

## Next Suggested Phase

Continue safe tenant-readiness by hardening another selected-parish reporting or integration surface, or run browser QA to confirm the reports scope label displays correctly after parish switching.
