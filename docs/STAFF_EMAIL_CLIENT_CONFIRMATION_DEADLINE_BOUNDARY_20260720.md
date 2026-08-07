# Staff Email Client Confirmation Deadline Boundary - 2026-07-20

Decision: `STAFF_EMAIL_CLIENT_CONFIRMATION_BOUNDARY_VERIFIED`

## What Changed

Request Detail and Daily Work Hub now stop waiting after 20 seconds for the request-bound email route, which remains longer than the server's existing 12-second provider deadline. Post-send communication logging now stops waiting after 60 seconds.

An uncertain delivery retains the existing exact-content delivery attempt, so a reviewed retry uses the same opaque provider idempotency key. Once provider delivery is positively confirmed, an uncertain or rejected communication log freezes related mutation controls until staff refresh and review. Vinea never treats another email send as a retry for logging.

## Existing Boundaries Preserved

- Staff authentication, selected active-parish membership, and same-parish request ownership remain required.
- The recipient remains derived from the stored request/parishioner relationship.
- Subject and body remain staff-entered and staff-reviewed.
- Existing provider idempotency, provider timeout, positive acknowledgement, and active-parish communication logging remain authoritative.
- No email or other communication was sent during verification.
- No production, migration, operational RLS, storage, export, AI, Google Calendar, certificate, flag, or public-claim action occurred.

## Source Identity

- Immutable implementation commit: `f7de8a6eeb320737987f6aa0332a0176fa535215`
- Tracked-head aggregate SHA-256: `3253FED2D2F7113513EAC1E28D465D19E153FDCF1ABD8A63055BC071917D850E`
- Tracked release-source files: `1496`
- Working-tree aggregate SHA-256: `A7692192F181492657C8B55D1495AD7DAF2002EC9DC80ABB0D798E7C88277F99`
- Working-tree release-source files: `1500`
- Unrelated user-owned untracked release-source scripts: `4`
- Production approval granted: `NO`

## Verification

- Focused client-deadline, single-flight, provider-deadline, partial-success, safe-message, and route suite: `7` files / `43` tests passed.
- TypeScript project check: passed.
- Focused ESLint and diff check: passed.
- Complete local release contract: `15` of `15` checks passed in `351` seconds.
- Repository secret scan: `2,884` text files scanned, `500` binaries skipped, zero findings, no secret values printed.
- Dependency audit: zero vulnerabilities.
- Governance and evidence gates: passed with production-sensitive approvals still false.
- TypeScript: both scopes passed.
- Lint: passed.
- Full Vitest suite: `855` files / `3,673` tests passed.
- Credential-free Next.js 16.2.10 production build: passed, `56` static pages generated.
- Post-documentation secret scan: `2,885` text files scanned, `500` binaries skipped, zero findings.
- Post-documentation source-bound suite: `8` files / `49` tests passed.

## Plain English

Parish staff will no longer be left staring at a permanent Sending state if a browser connection stalls. Vinea also prevents a second email from being used to repair uncertain history logging after the first email is known to have been delivered. Staff are told to refresh and review instead.

## Remaining Boundary

This is local source evidence. It did not send a real email and is not live rollout evidence. Production-sensitive approvals and external smoke evidence remain separate and closed.
