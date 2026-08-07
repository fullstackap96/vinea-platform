# Release Source Tracked-Head Manifest Boundary - 2026-07-20

Status: `RELEASE_SOURCE_TRACKED_HEAD_MANIFEST_BOUNDARY_IMPLEMENTED_20260720`

## Purpose

The release-source manifest now has two explicit modes:

- `npm run check:release-source-manifest` hashes the current tracked and non-ignored untracked release-source workspace for review.
- `npm run check:release-source-manifest:head` hashes only blobs committed to the exact current `HEAD`.

The tracked-head mode reads committed blobs directly through a bounded Git batch operation. It does not copy the repository, create a worktree, include untracked source, print source paths or contents, or treat a dirty workspace as part of the immutable commit identity.

## Fail-Closed Rules

- Unknown command arguments are rejected.
- Unsupported line breaks in release-source paths are rejected before the Git batch request.
- Missing, truncated, malformed, non-blob, or extra Git batch output is rejected.
- The committed source aggregate still uses canonical line-ending handling for text and exact bytes for binary files.
- The result continues to report that production approval is false.

## Verified Identity

- Immutable implementation commit: `a30b47762eb4ad01ff2710004921227134a767a5`
- Tracked-head aggregate SHA-256: `B3BBE5B194CF01E4A1D1662F40B5508E4BACFEE2DDE60316241BE69810C5B71E`
- Committed release-source files: `1474`
- Untracked files included in tracked-head mode: `0`
- Production approval granted: `NO`

The same shared workspace reports working-tree aggregate `06D2801786330310DA5CF247F31BD3FD25D79D4DDC867436ADB7AA217D7F3104` across `1478` release-source files because four unrelated user-owned scripts remain untracked inside the broad source allowlist. This difference is expected and proves that tracked-head mode does not silently fold those workspace files into the immutable commit identity.

Focused coverage passed `1` file / `6` tests. The complete local `15`-check release contract then passed in `357.2` seconds with zero secret findings across `2,845` text files, zero dependency vulnerabilities, every governance/evidence gate, both TypeScript scopes, lint, `837` test files / `3,582` tests, and the credential-free Next.js 16 `56`-page build.

## Boundary

This improves release evidence only. It does not deploy code, access production, enable a production-sensitive feature, apply migrations, change operational RLS, mutate records, access storage, create signed URLs, call providers, or make public trust claims.
