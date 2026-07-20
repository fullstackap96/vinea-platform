# Repository Release Artifact Boundary

Status: Implemented and locally verified on 2026-07-20.

## Purpose

Keep Vinea's release checks focused on tracked and genuinely pending source without weakening credential detection or accidentally staging private local artifacts.

## Boundary

- Root `.tmp/` is local generated scratch space and is excluded from Git and ESLint release scope.
- `docs/sales/VINEA_MAILBOX_SNAPSHOT_*.json` is a local-only mailbox export pattern. These files may contain private message bodies and signed tracking links and must not be staged or released.
- The repository secret scanner still scans every tracked and pending non-ignored file.
- JWT detection remains unchanged. Signed tracking-link tokens are not globally allowlisted.
- The Git file-list buffer is explicitly bounded at 64 MiB so a large dirty worktree does not fail with Node's default `ENOBUFS` limit before scanning begins.
- The release-source manifest uses the same 64 MiB Git-output boundary for source enumeration, base commit lookup, and dirty-worktree inspection.
- Scanner output remains path, rule id, line number, and aggregate counts only. It does not print matched values.

## Verification

- The original scan failed closed with `ENOBUFS` while enumerating a generated `.tmp/` dependency tree.
- After the boundary was added, the scan reached the remaining pending files and safely reported JWT-shaped content in a raw mailbox snapshot without printing the values.
- The raw mailbox snapshot pattern was then made local-only instead of weakening the JWT rule.
- `npm.cmd test -- lib/server/repositorySecretScan.test.ts` passed: 1 file, 4 tests.
- The final `npm.cmd run check:repository-secrets` pass scanned 2,840 text files, skipped 500 binaries, found 0 finding files, and printed no matched values.
- `npm.cmd run check:release-local` passed all 15 repository-owned release gates in an isolated child process with local `VINEA_*` QA flags removed from that process only.
- The release gate confirmed 0 dependency vulnerabilities, accepted the disabled production-sensitive environment, and passed every RLS, monitoring, production-gate, CSP, trust-center, handoff, and local-evidence boundary check.
- Both TypeScript scopes and lint passed, all 835 test files / 3,559 tests passed, and the credential-free Next.js 16 production build generated all 56 static pages successfully.
- The initial release run failed closed first on sandboxed npm advisory access and then on inherited non-production AI QA flags. Network-backed audit access plus process-only flag isolation resolved those environmental blockers without changing persistent settings.
- After the adjacent manifest safeguard, focused manifest/scanner coverage passed 2 files / 8 tests, the repository secret scan remained clean, and lint passed again.
- After the AI/operator-context guard was added, the combined focused slice passed 4 files / 12 tests, lint passed, and the final standalone secret scan passed across 2,841 text files with 500 binaries skipped and 0 findings.
- The current dirty-worktree development aggregate is `BDF5CD4F1326CBFA86B6FCDC32B7AE0E4FE7A1A6CD3C7B7267756F3B65BB31DC` across 1,477 release-source files. It includes the focused AI/operator-context consistency guard, remains development evidence only, and grants no production approval.

## Safety

No mailbox export was modified or committed. No credential was printed, rotated, or transmitted. No production environment, deployment, database, provider, migration, RLS policy, feature flag, record, email, AI route, export, storage object, or Google Calendar integration was accessed or changed.
