# Request Note And Playbook Insert Persistence Boundary - 2026-07-11

Status: Implemented and locally verified without production access or a schema change.

## What Changed

Two high-frequency Request Detail Server Actions now positively confirm inserted rows before audit history or success:

- `addRequestNote` selects only the inserted note `id` and requires one matched row.
- `applyWorkflowPlaybookChecklist` selects only inserted checklist-item ids and requires the returned row count to exactly match the staff-reviewed missing-item count.

Returned database errors, thrown exceptions, accepted zero-row note inserts, and partial playbook inserts retain the existing generic staff-safe messages. They do not write false request history, return a false added count, or claim success.

## Plain-English Summary

Vinea now checks that a staff note truly exists before adding it to request history. When staff apply a workflow playbook, Vinea also confirms every promised checklist item was created before reporting the count. The interface stays quick, but its success messages are now backed by the actual saved rows.

## Preserved Boundaries

- Authenticated staff and active-parish request ownership remain required before inserts.
- Staff-entered note text and playbook selection behavior are unchanged.
- Note audit metadata retains only source and note length, not the note body.
- Browser clients do not write note or checklist tables directly.
- No production or shared-QA access.
- No migration or operational RLS change.
- No communication, AI, export, storage, signed URL, Google Calendar, certificate, automation, canonical decision, sacramental eligibility decision, or public trust claim.

## Verification

Focused runtime and source tests prove:

- confirmed note insertion precedes note history and success;
- accepted zero-row note insertion produces no history;
- an exact playbook insert count precedes playbook history and success;
- a partial returned playbook row set produces no false count or history; and
- existing operation-order, active-parish, safe-error, and note-metadata privacy boundaries remain intact.

Rollback is code-only. Restore the previous insert response handling; no database rollback is involved.
