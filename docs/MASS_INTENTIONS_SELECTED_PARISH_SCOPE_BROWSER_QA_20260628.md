# Mass Intentions Selected-Parish Scope Browser QA

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, and no secrets were exposed.

## Scope

This verification checked that the Mass Intentions page selected-parish scope label follows the active parish selector after switching between authorized shared-QA parish fixtures.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app on `localhost:3001` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true`, `checks.supabase: true`, and `checks.parishes: true` |
| Staff session | Safe QA staff account already authenticated in the browser |
| Mass Intentions URL | `/dashboard/intentions` |
| Secrets printed | `false` |

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff session was already authenticated in the browser | Passed |
| Mass Intentions page loaded at `/dashboard/intentions` | Passed |
| Initial Mass Intentions scope label displayed the current active parish | Passed: `Mass intentions are scoped to Vinea QA Google Calendar Parish A.` |
| Parish selector listed `Vinea QA Google Calendar Parish B` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish A` | Passed |
| Selecting Parish B updated the selected option | Passed: `Vinea QA Google Calendar Parish B` |
| Selecting Parish B updated the Mass Intentions scope label after the server refresh settled | Passed: `Mass intentions are scoped to Vinea QA Google Calendar Parish B.` |
| Selecting Parish A updated the selected option | Passed: `Vinea QA Google Calendar Parish A` |
| Selecting Parish A updated the Mass Intentions scope label after the server refresh settled | Passed: `Mass intentions are scoped to Vinea QA Google Calendar Parish A.` |
| Page stayed on `/dashboard/intentions` | Passed |
| Page did not show a not-found state | Passed |
| Google Calendar was not opened or mutated | Passed |
| Production was not accessed | Passed |
| Migrations/RLS were unchanged | Passed |

## Sanitized Evidence Snapshot

```json
{
  "health": {
    "statusCode": 200,
    "checks": {
      "schema": true,
      "supabase": true,
      "parishes": true
    }
  },
  "massIntentionsScopeLabels": {
    "initial": "Mass intentions are scoped to Vinea QA Google Calendar Parish A.",
    "afterSelectingParishB": "Mass intentions are scoped to Vinea QA Google Calendar Parish B.",
    "afterSelectingParishA": "Mass intentions are scoped to Vinea QA Google Calendar Parish A."
  },
  "selectedOptions": {
    "afterSelectingParishB": "Vinea QA Google Calendar Parish B",
    "afterSelectingParishA": "Vinea QA Google Calendar Parish A"
  },
  "notFoundStateObserved": false,
  "secretsPrinted": false
}
```

## Known Limitations

- This was a shared-QA browser verification, not a production verification.
- Raw staff credentials, database URLs, auth tokens, fixture UUIDs, and signed URLs were intentionally not recorded.
- This QA confirmed selected-parish context display only. It did not promote production RLS or change Mass Intentions visibility behavior.

## Outcome

Current status: `MASS_INTENTIONS_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

The Mass Intentions selected-parish scope label follows authorized parish switching in the shared-QA browser path.
