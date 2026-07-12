# Request Pastoral Details Persistence Boundary - 2026-07-11

Status: Implemented and locally verified without production access or a schema change.

## Scope

This boundary covers the staff-reviewed Request Detail saves for:

- Funeral pastoral and service-planning details; and
- Wedding couple, proposed-date, and ceremony-planning details.

## Persistence Rule

Both active-parish request routes now:

1. reject untrusted origins;
2. require authenticated staff;
3. resolve selected-parish membership and same-parish request ownership;
4. validate the request type and staff-entered fields;
5. preserve the existing confirmed Funeral service or Wedding ceremony timestamp;
6. upsert the scoped detail row;
7. select only `request_id` and require a matched persisted row; and
8. write `request.intake.updated` audit history and return success only after that confirmation.

A returned database error, thrown exception, or accepted zero-row result returns the existing generic save failure. It does not create false audit history or show a false success.

## Plain-English Summary

When parish staff save Funeral or Wedding preparation details, Vinea now confirms the record really reached the database before saying it worked. If the request changes or disappears during the save, staff receive safe retry guidance and the activity log does not claim an update that never happened.

## Preserved Boundaries

- Staff-entered pastoral content and current review flow are unchanged.
- Active-parish membership and same-parish request ownership remain required.
- Confirmed schedule timestamps remain preserved.
- Browser clients do not write these tables directly.
- No production or shared-QA access.
- No migration or operational RLS change.
- No communication, AI, export, storage, signed URL, Google Calendar, certificate, automation, canonical decision, sacramental eligibility decision, or public trust claim.

## Verification

Focused source and runtime tests prove:

- confirmed same-parish Funeral and Wedding detail persistence succeeds;
- accepted zero-row upserts fail generically;
- zero-row failures write no audit event;
- persistence confirmation precedes audit history and success;
- existing body-size, request-type, active-parish, and browser-mutation boundaries remain intact; and
- only a minimal `request_id` is selected after the upsert.

Rollback is code-only. Restore the prior upsert response handling and remove this boundary; no database rollback is involved.
