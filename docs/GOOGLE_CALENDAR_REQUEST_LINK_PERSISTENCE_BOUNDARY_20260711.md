# Google Calendar Request Link Persistence Boundary - 2026-07-11

Status: Implemented and locally verified without Google Calendar or production access.

## Purpose

Google Calendar event create, update, and delete operations occur before Vinea updates the linked request. A database update can return no error while matching zero rows, so provider success must not be presented as complete request synchronization without persistence proof.

## Runtime Boundary

- All three routes retain staff authentication, same-origin mutation protection, selected active-parish ownership, request/parishioner scope, and selected-parish integration checks before provider calls.
- After provider create, update, and delete behavior, the request update returns only a minimal request id and must match before audit history or success.
- A returned database error or accepted zero-row update returns the existing partial-success guidance describing what succeeded in Google and what did not persist in Vinea.
- Route-owned `request.schedule.updated` history and normal success remain blocked until the request update is confirmed.
- The change does not claim provider rollback. Automatic rollback could itself fail or remove a provider event staff need to recover manually, so it remains a separate reviewed design decision.

## Verification

- Focused source guards require provider mutation before the scoped request update, minimal-id confirmation before audit/success, and preservation of route-specific partial-success guidance.
- Existing selected-parish create/update/delete authorization and lifecycle tests remain unchanged.
- No Google Calendar call was made.
- No production/shared-QA access, request mutation, OAuth exchange, integration mutation, migration, operational RLS change, email, AI, export, storage, signed URL, certificate, production flag, or public trust claim occurred.

## Rollback

Rollback is code-only: remove the minimal-id selection and matched-row check from the three request updates. No schema or data rollback is involved.
