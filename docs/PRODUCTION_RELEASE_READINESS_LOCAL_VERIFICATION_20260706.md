# Production Release Readiness Local Verification

Current decision state: `LOCAL RELEASE READINESS COMMAND PREPARED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO`

Date prepared: 2026-07-06

## Purpose

This document defines the local repository verification checklist for production-readiness review. It is a developer safety net, not a release approval and not a deployment mechanism.

Use this wrapper before preparing any production-sensitive approval prompt, pull request review, or release-readiness handoff:

```bash
npm run check:release-local
```

To preview the command order without running the heavy checklist:

```bash
npm run check:release-local -- --plan
```

The wrapper runs this command sequence:

```bash
npm run check:repository-secrets
npm run check:dependency-security
npm run check:release-env
npm run check:rls-production-evidence
npm run check:production-monitoring-evidence
npm run check:production-gates
npm run check:csp-report-only
npm run check:trust-center-claims
npm run check:release-handoff
npm run check:release-local-evidence
npm run typecheck
npm run typecheck:all
npm run lint
npm test
npm run build
```

The sequence is intentionally conservative. It starts with the repository secret scan and dependency audit, then keeps the full test suite on the same stable top-level `npm test` path used elsewhere in the repo. `npm run check:release-env` refuses to continue if obvious production-sensitive runtime flags are enabled in the shell. The RLS production evidence checker, `npm run check:rls-production-evidence`, verifies that membership-aware operational RLS production evidence remains ready for final human review while rollout, migrations, and operational RLS changes stay blocked. The production monitoring evidence checker, `npm run check:production-monitoring-evidence`, verifies that monitoring readiness artifacts remain ready for runtime approval review while runtime monitoring, external sends, production smoke, and public trust claims stay blocked. The CSP report-only evidence checker, `npm run check:csp-report-only`, verifies that browser-security evidence remains ready for review while runtime CSP, production CSP, enforcing CSP, and public trust claims stay blocked. The trust-center claims checker, `npm run check:trust-center-claims`, verifies that public trust-center publishing and public claims remain blocked before the heavier local checks run. The handoff checker and completed-evidence checker verify that the release index, local checklist, evidence template, CI workflow, gate references, and sanitized evidence still agree before type checks, lint, tests, and build.

The wrapper stops at the first failed command and reports only command labels, counts, and safe boundary booleans. It does not clear or override production-sensitive runtime flags; if QA/prototype flags are enabled, the release environment guard must refuse the run.

On Windows, the wrapper starts each nested npm command with a cleaned child-process environment that removes inherited `npm_*` lifecycle/config variables and `INIT_CWD`. This keeps the nested `npm test`/Vitest startup path anchored to the repository root instead of inheriting stale parent npm script metadata. The wrapper preserves the documented `npm test` checklist label, and internally adds Vitest's ESM-safe `--configLoader runner` option for the nested test process so the local runner does not depend on esbuild bundling the TypeScript Vitest config from a Node-spawned child process.

The app shell intentionally avoids `next/font/google` in `app/layout.tsx`. Root font variables are defined in `app/globals.css` using system font stacks so `npm run build` does not require a network call to Google Fonts during local/CI release verification.

If the release environment guard refuses because QA/prototype runtime or approval-residue variables are still configured, use the label-only cleanup guide before rerunning the release checklist:

```bash
npm run check:release-env-cleanup-guide
```

The cleanup guide reports variable names and safe labels only, prints no raw values, and does not clear anything automatically. See `docs/PRODUCTION_RELEASE_READINESS_ENV_CLEANUP_GUIDE_20260708.md`.

The same release-environment guard is also wired into CI before the production gate boundary check, the trust-center claims checker runs immediately after the production gate boundary check, and the handoff checker runs after the trust-center claims checker. Pull requests and guarded branch pushes therefore fail early if a production-sensitive runtime flag is accidentally present, if public trust-center claim boundaries drift, or if the release-readiness handoff artifacts drift.

When this checklist is used for a release-readiness handoff, start from `docs/PRODUCTION_RELEASE_READINESS_HANDOFF_INDEX_20260706.md`, then record results in `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_TEMPLATE_20260706.md` or a copy of that template. Validate the filled label-only record with `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_VALIDATOR_20260706.md` before using it as handoff evidence. Keep evidence label-only and sanitized.

## Completed Evidence Checker

The current completed local release-readiness evidence can be checked directly with:

```bash
npm run check:release-local-evidence
```

Expected decision:

```json
{
  "decision": "LOCAL_RELEASE_EVIDENCE_READY_FOR_HUMAN_REVIEW"
}
```

