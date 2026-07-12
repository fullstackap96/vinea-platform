# Vinea AI Summary Runtime Gate Scaffold Plan - 2026-06-27

Status: Disabled-by-default runtime gate, scaffold, non-production safety-chain adapter, DTO-backed prompt assembly, runtime audit metadata preparation, guarded audit-write approval, guarded source-display/staff-review response exposure, and guarded safety-chain OpenAI generation wired behind the enabled `/api/ai/summary` gate. Production was not accessed, no migrations were applied, flag-off AI summary behavior is intended to remain legacy-compatible, `/api/ai/reply` was not changed, staff UI behavior was not changed, family portal behavior was not changed, audit writes, safe response exposure, and safety-chain generation require separate non-production approval flags, and operational RLS was not changed.

The live `/api/ai/summary` route now imports `getAiSummarySafetyRuntimeGate` and `buildAiSummaryRuntimeScaffold`.

The enabled safety-chain path now calls `buildAiSummarySafetyChainAdapter`, assembles a prompt only from safe DTO source references, prepares audit metadata, writes the safe audit event only when the separate audit-write approval flags are exact, returns source-display/staff-review response scaffolding only when the separate safe-response exposure flags are also exact, and calls OpenAI only when the separate safety-chain generation flags are also exact.

The live `/api/ai/reply` route was not changed.

Safe response exposure has a separate acceptance packet: `docs/AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACCEPTANCE_20260627.md`.

Runtime AI audit-event writes have a separate approval packet: `docs/AI_SUMMARY_AUDIT_WRITE_APPROVAL_20260627.md`.

Safety-chain OpenAI generation has a separate approval packet: `docs/AI_SUMMARY_GENERATION_APPROVAL_20260627.md`.

## Purpose

This plan records the controlled step for routing `/api/ai/summary` through a disabled-by-default gate before any future AI safety DTO chain is allowed to run.

The new gate and scaffold live in:

```text
lib/server/aiSummaryRuntimeGate.ts
lib/server/aiSummaryRuntimeScaffold.ts
lib/server/aiSummarySafetyChainAdapter.ts
```

The focused tests live in:

```text
lib/server/aiSummaryRuntimeScaffold.test.ts
```

## Disabled-By-Default Runtime Gate

The summary safety chain is disabled unless both environment values are exact:

```text
VINEA_AI_SUMMARY_SAFETY_RUNTIME=ENABLED
VINEA_AI_SUMMARY_SAFETY_RUNTIME_ACK=APPROVED_AI_SUMMARY_SAFETY_RUNTIME
```

When either value is missing or incorrect, the gate returns:

```text
legacy_staff_gated_summary_route
```

When both values are exact, the scaffold may select:

```text
permission_scoped_summary_safety_chain
```

Do not enable the flags in production.

Do not add these flags to required startup environment validation yet. Missing flags must preserve legacy behavior.

## Current Live Route Wiring

The current `/api/ai/summary` route now:

1. Runs `requireStaffFromRequest(request)`.
2. Parses the existing request body.
3. Calls `getAiSummarySafetyRuntimeGate()`.
4. Calls `buildAiSummaryRuntimeScaffold(gate)`.
5. Runs `runLegacyStaffGatedSummaryRoute(body)` when the scaffold selects `legacy_staff_gated_summary_route`.
6. Calls `buildAiSummarySafetyChainAdapter` when the scaffold selects `permission_scoped_summary_safety_chain`.
7. Builds DTO-backed prompt assembly from retrieval, source-display, audit-metadata, and staff-review DTOs when all scope checks pass.
8. Builds a runtime audit metadata preparation envelope with `writeStatus: not_written`.
9. If the separate audit-write approval flags are exact and the safety chain succeeds, writes only the prepared safe audit event through `writeAuditEvent`.
10. Builds source-display and staff-review response scaffolding with `clientExposure: not_returned_while_generation_disabled`.
11. If the separate safe-response exposure flags are exact and audit-write approval is present, returns only `sourceDisplay` and `staffReview` from `safetyChain.responseScaffold` alongside `{ ok: false, error: 'ai_retrieval_unavailable' }` and HTTP `503`.
12. If the separate safety-chain generation flags are exact, calls OpenAI with only `safetyChain.promptAssembly.prompt`.
13. Returns generated summary text plus safe `sourceDisplay` and `staffReview` when generation is approved.
14. Returns `{ ok: false, error: 'ai_retrieval_unavailable' }` with HTTP `503` before OpenAI when response exposure or generation is not approved, whether the adapter blocks or reports the safety chain, prompt assembly, audit preparation, audit write, and response scaffold are ready.

The staff request detail page now includes `requestId` in the summary payload before posting to `/api/ai/summary`, so the enabled adapter can validate object-level request scope in non-production tests.

This means the safety-chain path can generate only in non-production environments where every approval flag is exact.

## Future `/api/ai/summary` Wiring Order

The future route wiring must preserve the current staff gate and then choose the scaffold path:

