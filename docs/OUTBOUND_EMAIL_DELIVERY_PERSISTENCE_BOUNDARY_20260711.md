# Outbound Email Delivery Persistence Boundary - 2026-07-11

Status: Implemented and locally verified without sending email or accessing production.

## Purpose

Resend can return no explicit error without a usable delivery identifier, and Daily Brief delivery can be accepted before Vinea records its parish state. Staff-visible success must distinguish provider acknowledgement from complete Vinea persistence.

## Runtime Boundary

- Public request notification, public demo request, staff-request email, and Daily Brief delivery each require a non-empty provider message id before success.
- Missing provider ids use the existing generic, privacy-safe provider failure path and produce no staff-email audit history.
- Daily Brief sent/failed state updates return only a minimal parish id and require a matched row.
- Manual Daily Brief reports explicit partial-success guidance when the message was accepted by the email provider but Vinea could not record delivery, telling staff to check the inbox before retrying.
- Cron Daily Brief keeps accepted-but-unrecorded sends out of the clean `sent` list and records a safe partial-failure label.
- Failed-state persistence remains best-effort and logs only parish id plus safe state kind when it cannot be confirmed.

## Preserved Boundaries

- Existing authentication, same-origin checks, active-parish membership, same-parish request ownership, stored-recipient derivation, verified public notification payload, public demo validation, durable rate limiting, staff-entered subject/body, templates, recipients, and provider configuration remain unchanged.
- No automatic resend or provider rollback was added.
- No email was sent during verification.
- No production/shared-QA access, database mutation, migration, operational RLS change, Google Calendar call, AI, export, storage, signed URL, portal token, certificate, production flag, or public trust claim occurred.

## Verification

- Runtime tests cover missing provider ids for public notification, public demo request, and staff request email, including no false audit history.
- Runtime tests cover confirmed and zero-row Daily Brief state persistence.
- Source guards require provider acknowledgement and Daily Brief state confirmation before clean success, while preserving explicit partial-success guidance.

## Rollback

Rollback is code-only. No schema or data rollback is required.
