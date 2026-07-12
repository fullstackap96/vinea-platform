# Release Candidate Source Manifest - 2026-07-11

Completion marker: `RELEASE_CANDIDATE_SOURCE_MANIFEST_20260711`

Decision: `RELEASE_CANDIDATE_SOURCE_MANIFEST_READY_FOR_IMMUTABLE_COMMIT`

## Manifest Identity

- Parent/base commit before this Preview health origin-alignment slice: `9899f8e7fc6fed898e13a73f0beb522dcacd848b`
- Immutable implementation commit: `19b601df046de06a6a52f214e24adcdeba05b577`
- Release-source aggregate SHA-256: `965D52668D4803437C25F22980FD1D741C612607D370AFF7896AD565D5EEADCA`
- Source file count: `1468`
- Tracked or staged source files: `1468`
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

This gives reviewers a tamper-evident identity for the exact release source surface, but the aggregate alone does not replace an immutable Git commit. Commit `19b601df046de06a6a52f214e24adcdeba05b577` on `codex/release-candidate-20260711` is the immutable Preview health origin-alignment implementation binding for this aggregate. The focused health/origin/security slice passed `5` files / `61` tests plus typecheck. The complete 15-check local release gate then passed in `304.9` seconds with zero secret findings across `2,142` files, zero vulnerabilities, both TypeScript scopes, lint, `832` test files / `3,546` tests, and the credential-free `56`-page build. Protected Preview deployment `dpl_12zYEf2RQE7W2xsGhPgeEmy1LFa9` reached `READY`; runtime evidence recorded `GET /api/health 200`, and the authenticated read-only staff smoke passed. Clean-checkout GitHub Actions for the latest evidence head and human PR review remain pending. Before any production deployment, the manifest and release-readiness runner must pass again against the exact approved deployment commit. Excluded non-release artifacts may remain outside the commit and do not authorize production.

No production access, deployment, migration, operational RLS change, record mutation, provider call, export, AI call, storage action, signed URL, communication, certificate generation, or public claim was performed.
