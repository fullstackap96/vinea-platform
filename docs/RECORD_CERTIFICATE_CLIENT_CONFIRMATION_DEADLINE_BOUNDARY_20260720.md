# Record Certificate Client Confirmation Deadline Boundary - 2026-07-20

Completion marker: `RECORD_CERTIFICATE_CLIENT_CONFIRMATION_DEADLINE_BOUNDARY_20260720`

Decision: `IMPLEMENTED_AND_LOCALLY_VERIFIED`

## What Changed

The staff-reviewed Baptism certificate action now has a finite 60-second browser confirmation deadline without changing certificate eligibility, PDF rendering, active-parish authorization, or event persistence.

- A synchronous single-flight guard prevents duplicate dispatch before React can repaint the button.
- Explicit non-2xx server rejection remains retryable with the existing generic guidance.
- Timeout, transport uncertainty, a malformed PDF acknowledgement, or an empty PDF freezes another generation attempt until staff refresh and review certificate activity.
- The client validates the PDF response before opening or downloading it.
- No certificate request replays automatically.

The server remains authoritative for same-origin POST enforcement, staff authentication, selected active-parish membership, same-parish record ownership, Baptism-only scope, PDF generation, and checked `certificate_generated` event insertion before delivery.

## Source Identity

- Immutable implementation commit: `b85ea09123fe4abc9d6cf45b999d455f38352bcb`
- Tracked-head aggregate SHA-256: `BCE10A325BC6A9E48BBF8B324DFA691A5EA9C1F122189B2B630C48F6ADDDF60D`
- Tracked release-source files: `1518`
- Working-tree aggregate SHA-256 at verification: `76028F59A97E8DC68CC22A81A633C055E8BD224DFBCC98E63AC6BAAD9063F082`
- Working-tree release-source files: `1522` (`1518` tracked plus `4` unrelated user-owned untracked scripts)

## Verification

- Focused certificate confirmation, selected-parish route, safe-error, explicit-method, and audit-order coverage: `6` files / `22` tests passed.
- TypeScript: passed.
- ESLint: passed.
- Diff hygiene: passed.
- Complete local release-readiness contract: all `15` checks passed.
- Repository secret scan: `2914` text files scanned, `500` binary files skipped, zero findings.
- Dependency audit: zero vulnerabilities.
- Complete Vitest suite: `869` files / `3721` tests passed.
- Credential-free Next.js production build: passed with `56` static pages generated.

No certificate or PDF was generated during verification. No production access, deployment, migration, operational RLS change, provider call, communication, export, storage action, record mutation, AI call, canonical or sacramental decision, or public trust claim occurred.

## Remaining Evidence Boundary

Live non-production evidence for timeout, malformed or empty PDF acknowledgement, and refresh-before-retry remains pending. This local evidence does not approve production deployment, broader certificate types, automated generation, or any canonical, sacramental, pastoral, or eligibility decision.
