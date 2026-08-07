# Request Document Confirmation Recovery Boundary - 2026-07-20

Completion marker: `REQUEST_DOCUMENT_CONFIRMATION_RECOVERY_BOUNDARY_20260720`

Decision: `IMPLEMENTED_AND_LOCALLY_VERIFIED`

## What Changed

Request Detail document uploads, staff reviews, and family upload-link creation now fail closed after browser acknowledgement uncertainty while preserving confirmed server rejection as retryable.

- One synchronous lock still covers all three document mutation types.
- Timeout, transport failure, malformed `2xx` acknowledgement, or failed authoritative document-list reload freezes every document write until staff refresh and review the request.
- Upload and review success appears only after the server acknowledgement and a successful same-request document-list reload.
- A confirmed family upload link remains visible if clipboard copying fails, so clipboard failure cannot encourage duplicate token creation.
- Read-only opening of an existing document remains outside the mutation lock.
- No document or token mutation replays automatically.

Existing staff authentication, selected active-parish membership, same-parish request ownership, upload validation, private storage rules, compensation cleanup, review authorization, portal-token behavior, migrations, and operational RLS remain authoritative and unchanged.

## Source Identity

- Immutable implementation commit: `8544263fd91691e6234d4111e71a703180c7fbdb`
- Tracked-head aggregate SHA-256: `F7C1111468121579492A38F46D317997755AF0F13B06802226F2303F0C934007`
- Tracked release-source files: `1518`
- Working-tree aggregate SHA-256 at verification: `E344C2F24788246D32CD16B8407DD7F4EC753B2C50AAAD6527B16A4A8536A60E`
- Working-tree release-source files: `1522` (`1518` tracked plus `4` unrelated user-owned untracked scripts)

## Verification

- Focused document messages, client recovery, single flight, safe messages, route authorization, cleanup, and compensation coverage: `7` files / `34` tests passed.
- TypeScript: passed.
- ESLint: passed.
- Diff hygiene: passed.
- Complete local release-readiness contract: all `15` checks passed.
- Repository secret scan: `2915` text files scanned, `500` binary files skipped, zero findings.
- Dependency audit: zero vulnerabilities.
- Complete Vitest suite: `869` files / `3723` tests passed.
- Credential-free Next.js production build: passed with `56` static pages generated.

No file was uploaded, reviewed, opened, or downloaded during verification. No family token was created. No production access, deployment, migration, operational RLS change, storage access, signed URL creation, record mutation, provider call, communication, export, AI call, certificate generation, or public trust claim occurred.

## Remaining Evidence Boundary

Live non-production evidence for timeout, malformed acknowledgement, failed post-write reload, clipboard denial, and refresh-before-retry remains pending. This local evidence does not approve production deployment, storage access, document mutation, family-token creation, or any production-sensitive feature.
