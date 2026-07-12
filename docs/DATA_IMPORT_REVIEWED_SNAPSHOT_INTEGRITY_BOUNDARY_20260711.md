# Data Import Reviewed Snapshot Integrity Boundary - 2026-07-11

Status: `DATA_IMPORT_REVIEWED_SNAPSHOT_INTEGRITY_IMPLEMENTED_20260711`

## What Changed

- File reading, preview, and commit now share one immediate browser operation lock.
- Import type, file selection, column mapping, review-note export, and commit controls freeze while an operation is unresolved.
- Every change to the import type, file, or mapping invalidates the old preview.
- Preview captures an exact copied snapshot of the selected import type, filename label, and mapped rows.
- Commit sends that reviewed snapshot instead of recomputing rows from live form state.
- The API now returns structured partial-completion metadata when it confirms that rows were created but the batch could not finish cleanly.
- A partial, malformed, or transport-uncertain commit blocks a blind retry and directs staff to review Recent imports and the applicable records list first.
- Preview and commit responses must match the reviewed import kind and row count and include safe renderable row/issue shapes before Vinea displays or confirms them.
- A confirmed import remains non-repeatable from the same preview. Staff must begin a fresh review before another commit.

## Plain-English Result

The spreadsheet staff approve is now the spreadsheet Vinea imports. Staff cannot change the type or column matching while an import is being checked or saved. If the connection drops after records might already have been created, Vinea does not invite a risky second click; it asks staff to review what happened first.

## Preserved Boundaries

- Existing authenticated selected-parish Data Imports API authorization remains unchanged.
- Existing validation, duplicate warnings, row preparation, audit metadata, and import history behavior remain in place.
- This is same-screen reviewed-snapshot integrity and honest outcome reporting, not durable cross-tab idempotency or a database transaction.
- No production or shared-QA access occurred.
- No migration or operational RLS change occurred.
- No records were imported during verification.
- No provider, communication, Calendar, AI, export, or storage call occurred.

## Rollback

Revert the client snapshot/operation-lock changes and the structured partial fields. No schema rollback, data cleanup, environment change, or feature flag is required.

## Manual QA

1. In safe non-production, upload a synthetic CSV and request a preview.
2. Confirm import type, file input, mappings, review-note export, and commit controls freeze during preview and commit.
3. Change a mapping after preview and confirm the old review disappears and commit is unavailable until preview runs again.
4. Commit a reviewed synthetic import once and confirm the same preview cannot be committed again.
5. Simulate a dropped commit response and confirm Vinea directs staff to Recent imports and records review instead of offering an immediate retry.
