# Public Intake Routing Selected-Parish Scope UX

Date: 2026-06-29

## Status

Completed as a safe non-production tenant-readiness hardening phase.

## Scope

This phase added a display-only selected-parish label to the Public intake routing card inside Parish settings.

## What Changed

- Parish settings now shows `Public intake routing is scoped to {parish name}.`
- The label uses the active parish name already loaded by the Settings page.
- The existing public intake routing settings API remains unchanged.
- Runtime public intake routing remains gated and was not enabled.

## What Changed Plain English

The Public Intake Routing area now tells staff which parish the routing settings belong to. This is useful for multi-parish staff because public intake routing controls future parish-specific links, domains, and tokens.

## Why This Matters

Public intake routing can eventually affect where family request forms create records. Showing the selected parish in this card makes the future routing controls clearer without changing any live public form behavior.

## Safety Boundaries

- Production was not accessed.
- No migrations were applied.
- Operational RLS was not changed.
- Runtime public intake routing was not enabled.
- Public intake forms were not changed.
- Google Calendar data was not touched.
- Public intake routing records were not mutated.
- Parish records were not mutated.
- Runtime authorization behavior was not changed.
- No secrets were exposed.

## Validation

- Source validation confirms the Settings page still uses `loadedParishName`.
- Source validation confirms the Public intake routing card displays the selected-parish label.
- Source validation confirms the public intake routing API remains backed by active parish read context and staff write parish context.
- Source validation confirms the card still displays `Prepared, not live`.

## Follow-Up

Run shared-QA browser verification that the Public intake routing selected-parish label updates after switching between authorized parishes, without saving metadata, adding domains, verifying domains, creating tokens, or enabling runtime routing.
