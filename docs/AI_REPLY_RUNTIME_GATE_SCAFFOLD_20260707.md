# AI Reply Runtime Gate Scaffold - 2026-07-07

Status: `IMPLEMENTED - DISABLED-BY-DEFAULT REPLY SAFETY GATE`

## Scope

This slice adds a disabled-by-default runtime gate and scaffold for:

- `POST /api/ai/reply`

The live route now selects one of two paths:

- `legacy_staff_gated_reply_route` when the new flags are missing or invalid.
- `permission_scoped_reply_safety_chain_scaffold` only when both exact approval flags are present.

The enabled scaffold path deliberately fails closed with `ai_reply_unavailable` before any OpenAI call. It does not implement a permission-scoped reply adapter, permission-scoped reply retrieval, source-display response payloads, audit writes, staff disposition tracking, or generated reply delivery through the safety chain.

## Required Flags

The scaffold is off unless both values match exactly:

```text
VINEA_AI_REPLY_SAFETY_RUNTIME=ENABLED
VINEA_AI_REPLY_SAFETY_RUNTIME_ACK=APPROVED_AI_REPLY_SAFETY_RUNTIME
```

These variables are intentionally not required boot-time environment variables.

## What Changed

- Added `lib/server/aiReplyRuntimeGate.ts`.
- Added `lib/server/aiReplyRuntimeScaffold.ts`.
- Updated `app/api/ai/reply/route.ts` to call the gate after staff authentication and request body parsing.
- Moved the existing reply prompt/OpenAI behavior into `runLegacyStaffGatedReplyRoute`.
- Added `lib/server/aiReplyRuntimeScaffold.test.ts`.

## Safety Boundaries

- Flag-off `/api/ai/reply` behavior remains legacy staff-gated and still calls the existing OpenAI reply prompt.
- Flag-on scaffold behavior fails closed before OpenAI with `ai_reply_unavailable`.
- No production flags were enabled.
- No production access was performed.
- No migrations were applied.
- No operational RLS changes were made.
- No audit events are written by this scaffold.
- No source display, staff review, prompt text, generated output, provider payload, token material, internal notes, document contents, storage paths, signed URLs, exports, Google Calendar data, public intake behavior, certificate generation, automation, or public trust claims were added or exposed.

## Future Approval Boundary

A future `/api/ai/reply` safety-chain implementation remains `NO_GO` until product/security approval defines and tests:

- authenticated staff context before any OpenAI call,
- selected active parish and membership scope,
- object-level request scope,
- family-portal and cross-parish exclusions,
- safe source-display DTO usage,
- safe AI audit metadata,
- staff review/status labels and disposition tracking,
- generic blocked errors,
- non-production QA evidence,
- production-safe smoke fixtures,
- monitoring and rollback owners.

## Verification

- `npm.cmd test -- lib\server\aiReplyRuntimeScaffold.test.ts` passed.
- Additional route/error/docs checks should include:
  - `lib\server\aiRouteSafeErrors.test.ts`
  - `lib\server\aiRouteRuntimeWiringPreflight.test.ts`
  - `lib\server\readmeProductionReadiness.test.ts`

## Manual Testing Needed

- Optional non-production smoke: sign in as safe staff and generate an AI reply with the flags unset to confirm the existing staff-reviewed reply draft behavior still works.
- Optional non-production scaffold smoke: set only the exact non-production reply scaffold flags and confirm `/api/ai/reply` returns `ai_reply_unavailable` without calling OpenAI.
