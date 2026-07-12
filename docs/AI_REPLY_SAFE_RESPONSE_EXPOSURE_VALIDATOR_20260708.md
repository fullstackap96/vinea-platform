# AI Reply Safe Response Exposure Validator - 2026-07-08

## Status

Implemented as a non-runtime safety validator.

This adds a pure validator for future `/api/ai/reply` safe-response exposure. It does not wire the live route, does not return source display to clients, does not write audit events, does not enable feature flags, does not call OpenAI, does not send email, and does not change production behavior.

## What Exists

- `lib/aiReplySafeResponseExposure.ts`
- `lib/aiReplySafeResponseExposure.test.ts`

## Purpose

Future AI reply safe-response exposure should have a final safety check immediately before any staff-facing scaffold is returned. This validator accepts only the prepared source-display and staff-review scaffold from the existing AI reply DTO chain.

## Required Safe Response Shape

The validator requires:

- `AI_REPLY_RESPONSE_SCAFFOLD_VERSION`
- runtime state: `reply_source_display_staff_review_response_scaffold_only`
- client exposure boundary: `not_returned_while_generation_disabled`
- generic fail-closed response: `ai_reply_unavailable` with status `503`
- target type: `communication_draft`
- non-empty active parish id
- non-empty request id
- safe target label
- source-card count matching the source-card array length
- at least one display-only source card
- safe source-card ids, references, types, data classes, and labels
- staff review present
- human approval required
- family-facing output disabled
- all private-material policy booleans set to `false`

## Forbidden Material

The validator blocks:

- extra top-level keys such as generated reply text or raw metadata
- raw prompt text
- generated output
- provider payloads
- token material
- storage paths
- signed URL values
- document contents
- original filenames
- autonomous send controls
- family-facing AI output
- unsafe source-card labels or references

## Production Boundary

Production AI reply safe-response exposure remains `NO-GO`.

This validator is preparation only. It does not approve:

- non-production safe-response route wiring
- production safe-response route wiring
- audit-event writes
- OpenAI generation
- outbound email
- staff disposition persistence
- public AI claims

## Verification

- `npm.cmd test -- lib/aiReplySafeResponseExposure.test.ts` passed: 1 file, 5 tests.
- `npm.cmd run typecheck:all` passed.

## Next Safe Step

If product-owner approval is later granted, use this validator inside a future `buildSafeAiReplyResponse(...)` helper immediately before returning source-display and staff-review scaffolding, while keeping production blocked and OpenAI generation disabled.
