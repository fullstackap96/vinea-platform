# Role Work Hub Selected-Parish Scope UX

Status: Completed as a safe multi-parish tenant-readiness hardening phase on 2026-06-29.

## Scope

This change adds a visible selected-parish scope label to the Role Work Hub on the dashboard home. It does not access production, apply migrations, change operational RLS, touch Google Calendar routes or data, mutate request or communication records, or expose secrets.

## What Changed

- `DashboardPageCore` now passes the already validated active parish display name into `DashboardRoleWorkHub`.
- `DashboardRoleWorkHub` displays `Role work hub is scoped to ...` when the active parish name is available.
- The role lens buttons, request links, command center data, selected parish request loader scope, and staff work queue behavior were not changed.

## What Changed Plain English

The dashboard role hub now says which parish its work list belongs to. Before this, the work was already scoped by the selected parish, but staff had to infer that from the top parish switcher.

## Why This Matters

The Role Work Hub is meant to tell staff what needs attention first. A visible parish label helps multi-parish staff avoid acting on the wrong parish's queue when switching between pastorates, clusters, or diocesan support assignments.

## Validation

- Source validation confirms `DashboardPageCore` passes `activeParishName` into `DashboardRoleWorkHub`.
- Source validation confirms `DashboardRoleWorkHub` renders `Role work hub is scoped to`.
- Source validation confirms this phase does not change Google Calendar behavior, request mutations, operational RLS, migrations, production access, or secrets.

## Known Risks

- This is a UX clarity improvement only. It does not promote production RLS or change request query/write rules.
- Browser QA should still verify the label updates after parish switching in shared QA or another approved non-production environment.

## Recommended Next Phase

Run browser QA for the Role Work Hub selected-parish scope label, or continue hardening another low-risk selected-parish UX surface while production RLS remains `NO-GO`.
