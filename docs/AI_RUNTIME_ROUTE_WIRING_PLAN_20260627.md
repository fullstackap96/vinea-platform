# Vinea AI Runtime Route Wiring Plan - 2026-06-27

Status: Runtime wiring plan plus source preflight record. Production was not accessed, no migrations were applied, flag-off AI summary behavior remains legacy-compatible, `/api/ai/reply` runtime generation behavior remains legacy-compatible while the reply safety gate is off, OpenAI call behavior is unchanged while the summary/reply gates are off, staff UI behavior was not changed, family portal behavior was not changed, audit event writes were not changed, and operational RLS was not changed.

## Purpose

This plan defines the safety order for future runtime wiring of:

- `/api/ai/summary`
- `/api/ai/reply`

The live `/api/ai/summary` route is now behind a disabled-by-default gate and calls a fail-closed safety-chain adapter only when the gate is explicitly enabled.

The live `/api/ai/reply` route now has a disabled-by-default fail-closed gate scaffold, but the permission-scoped reply safety-chain adapter remains unwired and flag-off behavior remains legacy staff-gated.

Current route state: `SUMMARY ROUTE GATED WITH FAIL-CLOSED ADAPTER, REPLY ROUTE DISABLED GATE SCAFFOLD WITH LEGACY STAFF-GATED FALLBACK`

## Current Route Boundary

The current routes already require staff authentication or authorization before calling OpenAI:

- `/api/ai/summary` uses `requireStaffFromRequest` before `openai.responses.create`.
- `/api/ai/reply` uses `supabase.auth.getUser` and `authorizeStaffUser` before `openai.responses.create`.

That is not enough for permission-scoped retrieval, source display, runtime AI audit metadata, staff review/status labels, family-portal exclusion, or cross-parish retrieval protection. The current routes are staff-gated legacy routes, not the completed AI safety layer.

## Required Future Wiring Order

Future route wiring must preserve this order before any OpenAI call:

1. Authenticate and authorize staff.
2. Parse and validate the request target.
3. Resolve active parish scope from the validated staff context.
4. Resolve object-level request scope, including the request's parish relationship.
5. Build the request-summary retrieval DTO using the AI feature registry and allowed data-class map.
6. Build the source-display DTO.
7. Build the AI audit metadata DTO.
8. Build the staff review/status DTO.
9. Build the family/cross-parish safety contract.
10. Build DTO-backed prompt assembly from approved safe source references.
11. If blocked, return or record a generic blocked error such as `ai_retrieval_unavailable` or `ai_reply_unavailable`.
12. Call `openai.responses.create` only after all gates pass.

Do not call OpenAI until all preflight gates pass.

## Required Safety Gates

The future source-level preflight tests must fail unless each route satisfies a complete route-specific marker set before `openai.responses.create`. A single partial marker is not enough to pass a gate.

| Gate | Required behavior |
|---|---|
| authentication | Staff identity and staff authorization happen before OpenAI. |
| active parish scope | Active parish context is validated before OpenAI. |
| object-level request scope | Request parish scope is resolved before OpenAI. |
| family-portal exclusion | Family-facing and cross-parish AI retrieval exclusions run before OpenAI. |
| source display | Safe source-display DTOs are built before OpenAI. |
| audit metadata | Safe AI audit metadata DTOs are built before OpenAI. |
| staff review status | Staff review/status DTOs are built before OpenAI. |
| prompt assembly | DTO-backed prompt assembly is built from safe references before OpenAI. |
| generic blocked errors | Blocked safety failures expose only generic errors before OpenAI. |

## Source-Level Preflight Tests

The source-level preflight suite lives in:

```text
lib/server/aiRouteRuntimeWiringPreflight.test.ts
```

The non-runtime source validator lives in:

```text
lib/server/aiRouteRuntimeWiringPreflight.ts
```

The tests currently prove:

