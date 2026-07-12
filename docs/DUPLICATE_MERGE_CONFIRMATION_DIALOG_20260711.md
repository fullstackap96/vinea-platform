# Duplicate Merge Confirmation Dialog - 2026-07-11

Decision: `DUPLICATE_MERGE_CONFIRMATION_DIALOG_IMPLEMENTED_20260711`

Status: Implemented for People and Household duplicate review.

## Staff Experience

- Replaced native browser confirmation prompts with one consistent Vinea confirmation dialog.
- Clearly names the profile or household that staff selected to keep.
- Explains which linked records will move and that the duplicate will be removed.
- Provides a prominent irreversible-action warning and an unambiguous `Keep reviewing` escape action.
- Supports Escape, keyboard focus containment, initial confirm-button focus, focus restoration, busy-state locking, and accessible dialog labels.
- Keeps the open-dialog effect stable across busy-state and inline-handler rerenders so focus cannot be restored behind the modal while work is still in progress.

## Safety Boundary

The existing People and Household duplicate APIs, payloads, validation, and audit behavior remain unchanged; active-parish authorization remains server-owned. The browser dialog cannot perform a merge without the existing authenticated API request, and the server remains authoritative for membership, selected-parish, candidate, and ownership checks.

## Verification Boundary

- No production access.
- No record mutation occurred during verification.
- No database migration or operational RLS change.
- No provider, communication, Calendar, AI, export, storage, signed URL, or certificate action.
- No production-sensitive flag change.

Rollback is limited to restoring the prior browser prompt. It does not require a database or API rollback.
