# Notifications Center Selected-Parish Scope UX - 2026-06-29

Status: Completed as a safe non-production tenant-readiness phase. Production was not accessed, no migrations were applied, runtime behavior was not changed beyond a display-only staff UI label, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

## Purpose

The dashboard Notifications Center already loads request notifications through the active parish context. This phase adds a visible display-only label in the dropdown header so staff can see which parish the "Needs attention" list is scoped to after they switch parish context.

## What Changed

- `app/dashboard/DashboardLayoutClient.tsx` now derives the selected parish display name from the validated parish switcher options.
- `DashboardLayoutClient` passes that name to `DashboardNotificationsCenter`.
- `app/dashboard/_components/DashboardNotificationsCenter.tsx` now renders `Scoped to {activeParishName}` in the open dropdown header when a selected parish name is available.
- No notification query, route authorization, audit behavior, RLS policy, migration, Google Calendar integration, or record mutation changed.

## Safety Boundaries

- Do not use this phase to access production.
- Do not apply migrations.
- Do not change operational RLS.
- Do not touch Google Calendar data.
- Do not mutate parish, request, communication, document, audit, workflow, or staff records.
- Do not expose secrets, database URLs, API keys, OAuth tokens, raw portal tokens, token hashes, signed URLs, private document contents, internal notes, AI prompts, AI outputs, or private parish data.

## Expected Staff Experience

1. A staff user signs in to a non-production environment with membership in more than one safe QA parish.
2. The staff user selects Parish A from the active parish selector.
3. The staff user opens the `Needs attention` dropdown.
4. The dropdown header shows `Scoped to Parish A`.
5. The staff user selects Parish B from the active parish selector.
6. The app refreshes the active parish context.
7. The staff user opens the `Needs attention` dropdown again.
8. The dropdown header shows `Scoped to Parish B`.

## Why This Matters

This is a small clarity improvement for multi-parish staff. When a secretary, pastor, or diocesan user switches parish context, the notification list now visibly confirms which parish's urgent work they are looking at. That lowers the risk of acting on the wrong parish's requests during shared staffing or cluster operations.

## Verification

- Source-level tests confirm the dashboard layout derives the selected parish name from validated parish switcher options.
- Source-level tests confirm the selected parish name is passed into the Notifications Center.
- Source-level tests confirm the dropdown renders the `Scoped to` label.
- Source-level tests confirm the Notifications Center loader remains active-parish scoped through `resolveActiveStaffParishContext` and `loadDashboardRequests`.

## Remaining Follow-Up

- Browser QA can later verify the label in shared QA after switching between authorized parishes.
- Production RLS remains `NO-GO` until separate explicit approval, production-safe fixtures, monitoring, rollback, and final go/no-go are complete.

## Project Completion Estimate

Estimated total project completion remains **73%**. This improves tenant-readiness polish and staff clarity, but production RLS, live production smoke evidence, tenant-security promotion, and broader customer-readiness work remain incomplete.
