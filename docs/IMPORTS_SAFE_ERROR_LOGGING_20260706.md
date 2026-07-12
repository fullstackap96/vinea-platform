# Imports Safe Error Logging - 2026-07-06

Status: Implemented as a scoped authenticated staff-route production-readiness hardening slice.

## Scope

The `/api/imports` route now logs unexpected import history, preview, commit, row insert, failed-batch recording, and completed-batch recording failures through the shared safe error logging helper.

## Staff-Facing Error Boundary

Unexpected failures return generic staff-facing messages:

- `Could not load imports.`
- `Could not import rows.`
- `Could not record import batch.`
- `Could not process import.`

Failed committed row inserts also store a generic failed-batch summary:

- `Import row insert failed.`

No raw provider or database error messages are returned to staff clients or written into import batch summaries by these unexpected failure paths.

## Preserved Behavior

- Staff authentication is still required.
- Import history and preview still use the selected active parish read context.
- Committed imports still use the staff write parish context helper.
- Explicit `primary_parish_id` fallback remains available only when no active parish cookie exists.
- Existing validation messages for invalid request bodies, unsupported import kinds, and empty spreadsheet rows are preserved.
- Preview generation, committed row insertion, completed-batch recording, and audit-event writing semantics are unchanged except for safer unexpected-error responses.

## Non-Goals

- No production access.
- No production flags.
- No migrations.
- No operational RLS changes.
- No Google Calendar changes.
- No AI calls.
- No export runtime changes.
- No storage or signed URL changes.
- No certificate generation.
- No automation or outbound communication behavior.
- No public trust claims.

## Verification

- Focused source tests validate that the Imports route imports `logServerError`, logs each unexpected failure action, returns generic staff-facing messages, stores a generic failed-batch summary, and does not return raw `error.message` or `batchError.message`.
- Docs validation tests confirm this evidence file documents the generic messages, no-go boundaries, and raw-provider-message exclusion.
