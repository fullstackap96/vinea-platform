# Vercel Core Environment Build Preflight

Status: Implemented as a deployment fail-closed guard. It does not configure credentials, approve production, or enable a production-sensitive capability.

## Purpose

The protected release-candidate preview reached Vercel `READY` state while `SUPABASE_SERVICE_ROLE_KEY` was absent from Preview scope. Authentication and active-parish selection could render, but `/api/health` returned HTTP 503 and staff data loaders failed safely. A deployment that cannot load the staff workspace must now fail during Vercel configuration evaluation instead of appearing ready.

## Required Contract

When `VERCEL=1`, `next.config.ts` calls `assertVercelCoreDeploymentEnv()` and requires:

- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The failure message contains missing variable names only. It never includes environment values.

## Boundaries

- Local development and credential-free CI builds remain supported when `VERCEL` is not `1`.
- Optional Resend, OpenAI, Google Calendar, cron, staff allowlist, export, public-intake, monitoring, and other gated settings are not part of this core preflight.
- No environment value is copied, printed, committed, or changed by the guard.
- A successful build still does not prove database schema readiness. `/api/health` must return HTTP 200 with `checks.schema: true` during the approved target smoke.
- Production deployment, merge, production access, and production-sensitive capabilities remain `NO-GO` without their separate approvals.

## Verification

Focused tests cover local/CI no-op behavior, the alternate server URL, complete Vercel configuration, missing service-role failure, names-only error output, and execution from `next.config.ts` before export.

The next protected-preview smoke requires an authorized operator to configure the missing credential in Vercel Preview scope, create a fresh deployment, verify `/api/health`, authenticate safe staff, switch authorized parishes, and confirm staff workspace data loads. This repository change does not perform that external configuration.
