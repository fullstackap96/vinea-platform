# Sacramental Record Create Relationship Integrity

Status: `IMPLEMENTED AND LOCALLY VERIFIED; SAFE NON-PRODUCTION BROWSER QA RECOMMENDED`

Date: 2026-07-10

## Purpose

Protect optional request-to-record and person-to-record links at the final sacramental record creation boundary. The record create action must not trust a browser-supplied `requestId` or `personId` merely because the new record itself uses the selected parish id.

## Implemented Boundary

- Staff authentication and the existing staff write parish context resolve before relationship validation.
- An optional source request must exist and its stored parishioner relationship must belong to the selected parish.
- A request that already produced a sacramental record is rejected before insert; the existing database unique constraint remains the final concurrent-write safeguard.
- An optional linked person must exist in `people` for the selected parish.
- Forged, stale, missing, or cross-parish relationship ids receive safe selected-parish messages and stop before record insertion.
- Database lookup failures use one generic client-safe verification message while server logs continue through the existing redacted error logger.
- The existing staff-entered register fields and insert behavior remain unchanged after validation succeeds.

## Explicit Boundaries

- Automatic request/person linking added: `NO`.
- Existing records mutated: `NO`.
- Certificate generated: `NO`.
- Canonical, sacramental, pastoral, or eligibility decision made: `NO`.
- Migration or operational RLS changed: `NO`.
- Production accessed: `NO`.
- External provider called: `NO`.
- Production-sensitive feature enabled: `NO`.
- Public trust claim approved: `NO`.

## Verification

- `lib/server/sacramentalRecordCreateRelationships.test.ts` covers same-parish success, cross-parish request denial, duplicate request-to-record denial, and cross-parish person denial.
- `lib/server/sacramentalRecordActionsCreate.test.ts` proves rejected relationships stop before the existing insert and verifies the authorized selected parish is passed into the relationship guard.
- `lib/sacramentalRecordClientMessages.test.ts` confirms approved relationship guidance remains visible while unexpected technical text stays behind an action-specific fallback.
- Focused integrity suite: `3 files / 17 tests passed`.
- Focused integrity plus release-review guards: `5 files / 23 tests passed`.
- Full Vitest regression suite: `693 files / 2,751 tests passed`.
- Standard and all-file TypeScript checks: `PASS`.
- Quiet lint: `PASS`.
- Next.js `16.2.10` production build: `PASS`, with `56` static pages generated.
- Repository secret scan: `1,884` text files scanned, `26` binaries skipped, `0` findings, and no secret values printed.
- Release handoff: `86` artifacts, `16` CI commands, `15` locked gates, and `0` findings.
- Completed local evidence: `510` required phrases and `0` findings.
- Production gate check: `15` gates remain locked and `0` findings.
- `git diff --check`: `PASS`; existing line-ending warnings only.

## Manual Follow-Up

In safe non-production only, create one record from an authorized same-parish request, then confirm a stale/cross-parish request id, a cross-parish person id, and a request that already has a record all fail without creating another register row. Do not use production data or treat this as approval for runtime certificate/correction/notation workflows.