1. Keep `requireStaffFromRequest(request)` before any body processing or OpenAI call.
2. Call `getAiSummarySafetyRuntimeGate()`.
3. Call `buildAiSummaryRuntimeScaffold(gate)`.
4. If the scaffold selects `legacy_staff_gated_summary_route`, run the existing legacy summary behavior.
5. If the scaffold selects `permission_scoped_summary_safety_chain`, call `buildAiSummarySafetyChainAdapter`.
6. Assemble the prompt from safe DTO references only.
7. Prepare the future audit metadata envelope.
8. Write `audit_events` only when the separate audit-write approval flags are exact and the prepared envelope is safe.
9. Prepare source-display and staff-review response scaffolding.
10. Return source-display and staff-review scaffolding only when the separate safe-response exposure flags are exact and audit-write approval is present.
11. Call OpenAI with only `safetyChain.promptAssembly.prompt` when the separate generation flags are exact.
12. Return `ai_retrieval_unavailable` before OpenAI until generation is separately approved.

Runtime safe response exposure must not be enabled by the base safety runtime gate alone. It requires audit-write approval, separate product-owner approval, and the exact non-production-only flags documented in `docs/AI_SUMMARY_SAFE_RESPONSE_EXPOSURE_ACCEPTANCE_20260627.md`.

Runtime audit-event writes must not be enabled by the base safety runtime gate alone. They require separate product-owner approval and the exact non-production-only flags documented in `docs/AI_SUMMARY_AUDIT_WRITE_APPROVAL_20260627.md`.

Runtime safety-chain OpenAI generation must not be enabled by the base safety runtime gate alone. It requires separate product-owner approval, the audit-write approval gate, the safe-response exposure gate, and the exact non-production-only flags documented in `docs/AI_SUMMARY_GENERATION_APPROVAL_20260627.md`.

## Required Pre-OpenAI Safety Gates

When the safety chain path is selected, all of these must occur before `openai.responses.create`:

| Gate | Required behavior |
|---|---|
| authentication | Staff identity and authorization remain first. |
| active parish scope | Active parish scope is validated before OpenAI. |
| object-level request scope | The request's parish relationship is resolved before OpenAI. |
| family-portal exclusion | Family-facing and cross-parish AI retrieval boundaries are checked before OpenAI. |
| source display | Source-display DTOs are built before OpenAI. |
| audit metadata | AI audit metadata DTOs are built before OpenAI. |
| staff review status | Staff review/status DTOs are built before OpenAI. |
| DTO-backed prompt assembly | Prompt input is assembled only from safe retrieval/source-display/audit/review DTO references before OpenAI. |
| runtime audit metadata preparation | Future audit-event metadata is prepared with `writeStatus: not_written` and safe references only before any approved audit write or OpenAI call. |
| runtime audit write approval | A safe audit event may be written only when the separate audit-write flags are exact, the safety chain succeeds, and the prepared envelope targets `audit_events`. |
| source-display/staff-review response scaffold | Future staff-facing source cards and review labels are prepared with `clientExposure: not_returned_while_generation_disabled` and no raw prompt/output material before OpenAI. |
| safe response exposure approval | Safe source-display and staff-review scaffolding may be returned only when audit-write approval and safe-response exposure flags are exact. |
| safety-chain generation approval | OpenAI may be called only when audit-write, safe-response exposure, and generation flags are exact. The input must be `safetyChain.promptAssembly.prompt`. |
| generic blocked errors | Blocked cases use `ai_retrieval_unavailable` or another approved generic response before OpenAI. |

## Legacy Behavior That Must Stay True With Flags Off

With the flags off:

- `/api/ai/summary` remains the current staff-gated legacy summary route.
- Existing summary requests still use the current request body fields.
- Existing prompt construction remains unchanged.
- Existing OpenAI model invocation remains unchanged.
- No new source display is returned.
- No new AI audit metadata is written.
- No staff review/status label is written.
- No family portal surface changes.
- No operational RLS changes.
- `/api/ai/reply` remains untouched.

## Future Flag-On QA Requirements

Before the flags can be enabled in any non-production environment, QA must verify:

