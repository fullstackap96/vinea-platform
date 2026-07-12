# Duplicate Review Operation Integrity Boundary

Decision: `DUPLICATE_REVIEW_OPERATION_INTEGRITY_BOUNDARY_IMPLEMENTED_20260711`

Status: Implemented and verified locally without accessing production or mutating records.

## What Changed

People and Household duplicate review now use one immediate browser operation lock per screen. Candidate discovery and destructive merge cannot overlap, and repeated clicks cannot dispatch a second browser request before React paints the disabled state.

Both screens now recover from thrown discovery errors instead of remaining in a loading state. The Find duplicates control exposes accessible busy state while either discovery or merge is unresolved.

Merge handling now distinguishes three outcomes:

1. A confirmed API error retains the existing safe no-confirmation message.
2. A successful merge followed by refresh failure says the merge was confirmed and requires a fresh scan before another merge.
3. A dropped or malformed success response is treated as uncertain completion; stale merge controls remain blocked until a successful fresh scan resolves current state.

## Plain English

Vinea no longer lets duplicate discovery race a merge. More importantly, if the connection drops at the worst moment, staff are not encouraged to press Merge again without first checking what actually happened.

This protects parishioner, household, sacramental-record, request, and membership continuity while keeping the interaction quick and understandable.

## Preserved Boundaries

- Existing staff confirmation remains required before every merge.
- Existing authenticated active-parish APIs, merge validation, ownership checks, persistence order, and audit behavior remain authoritative.
- No merge algorithm, selected-field behavior, database schema, or operational RLS changed.
- No production access, shared-QA access, record mutation during verification, migration, communication, provider call, AI call, export, storage access, signed URL, certificate generation, sensitive flag change, or public trust claim occurred.
- The browser lock is same-screen exclusion, not durable idempotency or a database transaction.

## Rollback

Restore the prior component operation handling. No migration or data rollback is required.

## Verification

- Focused People/Household UI, confirmation, safe-message, selected-parish, and route persistence regression passed with 8 files and 58 tests.
- ESLint passed with no findings.
- All-file TypeScript checking passed.
- Production-gate validation passed with all 15 artifacts linked and sensitive features still unapproved.
- Next.js 16.2.10 production build passed and generated all 56 static pages.
- Full repository regression passed with 788 test files and 3,345 tests.
- `git diff --check` passed; existing line-ending notices are informational only.
