# Request Detail Schedule Confirmation Deadline Boundary - 2026-07-20

Decision: `REQUEST_DETAIL_SCHEDULE_CONFIRMATION_BOUNDARY_VERIFIED`

## What Changed

Request Detail now gives suggested-date and confirmed Baptism, Funeral, Wedding, and OCIA schedule writes one shared 60-second browser confirmation deadline. The shared helper takes a synchronous single-flight lock before dispatch, requires an explicit `{ ok: true }` acknowledgement, and requires the request to reload successfully before telling staff the displayed schedule is current.

If delivery is uncertain, success is malformed, or the post-save refresh fails, Vinea freezes every reviewed schedule field until staff refresh and review. Explicit server rejections remain retryable. Clear actions keep the displayed confirmed value until both persistence and refresh are positively confirmed, and no schedule write is retried or replayed automatically.

## Existing Boundaries Preserved

- Staff authentication remains required by the existing request APIs.
- Selected active-parish membership and same-parish request ownership remain required.
- Existing schedule validation, checked persistence, audit metadata, and privacy-safe errors remain authoritative.
- Staff continue to choose and review every suggested or confirmed date and time.
- No request or schedule record was written during verification.
- No production, migration, operational RLS, provider, storage, export, AI, certificate, flag, or public-claim action occurred.

## Source Identity

- Primary implementation commit: `995143bddf40d82b75f71e589858c35e4c1f0345`
- Immutable source-bound head: `883a41a956bf90450f0359d06460c72ffab43a99`
- Tracked-head aggregate SHA-256: `2842200303DAF7DBB29FB9320966831196714B9E2F748FBB919C8BBECB2DC5B7`
- Tracked release-source files: `1493`
- Working-tree aggregate SHA-256: `A424D9E552A6A8AC3905C1E3AC0996D15A125D36AF9C63CAE8A04CF4DE5FEFD3`
- Working-tree release-source files: `1497`
- Unrelated user-owned untracked release-source scripts: `4`
- Production approval granted: `NO`

## Verification

- Focused schedule-confirmation, persistence-order, safe-message, notes/communication compatibility, core-workflow, and active-parish route suite: `11` files / `41` tests passed.
- TypeScript project check: passed.
- Focused ESLint and diff check: passed.
- The first complete release-contract attempt failed closed when an older notes test included the newly inserted schedule helper in its source slice. The test boundary was corrected without changing runtime behavior.
- Complete local release contract after correction: `15` of `15` checks passed in `361.7` seconds.
- Repository secret scan: `2,879` text files scanned, `500` binaries skipped, zero findings, no secret values printed.
- Dependency audit: zero vulnerabilities.
- Governance and evidence gates: passed with production-sensitive approvals still false.
- TypeScript: both scopes passed.
- Lint: passed.
- Full Vitest suite: `853` files / `3,664` tests passed.
- Credential-free Next.js 16.2.10 production build: passed, `56` static pages generated.
- Final source-bound suite: `12` files / `47` tests passed.
- Post-documentation secret scan: `2,880` text files scanned, `500` binaries skipped, zero findings.
- Both tracked-head and working-tree source manifests reproduced the recorded identities exactly.

## Plain English

If the network becomes unclear while parish staff save or clear a proposed or confirmed sacramental date, Vinea no longer guesses and invites another click. It pauses all related schedule editing and asks staff to refresh and review first. This reduces duplicate or conflicting schedule changes and keeps the screen honest about what the server has confirmed.

## Remaining Boundary

This is local evidence for committed source, not live rollout evidence. Production-sensitive feature approvals and external smoke evidence remain separate and closed.
