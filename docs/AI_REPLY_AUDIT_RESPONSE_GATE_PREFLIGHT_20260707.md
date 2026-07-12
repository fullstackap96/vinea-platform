# AI Reply Audit-Write And Safe-Response Gate Preflight - 2026-07-07

## Status

Implemented as a source-level preflight scaffold only.

This prepares the next safety boundary for future `/api/ai/reply` runtime work after the fail-closed safety-chain adapter. It does not implement audit writes, does not expose source display, does not return staff-review scaffolding to the client, does not call OpenAI, does not send email, does not mutate records, and does not enable production AI.

## What Exists

- `lib/server/aiReplyAuditResponseGatePreflight.ts`
- `lib/server/aiReplyAuditResponseGatePreflight.test.ts`
- A source validator for future AI reply audit-write and safe-response exposure code sketches

## Required Future Gate Strategy

Any future runtime implementation that writes AI reply audit metadata or exposes safe response scaffolding must include:

- `VINEA_AI_REPLY_RUNTIME_ENV=NON_PRODUCTION`
- a production environment block before any approval gates
- `VINEA_AI_REPLY_AUDIT_WRITE`
- `APPROVED_AI_REPLY_AUDIT_WRITE_QA`
- `VINEA_AI_REPLY_SAFE_RESPONSE_EXPOSURE`
- `APPROVED_AI_REPLY_SAFE_RESPONSE_QA`
- rollback/no-op behavior by disabling flags
- generic denied responses such as `ai_reply_unavailable`
- an explicit `safeAuditMetadataWritten = true` success marker after the validated safe audit write and before safe-response exposure

Each gate must satisfy one complete marker set before the source-level preflight treats it as present. A single partial marker is not enough, including when future code only names a flag or only names a helper.

## Required Future Ordering

The preflight expects future code to keep this order:

1. Confirm non-production environment.
2. Build `buildAiReplySafetyChainAdapter(...)`.
3. Fail closed with the generic blocked reason if the adapter does not pass.
4. Use `safetyChain.auditPreparation` or `auditPreparation.futureAuditEvent` as the only audit-write source.
5. Evaluate the audit-write approval gate.
6. Validate the future audit event with `validateAiReplyAuditEventForSafeWrite(...)`.
7. Write safe metadata only through a future `writeAiReplyAuditMetadata(...)` helper.
8. Record `safeAuditMetadataWritten = true` only after the safe audit write completes.
9. Evaluate the safe-response exposure gate only after `safeAuditMetadataWritten = true`.
10. Validate the response scaffold with `validateAiReplyResponseScaffoldForSafeExposure(...)`.
11. Return safe client scaffolding only through a future `buildSafeAiReplyResponse(...)` helper.

The future safe-response path must not continue merely because the audit-write gate is enabled or because a writer function was called. It must depend on a completed safe audit metadata write.

## Forbidden Future Markers

The source preflight rejects future audit/response gate code if it includes:

- raw prompt storage or return paths
- raw output storage or return paths
- provider payload storage or return paths
- token material
- `promptAssembly.prompt` as an audit-write payload
- `openai.responses.create`
- send-email calls
- storage access
- signed URL creation

## Production Boundary

The production AI reply remains `NO-GO`.

Still not approved:

- production AI reply flags
- production audit writes
- production safe-response exposure
- OpenAI generation through the reply safety chain
- staff disposition persistence
- outbound email sending
- public/customer AI claims

## Verification

- `npm.cmd test -- lib/server/aiReplyAuditResponseGatePreflight.test.ts` should pass before any future runtime gate implementation is reviewed.

## Next Safe Step

Prepare a product-owner approval packet for non-production AI reply audit-write and safe-response exposure implementation, or keep advancing other production-readiness blockers until those gates are explicitly approved.