1. Authorized staff can still generate a summary for a same-parish request.
2. Unauthorized staff receive a generic blocked error before OpenAI.
3. Forged or unauthorized active parish cookie fails before OpenAI.
4. Cross-parish request scope fails before OpenAI.
5. Family portal surfaces do not call or display AI summary data.
6. Safe source-display DTOs are present for staff review.
7. Safe audit metadata DTOs are written only when audit-write approval is present.
8. Staff review/status DTO starts as review-required.
9. Blocked cases use generic blocked errors.
10. No raw prompts, generated text, provider payloads, token material, internal note bodies, communication bodies, or document contents are stored in audit metadata.
11. Prompt assembly uses safe DTO labels, source reference ids, data classes, staff/family flags, and boundary text only.
12. Prompt assembly does not include raw request notes, communication bodies, document contents, token material, signed URLs, hashes, provider payloads, or family portal data.
13. Runtime audit metadata preparation produces a future `audit_events` envelope with `writeStatus: not_written`.
14. Runtime audit metadata preparation stores only safe references and explicit `rawPromptStored: false`, `rawOutputStored: false`, `providerPayloadStored: false`, and `tokenMaterialStored: false` flags.
15. Runtime audit writes use `writeAuditEvent` only after audit-write approval and must not call `.from('audit_events').insert` directly in the route.
16. Response scaffolding includes safe source-card labels, staff review status, and private-material policy only.
17. Response scaffolding uses `clientExposure: not_returned_while_generation_disabled` and is returned only when the safe-response exposure approval flags and audit-write approval flags are exact.
18. Response scaffolding records `promptIncluded: false`, `generatedOutputIncluded: false`, `providerPayloadIncluded: false`, and `tokenMaterialIncluded: false`.
19. Runtime safe response exposure requires a separate approval gate and must return only `sourceDisplay` and `staffReview` from `safetyChain.responseScaffold`.
20. Runtime safe response exposure must continue to return `ai_retrieval_unavailable` until OpenAI generation is separately approved.
21. Runtime audit-event writes require a separate approval gate and must write only `safetyChain.auditPreparation.futureAuditEvent`.
22. Future runtime audit-event writes must continue to avoid raw prompts, generated outputs, provider payloads, token material, internal note bodies, communication bodies, document contents, signed URLs, hashes, and secrets.
23. Runtime safety-chain OpenAI generation requires a separate approval gate after audit-write and safe-response exposure gates pass.
24. Runtime safety-chain OpenAI generation must use only `safetyChain.promptAssembly.prompt` as the OpenAI input.

## Source-Level Preflight Relationship

The existing preflight validator and tests remain the route-wiring guard:

```text
lib/server/aiRouteRuntimeWiringPreflight.ts
lib/server/aiRouteRuntimeWiringPreflight.test.ts
```

Future `/api/ai/summary` route wiring must pass those tests and must additionally prove:

- `getAiSummarySafetyRuntimeGate()` runs before any safety-chain OpenAI path.
- `buildAiSummaryRuntimeScaffold(gate)` runs before any safety-chain OpenAI path.
- `buildAiSummarySafetyChainAdapter` runs before any enabled-path OpenAI generation.
- `buildAiSummaryPromptAssembly` runs after the safety contract and before any enabled-path OpenAI generation.
- `buildAiSummaryAuditMetadataPreparation` runs after prompt assembly and before any enabled-path OpenAI generation.
- `buildAiSummaryResponseScaffold` runs after audit metadata preparation and before any enabled-path OpenAI generation.
- The staff summary payload includes `requestId` before the `/api/ai/summary` fetch.
- The legacy path remains selectable when the gate is disabled.
- The safety chain path cannot call OpenAI until all required pre-OpenAI gates pass.

## Explicit Non-Goals

- Do not call OpenAI from the enabled safety-chain adapter without the separate safety-chain generation approval flags.
- Do not wire `/api/ai/reply` in this phase.
- Do not enable the flags in production.
- Do not call OpenAI differently unless the safety-chain generation approval flags are exact.
- Do not return source-display or staff-review scaffolding without the separate safe response exposure approval packet.
- Do not write runtime AI audit events without the separate audit-write approval packet and exact flags.
- Do not call OpenAI from the safety-chain path without the separate generation approval packet and exact flags.
- Do not expose raw prompts, generated outputs, provider payloads, token material, internal note bodies, or document contents.
- Do not apply migrations.
- Do not change staff UI behavior.
- Do not change family portal behavior.
- Do not write AI audit events unless the separate audit-write approval flags are exact.
- Do not import or call `writeAuditEvent` from the enabled summary safety adapter; the guarded route owns the write.
- Do not change operational RLS.

## Rollback Strategy

This phase is code-only and uses disabled-by-default route wiring.

Rollback is:

1. Remove `getAiSummarySafetyRuntimeGate()`, `buildAiSummaryRuntimeScaffold(gate)`, and `buildAiSummarySafetyChainAdapter` from `/api/ai/summary`.
2. Return `/api/ai/summary` to the previous direct legacy prompt/OpenAI flow after staff authorization.
3. Keep `/api/ai/reply` unchanged.
4. Remove or update the scaffold tests and this plan.

## Claim Boundary

Safe internal statement:

> Vinea has wired `/api/ai/summary` through a disabled-by-default runtime gate that preserves legacy behavior when disabled and runs a non-production safety-chain adapter plus DTO-backed prompt assembly, guarded audit metadata writing, guarded source-display/staff-review response scaffolding, and guarded OpenAI generation when every approval flag is exact.

Do not claim:

- `/api/ai/summary` is fully permission-scoped for generation in production.
- AI summary prompts are sent to OpenAI through the permission-scoped runtime path without the separate generation approval flags.
- AI summary source display is visible in the product without the separate safe-response exposure approval flags.
- AI summary audit metadata is written at runtime without the separate audit-write approval flags.
- AI summary staff review/status labels are visible in the product.
- AI summary source-display or staff-review scaffolding is returned to staff at runtime without the separate safe-response exposure approval flags.
- Family portal or cross-parish AI blocking is runtime-enforced by this scaffold.
