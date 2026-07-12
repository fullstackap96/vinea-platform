# AI Reply Safety-Chain Adapter - 2026-07-07

## Status

Implemented as a disabled-gate, fail-closed runtime safety adapter for `/api/ai/reply`.

When the AI reply safety gate is off, `/api/ai/reply` keeps the existing staff-gated legacy behavior. When the exact non-production scaffold flags are enabled, the route now builds the prepared reply safety DTO chain and still fails closed with `ai_reply_unavailable` before any OpenAI call.

This is not production AI enablement.

## What Exists

- `lib/server/aiReplySafetyChainAdapter.ts`
- `lib/server/aiReplySafetyChainAdapter.test.ts`
- Updated `/api/ai/reply` route wiring behind `getAiReplySafetyRuntimeGate(...)`
- Existing permission-scoped reply retrieval DTO
- Existing reply prompt assembly, audit metadata preparation, and source-display/staff-review response scaffold DTOs

## Runtime Safety Boundary

The enabled scaffold path requires:

- authenticated staff before body parsing and safety-chain work
- selected active parish context from the active parish cookie when present
- membership-validated active parish context when an active parish cookie is present
- primary-parish fallback only when no active parish cookie exists
- object-level `requestId` before lookup
- request row lookup through server-owned database access
- linked parishioner parish ownership lookup
- active parish matching the request parish before DTO preparation can succeed
- permission-scoped reply retrieval DTO creation
- safe source-display DTO creation
- safe audit metadata DTO creation
- staff review/status DTO creation
- future retrieval safety contract validation
- DTO-backed prompt assembly from safe source references only
- safe audit metadata preparation without writing audit events
- safe response scaffold preparation without returning source display or generated content

Even when every check passes, the route returns `ai_reply_unavailable` and does not call OpenAI.

## Forbidden Behavior

This adapter does not:

- call OpenAI; in other words, it does not call OpenAI from this scaffold
- write audit events; in other words, it does not write audit events from this scaffold
- expose source display to staff UI; in other words, it does not expose source display to staff UI
- persist staff disposition
- send email or any outbound communication; in other words, it does not send email or any outbound communication
- create autonomous send controls
- read or write storage
- create signed URLs
- expose document contents
- expose raw prompt text
- expose generated output
- expose provider payloads
- expose token material
- apply migrations
- change operational RLS
- enable production flags
- make public trust claims

## Production Boundary

Still `NO-GO`:

- production AI reply safety-chain enablement
- OpenAI generation through the reply safety chain
- audit event writes from `/api/ai/reply`
- safe response/source-display exposure to staff UI
- staff disposition persistence
- customer-facing AI reply claims
- autonomous outbound communication

## Verification

- `npm.cmd test -- lib/server/aiReplySafetyChainAdapter.test.ts lib/server/aiReplyRuntimeScaffold.test.ts lib/aiReplySafetyChainDtos.test.ts` passed: 3 files, 20 tests.
- `npm.cmd run typecheck` passed.

## Next Safe Step

Prepare separate approval and source-level tests for AI reply audit-write and safe-response exposure gates. Those gates should remain non-production-only until product, security/data, QA, support, monitoring, and rollback owners approve them.
