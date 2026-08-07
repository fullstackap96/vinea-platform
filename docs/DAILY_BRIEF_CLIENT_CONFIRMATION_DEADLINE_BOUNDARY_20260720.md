# Daily Brief Client Confirmation Deadline Boundary - 2026-07-20

Completion marker: `DAILY_BRIEF_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720`

Decision: `IMPLEMENTED_AND_LOCALLY_VERIFIED`

## Purpose

The staff-initiated Daily Brief send now has a finite browser confirmation boundary. Vinea reports success only after the server returns a positive provider acknowledgement, and it gives inbox-first guidance instead of inviting a blind duplicate send when delivery cannot be confirmed.

## Implemented Boundary

- Browser confirmation deadline: `30` seconds.
- The existing synchronous single-flight lock still prevents competing Settings and Daily Brief operations.
- One opaque delivery attempt remains associated with the selected parish until positive delivery confirmation.
- The client captures active parish scope before dispatch and ignores stale settlement after an authorized parish switch.
- Explicit non-2xx server rejections continue through the existing privacy-safe message allowlist.
- A 2xx response must contain both `ok: true` and a non-empty provider message id before Vinea reports success.
- Timeout, transport uncertainty, malformed success, or acknowledgement loss tells staff to check the parish inbox before retrying.
- A deliberate retry for the same selected parish reuses the existing attempt; no retry occurs automatically.
- The existing server authentication, active-parish membership, provider idempotency, 12-second provider deadline, recipient selection, checked state recording, and partial-success handling remain authoritative.

## Source Identity

- Implementation commit: `fe0c75fbe6cdb674153282babf74f6e7573407a3`
- Tracked-head aggregate SHA-256: `0AC717E566E754D32D5DC0C8779DA67661A00B1203179FEBCF390849EF396B72`
- Tracked source files: `1513`
- Working-tree aggregate SHA-256: `D3A216473D26C7E393219C81E5FA0362FD78CA5F1FCB40EEA9E36A4E5349DA3C`
- Working source files: `1517` (`1513` tracked plus `4` unrelated user-owned untracked scripts)

## Verification

- Focused confirmation, provider reliability, single-flight, route, selected-parish, safe-message, and Settings compatibility suite: `9` files / `41` tests passed.
- TypeScript `typecheck` passed.
- Repository lint passed.
- Diff hygiene passed.
- Complete release-readiness rerun: `15 / 15` checks passed.
- Repository secret scan: `2907` text files scanned, `500` binaries skipped, `0` findings.
- Dependency security: `0` vulnerabilities.
- TypeScript: `typecheck` and `typecheck:all` passed.
- Full Vitest suite: `866` files / `3710` tests passed.
- Credential-free Next.js `16.2.10` build passed with `56` static pages generated.
- Post-documentation focused suite: `10` files / `47` tests passed.
- Post-documentation repository secret scan: `2908` text files scanned, `500` binaries skipped, `0` findings.

The first complete release-contract attempt passed checks 1 through 13 and executed the full suite, but the source-manifest evidence test correctly rejected the new aggregate because the manifest section had not yet been added. That partial run was not counted. After binding the exact source identity, the complete contract restarted from check 1 and returned `LOCAL_RELEASE_READINESS_PASSED`.

## Safety Boundary

This work did not send a Daily Brief, access production, deploy code, apply a migration, change RLS, enable a production-sensitive flag, mutate parish data, call Google Calendar or AI, run an export, access storage, create a signed URL, generate a certificate, or make a public trust claim. Live non-production timeout, acknowledgement-loss, selected-parish-switch, and same-attempt retry evidence remain rollout checks rather than local-test claims.
