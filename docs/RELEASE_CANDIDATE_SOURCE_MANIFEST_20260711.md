# Release Candidate Source Manifest - 2026-07-11

Completion marker: `RELEASE_CANDIDATE_SOURCE_MANIFEST_20260711`

Decision: `RELEASE_CANDIDATE_SOURCE_MANIFEST_READY_FOR_IMMUTABLE_COMMIT`

## Manifest Identity

- Parent/base commit before this public intake success-settlement slice: `326caa6a02aea6685345003cf9a648359ae58937`
- Immutable implementation commit: `b3a20a892e3abd88e36b5ba989f339acb1ece35b`
- Release-source aggregate SHA-256: `A5402654EC53812A0737A940514BD9A287D7F510819852CA7854984C9311E1D7`
- Source file count: `1462`
- Tracked or staged source files: `1462`
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

This gives reviewers a tamper-evident identity for the exact release source surface, but the aggregate alone does not replace an immutable Git commit. Commit `b3a20a892e3abd88e36b5ba989f339acb1ece35b` on `codex/release-candidate-20260711` is the immutable public-intake success-settlement implementation binding for this aggregate. The complete 15-check local release gate passed against this aggregate in `319.8` seconds with zero secret findings across `2,129` scanned files, zero dependency vulnerabilities, both TypeScript scopes, lint, `826` test files / `3,515` tests, and the credential-free `56`-page build. Clean-checkout GitHub Actions, actual PR check attribution, and a correctly configured protected-preview smoke remain pending. Before any production deployment, the manifest and release-readiness runner must pass again against the exact approved deployment commit. Excluded non-release artifacts may remain outside the commit and do not authorize production.

No production access, deployment, migration, operational RLS change, record mutation, provider call, export, AI call, storage action, signed URL, communication, certificate generation, or public claim was performed.
