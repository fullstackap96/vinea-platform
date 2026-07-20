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

## Post-Merge Checkpoint Identity

The merged release identity above remains the authoritative record for `f134b598308ddd78b5b6b81ee447bf5b1fb15937`. The later documentation-only controlled-rollout checkpoint adds one source-allowlisted validation test, so it has a separate aggregate rather than rewriting the merged release record:

- Checkpoint commit: `19a7ee598a1bc5201dcb71a49827da87e1110c1b`
- Release-source aggregate SHA-256: `C42FE6E07B427E55D26B4B6F735CF63112F0C8234DD3409B83AFAD343BF82CDD`
- Source file count: `1469`
- Tracked source files: `1469`
- Untracked source files: `0`
- Production approval granted: `NO`

This checkpoint aggregate identifies the post-merge documentation guard branch only. It does not authorize promotion of the merged release or alter the rollback state recorded in `docs/CONTROLLED_PRODUCTION_ROLLOUT_CHECKPOINT_20260712.md`.

## Post-Rollback Human Intake Gate Identity

The controlled-rollout human intake gate adds one source-allowlisted checker and one focused source-allowlisted test. A clean temporary checkout of its immutable implementation commit produced this separate aggregate:

- Intake implementation commit: `aa502b5760ce0666ba9ce527e9259c2240fa7c7a`
- Release-source aggregate SHA-256: `35437CD5A8B1E8AA9428C77FF126A63D3C72E288AFAF423FCCC762EC07F8E402`
- Source file count: `1471`
- Tracked source files: `1471`
- Untracked source files: `0`
- Worktree dirty in clean verification checkout: `NO`
- Production approval granted: `NO`

The intake checker's initial result was `NO_GO_MISSING_HUMAN_INPUT`. This aggregate identifies the committed intake validation source only; it does not treat unrelated user-owned workspace files as release source and does not authorize production promotion or smoke.

The final physical-dependency, LF-preserving clean-checkout verification at docs-binding commit `d60c3a8e` passed all 15 local release checks: zero secret findings, zero dependency vulnerabilities, every evidence gate, both TypeScript scopes, lint, 834 test files / 3,554 tests, and the credential-free 56-page build. The final decision was `LOCAL_RELEASE_READINESS_PASSED`; production approval remained `NO`.

## Confirmed Intake And Prepared Approval Prompt Identity

After the product owner confirmed all non-secret intake labels and scope confirmations, a clean LF-preserving checkout of the immutable approval-readiness commit produced this release-source identity:

- Approval-readiness implementation commit: `bdc3fdd157d413a44b26026b3bbcc376e6f53753`
- Release-source aggregate SHA-256: `BAD7E2F3E348BF6835FBC8CF9C51F94D5E70B58789621253B3C53F55861499C0`
- Source file count: `1472`
- Tracked source files: `1472`
- Untracked source files: `0`
- Worktree dirty in clean verification checkout: `NO`
- Intake decision: `READY_FOR_EXPLICIT_APPROVAL`
- Production approval granted: `NO`

This aggregate adds the focused final-approval-prompt validation source and binds the confirmed intake state. The approval prompt remains a prepared document only; it does not authorize deployment, production access, smoke, migrations, flags, or any separately locked capability.

The first complete release-gate attempt failed closed at the test stage because two checkpoint assertions still expected the pre-intake wording. After the assertions were updated to require `READY_FOR_EXPLICIT_APPROVAL` while preserving explicit production `NO-GO`, focused coverage passed `3` files / `12` tests. The corrected docs-binding commit `af3aef78` then passed all `15` local release checks in an LF-preserving clean checkout: zero secret findings across `2,101` files, zero dependency vulnerabilities, every evidence gate, both TypeScript scopes, lint, `835` test files / `3,558` tests, and the credential-free `56`-page build. Final decision: `LOCAL_RELEASE_READINESS_PASSED`; production approval remained `NO`.

## Repository Artifact Boundary Development Identity

The 2026-07-20 repository-artifact hardening slice has a separate dirty-worktree development identity. It does not replace any immutable release record above:

- Parent/base commit: `c70487a0030ad0924fc1602370090e39065fd6d3`
- Implementation commit: `f3a7747f0dcddda8362e00f1e27a573694933d8b`
- Release-source aggregate SHA-256: `BDF5CD4F1326CBFA86B6FCDC32B7AE0E4FE7A1A6CD3C7B7267756F3B65BB31DC`
- Source file count: `1477`
- Tracked source files: `1473`
- Untracked source files: `4`
- Worktree dirty: `YES`
- Production approval granted: `NO`

This identity binds the current release-source allowlist while unrelated local generated/private artifacts remain excluded by the repository boundary. Both the secret scanner and source manifest now use an explicit 64 MiB Git-output buffer so large dirty worktrees fail only at a meaningful integrity boundary, not Node's default output limit. The current identity also includes the focused AI/operator-context consistency guard. The complete local 15-check release contract passed before these adjacent safeguards; focused manifest, secret-scan, and context checks passed afterward. Implementation commit `f3a7747f0dcddda8362e00f1e27a573694933d8b` makes the code/test boundary immutable; this follow-up record still does not substitute for clean-checkout remote CI, Preview, or separate production approval.

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

This gives reviewers a tamper-evident identity for the exact release source surface, but the aggregate alone does not replace an immutable Git commit. Commit `19b601df046de06a6a52f214e24adcdeba05b577` on `codex/release-candidate-20260711` is the immutable Preview health origin-alignment implementation binding for this aggregate. The focused health/origin/security slice passed `5` files / `61` tests plus typecheck. The complete 15-check local release gate then passed in `304.9` seconds with zero secret findings across `2,142` files, zero vulnerabilities, both TypeScript scopes, lint, `832` test files / `3,546` tests, and the credential-free `56`-page build. GitHub Actions run `29207351611` passed clean-checkout CI against evidence head `d3daf3faa6ea3fc2f3d5de27dfb9e577cf3c6044`. Exact-head Preview deployment `dpl_DCLZ9b1vthZmGfvKZUKQLnwLYZP2` reached `READY`; runtime evidence recorded `GET /api/health 200`, and the authenticated read-only staff smoke passed. Human PR review remains pending. Before any production deployment, the manifest and release-readiness runner must pass again against the exact approved deployment commit. Excluded non-release artifacts may remain outside the commit and do not authorize production.

No production access, deployment, migration, operational RLS change, record mutation, provider call, export, AI call, storage action, signed URL, communication, certificate generation, or public claim was performed.
