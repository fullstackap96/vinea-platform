# Import Commit Persistence Boundary - 2026-07-11

Status: Implemented and locally verified without production access or a real import.

## What Changed

Committed People, Household, and Sacramental Record imports now use returned rows as the source of truth:

- the bulk insert selects only inserted row ids;
- `createdCount`, `skippedCount`, completed-batch fields, and audit metadata use the confirmed returned-row count;
- a returned database error or count mismatch records a failed batch with the confirmed count and returns the existing generic import failure;
- failed-batch history itself selects a minimal id and reports a privacy-safe server failure if that row is not confirmed;
- completed-batch history must return an id before `import.completed` audit history or API success; and
- API success returns a non-null confirmed batch id.

## Plain-English Summary

Vinea no longer says a spreadsheet imported a certain number of records merely because that many rows were prepared. It counts the rows the database actually returned and confirms the import-history entry before showing success.

## Partial-Recovery Boundary

The data-row insert and import-batch insert remain separate database statements. If data rows are confirmed but completed-batch history cannot be confirmed, Vinea returns `Could not record import batch.` and writes no completed audit event. The staff client continues to say that no completed import was confirmed, so staff should review import history and destination records before retrying.

This is not a transaction or automatic rollback. Moving the workflow into a database transaction or RPC would require separate schema, security, migration, disposable-QA, and production approval.

## Preserved Boundaries

- Staff authentication and selected active-parish write scope remain required.
- Preview behavior, supported import kinds, validation, 1,000-row limit, and 4 MiB body limit remain unchanged.
- Import filenames remain excluded from audit metadata.
- No production or shared-QA access.
- No real import, migration, or operational RLS change.
- No communication, AI, export, storage, signed URL, Google Calendar, certificate, automation, canonical decision, sacramental eligibility decision, or public trust claim.

## Verification

Focused runtime and source tests prove exact confirmed success, zero-row mismatch failure with a confirmed failed-batch count, missing completed-batch failure without completed audit history, active-parish operation ordering, safe logging, body-size behavior, and audit metadata privacy.

Rollback is code-only. Restore intended-row count handling and prior batch response checks; no database rollback is involved.
