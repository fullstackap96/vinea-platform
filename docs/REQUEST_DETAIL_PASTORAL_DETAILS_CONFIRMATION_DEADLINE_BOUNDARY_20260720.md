# Request Detail Pastoral Details Confirmation Deadline Boundary - 2026-07-20

Decision: `REQUEST_DETAIL_PASTORAL_DETAILS_CONFIRMATION_BOUNDARY_VERIFIED`

## What Changed

Funeral and Wedding pastoral-detail saves now use the same finite 60-second request-type confirmation boundary as Request Detail schedule writes. One synchronous lock covers all eleven request-type operations, positive `{ ok: true }` acknowledgement and a successful request refresh are required before staff see a confirmed success, and no write is replayed automatically.

When delivery is uncertain, acknowledgement is malformed, or the refreshed request cannot load, Vinea freezes all reviewed Funeral, Wedding, and schedule fields until staff refresh and review. Explicit server rejections remain retryable. Funeral and Wedding forms retain their staff-entered values throughout uncertain outcomes.

## Existing Boundaries Preserved

- Existing staff authentication, selected active-parish membership, and same-parish request ownership remain authoritative.
- Existing Funeral and Wedding validation, checked persistence, audit behavior, and privacy-safe errors remain unchanged.
- Staff remain responsible for every pastoral detail and schedule decision.
- No request record was written during verification.
- No production, migration, operational RLS, provider, storage, export, AI, Google Calendar, certificate, flag, or public-claim action occurred.

## Source Identity

- Primary implementation commit: `d2b42ea76e726198e5296671e2e7cfc8d7da3a12`
- Immutable source-bound head: `45be97633a6d8f17cba2f08c0064a7cd0f086b38`
- Tracked-head aggregate SHA-256: `9E70D7FB2CA8E5F8D9F1C907B0D045DD0A5EF1923A9F152F00ABCF136E55C1E7`
- Tracked release-source files: `1494`
- Working-tree aggregate SHA-256: `FDC0F4FB8FE90EC794C9C1B00EE2CE3C4D082B3B5DD14CB1E3A212594D50B830`
- Working-tree release-source files: `1498`
- Unrelated user-owned untracked release-source scripts: `4`
- Production approval granted: `NO`

## Verification

- Focused pastoral-detail and request-type confirmation suite: `12` files / `46` tests passed.
- TypeScript project check: passed.
- Focused ESLint and diff check: passed.
- The first complete release-contract attempt failed closed because the release manifest still held the preceding aggregate and one source guard depended on an accidental leading space before a handler. Both guards were corrected without changing runtime behavior.
- Final source-bound suite: `13` files / `52` tests passed.
- Corrected complete local release contract: `15` of `15` checks passed in `362` seconds.
- Repository secret scan: `2,881` text files scanned, `500` binaries skipped, zero findings, no secret values printed.
- Dependency audit: zero vulnerabilities.
- Governance and evidence gates: passed with production-sensitive approvals still false.
- TypeScript: both scopes passed.
- Lint: passed.
- Full Vitest suite: `854` files / `3,668` tests passed.
- Credential-free Next.js 16.2.10 production build: passed, `56` static pages generated.
- Post-documentation secret scan: `2,882` text files scanned, `500` binaries skipped, zero findings.
- Post-documentation source-bound suite: `13` files / `52` tests passed.

## Plain English

If a Funeral or Wedding detail save becomes unclear because of a network problem, Vinea no longer assumes the save failed or invites staff to click again. It keeps their work visible, pauses related editing, and asks them to refresh before taking another action. This reduces duplicate or conflicting pastoral updates.

## Remaining Boundary

This is local source evidence, not live rollout evidence. Production-sensitive approvals and external smoke evidence remain separate and closed.
