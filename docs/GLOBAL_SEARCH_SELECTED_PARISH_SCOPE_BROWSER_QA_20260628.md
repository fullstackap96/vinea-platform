# Global Search Selected-Parish Scope Browser QA

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, and no secrets were exposed.

## Scope

This verification checked that the full Global Search results page selected-parish context label follows the active parish selector after switching between authorized shared-QA parish fixtures.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app on `localhost:3001` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true`, `checks.supabase: true`, and `checks.parishes: true` |
| Staff session | Safe QA staff account already authenticated in the browser |
| Search URL | `/dashboard/search?q=Maria` |
| Secrets printed | `false` |

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff session was already authenticated in the browser | Passed |
| Global Search page loaded at `/dashboard/search?q=Maria` | Passed |
| Initial Global Search scope label displayed the current active parish | Passed: `Search is using selected parish context: Vinea QA Google Calendar Parish A.` |
| Parish selector listed `Vinea QA Google Calendar Parish B` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish A` | Passed |
| Selecting Parish B updated the selected option | Passed: `Vinea QA Google Calendar Parish B` |
| Selecting Parish B updated the Global Search scope label | Passed: `Search is using selected parish context: Vinea QA Google Calendar Parish B.` |
| Selecting Parish A updated the selected option | Passed: `Vinea QA Google Calendar Parish A` |
| Selecting Parish A updated the Global Search scope label after the server refresh settled | Passed: `Search is using selected parish context: Vinea QA Google Calendar Parish A.` |
| Page stayed on `/dashboard/search?q=Maria` | Passed |
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
  "globalSearchScopeLabels": {
    "initial": "Search is using selected parish context: Vinea QA Google Calendar Parish A.",
    "afterSelectingParishB": "Search is using selected parish context: Vinea QA Google Calendar Parish B.",
    "afterSelectingParishA": "Search is using selected parish context: Vinea QA Google Calendar Parish A."
  },
  "selectedOptions": {
    "afterSelectingParishB": "Vinea QA Google Calendar Parish B",
    "afterSelectingParishA": "Vinea QA Google Calendar Parish A"
  },
  "refreshObservation": "An immediate read after switching back to Parish A briefly saw the previous server-rendered label, then the page settled to the correct Parish A label after a short refresh wait.",
  "secretsPrinted": false
}
```

## Known Limitations

- This was a shared-QA browser verification, not a production verification.
- Raw staff credentials, database URLs, auth tokens, fixture UUIDs, and signed URLs were intentionally not recorded.
- This QA confirmed selected-parish context display only. It did not promote production RLS or change global search visibility behavior.

## Outcome

Current status: `GLOBAL_SEARCH_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

The Global Search selected-parish context label follows authorized parish switching in the shared-QA browser path.
