# AI Summary Safe Audit Event Validation - 2026-07-08

## Status

Implemented as a production-readiness hardening slice for the disabled-by-default `/api/ai/summary` safety-chain path.

This adds a pure safe audit-event validator and requires the live summary route to validate `safetyChain.auditPreparation.futureAuditEvent` before any `writeAuditEvent(...)` call. It also requires a successful validated audit write before the gated safe-response or generation paths can continue.

## What Exists

- `lib/aiSummaryAuditEventSafety.ts`
- `lib/aiSummaryAuditEventSafety.test.ts`
- `/api/ai/summary` route wiring that calls `validateAiSummaryAuditEventForSafeWrite(...)` before `writeAuditEvent(...)`
- source-level approval tests for audit-write, safe-response exposure, and generation ordering

## Required Safe Event Shape

The validator requires:

- table: `audit_events`
- action: `ai.summary.audit_metadata_prepared`
- target type: `request`
- feature id: `request_summary`
- output destination: `internal_summary`
- model/provider family: `not_invoked`
- active parish matching event parish
- metadata target id matching event target id
- non-empty actor email
- safe input data classes
- safe source references
- prompt source references already present in safe audit references
- human approval required
- family-facing output disabled

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

## Route Boundary

The `/api/ai/summary` safety-chain path now follows this stricter order:

1. Staff authentication.
2. Disabled-by-default AI summary safety runtime gate.
3. Safety-chain adapter.
4. Audit-write approval flags.
5. Safe audit-event validation.
6. Safe audit metadata write.
7. Safe-response exposure approval.
8. Generation approval.

If the safe audit-event validator fails, the route does not write audit metadata, does not expose source-display/staff-review scaffolding, and does not call OpenAI through the safety-chain path.

## Production Boundary

Production AI summary enablement remains `NO-GO`.

This hardening slice does not:

- enable production AI flags
- add production flags
- change `/api/ai/reply`
- call OpenAI differently
- expose raw prompts or generated output
- write audit events outside the already approved disabled-by-default audit-write path
- apply migrations
- change operational RLS
- access production
- run exports
- send communications
- access storage or create signed URLs
- make public trust claims

## Verification

- `npm.cmd test -- lib\aiSummaryAuditEventSafety.test.ts lib\server\aiSummaryAuditWriteApproval.test.ts lib\server\aiSummarySafeResponseExposureAcceptance.test.ts lib\server\aiSummaryGenerationApproval.test.ts` passed: 4 files / 29 tests.

## Next Safe Step

Continue hardening permission-aware AI surfaces without enabling production AI. A likely next slice is adding the same validated safe write/no-response-before-audit boundary to any future AI reply audit-write implementation when product-owner approval is granted.
