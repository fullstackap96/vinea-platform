# Imports Selected-Parish Scope Browser QA

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, import data was not mutated, and no secrets were exposed.

## Scope

This verification checked that the Data Imports selected-parish scope label follows the active parish selector after switching between authorized shared-QA parish fixtures.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app on `localhost:3001` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true`, `checks.supabase: true`, and `checks.parishes: true` |
| Staff session | Safe QA staff account authenticated in the browser |
| Imports URL | `/dashboard/imports` |
| Secrets printed | `false` |

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff session could access Imports | Passed |
| Imports page loaded at `/dashboard/imports` | Passed |
| Initial Imports scope label displayed the current active parish | Passed: `Imports are scoped to Vinea QA Google Calendar Parish A.` |
| Parish selector listed `Vinea QA Google Calendar Parish B` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish A` | Passed |
| Selecting Parish B updated the selected option | Passed: `Vinea QA Google Calendar Parish B` |
| Selecting Parish B updated the Imports scope label after the server refresh settled | Passed: `Imports are scoped to Vinea QA Google Calendar Parish B.` |
| Selecting Parish A updated the selected option | Passed: `Vinea QA Google Calendar Parish A` |
| Selecting Parish A updated the Imports scope label after the server refresh settled | Passed: `Imports are scoped to Vinea QA Google Calendar Parish A.` |
| Template controls remained visible after parish switching | Passed |
| Page stayed on `/dashboard/imports` | Passed |
| Page did not show a not-found state | Passed |
| No CSV file was uploaded and no import was committed | Passed |
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
  "importsScopeLabels": {
    "initial": "Imports are scoped to Vinea QA Google Calendar Parish A.",
    "afterSelectingParishB": "Imports are scoped to Vinea QA Google Calendar Parish B.",
    "afterSelectingParishA": "Imports are scoped to Vinea QA Google Calendar Parish A."
  },
  "selectedOptions": {
    "afterSelectingParishB": "Vinea QA Google Calendar Parish B",
    "afterSelectingParishA": "Vinea QA Google Calendar Parish A"
  },
  "templateControlsPresent": true,
  "notFoundStateObserved": false,
  "importCommitted": false,
  "secretsPrinted": false
}
```

## Known Limitations

- This was a shared-QA browser verification, not a production verification.
- Raw staff credentials, database URLs, auth tokens, fixture UUIDs, and signed URLs were intentionally not recorded.
- This QA confirmed selected-parish context display only. It did not upload a CSV file, commit an import, promote production RLS, or change Imports authorization behavior.

## Outcome

Current status: `IMPORTS_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

The Data Imports selected-parish scope label follows authorized parish switching in the shared-QA browser path.
