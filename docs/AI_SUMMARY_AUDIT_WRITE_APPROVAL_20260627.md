# AI Summary Audit Write Approval Plan

Last Updated: 2026-06-27

## Status

Status: Disabled-by-default runtime audit-write gate wired for `/api/ai/summary` in non-production only.

This packet records the non-production approval gate for writing safe AI summary audit metadata from `/api/ai/summary`.

The live `/api/ai/summary` route is changed only to support the guarded audit-write path.

The live `/api/ai/reply` route must remain untouched.

## Separate Approval Flags

Runtime AI summary audit writes require the existing summary safety runtime flags and these separate flags:

```text
VINEA_AI_SUMMARY_AUDIT_WRITE=ENABLED
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK=APPROVED_AI_SUMMARY_AUDIT_WRITE
```

Do not enable these flags in production.

Do not add these flags to required startup environment validation.

Missing or invalid values must keep the live route fail-closed and must not write audit events.

## Future Accepted Write Shape

After separate product-owner approval, the non-production audit-write path may write a single AI summary audit event only after the safety-chain adapter succeeds.

The future write may use only `safetyChain.auditPreparation.futureAuditEvent`.

The future write must keep `rawPromptStored: false`, `rawOutputStored: false`, `providerPayloadStored: false`, and `tokenMaterialStored: false`.

The future write must not store raw prompts, generated outputs, provider payloads, token material, internal note bodies, communication bodies, document contents, signed URLs, hashes, or secrets.

The route must still return `{ ok: false, error: 'ai_retrieval_unavailable' }` with HTTP `503` until OpenAI generation is separately approved.

## Required Ordering

Any future route change that writes AI summary audit metadata must prove this order:

1. `requireStaffFromRequest` runs first.
2. `getAiSummarySafetyRuntimeGate` runs before the safety-chain adapter.
3. `buildAiSummaryRuntimeScaffold` selects the legacy or safety-chain path.
4. The legacy path remains available when the base safety runtime gate is off.
5. `buildAiSummarySafetyChainAdapter` runs before any audit write.
6. The separate audit-write flags are checked after the safety-chain adapter returns.
7. `safetyChain.ok` must be true.
8. `safetyChain.auditPreparation.writeStatus` must be `not_written`.
9. `writeAuditEvent` may receive only the prepared safe future audit event fields.
10. The route remains fail-closed with `ai_retrieval_unavailable`.

## Explicit Non-Goals

- Do not enable these flags in production.
- Do not change `/api/ai/reply`.
- Do not call OpenAI from the enabled safety-chain path.
- Do not call OpenAI differently from the existing flag-off legacy route.
- Do not return source-display or staff-review scaffolding in this phase.
- Do not expose raw prompts, generated outputs, provider payloads, token material, internal note bodies, communication bodies, document contents, signed URLs, hashes, or secrets.
- Do not apply migrations.
- Do not change staff UI behavior.
- Do not change family portal behavior.
- Do not change operational RLS.

Audit events are written only when the base safety runtime gate and the separate audit-write approval flags are all exact.

No migrations are applied in this approval-plan phase.

Operational RLS is not changed in this approval-plan phase.

## Acceptance Tests

The focused acceptance tests live in:

```text
lib/server/aiSummaryAuditWriteApproval.test.ts
```

They prove:

- A future source sketch must include both the base summary safety runtime gate and the separate audit-write approval.
- A future source sketch must reject raw prompt, generated output, provider payload, token material, and prompt assembly exposure.
- The current live route remains fail-closed before OpenAI even when audit-write flag names are present in test environment variables.
- The current live route imports `writeAuditEvent` only in `/api/ai/summary` and only after the safety-chain adapter succeeds.
- The future audit-write flags are not added to required environment validation.
- The live `/api/ai/reply` route is not wired to summary audit writes.

## Manual QA Criteria For Future Approval

Before enabling AI summary audit writes from `/api/ai/summary`, verify in a non-production environment only:

1. Flag-off AI summary behavior still uses the existing legacy summary route.
2. Base safety runtime flags on, audit-write flags off: route fails closed and writes no audit row.
3. Base safety runtime flags on, audit-write flags on: route writes exactly one safe AI summary audit row and still fails closed with `ai_retrieval_unavailable`.
4. Cross-parish request scope fails before any audit row is written.
5. Forged active parish cookie fails before any audit row is written.
6. Missing or invalid `requestId` fails before any audit row is written.
7. The audit row contains staff identity, parish scope, active parish context, target request, AI feature id, safe source references, output destination, staff disposition, model/provider family placeholder, and blocked reason.
8. The audit row records `rawPromptStored: false`, `rawOutputStored: false`, `providerPayloadStored: false`, and `tokenMaterialStored: false`.
9. No raw prompt, generated output, provider payload, token material, note body, communication body, document content, signed URL, hash, or secret appears in the audit row, HTTP response, logs, or UI.

## What Changed Plain English

Vinea now has a guarded audit-log path for the safer AI summary route. When the right non-production test switches are on, Vinea can record who requested AI help, which parish and request were involved, and which safe source references were used. It still does not generate AI text through this safer path yet, and it does not store hidden notes, prompts, generated AI text, or provider data.
