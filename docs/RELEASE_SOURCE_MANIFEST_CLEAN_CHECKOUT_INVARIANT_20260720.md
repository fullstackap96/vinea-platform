# Release Source Manifest Clean-Checkout Invariant - 2026-07-20

Completion marker: `RELEASE_SOURCE_MANIFEST_CLEAN_CHECKOUT_INVARIANT_20260720`

Decision: `IMPLEMENTED_AND_LOCAL_RELEASE_READINESS_PASSED`

## Trigger

The approved ten-commit publication reached exact remote head `fee1c5c5993d218cd872cf1396cfe50262bb88b5`. Exact-head Vercel Preview deployment `dpl_75hUpeRZVMr4a9bUSyqYo7e66KXT` reached `READY`, but GitHub Actions run `29791367802` failed one source-manifest evidence assertion after `3,722` other tests passed.

The failed assertion expected a clean-checkout `Source file count: 1518` label. Local verification had used the default working-tree manifest, where four unrelated user-owned untracked scripts produced a count of 1,522 and accidentally satisfied a historical evidence line.

## Correction

- Implementation commit: `9e15d6b2ba1788c39fc7bf8cf8bd82f0265cfccd`
- Tracked-head aggregate SHA-256: `1AA7EC5167D88A91314CA3D2CF029C2CAB9111BD241FB599587A8F4B7AC7CEC7`
- Tracked release-source files: `1518`
- The evidence assertion now invokes `build-release-candidate-source-manifest.mjs --tracked-head`.
- The assertion requires the tracked-head source count already recorded in the evidence document.
- Untracked workspace files can no longer satisfy or invalidate the immutable evidence assertion.

Focused verification passed `lib/server/releaseCandidateSourceManifest.test.ts`: `1` file / `6` tests.

The complete isolated release-readiness contract then passed all `15` checks:

- Repository secret scan: `2,917` text files scanned, `500` binary files skipped, zero findings.
- Dependency audit: zero vulnerabilities.
- Production-sensitive runtime flags: disabled in the isolated verification process.
- RLS, production-monitoring, production-gate, CSP report-only, trust-center, handoff, and local-evidence validators: passed with production approval remaining `NO`.
- TypeScript: both scoped and all-file checks passed.
- ESLint: passed.
- Vitest: `869` files / `3,723` tests passed.
- Credential-free Next.js 16.2.10 production build: passed with `56` static pages generated.

## Boundary

The application runtime did not change. No merge, production deployment, production access, migration, operational RLS change, storage access, signed URL, token, certificate, record mutation, external provider call, export, AI call, communication, production-sensitive flag, or public trust claim occurred.

The exact repair head remains local until separately approved for publication. The failed exact-head CI run remains failed and is not represented as passing evidence. Clean-checkout GitHub CI and exact-head non-production Preview verification must run again after any separately approved publication.
