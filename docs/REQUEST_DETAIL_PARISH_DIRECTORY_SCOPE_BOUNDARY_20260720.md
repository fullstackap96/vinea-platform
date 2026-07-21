# Request Detail Parish Directory Scope Boundary - 2026-07-20

## Decision

`PASS` for the local read-only reliability slice. Live two-parish browser evidence, remote CI, and non-production Preview verification remain separate gates.

## Problem Closed

Request Detail loaded staff and priest assignment directories only once, without a deadline or returned-parish validation. A stalled response could remain unresolved, and a route or selected-parish transition could leave assignment choices from the prior parish visible.

## Implemented Boundary

- The optional `/api/parish/settings` read has a 15-second abortable deadline.
- The read reruns when the authoritative loaded request `parish_id` changes.
- Prior directory choices clear before a replacement read begins.
- The existing strict parish-settings parser accepts the response only when `ok` is true, the complete settings projection is valid, and the returned parish id matches the request parish.
- Cleanup aborts obsolete work and blocks late state settlement.
- Existing preserved assignee values and free-text assignment behavior remain available if the optional directory read fails.

The path remains credentialed and read-only. No API, authorization, assignment mutation, migration, RLS, provider, storage, export, AI, communication, certificate, feature-gate, or production behavior changed.

## Verification

- Immutable implementation commit: `ca03a7cbdbfa5042006d0d482b335f6c1a018412`
- Tracked-head aggregate SHA-256: `F9383B3D44A0ABD00DBBADCACAB1C2E4FDD3FDC6C04A4AC09274B8A3D8CB8FB6`
- Tracked release-source files: `1520`
- Source mode: `tracked-head`
- Production approval granted: `NO`
- Focused parser and new boundary coverage: `3` files / `15` tests passed.
- Existing Request Detail and parish-settings regression coverage: `16` files / `74` tests passed.
- TypeScript and targeted lint passed.
- Complete local release contract: all `15` checks passed with zero secret findings across `2,921` text files (`500` binaries skipped), zero vulnerabilities, every production-safety/evidence gate, both TypeScript scopes, lint, `871` test files / `3,731` tests, and the credential-free `56`-page Next.js build.

## Remaining Evidence

1. Publish only after separate exact-head approval.
2. Require clean-checkout CI and non-production Preview verification.
3. In a safe two-parish staff session, confirm assignment choices refresh to the loaded request's parish and never retain prior-parish names.
4. Keep production-sensitive gates and human rollout approvals separate.
