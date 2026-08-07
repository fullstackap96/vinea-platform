# Request Detail Notes And Communication Confirmation Deadline Boundary - 2026-07-20

Decision: `REQUEST_DETAIL_NOTES_COMMUNICATION_CONFIRMATION_BOUNDARY_VERIFIED`

## What Changed

Request Detail now gives shared staff-notes and manual communication-log writes a 60-second browser confirmation deadline. Each handler takes a synchronous single-flight lock before dispatch, requires an explicit `{ ok: true }` acknowledgement, and requires the request to reload successfully before telling staff the displayed state is current.

If delivery is uncertain, success is malformed, or the post-save refresh fails, Vinea freezes the reviewed fields and tells staff to refresh and review before trying another write. Explicit server rejections remain retryable. The known partial-success communication case, where the touchpoint is stored but the request summary cannot be updated, now refreshes once and stays locked against a duplicate touchpoint.

No automatic retry or replay was added.

## Existing Boundaries Preserved

- Staff authentication remains required by the existing request APIs.
- Selected active-parish membership and same-parish request ownership remain required.
- Existing server validation, checked persistence, audit metadata, and privacy-safe errors remain authoritative.
- Staff continue to enter and review notes and communication details.
- No request or communication record was written during verification.
- No production, migration, operational RLS, provider, storage, export, AI, certificate, flag, or public-claim action occurred.

## Source Identity

- Implementation commit: `b16b7b49eb1e7ac711df70362289dbbbcb31464e`
- Tracked-head aggregate SHA-256: `F9C01CC3D009969FBFD29E35327A32EAE0776A2A6471A0D6DEB2F83E64CDDB8C`
- Tracked release-source files: `1492`
- Working-tree aggregate SHA-256: `C71B00AA30751E758135D8EB3C0C926F05BD0EC279C555623712AC3849DB9B43`
- Working-tree release-source files: `1496`
- Unrelated user-owned untracked release-source scripts: `4`
- Production approval granted: `NO`

## Verification

- Focused confirmation, active-parish route, safe-message, core-workflow, and ownership/follow-up suite: `6` files / `27` tests passed.
- TypeScript project check: passed.
- Focused ESLint and diff check: passed.
- The first complete release-contract attempt failed closed because the human-review manifest still held the preceding aggregate.
- Current tracked-head and working-tree identities were generated and bound to the manifest.
- Complete local release contract: `15` of `15` checks passed in `375.1` seconds.
- Repository secret scan: `2,877` text files scanned, `500` binaries skipped, zero findings, no secret values printed.
- Dependency audit: zero vulnerabilities.
- Governance and evidence gates: passed with production-sensitive approvals still false.
- TypeScript: both scopes passed.
- Lint: passed.
- Full Vitest suite: `852` files / `3,658` tests passed.
- Credential-free Next.js 16.2.10 production build: passed, `56` static pages generated.
- Final source-bound suite: `7` files / `33` tests passed.
- Post-documentation secret scan: `2,878` text files scanned, `500` binaries skipped, zero findings.
- Both tracked-head and working-tree source manifests reproduced the recorded identities exactly.

## Plain English

If the network becomes unclear while a staff member saves shared notes or logs a family touchpoint, Vinea no longer guesses that the operation failed or encourages an immediate repeat. It pauses the form and asks staff to refresh first. That reduces duplicate communication history and prevents a stale screen from looking trustworthy after a save.

## Remaining Boundary

This is local evidence for committed source, not live rollout evidence. Production-sensitive feature approvals and external smoke evidence remain separate and closed.
