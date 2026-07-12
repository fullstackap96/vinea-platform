# AI Summary Safety-Chain Generation Approval Plan

Last Updated: 2026-06-27

## Status

Status: Disabled-by-default runtime safety-chain generation gate wired for `/api/ai/summary` in non-production only.

This packet records the non-production approval gate for calling OpenAI from `/api/ai/summary` through the permission-scoped safety chain.

The live `/api/ai/summary` route is changed only to support the guarded safety-chain generation path.

The live `/api/ai/reply` route must remain untouched.

## Separate Approval Flags

Permission-scoped AI summary generation requires the existing summary safety runtime flags and these separate generation flags:

```text
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION=ENABLED
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK=APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION
```

Safety-chain generation also requires the audit-write approval flags and safe-response exposure flags.

Do not enable these flags in production.

Do not add these flags to required startup environment validation.

Missing or invalid values must keep the enabled safety-chain path from calling OpenAI.

## Required Prior Approvals

Safety-chain OpenAI generation cannot be approved by the base runtime gate alone.

Before the future safety-chain generation path can call OpenAI, all of these must be exact:

```text
VINEA_AI_SUMMARY_SAFETY_RUNTIME=ENABLED
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK=APPROVED_AI_SUMMARY_SAFETY_RUNTIME
VINEA_AI_SUMMARY_AUDIT_WRITE=ENABLED
VINEA_AI_SUMMARY_AUDIT_WRITE_ACK=APPROVED_AI_SUMMARY_AUDIT_WRITE
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE=ENABLED
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION=ENABLED
VINEA_AI_SUMMARY_SAFETY_CHAIN_GENERATION_ACK=APPROVED_AI_SUMMARY_SAFETY_CHAIN_GENERATION
```

## Accepted Generation Shape

After separate product-owner approval, the non-production generation path may call OpenAI only after the safety-chain adapter succeeds and the prior gates pass.

The OpenAI call may use only `safetyChain.promptAssembly.prompt` as input.

The route must write the approved safe audit event before the safety-chain OpenAI call and must positively confirm that persistence succeeded. Returned or thrown audit failure must keep source exposure and OpenAI generation fail closed.

The response may return generated summary text plus safe `sourceDisplay` and `staffReview` scaffolding.

The response must not return raw prompts, raw provider responses, provider payloads, token material, audit preparation envelopes, private material policy details, internal note bodies, communication bodies, document contents, signed URLs, hashes, or secrets.

## Required Ordering

Any future route change that calls OpenAI through the permission-scoped safety chain must prove this order:

1. `requireStaffFromRequest` runs first.
2. `getAiSummarySafetyRuntimeGate` runs before the safety-chain adapter.
3. `buildAiSummaryRuntimeScaffold` selects the legacy or safety-chain path.
4. The legacy path remains available when the base safety runtime gate is off.
5. `buildAiSummarySafetyChainAdapter` runs before any audit write, safe response exposure, or safety-chain OpenAI call.
6. Audit-write approval is checked before the audit write.
7. Safe-response exposure approval is checked before returning source display or staff review scaffolding.
8. Safety-chain generation approval is checked before `openai.responses.create`.
9. `writeAuditEvent` writes the approved safe future audit event and returns a positively checked persistence result before OpenAI is called.
10. `openai.responses.create` uses only `safetyChain.promptAssembly.prompt`.
11. The response returns generated summary text plus safe source-display and staff-review scaffolding only.

## Explicit Non-Goals

- Do not enable these flags in production.
- Do not change `/api/ai/reply`.
- Do not call OpenAI from the enabled safety-chain path unless all approval flags are exact.
- Do not call OpenAI differently from the existing flag-off legacy route unless all safety-chain approvals are exact.
- Safety-chain generation still requires an approved safe audit write before OpenAI.
- Do not return source-display or staff-review scaffolding without the safe-response exposure approval flags.
- Do not expose raw prompts, raw provider responses, provider payloads, token material, audit preparation envelopes, internal note bodies, communication bodies, document contents, signed URLs, hashes, or secrets.
- Do not apply migrations.
- Do not change staff UI behavior.
- Do not change family portal behavior.
- Do not change operational RLS.

Safety-chain OpenAI calls require the base runtime, audit-write, safe-response exposure, and generation flags.

Audit events are written only when the audit-write approval flags are exact.

No migrations are applied in this approval-plan phase.

Operational RLS is not changed in this approval-plan phase.

## Acceptance Tests

The focused approval tests live in:

```text
lib/server/aiSummaryGenerationApproval.test.ts
```

They prove:

- A source sketch must include base summary safety runtime approval, audit-write approval, safe-response exposure approval, and safety-chain generation approval before OpenAI.
- A source sketch must reject calling OpenAI before the approved safe audit write.
- A source sketch must reject legacy body prompts and must use only `safetyChain.promptAssembly.prompt` as OpenAI input.
- A source sketch must reject raw prompt, raw output, provider payload, token material, and private material exposure.
- The live route calls OpenAI through the safety chain only when all approval flags are exact.
- The future generation flags are not added to required environment validation.
- The live `/api/ai/reply` route is not wired to summary safety-chain generation.

## Manual QA Criteria For Future Approval

Before enabling OpenAI calls from the permission-scoped safety-chain path, verify in a non-production environment only:

1. Flag-off AI summary behavior still uses the existing legacy summary route.
2. Base safety runtime flags on, generation flags off: route fails closed and does not call OpenAI.
3. Base safety runtime flags on, generation flags on, audit-write flags off: route fails closed and does not call OpenAI.
4. Base safety runtime flags on, generation flags on, safe-response flags off: route fails closed and does not call OpenAI.
5. All required flags on: route validates staff identity, active parish scope, request scope, safe sources, audit metadata, staff review status, family/cross-parish safety, safe audit write, and safe response scaffolding before OpenAI.
6. Cross-parish request scope fails before any audit write or OpenAI call.
7. Forged active parish cookie fails before any audit write or OpenAI call.
8. Missing or invalid `requestId` fails before any audit write or OpenAI call.
9. The OpenAI input is exactly the DTO-backed safe prompt assembly.
10. The HTTP response contains generated summary text plus safe source-display and staff-review scaffolding only.
11. No raw prompt, raw provider response, provider payload, token material, note body, communication body, document content, signed URL, hash, or secret appears in the audit row, HTTP response, logs, or UI.

## What Changed Plain English

Vinea now has a guarded non-production path for the safer AI summary route to call OpenAI. It can call AI only after parish permission checks pass, safe prompt data is prepared, safe audit details are written, safe review/source labels are ready, and every approval flag is exact. The normal flag-off route still behaves like the legacy AI summary route.
