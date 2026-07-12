# Public Intake Partial Cleanup Observability Boundary - 2026-07-11

Status: Implemented and locally verified without production access or a schema change.

## What Changed

- Public intake failure recovery now uses the server-only `cleanupPartialPublicIntake` helper.
- Request and parishioner cleanup are attempted independently so a failed request delete does not prevent the parishioner delete attempt.
- Each delete selects only the deleted row id and requires a matched row before cleanup is reported complete.
- Returned database errors, thrown exceptions, and accepted zero-row deletes are all reported as incomplete cleanup.
- Each Funeral, Wedding, OCIA, or Join Parish type-specific detail insert now returns `request_id` and must match the newly created request.
- The complete checklist batch returns minimal ids, and its confirmed row count must equal the expected checklist count before workflow creation, audit history, or success.
- A returned error, zero-row detail insert, mismatched request id, or partial checklist insert enters the same checked compensating cleanup path.
- The public response remains the generic `Could not submit request.` message.
- Server failure context contains only route/type and boolean cleanup outcomes. It does not add raw request ids, parishioner ids, names, contact details, tokens, or database/provider messages.

## Plain-English Summary

If a family submission stops partway through, Vinea now checks that the Catholic workflow details and every checklist item were truly created. If they were not, it checks that the temporary request and contact records were truly removed. It still tries every safe cleanup step, even when one step fails, and gives operators a privacy-safe signal that follow-up may be needed instead of silently assuming cleanup worked.

## Recovery Boundary

The intake path still uses sequential database writes. This helper is compensating cleanup, not a database transaction, and it cannot promise atomic rollback. A future transaction or database RPC would require separate schema, security, migration, disposable-QA, and production approval.

Rollback is code-only: restore the prior route-local cleanup behavior and remove the helper. No migration or production flag is involved.

## Verification

Focused tests prove:

- no-op cleanup when no partial ids exist;
- positively confirmed request and parishioner deletion;
- continued parishioner cleanup after a returned or thrown request-delete failure;
- accepted zero-row deletion is treated as failure;
- combined cleanup outcomes contain booleans only; and
- private fixture ids do not enter cleanup logs;
- every type-specific detail insert is positively confirmed against the created request; and
- the complete checklist batch is confirmed before workflow creation, history, or success.

## Preserved Boundaries

- No production or shared-QA access.
- No public intake submission was executed.
- No migration or operational RLS change.
- No production-sensitive flag changed.
- No email, AI, export, storage, signed URL, Google Calendar, or external provider call.
- No public trust claim.
