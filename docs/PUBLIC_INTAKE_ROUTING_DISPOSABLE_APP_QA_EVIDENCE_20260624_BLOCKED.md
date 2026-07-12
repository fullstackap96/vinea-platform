# Public Intake Routing Disposable App QA Evidence - Blocked Attempt 2026-06-24

Status: Blocked before starting a disposable app instance. No runtime app was started against shared QA, no public intake regression was run, no migrations were applied, and no runtime behavior was changed.

Related docs:

- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_SUPABASE_EXECUTION_PACKET.md`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_20260624_EXECUTED.json`
- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md`
- `docs/PUBLIC_INTAKE_ROUTING_PROMOTION_READINESS_CHECKLIST.md`

## Requested Gate

Complete the remaining public intake routing disposable QA gates by running a disposable app instance against project `kikqtorplsswepqitjys` and capturing:

- `/api/health` observations.
- Baptism public intake regression.
- Wedding public intake regression.
- Funeral public intake regression.
- OCIA public intake regression.
- Join Parish public intake regression.
- Normal public intake rate-limit behavior.
- Durable 429 behavior.

## Latest Attempt

The disposable Supabase API URL was provided for project `kikqtorplsswepqitjys`, but the anon key and service role key were still placeholder values:

```text
DISPOSABLE_SUPABASE_URL=https://kikqtorplsswepqitjys.supabase.co
DISPOSABLE_SUPABASE_ANON_KEY=[paste anon key]
DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY=[paste service role key]
```

Because the keys were placeholders, the disposable app instance could not be started safely.

## Safety Confirmation

- Disposable app environment only: `No`
- Disposable Supabase URL available: `Yes`
- Disposable Supabase anon key available: `No`
- Disposable Supabase service role key available: `No`
- Placeholder credentials rejected: `Yes`
- Shared QA avoided: `Yes`
- Production avoided: `Yes`
- Runtime public intake wiring changed: `No`
- Runtime `/api/health` changed: `No`
- Operational RLS changed: `No`
- Migration candidate moved into `supabase/migrations`: `No`

## Blocker

The app requires Supabase API credentials:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The local `.env.local` still points at shared QA project `gnfomgsuottcuueasfvi`. The disposable URL is known, but disposable API keys were not available as environment variables, repository files, or prompt values:

- `DISPOSABLE_SUPABASE_URL`: available.
- `DISPOSABLE_SUPABASE_ANON_KEY`: missing; prompt value was `[paste anon key]`.
- `DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY`: missing; prompt value was `[paste service role key]`.

The disposable database URL previously provided is enough for direct Postgres schema validation, but it is not enough to start the Next.js app because the app uses Supabase API URL, anon key, and service role key.

## What Was Not Run

- Disposable app instance: `Not run`.
- `/api/health` baseline observation: `Not run`.
- `/api/health` post-forward observation: `Not run`.
- `/api/health` post-rollback observation: `Not run`.
- Baptism public intake regression: `Not run`.
- Wedding public intake regression: `Not run`.
- Funeral public intake regression: `Not run`.
- OCIA public intake regression: `Not run`.
- Join Parish public intake regression: `Not run`.
- Normal public intake rate-limit behavior: `Not run`.
- Durable public intake 429 behavior: `Not run`.

## What Remains Valid From Prior Disposable DB QA

The prior disposable database-only evidence remains valid:

- `docs/PUBLIC_INTAKE_ROUTING_DISPOSABLE_QA_EVIDENCE_20260624_EXECUTED.json`
- Forward candidate applied successfully to disposable project `kikqtorplsswepqitjys`.
- Schema, indexes, RLS, policies, and data validation passed.
- Rollback passed.
- Cleanup passed with `remainingRelevantTables: []`.

## Required Inputs To Unblock

Provide disposable project API credentials for `kikqtorplsswepqitjys`:

```text
DISPOSABLE_SUPABASE_URL=https://kikqtorplsswepqitjys.supabase.co
DISPOSABLE_SUPABASE_ANON_KEY=...
DISPOSABLE_SUPABASE_SERVICE_ROLE_KEY=...
```

Do not provide shared QA or production credentials for this gate.

## Final Decision

Decision: `Do Not Promote`

Reason: The disposable database migration evidence passed, but the app-level public intake regression and `/api/health` observations remain blocked until disposable Supabase API credentials are available.
