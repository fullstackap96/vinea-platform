# Duplicate Review Client Recovery Boundary - 2026-07-12

Completion marker: `DUPLICATE_REVIEW_CLIENT_RECOVERY_BOUNDARY_IMPLEMENTED_20260712`

Status: Implemented and verified locally. Live protected-preview timing remains rollout-unverified until the exact-head Preview environment is healthy.

## What Changed

- People and Household duplicate candidate loads now stop waiting after 20 seconds.
- Staff-reviewed merge confirmation now stops waiting after 120 seconds instead of leaving the workspace indefinitely busy.
- Any unconfirmed merge keeps duplicate review blocked until staff refresh the queue, preventing a casual replay against linked records.

## Safety Boundary

- Existing explicit confirmation dialogs and synchronous single-flight locks still precede merge dispatch.
- Existing selected active-parish authorization, same-parish merge scope, field review, checked row persistence, compensation guidance, audit behavior, migrations, and operational RLS are unchanged.
- No automatic retry was added. A browser deadline does not claim already-dispatched server work was cancelled or rolled back.
- No production access, migration, RLS change, provider call, export, AI call, storage access, communication, certificate generation, or public claim occurred.

## Verification

- Focused duplicate-review regression passed `14` files / `84` tests.
- Both TypeScript scopes and lint passed.
- Source coverage verifies separate load/merge deadlines, confirmation and lock ordering, refresh-before-retry, and absence of automatic merge replay.
- The complete 15-check release gate passed in `274.7` seconds with zero secret findings across `2,139` files, zero dependency vulnerabilities, both TypeScript scopes, lint, `831` test files / `3,540` tests, and the credential-free `56`-page Next.js build.
- Release-source aggregate `1DA7F37F606026BC8486F84484F9EC23B9B570B07E5677BBC30133B679EBDFD1` binds `1,467` files to immutable implementation commit `ddf5ebfa8d626f9910fa8b17479ba2f1c55ce1ba`.

## Rollback

Rollback is the scoped client deadline and source-test revert. No database, merge, migration, or RLS rollback is required.
