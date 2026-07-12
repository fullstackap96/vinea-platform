# AI Reply Audit-Write And Safe-Response Implementation Approval Packet - 2026-07-07

## Status

Prepared as a product-owner approval packet only.

This packet describes the exact approval needed before implementing non-production `/api/ai/reply` audit-write and safe-response exposure gates. It does not approve implementation, does not enable production flags, does not write audit events, does not expose source display, does not call OpenAI, does not send email, and does not change production behavior.

## Required Product-Owner Decision

Future implementation may proceed only after the product owner explicitly approves:

```text
I approve non-production implementation of the AI reply audit-write and safe-response exposure gates only.
Use disabled-by-default non-production flags, keep production blocked, use the existing fail-closed AI reply safety-chain adapter, write only approved safe audit metadata after the audit-write gate, expose only approved safe response/source/review scaffolding after the safe-response gate, keep OpenAI generation disabled, keep outbound email disabled, keep staff review required, and preserve rollback by disabling flags.
```

## Exact Future Implementation Scope

Allowed files for a future implementation:

- `lib/server/aiReplyAuditWriteRuntimeGate.ts`
- `lib/server/aiReplySafeResponseRuntimeGate.ts`
- `lib/server/aiReplyAuditWriter.ts`
- `lib/server/aiReplySafeResponse.ts`
- existing `lib/aiReplyAuditEventSafety.ts` safe-event validator
- existing `lib/aiReplySafeResponseExposure.ts` safe-response validator
- `app/api/ai/reply/route.ts`
- focused route, gate, writer, response, and source-preflight tests
- QA evidence docs for non-production only

Not allowed in this approval:

- production AI reply flags
- OpenAI generation through the safety-chain path
- outbound email sending
- staff disposition persistence
- staff-facing production UI
- migrations
- operational RLS changes
- storage access
- signed URL creation
- document content reads
- family-facing AI output
- public trust claims

## Required Feature Gates

Future implementation must stay disabled unless all approved non-production gate values are present:

- `VINEA_AI_REPLY_RUNTIME_ENV=NON_PRODUCTION`
- `VINEA_AI_REPLY_AUDIT_WRITE=ENABLED`
- `VINEA_AI_REPLY_AUDIT_WRITE_ACK=APPROVED_AI_REPLY_AUDIT_WRITE_QA`
- `VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE=ENABLED`
- `VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_REPLY_SAFE_RESPONSE_QA`

Production must stay blocked even if these values are accidentally present in a production runtime.

## Required Runtime Ordering

Future route code must preserve this order:

1. Authenticate staff.
2. Parse the request body.
3. Evaluate the existing disabled AI reply runtime gate.
4. Preserve legacy behavior when the gate is off.
5. Build `buildAiReplySafetyChainAdapter(...)`.
6. Fail closed with `ai_reply_unavailable` if the adapter is blocked.
7. Confirm non-production runtime environment.
8. Evaluate the audit-write approval gate.
9. Validate `safetyChain.auditPreparation.futureAuditEvent` with `validateAiReplyAuditEventForSafeWrite(...)`.
10. Write only the validated safe event through a safe writer.
11. Record `safeAuditMetadataWritten = true` only after the safe audit metadata write completes.
12. Evaluate the safe-response exposure approval gate only after `safeAuditMetadataWritten = true`.
13. Validate the response scaffold with `validateAiReplyResponseScaffoldForSafeExposure(...)`.
14. Return only the validated approved safe response scaffold.
15. Keep OpenAI generation disabled.

The future code must pass `lib/server/aiReplyAuditResponseGatePreflight.test.ts`.

The source-level preflight must require complete marker sets for each gate. Future audit-write and safe-response code must not pass by including only one partial marker from the environment, approval, safety-chain, audit-preparation, safe-audit-write, safe-response, generic-denial, or rollback/no-op gate.

## Safe Audit Metadata Boundary

Future audit metadata writes may include only the safe metadata already prepared by the DTO chain:

- AI feature id
- active parish context
- target object type and id
- request id
- input data classes
- safe source references
- output destination
- staff review status
- model/provider family placeholder
- blocked reason if applicable
- prompt-assembly metadata that explicitly says prompt text is not included or stored
- booleans confirming raw prompt, raw output, provider payload, and token material are not stored

The future writer must call `validateAiReplyAuditEventForSafeWrite(...)` before insert and must block the write if that validator returns `ok: false`. The future route must not treat an enabled audit-write flag or a writer call as sufficient for response exposure; it must record `safeAuditMetadataWritten = true` only after the safe write succeeds.

Future audit writes must not include:

- raw prompt text
- generated output
- provider payloads
- token material
- signed URLs
- storage paths
- document contents
- original filenames
- internal note bodies
- communication bodies
- secrets

## Safe Response Exposure Boundary

Future safe-response exposure may include only:

- generic route status
- safe target label
- safe source-card labels already approved by source-display DTOs
- staff-review status and guidance
- no-autonomous-send policy
- family-facing disabled flag
- private-material exclusion flags

The future safe-response helper must call `validateAiReplyResponseScaffoldForSafeExposure(...)` before returning any scaffold fields and must block the response if that validator returns `ok: false`. The future safe-response path must also require `safeAuditMetadataWritten = true` before response exposure is considered.

Future safe-response exposure must not include:

- generated AI output
- raw prompt text
- provider payloads
- audit metadata raw JSON
- source rows
- internal note bodies
- communication bodies
- document contents
- storage paths
- signed URLs
- tokens
- send controls

## QA Requirements

Before any future non-production smoke can be considered complete, QA must verify:

- flag-off legacy behavior still works
- audit-write gate disabled returns the generic blocked response
- audit-write gate enabled writes exactly one safe metadata event for a same-parish request
- safe-response gate disabled keeps response exposure blocked
- safe-response gate enabled returns only safe scaffold fields
- safe-response gate enabled still blocks if the safe audit write fails or does not record `safeAuditMetadataWritten = true`
- cross-parish request is denied generically
- family/unauthenticated access is denied
- production environment remains blocked
- OpenAI is not called
- email is not sent
- no storage or signed URL calls occur
- rollback by disabling flags restores fail-closed behavior

## Production Boundary

Production AI reply remains `NO-GO` after this packet.

Separate future approvals would be required for:

- production AI reply audit writes
- production safe-response exposure
- OpenAI generation
- staff disposition persistence
- staff-facing UI exposure
- customer-facing AI claims

## Validation

Required source/document checks:

- `lib/server/aiReplyAuditResponseGatePreflight.test.ts`
- `lib/server/aiReplyAuditResponseImplementationApprovalPacket.test.ts`

## Next Safe Step

After explicit approval, implement the non-production-only runtime gates and helpers in the exact scoped files listed above, then run focused route tests, source preflight tests, typecheck, lint, build, and the full test suite.
