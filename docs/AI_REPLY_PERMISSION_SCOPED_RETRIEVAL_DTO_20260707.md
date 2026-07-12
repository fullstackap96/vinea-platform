# AI Reply Permission-Scoped Retrieval DTO - 2026-07-07

Status: Implemented as a non-runtime AI safety DTO slice. Production was not accessed, no migrations were applied, operational RLS was not changed, `/api/ai/reply` runtime behavior was not expanded, and no OpenAI call path was changed.

## Purpose

This slice prepares a typed safety contract for future staff-reviewed AI reply drafts. It gives the future `/api/ai/reply` safety chain a parish-scoped, request-scoped, source-labeled DTO before any future route can build prompts, expose source display, write audit events, or return generated reply text through the new safety path.

## What Exists

- `lib/aiReplyRetrievalDto.ts`
- `lib/aiReplyRetrievalDto.test.ts`

The DTO uses the existing AI feature registry `email_draft` policy and produces:

- active parish and request parish scope,
- staff identity and authorized parish membership expectation,
- communication-draft target metadata,
- request ID, request type, draft intent, and recipient kind,
- allowed input data classes,
- safe source references,
- source-display requirements,
- audit metadata requirements,
- human-review requirements,
- family-facing exclusion boundaries,
- sacramental/canonical restriction boundaries,
- outbound communication policy that requires staff review and forbids autonomous send.

## Fail-Closed Rules

The DTO blocks:

- missing staff, parish, request, draft, or source fields,
- active parish mismatch with the request parish,
- active parish not included in the staff member's authorized parish IDs,
- empty source lists,
- token-like, signed-URL, raw prompt, raw output, provider-payload, secret, password, hash, or plaintext markers in target/source labels or paths,
- data classes not approved for `email_draft`, including sacramental record metadata and document contents.

## Chain Compatibility

Focused tests prove the reply DTO can compose with the existing non-runtime:

- source display DTO,
- AI audit metadata DTO,
- staff review/status DTO.

The composed chain preserves safe references and review labels without storing raw prompts, raw outputs, provider payloads, signed URLs, token material, document contents, or generated reply text.

## Shared Safety Contract Coverage

This slice also extends the non-runtime family/cross-parish AI safety contract so it can validate the reply retrieval DTO chain, not only the request-summary retrieval DTO chain. The source-level AI route preflight now recognizes `buildAiReplyRetrievalDto(...)` as the intended future `/api/ai/reply` object-scope gate and rejects that marker if it appears in the current live legacy route before approved runtime wiring.

## Explicit Non-Goals

This slice does not:

- wire `/api/ai/reply` to the DTO,
- call OpenAI through the new safety path,
- change legacy flag-off AI reply behavior,
- write AI audit events,
- expose source display in the staff UI,
- persist staff disposition,
- send communications,
- generate or save reply drafts,
- access Supabase, storage, Google Calendar, exports, public intake, family portal routes, or production,
- apply migrations,
- change operational RLS,
- make public trust-center claims.

## Future Approval Boundary

Runtime use remains `NO_GO` until a separate product/security approval covers:

- `/api/ai/reply` safety-chain adapter wiring,
- server-side active parish and membership loading,
- object-level request ownership loading,
- safe source display response shape,
- safe AI audit-write behavior,
- staff disposition persistence,
- non-production flag-on QA,
- rollback by disabling flags,
- production NO-GO criteria.

## Verification

- `npm.cmd test -- lib\aiReplyRetrievalDto.test.ts lib\aiAuditMetadataDto.test.ts lib\aiSourceDisplayDto.test.ts lib\aiStaffReviewStatusDto.test.ts` passed: 4 files, 19 tests.
- `npm.cmd test -- lib\aiFutureRetrievalSafetyContract.test.ts lib\server\aiRouteRuntimeWiringPreflight.test.ts lib\aiReplyRetrievalDto.test.ts` passed: 3 files, 17 tests.
