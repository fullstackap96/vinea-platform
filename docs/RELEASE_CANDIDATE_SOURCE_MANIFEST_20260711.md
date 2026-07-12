# Release Candidate Source Manifest - 2026-07-11

Completion marker: `RELEASE_CANDIDATE_SOURCE_MANIFEST_20260711`

Decision: `RELEASE_CANDIDATE_SOURCE_MANIFEST_READY_FOR_IMMUTABLE_COMMIT`

## Manifest Identity

- Parent/base commit before the release candidate: `f5ee00b75da36607ca4409a04c1d66e1ba10f4a7`
- Release-source aggregate SHA-256: `4865365E244756008022788AD375698900390857D1138899A6F3132A2AF24A95`
- Source file count: `1439`
- Tracked or staged source files: `1439`
- Untracked source files: `0`
- Worktree dirty: `YES`
- Production approval granted: `NO`

## Scope

The aggregate covers the current Git-tracked and non-ignored untracked release source under:

- `.github/workflows/`
- `app/`
- `lib/`
- `public/`
- `scripts/`
- `supabase/`
- reviewed root configuration and lock files, including `package.json`, `package-lock.json`, `proxy.ts`, Next.js, TypeScript, ESLint, PostCSS, and Vitest configuration.

Environment files, ignored secrets, documentation, command output, file paths, and file contents are not printed by the manifest result. Each included file contributes its normalized repository path, byte length, and content SHA-256 to the aggregate without exposing those details in output.

## Verification

- Command: `npm run check:release-source-manifest`
- Expected decision: `RELEASE_CANDIDATE_SOURCE_MANIFEST_READY`
- Determinism test: two consecutive runs must return the same JSON.
- Privacy test: no file paths, contents, environment files, or secret values may be printed.
- Production boundary: the manifest never approves production.

## Limitation

This gives reviewers a tamper-evident identity for the exact release source surface, but the aggregate alone does not replace an immutable Git commit. The first release-candidate commit on `codex/release-candidate-20260711` containing this document is the immutable binding for this aggregate. Before any production deployment, the manifest and full release-readiness runner must pass against that exact committed source. Excluded non-release artifacts may remain outside the commit and do not authorize production.

No production access, deployment, migration, operational RLS change, record mutation, provider call, export, AI call, storage action, signed URL, communication, certificate generation, or public claim was performed.
