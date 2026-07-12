# Data Import Client Recovery Boundary - 2026-07-12

Completion marker: `DATA_IMPORT_CLIENT_RECOVERY_BOUNDARY_IMPLEMENTED_20260712`

Status: Implemented and verified locally. Live protected-preview timing remains rollout-unverified until the exact-head Preview environment is healthy.

## What Changed

- Recent-import history refresh now stops waiting after 15 seconds and continues to preserve the last confirmed staff view when a newer refresh is superseded or times out.
- Spreadsheet preview now stops waiting after 30 seconds and returns the existing safe review failure guidance.
- A reviewed import commit now stops waiting after 120 seconds instead of leaving staff in an indefinite busy state.
- An unconfirmed commit keeps the reviewed import blocked and tells staff to inspect Recent imports and the records list before trying again.

## Safety Boundary

- The existing synchronous single-flight lock still runs before either preview or commit dispatch.
- The reviewed immutable snapshot, selected active-parish API scope, server authorization, validation, row confirmation, partial-success reporting, and import-history behavior are unchanged.
- No automatic retry was added. A browser deadline does not claim that already-dispatched server work was cancelled or rolled back.
- No migration, operational RLS change, provider call, production access, export, AI call, communication, storage access, certificate generation, or public claim is part of this slice.

## Verification

- Focused import regression passed `9` files / `38` tests.
- Both TypeScript scopes and lint passed.
- Focused source coverage verifies operation-specific deadlines, timeout cleanup, single-flight ordering, no automatic commit retry, and confirm-before-retry guidance.
- The complete 15-check release gate passed in `296.3` seconds with zero secret findings across `2,135` files, zero dependency vulnerabilities, both TypeScript scopes, lint, `829` test files / `3,528` tests, and the credential-free `56`-page Next.js build.
- Release-source aggregate `0CB1CAFF043A1D4D382B6AA9220D93824DB811F6864DBEA6D1536547F78514E8` binds `1,465` files to immutable implementation commit `68694e7cb5aa71884fd1c16b45d92d699fe1921a`.

## Rollback

Rollback is the scoped client deadline and source-test revert. No database, import-record, migration, or RLS rollback is required.
