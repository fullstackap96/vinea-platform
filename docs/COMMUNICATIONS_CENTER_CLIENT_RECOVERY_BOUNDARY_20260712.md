# Communications Center Client Recovery Boundary - 2026-07-12

Completion marker: `COMMUNICATIONS_CENTER_CLIENT_RECOVERY_BOUNDARY_IMPLEMENTED_20260712`

Status: Implemented and verified locally. Live protected-preview timing remains rollout-unverified until the exact-head Preview environment is healthy.

## What Changed

- Staff-reviewed touchpoint and follow-up writes now stop waiting after 60 seconds.
- If completion cannot be confirmed, Communications Center freezes every mutation control and tells staff to refresh Communications and review the request before trying again.
- The same-screen single-flight lock still runs before either authenticated request API call.

## Safety Boundary

- Existing active-parish membership and same-parish request ownership remain enforced by the server route.
- Existing staff-entered communication/follow-up data, safe response allowlist, audit metadata, route behavior, migrations, RLS, and production gates are unchanged.
- No automatic retry was added. A browser deadline does not claim that already-dispatched server work was cancelled or rolled back.
- No communication was sent, and no production access, migration, RLS change, provider call, export, AI call, storage access, certificate generation, or public claim occurred.

## Verification

- Focused Communications Center regression passed `6` files / `28` tests after two stale source expectations were updated to require the stronger refresh lock.
- Both TypeScript scopes and lint passed.
- Source coverage verifies the deadline, refresh-after-uncertainty state, frozen controls, single-flight ordering, and absence of automatic replay.
- The complete 15-check release gate passed in `297.7` seconds with zero secret findings across `2,141` files, zero dependency vulnerabilities, both TypeScript scopes, lint, `832` test files / `3,544` tests, and the credential-free `56`-page Next.js build.
- Release-source aggregate `F9ED8FAC6AEAE72B94DD4F4CEDA513DED3A7C46D16EA353E7A020D33C73EA188` binds `1,468` files to immutable implementation commit `ca3488436906f5836e96ddabe4fb9e0ee14d328c`.

## Rollback

Rollback is the scoped client deadline/refresh lock and source-test revert. No database, communication-record, migration, or RLS rollback is required.
