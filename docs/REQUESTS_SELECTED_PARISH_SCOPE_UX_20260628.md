# Requests Selected-Parish Scope UX

Status: Prepared as a safe multi-parish tenant-readiness hardening phase on 2026-06-28.

## Scope

This change adds a visible selected-parish scope label to the staff Requests page. It does not access production, apply migrations, change operational RLS, touch Google Calendar data, or expose secrets.

## What Changed

- The `/dashboard/requests` server page now derives the active parish display name from `loadActiveStaffParishSwitcherContext`.
- `DashboardPageCore` accepts `activeParishName` as display-only context.
- The Requests view shows `Requests are scoped to ...` when the active parish name is available.
- The existing request loading path remains scoped by the validated `activeParishId`.

## What Changed Plain English

The Requests page now says which parish the request list belongs to. Staff could already switch parish context, but this makes the selected parish obvious on the page they use most often.

## Why This Matters

Requests are one of the most important parish workflows in Vinea. A visible parish label helps staff avoid confusion when they have access to more than one parish, especially during demos, QA, and future diocesan deployments.

## Validation

- Source-level test confirms the Requests page passes the active parish name into `DashboardPageCore`.
- Source-level test confirms `DashboardPageCore` renders the visible `Requests are scoped to` label only for the Requests view.
- Source-level test confirms request data loading still uses the selected active parish id.

## Known Risks

- This is a UX clarity improvement only. It does not change request visibility rules or promote production RLS.
- Browser QA should still verify that the label updates after parish switching in shared QA or another approved non-production environment.

## Recommended Next Phase

Run browser QA for the Requests selected-parish scope label, or continue hardening another low-risk selected-parish UX surface while production RLS remains `NO-GO`.
