# Parish Care Calendar Selected-Parish Scope Browser QA

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, and no secrets were exposed.

## Scope

This verification checked that the Parish Care Calendar selected-parish scope label follows the active parish selector after switching between authorized shared-QA parish fixtures.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app on `localhost:3001` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true`, `checks.supabase: true`, and `checks.parishes: true` |
| Staff session | Safe QA staff account already authenticated in the in-app browser |
| Secrets printed | `false` |

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff session was already authenticated in the browser | Passed |
| Parish Care Calendar loaded at `/dashboard/calendar` | Passed |
| Initial Parish Care Calendar scope label displayed the current active parish | Passed: `Parish care calendar is scoped to Vinea QA Google Calendar Parish A.` |
| Parish selector listed `Vinea QA Google Calendar Parish B` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish A` | Passed |
| Selecting Parish B updated the selected option | Passed: `Vinea QA Google Calendar Parish B` |
| Selecting Parish B updated the Parish Care Calendar scope label | Passed: `Parish care calendar is scoped to Vinea QA Google Calendar Parish B.` |
| Selecting Parish A updated the selected option | Passed: `Vinea QA Google Calendar Parish A` |
| Selecting Parish A updated the Parish Care Calendar scope label | Passed: `Parish care calendar is scoped to Vinea QA Google Calendar Parish A.` |
| Calendar page stayed on `/dashboard/calendar` after each switch | Passed |
| Browser did not show a not-found state after switching | Passed |
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
  "calendarScopeLabels": {
    "initial": "Parish care calendar is scoped to Vinea QA Google Calendar Parish A.",
    "afterSelectingParishB": "Parish care calendar is scoped to Vinea QA Google Calendar Parish B.",
    "afterSelectingParishA": "Parish care calendar is scoped to Vinea QA Google Calendar Parish A."
  },
  "selectedOptions": {
    "initial": "Vinea QA Google Calendar Parish A",
    "afterSelectingParishB": "Vinea QA Google Calendar Parish B",
    "afterSelectingParishA": "Vinea QA Google Calendar Parish A"
  },
  "notFoundAfterSwitch": false,
  "secretsPrinted": false
}
```

## Known Limitations

- This was a shared-QA browser verification, not a production verification.
- Raw staff credentials, database URLs, auth tokens, fixture UUIDs, and signed URLs were intentionally not recorded.
- This QA confirmed selected-parish Parish Care Calendar scope display only. It did not promote production RLS or change calendar-query behavior.

## Outcome

Current status: `PARISH_CARE_CALENDAR_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

The Parish Care Calendar selected-parish scope label follows authorized parish switching in the shared-QA browser path.
