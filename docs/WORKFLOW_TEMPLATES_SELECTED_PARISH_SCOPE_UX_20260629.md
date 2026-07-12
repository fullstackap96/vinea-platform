# Workflow Templates Selected-Parish Scope UX

Date: 2026-06-29

## Status

Completed as a safe non-production tenant-readiness hardening phase.

## Scope

This phase added a display-only selected-parish label to the Workflow templates editor inside Parish settings.

## What Changed

- `SettingsWorkflowTemplatesSection` now accepts the active parish name already loaded by Parish settings.
- Parish settings now passes `loadedParishName` into the Workflow templates section.
- The Workflow templates section displays: `Workflow templates are scoped to {parish name}.`
- The existing active-parish Workflow Templates API read and write helpers remain unchanged.

## What Changed Plain English

The Workflow templates editor now says which parish it belongs to before staff edit Baptism, Wedding, Funeral, or OCIA process steps. This helps a multi-parish staff member avoid editing the wrong parish's checklist.

## Why This Matters

Workflow templates control how new parish requests are handled. Showing the selected parish inside the editor improves admin clarity and tenant-readiness without changing permissions, database policy, production behavior, or any live records.

## Safety Boundaries

- Production was not accessed.
- No migrations were applied.
- Operational RLS was not changed.
- Google Calendar data was not touched.
- Workflow templates were not mutated.
- Parish records were not mutated.
- Runtime authorization behavior was not changed.
- No secrets were exposed.

## Validation

- Source validation confirms the Workflow templates section accepts `activeParishName`.
- Source validation confirms Parish settings passes `loadedParishName` into the Workflow templates section.
- Source validation confirms the selected-parish label text is present.
- Route validation confirms Workflow Templates GET/PATCH remain backed by active parish read context and staff write parish context.

## Follow-Up

Run shared-QA browser verification that the Workflow templates selected-parish label updates after switching between authorized parishes, without saving workflow template edits.
