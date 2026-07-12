# Production Release-Readiness Environment Cleanup Guide

Current decision state: `RELEASE ENVIRONMENT CLEANUP GUIDE PREPARED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO`

This guide helps a reviewer prepare a local shell for `npm run check:release-local` when earlier non-production QA work left feature-gate variables, approval acknowledgements, runtime environment markers, or production-smoke metadata labels behind.

The cleanup guide is intentionally conservative:

- It reports variable names only.
- It does not print secrets, approval phrases, tokens, URLs, passwords, or raw environment values.
- It does not clear anything automatically.
- It does not deploy, enable production flags, add production flags, access production, apply migrations, change operational RLS, mutate records, touch Google Calendar data, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, or make public trust claims.

## Command

Run this from the repository root:

```powershell
npm run check:release-env-cleanup-guide
```

The command returns JSON with one of these decisions:

- `RELEASE_ENV_ALREADY_CLEAN`: no known production-sensitive QA/prototype runtime variables are configured in the current process.
- `RELEASE_ENV_CLEANUP_GUIDE_READY`: one or more known QA/prototype runtime, approval-residue, or production-smoke metadata variables are configured.

## What The Output Means

When residue is found, the output includes:

- `unsafeFlags`: variable names and safe labels only, such as `present-and-enabled` or `present-and-configured`.
- `mutatesEnvironment: false`: the helper did not clear anything.
- `secretValuesPrinted: false`: the helper did not print raw values.
- `powerShellProcessScopeCommands`: commands that clear the current PowerShell session only.
- `powerShellUserScopeCommands`: commands that clear Windows user-scope variables for future shells.

Example process-scope command shape:

```powershell
Remove-Item Env:\VINEA_EXAMPLE_FLAG -ErrorAction SilentlyContinue
```

Example user-scope command shape:

```powershell
[Environment]::SetEnvironmentVariable('VINEA_EXAMPLE_FLAG', $null, 'User')
```

## Recommended Cleanup Order

1. Run `npm run check:release-env-cleanup-guide`.
2. If residue is present, run only the process-scope commands first.
3. Run `npm run check:release-env` in the same shell.
4. If a new terminal still shows the same residue, clear the matching Windows user-scope variables intentionally.
5. Open a new terminal and rerun `npm run check:release-env`.
6. Run `npm run check:release-local` only after the release environment guard returns `RELEASE_READINESS_ENVIRONMENT_ACCEPTED`.

## Evidence Rules

Record only:

- command name;
- decision label;
- variable names if cleanup was needed;
- whether process-scope cleanup was performed;
- whether user-scope cleanup was performed;
- final `check:release-env` decision.

Do not paste secrets into the evidence file. Do not paste raw approval phrases, API keys, database URLs, OAuth tokens, Supabase keys, OpenAI keys, signed URLs, storage paths, private document names, private document contents, raw IDs, email addresses, or family portal token material.

## Production Boundary

This guide only prepares a local shell for release-readiness verification. It does not approve production RLS, production exports, export audit reviewer dashboard exposure, production monitoring, runtime CSP, customer-facing AI, public intake production routing, certificate issuance logging runtime scaffolding, sacramental correction/notation runtime scaffolding, backup/restore public claims, or public trust-center publishing.