- The live `/api/ai/summary` route remains staff-gated before the OpenAI call and preserves legacy behavior while the summary gate is off.
- The live `/api/ai/reply` route remains staff-gated before the OpenAI call while the disabled safety scaffold preserves legacy fallback behavior.
- The summary route can call the fail-closed safety-chain adapter when explicitly enabled, but it does not generate from the AI safety DTO chain.
- A future summary route sketch passes only when authentication, active parish scope, object-level request scope, family-portal exclusion, source display, audit metadata, staff review status, DTO-backed prompt assembly, and generic blocked errors all occur before OpenAI.
- A future reply route sketch passes only when the same gates occur before OpenAI.
- A future sketch fails when it includes only partial route-specific marker sets before OpenAI.
- A future sketch fails when OpenAI moves before source-display, audit metadata, or staff-review safeguards.
- A future sketch fails when generic blocked errors are missing before OpenAI.

## Future `/api/ai/summary` Insertion Points

The future `/api/ai/summary` wiring should keep the existing staff gate and add safety wiring before prompt construction is upgraded:

1. Keep `requireStaffFromRequest(request)` at the top of the route.
2. Resolve active parish context from the staff session and active parish cookie.
3. Load the target request and verify the request belongs to the active parish.
4. Build `buildRequestSummaryRetrievalDto`.
5. Build `buildRequestSummarySourceDisplayDto`.
6. Build `buildRequestSummaryAuditMetadataDto`.
7. Build `buildAiStaffReviewStatusDto`.
8. Build `buildAiFutureRetrievalSafetyContract`.
9. Return a generic blocked error before OpenAI if the safety contract fails.
10. Build `buildAiSummaryPromptAssembly` only from approved DTO-backed sources.
11. Write safe audit metadata only after a separate audit-write phase is approved.

## Future `/api/ai/reply` Insertion Points

The future `/api/ai/reply` wiring should keep the existing Supabase user and staff authorization gate:

1. Keep `supabase.auth.getUser()` and `authorizeStaffUser(user)` before the OpenAI call.
2. Resolve active parish context from the staff session and active parish cookie.
3. Load the target request and verify the request belongs to the active parish.
4. Build `buildAiReplyRetrievalDto` for the communication-draft target and request scope.
5. Build email-draft source display, audit metadata, and staff review/status labels from the reply DTO chain.
6. Build `buildAiFutureRetrievalSafetyContract`.
7. Return a generic blocked error before OpenAI if the safety contract fails.
8. Build `buildAiReplyPromptAssembly` only from approved DTO-backed sources.
9. Preserve human approval: do not send email automatically.
10. Write safe audit metadata only after a separate audit-write phase is approved.

## Generic Blocked Error Rules

Family-facing or public-ish blocked reasons must stay generic.

Allowed generic blocked reason:

```text
ai_retrieval_unavailable
ai_reply_unavailable
```

Do not expose:

- Cross-parish mismatch details.
- Staff membership details.
- Request parish IDs.
- Internal note details.
- Document contents.
- Token material.
- Raw prompts.
- Raw provider output.
- Stack traces.

## Manual QA Required After Future Runtime Wiring

Before runtime AI safety can be considered complete, QA must verify:

1. Staff can still generate a basic summary and draft when authorized.
2. Staff cannot generate AI output for a request outside the active parish.
3. Staff cannot generate AI output when the active parish cookie is forged or unauthorized.
4. Family portal pages never expose AI summaries, AI drafts, internal notes, source cards, or audit metadata.
5. Source cards show safe labels only.
6. Blocked cases return generic errors.
7. No OpenAI call is made when safety scope fails.
8. Staff review/status labels remain draft or review-required until staff acts.
9. No email is sent automatically.
10. Safe audit metadata is recorded only after the audit-write phase is explicitly approved.

## Rollback Strategy

Rollback for a future runtime wiring commit should be code-only unless a later approved phase adds schema changes.

1. Revert the `/api/ai/summary` or `/api/ai/reply` route wiring commit.
2. Confirm the route returns to the legacy staff-gated behavior.
3. Confirm `openai.responses.create` still occurs only after staff authorization.
4. Confirm no family portal or staff UI behavior changed.
5. Confirm no operational RLS changes are present.

## Claim Boundary

Safe internal statement:

> Vinea has prepared a route wiring plan, source-level preflight tests, and a fail-closed summary adapter for future AI safety integration.

Do not claim:

- Runtime AI retrieval is fully permission-scoped.
- AI route prompts are DTO-backed at runtime for all enabled routes.
- AI source display is visible in the staff UI.
- AI audit metadata is written at runtime.
- AI staff review/status labels are visible in the staff UI.
- Family portal or cross-parish AI retrieval blocking is runtime-enforced.
