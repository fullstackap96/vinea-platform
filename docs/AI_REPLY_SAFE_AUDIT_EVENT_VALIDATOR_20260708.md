# AI Reply Safe Audit Event Validator - 2026-07-08

## Status

Implemented as a non-runtime safety validator.

This adds a pure validator for future `/api/ai/reply` audit-event writes. It does not write audit events, does not wire the live route, does not enable feature flags, does not call OpenAI, does not send email, and does not change production behavior.

## What Exists

- `lib/aiReplyAuditEventSafety.ts`
- `lib/aiReplyAuditEventSafety.test.ts`

## Purpose

Future AI reply audit writing should have a final safety check immediately before any insert into `audit_events`. This validator accepts only the prepared safe audit event shape from the existing AI reply DTO chain.

## Required Safe Event Shape

The validator requires:

- table: `audit_events`
- action: `ai.reply.audit_metadata_prepared`
- target type: `communication_draft`
- feature id: `email_draft`
- output destination: `draft_only`
- model/provider family: `not_invoked`
- active parish matching event parish
- metadata target id matching event target id
- non-empty request id
- non-empty actor email
- safe input data classes
- safe source references
- prompt source references already present in safe audit references
- human approval required
- family-facing output disabled
- autonomous send disabled

## Forbidden Material

The validator blocks:

- raw prompt storage
- raw output storage
- provider payload storage
- token material storage
- prompt text included in audit metadata
- prompt text stored in audit metadata
- unsafe source references containing token/hash/secret/password/signed URL/storage path/raw prompt/raw output/provider payload/plaintext/document content/original filename terms
- unexpected metadata keys such as `rawPrompt`

## Production Boundary

Production AI reply audit writing remains `NO-GO`.

This validator is preparation only. It does not approve:

- non-production audit-write route wiring
- production audit-write route wiring
- safe-response exposure
- OpenAI generation
- outbound email
- staff disposition persistence
- public AI claims

## Verification

- `npm.cmd test -- lib/aiReplyAuditEventSafety.test.ts` passed: 1 file, 5 tests.
- `npm.cmd run typecheck` passed.

## Next Safe Step

If product-owner approval is later granted, use this validator inside a future `writeAiReplyAuditMetadata(...)` helper before any database insert, while keeping production blocked and OpenAI generation disabled.
