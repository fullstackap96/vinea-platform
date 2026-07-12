# AI Summary Safe Response Exposure Acceptance Criteria

Last Updated: 2026-06-27

## Status

Status: Disabled-by-default runtime safe-response exposure gate wired for `/api/ai/summary` in non-production only.

This packet records the non-production approval gate for returning safe source-display and staff-review scaffolding from `/api/ai/summary`.

The live `/api/ai/summary` route is changed only to support guarded safe-response scaffolding.

The live `/api/ai/reply` route must remain untouched.

## Separate Approval Flags

Safe response exposure requires the existing summary safety runtime flags, the audit-write approval flags, and these separate flags:

```text
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE=ENABLED
VINEA_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACK=APPROVED_AI_SUMMARY_SAFE_RESPONSE_EXPOSURE
```

Do not enable these flags in production.

Do not add these flags to required startup environment validation.

Missing or invalid values must keep the live route fail-closed with no source/review scaffolding and must not change legacy flag-off behavior.

## Future Accepted Response Shape

After separate product-owner approval, the non-production safe response exposure path may return source-display and staff-review scaffolding while generation is still disabled.

The response may include only `sourceDisplay` and `staffReview` from `safetyChain.responseScaffold` after audit-write approval is present.

The response must keep:

```json
{
  "ok": false,
  "error": "ai_retrieval_unavailable"
}
```

until OpenAI generation is separately approved.

The response must not include prompt assembly, audit preparation, future audit event envelopes, raw prompts, generated outputs, provider payloads, token material, internal note bodies, document contents, or private material policy details.

## Required Ordering

Any future route change that returns safe scaffolding must prove this order:

1. `requireStaffFromRequest` runs first.
2. `getAiSummarySafetyRuntimeGate` runs before the safety-chain adapter.
3. `buildAiSummaryRuntimeScaffold` selects the legacy or safety-chain path.
4. The legacy path remains available when the base safety runtime gate is off.
5. `buildAiSummarySafetyChainAdapter` runs before safe response exposure.
6. Audit-write approval is checked after the safety-chain adapter is ready.
7. The approved safe audit event is written before safe response exposure.
8. The separate safe response exposure flags are checked after audit-write approval.
9. Only safe `sourceDisplay` and `staffReview` fields can be returned.
10. The response remains fail-closed with `ai_retrieval_unavailable`.

## Explicit Non-Goals

- Do not enable these flags in production.
- Do not change `/api/ai/reply`.
- Do not call OpenAI from the enabled safety-chain path.
- Do not call OpenAI differently from the existing flag-off legacy route.
- Do not write audit events without the separate audit-write approval flags.
- Do not expose raw prompts, generated outputs, provider payloads, token material, internal note bodies, communication bodies, document contents, signed URLs, hashes, or secrets.
- Do not apply migrations.
- Do not change staff UI behavior.
- Do not change family portal behavior.
- Do not change operational RLS.

Safe response exposure requires audit-write approval flags.

No migrations are applied in this acceptance phase.

Operational RLS is not changed in this acceptance phase.

## Acceptance Tests

The focused acceptance tests live in:

```text
lib/server/aiSummarySafeResponseExposureAcceptance.test.ts
```

They prove:

- A future source sketch must include the base summary safety runtime gate, audit-write approval, and the separate safe response exposure approval.
- A future source sketch must reject prompt assembly, audit preparation, provider payload, token material, and raw prompt/output exposure.
- The current live route remains fail-closed before OpenAI even when safe-response flag names are present in test environment variables.
- The current live route returns source-display and staff-review scaffolding only when audit-write approval and safe-response approval are both present.
- The future safe response exposure flags are not added to required environment validation.
- The live `/api/ai/reply` route is not wired to summary safety or response exposure.

## Manual QA Criteria For Future Approval

Before enabling safe scaffolding from `/api/ai/summary`, verify in a non-production environment only:

1. Flag-off AI summary behavior still uses the existing legacy summary route.
2. Base safety runtime flags on, safe response exposure flags off: route fails closed with only `ai_retrieval_unavailable`.
3. Base safety runtime flags on, safe response exposure flags on, audit-write flags off: route fails closed and does not include source-display or staff-review scaffolding.
4. Base safety runtime flags on, audit-write flags on, safe response exposure flags on: route still fails closed but may include only safe source-display and staff-review scaffolding.
5. Cross-parish request scope still fails before any response scaffolding is returned.
6. Forged active parish cookie still fails before any response scaffolding is returned.
7. Missing or invalid `requestId` still fails before any response scaffolding is returned.
8. Public/family portal surfaces do not call or display AI scaffolding.
9. Audit rows contain only safe approved metadata.
10. No raw prompt, generated output, provider payload, token material, note body, communication body, document content, signed URL, hash, or secret appears in the HTTP response, logs, or UI.

## What Changed Plain English

Vinea now has a guarded way for the safer AI summary route to show staff safe source labels and review instructions in non-production tests. It still does not generate AI text through this safer path. The response can show only approved source and review scaffolding, and only after the audit-write gate is also approved.
