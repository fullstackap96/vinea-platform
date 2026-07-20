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

## Boundary

This improves release evidence only. It does not deploy code, access production, enable a production-sensitive feature, apply migrations, change operational RLS, mutate records, access storage, create signed URLs, call providers, or make public trust claims.
