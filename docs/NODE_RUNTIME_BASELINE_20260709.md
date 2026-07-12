# Node Runtime Baseline

Current decision state: `SUPPORTED NODE LTS BASELINE IMPLEMENTED; PRODUCTION-SENSITIVE FEATURES REMAIN NO-GO`

Date: 2026-07-09

## Baseline

Vinea uses Node.js 24 LTS for local version-manager guidance, package engine enforcement, and CI verification.

- `.nvmrc`: `24`
- `package.json` engine: `>=24.0.0 <25`
- GitHub Actions `actions/setup-node`: `24`
- Next.js minimum documented requirement: Node.js `20.9` or newer

## Why Node 20 Was Replaced

The official Node.js release table lists Node.js 20 as end-of-life and Node.js 24 as LTS. Continuing to verify Vinea only on an EOL runtime would leave the release path without upstream security support even when application dependencies are current.

Official lifecycle references:

- https://nodejs.org/en/about/previous-releases
- https://nodejs.org/en/blog/release

The repository-local Next.js 16 installation guide remains authoritative for framework compatibility at `node_modules/next/dist/docs/01-app/01-getting-started/01-installation.md`.

## Verification Boundary

- CI installs dependencies, runs repository secret scanning and dependency auditing, executes tests and both typechecks, validates release evidence, lints, and builds on Node.js 24.
- The local workspace used for this baseline reported Node.js `24.14.1`.
- A future Node major upgrade requires a new full release-readiness run and production build.

## Safety Boundary

This baseline changes development and CI runtime metadata only. It does not deploy code, access production, enable production flags, apply migrations, change operational RLS, mutate records, run exports, call AI, access storage, create signed URLs, send communications, generate certificates, touch Google Calendar data, or approve public trust claims.
