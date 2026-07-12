# Public Intake Routing Selected-Parish Scope Browser QA

Date: 2026-06-29

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, public intake routing metadata was not saved, domains were not added or verified, tokens were not created, runtime public intake routing was not enabled, parish records were not mutated, records were not mutated, and no secrets were exposed.

Completion marker: `PUBLIC_INTAKE_ROUTING_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

## Environment

| Item | Result |
| --- | --- |
| App origin | `http://localhost:3000` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| `/api/health` | HTTP `200`, `ok: true`, `checks.schema: true` |
| Browser session | Safe authenticated QA staff session |
| Production accessed | No |
| Migrations applied | No |
| Operational RLS changed | No |
| Google Calendar touched | No |
| Public intake routing metadata saved | No |
| Domains added or verified | No |
| Tokens created | No |
| Runtime public intake routing enabled | No |
| Parish records mutated | No |
| Records mutated | No |
| Secrets printed | No |

## Browser Verification

1. Opened `/dashboard/settings` in the local non-production app.
2. Confirmed `/api/health` returned HTTP `200`, `ok: true`, and `checks.schema: true`.
3. Confirmed Parish A selected-parish display showed:
   - `Settings are scoped to Vinea QA Google Calendar Parish A.`
   - `Public intake routing is scoped to Vinea QA Google Calendar Parish A.`
   - `Prepared, not live`
4. Switched to Parish B using only the active parish selector.
5. Confirmed after the normal selected-parish refresh:
   - `Settings are scoped to Vinea QA Google Calendar Parish B.`
   - `Public intake routing is scoped to Vinea QA Google Calendar Parish B.`
   - `Prepared, not live`
6. Switched back to Parish A using only the active parish selector.
7. Confirmed after the normal selected-parish refresh:
   - `Settings are scoped to Vinea QA Google Calendar Parish A.`
   - `Public intake routing is scoped to Vinea QA Google Calendar Parish A.`
   - `Prepared, not live`
8. Confirmed no Save routing metadata, Add domain, Verify domain, Create token, Google Calendar, migration, RLS, production, or record mutation action was performed.

## Observation

The selected-parish switch can take a short client refresh moment before the Settings panel updates. After the refresh settled, the Public Intake Routing selected-parish label matched the active parish in both directions.

## Safety Confirmation

```json
{
  "productionAccessed": false,
  "migrationsApplied": false,
  "operationalRlsChanged": false,
  "googleCalendarTouched": false,
  "publicIntakeRoutingMetadataSaved": false,
  "domainsAddedOrVerified": false,
  "tokensCreated": false,
  "runtimePublicIntakeRoutingEnabled": false,
  "parishRecordsMutated": false,
  "recordsMutated": false,
  "secretsPrinted": false
}
```

## Known Risks

- This was shared-QA browser verification, not production verification.
- The Public Intake Routing card remains prepared and not live.
- Runtime public intake routing remains gated and disabled unless explicitly approved separately.
- This does not approve or apply production membership-aware operational RLS.
- Production RLS remains `NO-GO` until explicit production approval, production-safe smoke fixtures, monitoring, rollback readiness, and live smoke evidence are complete.
