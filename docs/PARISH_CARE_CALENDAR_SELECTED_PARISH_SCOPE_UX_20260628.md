# Parish Care Calendar Selected-Parish Scope UX

Status: Completed as a safe multi-parish tenant-readiness hardening phase on 2026-06-28.

## Scope

This change adds a visible selected-parish scope label to the staff Parish Care Calendar page. It does not access production, apply migrations, change operational RLS, touch Google Calendar routes or data, or expose secrets.

## What Changed

- `loadParishCareCalendar` now returns the resolved active parish display name from the existing active-parish context.
- `DashboardCalendarPageClient` displays `Parish care calendar is scoped to ...` when the active parish name is available.
- Existing calendar data loading remains scoped by the same validated active parish id already used for dashboard requests and Mass Intentions.

## What Changed Plain English

The Parish Care Calendar now says which parish the calendar belongs to. Before this, the data could already be scoped to the selected parish, but staff had to infer that from the top parish switcher.

## Why This Matters

The calendar combines follow-ups, sacraments, OCIA milestones, funerals, weddings, baptisms, and Mass intentions. A visible parish label helps staff avoid acting on the wrong parish's pastoral work when they can switch between parishes.

## Validation

- Loader tests confirm the active parish name is returned from the validated active-parish context.
- Loader tests confirm stale active-parish cookies still fall back to the resolver-approved parish.
- Source validation confirms the client renders the selected-parish label.
- Source validation confirms this is display-only and does not change operational RLS, migrations, production access, or Google Calendar behavior.

## Known Risks

- This is a UX clarity improvement only. It does not promote production RLS or change calendar query rules.
- Browser QA should still verify the label updates after parish switching in shared QA or another approved non-production environment.

## Recommended Next Phase

Run browser QA for the Parish Care Calendar selected-parish scope label, or continue hardening another low-risk selected-parish UX surface while production RLS remains `NO-GO`.
