# Daily Work Hub Workflow Settings Scope Boundary - 2026-07-20

Completion marker: `DAILY_WORK_HUB_WORKFLOW_SETTINGS_SCOPE_BOUNDARY_20260720`

Decision: `IMPLEMENTED_AND_LOCALLY_VERIFIED`

## What Changed

The Daily Work Hub's read-only workflow SLA settings now remain bound to the currently selected parish during initial load, parish switching, timeout, and late-response races.

- The auxiliary `/api/parish/settings` read has a 15-second browser deadline.
- Every selected-parish change resets care-cadence rules to the existing safe defaults before loading that parish's settings.
- A response may update dashboard rules only when its returned parish id matches the expected selected parish and its load sequence is still current.
- Replacement and unmount cleanup abort the request, clear its deadline, and invalidate late settlement.
- Missing, malformed, mismatched, failed, or stale settings leave the dashboard on the existing safe defaults.
- The path remains credentialed and read-only; it adds no write, provider call, automation, export, storage access, certificate action, or production gate.

Existing staff authentication, selected active-parish ownership, settings-route membership checks, Daily Work Hub request loading, workflow calculation, migrations, and operational RLS remain authoritative and unchanged.

## Source Identity

- Immutable implementation commit: `0392f5110a3cdc4ff0040ebcbcd50db9751eaa52`
- Tracked-head aggregate SHA-256: `B06BC97423E5C68DC1E0949CF6750906EEBD27CE4274BFE99706180084A68886`
- Tracked release-source files: `1519`
- Source mode: `tracked-head`
- Production approval granted: `NO`

## Verification

- Direct boundary coverage: `1` file / `4` tests passed.
- Dashboard source-dependent regression coverage: `10` files / `54` tests passed.
- Targeted ESLint: passed.
- TypeScript application scope: passed.
- Diff hygiene: passed.
- Complete local release-readiness contract: all `15` checks passed.
- Repository secret scan: `2919` text files scanned, `500` binary files skipped, zero findings.
- Dependency audit: zero vulnerabilities.
- Evidence and production-gate checks: passed with every sensitive capability still unapproved and disabled.
- Both TypeScript scopes and full repository ESLint: passed.
- Complete Vitest suite: `870` files / `3727` tests passed.
- Credential-free Next.js `16.2.10` production build: passed with `56` pages generated.

No staff session, parish record, production application, production data, migration, RLS policy, setting, request, provider, external integration, storage object, signed URL, export, AI route, communication, certificate, or public trust claim was accessed or changed during verification.

## Remaining Evidence Boundary

Safe non-production browser evidence should switch between two authorized parishes with different workflow SLA rules and confirm that the Daily Work Hub immediately returns to defaults while loading, applies only the newly selected parish's rules, and never restores a late prior-parish response. This local evidence does not approve a production deployment or any production-sensitive capability.
