# Export Audit Reviewer Dashboard Client Read Deadline Boundary - 2026-07-20

## Decision

`PASS` for the local non-production reliability slice. Production dashboard exposure, production exports, and production monitoring remain `NO-GO`.

## Problem Closed

The non-production staff reviewer dashboard already ignored stale saved-filter responses, but its protected API read had no deadline and obsolete requests remained alive after filter replacement or unmount. A stalled current request could therefore leave the dashboard loading indefinitely.

## Implemented Boundary

- The credentialed `/api/export-audit-reviewer` GET has a 15-second abortable deadline.
- Starting a replacement load aborts the previous request.
- Selecting another saved filter invalidates and aborts the current request before dispatching the replacement.
- Effect cleanup invalidates and aborts unresolved work.
- Response-body settlement checks the abort signal before state changes.
- Existing latest-sequence ownership and generic staff-safe failure guidance remain authoritative.

The dashboard still uses only the existing protected API/read-model path. It adds no direct Supabase read, mutation, export/download control, raw metadata, storage access, signed URL, production flag, production navigation, or production runtime behavior.

## Verification

- Immutable implementation commit: `91d39c2080cddc145acae1b2ada822291c746cfe`
- Tracked-head aggregate SHA-256: `713C54768F43D49AC3ADB0BF78F5AC15DD849F958014C2897078ACC83B383C3A`
- Tracked release-source files: `1521`
- Source mode: `tracked-head`
- Production approval granted: `NO`
- Focused dashboard, route, read-model, prior QA evidence, and new deadline coverage: `5` files / `28` tests passed.
- TypeScript and targeted lint passed.
- Complete local release contract: all `15` checks passed with zero secret findings across `2,923` text files (`500` binaries skipped), zero vulnerabilities, every production-safety/evidence gate, both TypeScript scopes, lint, `872` test files / `3,735` tests, and the credential-free `56`-page Next.js build.

## Remaining Evidence

1. Publish only after separate exact-head approval.
2. Require clean-checkout CI and non-production Preview verification.
3. In a safe non-production staff session, confirm a saved-filter change settles normally and disabling the prototype flags still removes access.
4. Keep production dashboard exposure, exports, monitoring, and all production-sensitive gates separately unapproved.
