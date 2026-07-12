# Public Intake Routing Disposable App QA Evidence - Partial Run 2026-06-24

Status: Partially executed against disposable Supabase project `kikqtorplsswepqitjys`. This is not a promotion pass.

## Scope

Requested disposable app QA gates:

- `/api/health` observation.
- Baptism public intake regression.
- Wedding public intake regression.
- Funeral public intake regression.
- OCIA public intake regression.
- Join Parish public intake regression.
- Normal public intake rate-limit behavior.
- Durable public intake 429 behavior.

## Safety Confirmation

- Disposable Supabase project only: `Yes`.
- Production avoided: `Yes`.
- Shared QA avoided: `Yes`.
- Runtime public intake wiring changed: `No`.
- Runtime `/api/health` changed: `No`.
- Operational RLS changed: `No`.
- Migration candidate moved into `supabase/migrations`: `No`.
- Secrets stored in repo files: `No`.

## Environment Notes

- Disposable app URL was set to `https://kikqtorplsswepqitjys.supabase.co`.
- Disposable anon and service role keys were used only as process environment variables for local disposable app runs.
- The disposable database did not contain the normal Vinea base schema after the prior cleanup.
- Applying the repo migration folder alone failed because the repo migrations are incremental and assume the original base tables already exist.
- A minimal disposable-only app foundation was applied directly to the disposable database so current runtime pages and API routes could be probed.

## Observations

### Direct Supabase REST Probe

Direct disposable Supabase REST could read the temporary parish row:

- Endpoint: `GET /rest/v1/parishes?select=id&limit=1`
- Status: `200`
- Result: returned disposable parish id `11111111-1111-4111-8111-111111111111`.

### Public Page Availability

Local disposable app instance served the public intake pages:

- `/baptism-request`: `200`
- `/wedding-request`: `200`
- `/funeral-request`: `200`
- `/ocia-request`: `200`
- `/join-parish-request`: `200`

### `/api/health`

Local disposable app `/api/health` returned:

```json
{
  "ok": false,
  "checks": {
    "env": true,
    "supabase": true,
    "parishes": false,
    "schema": false,
    "resend": true,
    "googleOAuth": true
  },
  "error": "parishes"
}
```

Observed HTTP status: `503`.

### Public Intake API

The public intake API did not pass regression because the app health dependency was not satisfied.

Representative Baptism POST returned:

```json
{
  "ok": false,
  "error": "Could not submit request. Please try again later."
}
```

Observed HTTP status: `503`.

The app logs also recorded `503` responses for the attempted public intake POST sequence.

## Gate Results

- `/api/health`: `Failed`, status `503`.
- Baptism public intake regression: `Failed`, status `503`.
- Wedding public intake regression: `Failed`, status `503`.
- Funeral public intake regression: `Failed`, status `503`.
- OCIA public intake regression: `Failed`, status `503`.
- Join Parish public intake regression: `Failed`, status `503`.
- Normal public intake rate-limit behavior: `Not proven`; intake failed before successful threshold behavior could be observed.
- Durable public intake 429 behavior: `Not proven`; intake failed before the threshold could be reached.

## Conclusion

Decision: `Do Not Promote`

The disposable app could render the public pages, and direct Supabase REST could see the disposable parish row, but `/api/health` and `/api/intake` did not pass through the local app. Promotion readiness remains blocked until a disposable environment with the full Vinea base schema can run `/api/health` with `checks.schema: true` and complete the public intake and 429 regression gates.

## Recommended Next Action

Prepare a disposable Supabase project from a real Vinea QA backup or add an explicit repo-owned base schema bootstrap for blank disposable projects. Then rerun this app QA gate against that fully prepared disposable target.