This checker validates that `docs/PRODUCTION_RELEASE_READINESS_LOCAL_EVIDENCE_20260707_COMPLETED.md` still records the required command sequence, pass labels, local validator result, production-sensitive NO-GO boundaries, and no obvious secret-shaped values. It is a consistency check for the completed evidence file, not a replacement for rerunning `npm run check:release-local` when fresh code changes need full verification.

## What The Checklist Runs

Wrapper command:

- `npm run check:release-local`

Expanded sequence:

1. `npm run check:repository-secrets`
2. `npm run check:dependency-security`
3. `npm run check:release-env`
4. `npm run check:rls-production-evidence`
5. `npm run check:production-monitoring-evidence`
6. `npm run check:production-gates`
7. `npm run check:csp-report-only`
8. `npm run check:trust-center-claims`
9. `npm run check:release-handoff`
10. `npm run check:release-local-evidence`
11. `npm run typecheck`
12. `npm run typecheck:all`
13. `npm run lint`
14. `npm test`
15. `npm run build`

## Safety Boundary

This command:

- does not deploy
- does not enable production flags
- does not add production flags
- does not access production
- does not apply migrations
- does not change operational RLS
- does not mutate records
- does not touch Google Calendar data
- does not run exports
- does not call AI
- does not access storage
- does not create signed URLs
- does not send communications
- does not generate certificates
- does not make public trust-center claims

Passing this command means the local repository checks completed successfully. It does not mean production RLS, production exports, production public intake routing, production AI, production monitoring, Catholic records runtime scaffolds, backup/restore public claims, or public trust-center publishing are approved.

## Runtime Flag Refusal

The runner refuses to start when known production-sensitive runtime flags are present and enabled in the shell. This protects local release verification from accidentally running under a QA/prototype mode that should not be mistaken for normal production readiness.

The refusal is intentionally label-only. It reports the variable name and `present-and-enabled`; it does not print secrets or raw values.

The guard also covers the newer production-sensitive gate names used by source preflight and approval packets, including report-only CSP runtime, production monitoring/observability runtime, the export audit reviewer dashboard production gate, AI reply safety runtime, AI reply audit-write, AI reply safe-response exposure, and AI reply runtime environment flags. Those names remain blocked in release-readiness shells even though their runtime implementations remain separately gated or unapproved.

The guard treats `ENABLED`, `PRODUCTION`, `NON_PRODUCTION`, `true`, `1`, `yes`, and `on` as enabled-like values, case-insensitively. This keeps the checklist fail-closed even when a shell uses an informal truthy value or a non-production QA runtime value instead of the exact approved flag value.

The guard also refuses configured `_ACK` / `_ENV` residue and production-smoke metadata residue for known production-sensitive QA/prototype gates. This catches shells where a QA approval acknowledgement, runtime environment value, route allowlist, approval id, expiry timestamp, rollback owner, monitoring channel, support owner, or evidence owner label remains set even if the main runtime switch has already been disabled. The refusal output remains label-only: it reports variable names and `present-and-configured`, not raw approval values or raw production-smoke labels.

When cleanup is needed, run `npm run check:release-env-cleanup-guide` first. Its output includes process-scope and optional Windows user-scope PowerShell commands for the detected variable names only. Use process-scope cleanup first, and use user-scope cleanup only when the same QA/prototype residue was intentionally saved in Windows user scope and should no longer persist for future shells.

## Expected Output

The environment guard succeeds with:

```json
{
  "schemaVersion": 1,
  "decision": "RELEASE_READINESS_ENVIRONMENT_ACCEPTED",
  "productionSensitiveRuntimeFlagsEnabled": false
}
```

The handoff checker succeeds with:

```json
{
  "schemaVersion": 1,
  "decision": "RELEASE_HANDOFF_READY_FOR_REVIEW",
  "productionSensitiveFeaturesApproved": false,
  "publicTrustClaimsApproved": false
}
```

The trust-center claims checker succeeds with:

```json
{
  "schemaVersion": 1,
  "decision": "PUBLIC_CLAIMS_BOUNDARIES_READY_FOR_REVIEW",
  "publicTrustCenterPublishingApproved": false,
  "publicClaimsApproved": false
}
```

If any command fails, stop and fix the failure before using the result in a production-readiness handoff.

## Manual Follow-Up

After the command passes, humans still need to verify any relevant manual QA evidence for the feature under review. A green local verification run is necessary engineering hygiene, but it is not a substitute for named owner sign-off, production-safe smoke fixtures, rollback owner assignment, monitoring owner assignment, or product-owner approval.

## Current Recommendation

Use this checklist as the final local repository check before requesting review for production-sensitive work. Keep production-sensitive features `NO-GO` until their separate approval packets and evidence packages say otherwise.
