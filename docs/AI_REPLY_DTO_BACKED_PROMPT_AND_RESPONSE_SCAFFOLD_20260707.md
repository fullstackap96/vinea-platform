# AI Reply DTO-Backed Prompt and Response Scaffold - 2026-07-07

## Status

Implemented as a non-runtime AI safety slice.

This adds DTO-backed prompt assembly, audit metadata preparation, and source-display/staff-review response scaffolding for future `/api/ai/reply` safety-chain work. The live reply route is not wired to this path, OpenAI is not called through this path, audit events are not written, source display is not exposed to staff UI, staff disposition is not persisted, and outbound communications are not sent.

## What Exists

- `lib/aiReplySafetyChainDtos.ts`
- `lib/aiReplySafetyChainDtos.test.ts`
- `lib/aiReplyRetrievalDto.ts`
- Existing source-display, audit-metadata, staff-review, and family/cross-parish safety DTOs

## Safety Boundary

The prompt assembly requires:

- `email_draft` AI feature scope
- selected active parish scope
- request parish scope
- matching communication-draft target scope
- authorized staff membership represented by the retrieval DTO
- safe source references present in both retrieval and audit metadata DTOs
- `draft_only` output destination
- `pending_review` staff disposition
- staff-reviewed draft policy
- autonomous send disabled
- family-facing output disabled
- model/provider family set to `not_invoked`

The audit metadata preparation and response scaffold intentionally exclude:

- raw prompt text
- generated output
- provider payloads
- token material
- signed URLs
- storage paths
- document contents
- internal note bodies
- communication bodies
- autonomous send controls

## Staff-Reviewed Boundary

Future AI reply drafts must remain staff-reviewed. This scaffold allows future code to prepare safe source references and review labels, but it does not approve sending, saving, disposition persistence, or generated draft exposure.

## Production Boundary

Still `NO-GO`:

- runtime `/api/ai/reply` safety-chain adapter wiring
- OpenAI generation through the reply safety chain
- audit event writes
- staff-visible source display
- staff disposition persistence
- customer-facing or production AI reply enablement
- autonomous outbound communication
- production flags

## Verification

- `npm.cmd test -- lib\aiReplySafetyChainDtos.test.ts lib\aiReplyRetrievalDto.test.ts lib\aiFutureRetrievalSafetyContract.test.ts` passed: 3 files, 17 tests.

## Next Safe Step

Prepare source-level preflight tests for the future `/api/ai/reply` safety-chain adapter so runtime wiring cannot skip authentication, active-parish scope, object-level request ownership, DTO-backed prompt assembly, safe audit metadata, staff review, generic blocked errors, and the no-autonomous-send boundary.
