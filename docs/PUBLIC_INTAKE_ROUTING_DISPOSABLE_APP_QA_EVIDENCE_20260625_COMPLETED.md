# Public Intake Routing Disposable App QA Evidence - Completed 2026-06-25

Status: Completed against disposable Supabase project `kikqtorplsswepqitjys`.

This evidence follows the successful disposable base schema bootstrap replay recorded in `docs/DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_EVIDENCE_20260625_REUSABLE_COMPLETED.md`.

## Scope

Requested disposable app QA gates:

- `/api/health` observation.
- Baptism public intake regression.
- Wedding public intake regression.
- Funeral public intake regression.
- OCIA public intake regression.
- Join Parish public intake regression.
- Normal public intake rate-limit behavior.
- Durable public intake `429` behavior.

## Safety Confirmation

- Disposable Supabase project only: `Yes`.
- Project ref: `kikqtorplsswepqitjys`.
- Production avoided: `Yes`.
- Shared QA avoided: `Yes`.
- Runtime public intake wiring changed: `No`.
- Runtime `/api/health` changed: `No`.
- Operational RLS changed: `No`.
- Migration candidate moved into `supabase/migrations`: `No`.
- Secrets stored in repo files: `No`.
- Disposable Supabase URL, anon key, and service role key were used only as process environment variables.

## Local Disposable App Instance

- Local app URL: `http://127.0.0.1:3017`
- App command: `npm.cmd run dev -- --hostname 127.0.0.1 --port 3017`
- App framework: Next.js `16.2.2`
- The local disposable app process was stopped after QA.

## `/api/health`

Local disposable app `/api/health` returned HTTP `200`.

Observed response:

```json
{
  "ok": true,
  "checks": {
    "env": true,
    "supabase": true,
    "parishes": true,
    "schema": true,
    "resend": true,
    "googleOAuth": true
  }
}
```

## Public Page Availability

- `/baptism-request`: `200`
- `/wedding-request`: `200`
- `/funeral-request`: `200`
- `/ocia-request`: `200`
- `/join-parish-request`: `200`

## Public Intake Regression

All five public intake types were submitted through the local disposable app API and returned HTTP `201`.

- Baptism: `201`
- Wedding: `201`
- Funeral: `201`
- OCIA: `201`
- Join Parish: `201`

Each successful response included `ok: true`, a disposable `requestId`, and a disposable `parishionerId`.

## Rate-Limit Regression

After the five successful intake submissions, three additional Baptism submissions returned HTTP `201`, proving normal submissions still work below the limit.

- Rate-limit attempt `1`: `201`
- Rate-limit attempt `2`: `201`
- Rate-limit attempt `3`: `201`

The next same-window submission returned HTTP `429`.

Observed `429` response:

```json
{
  "ok": false,
  "error": "Too many submissions. Please try again later."
}
```

Observed `Retry-After` header: present.

## Gate Results

- `/api/health`: `Passed`, status `200`, `checks.schema: true`.
- Baptism public intake regression: `Passed`, status `201`.
- Wedding public intake regression: `Passed`, status `201`.
- Funeral public intake regression: `Passed`, status `201`.
- OCIA public intake regression: `Passed`, status `201`.
- Join Parish public intake regression: `Passed`, status `201`.
- Normal public intake rate-limit behavior: `Passed`, statuses `201`.
- Durable public intake `429` behavior: `Passed`, status `429`.

## Conclusion

Decision: `Disposable App QA Passed`

The reusable disposable project now supports the current app-level `/api/health` and public intake regression gates after the base schema bootstrap replay. This does not promote public intake routing into runtime behavior, and it does not move any SQL candidate into `supabase/migrations`.

## Remaining Work

- Public intake routing remains a future runtime feature.
- The public intake routing migration candidate is still outside `supabase/migrations`.
- Runtime public intake still uses the current single-parish destination logic.
- Operational RLS was intentionally not changed.
- Existing React lint failures remain unrelated to this disposable app QA run.

## What Changed Plain English

The disposable test app now works against the rebuilt disposable database. The health check passed, every public intake form type created a request, and the spam protection correctly blocked an extra rapid submission with a `429` response. This proves the current database setup can support the app-level public intake checks in a safe disposable environment.
