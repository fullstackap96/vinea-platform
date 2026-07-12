# Communications Selected-Parish Scope Browser QA

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, communication records were not mutated, and no secrets were exposed.

## Scope

This verification checked that the Communications selected-parish scope label follows the active parish selector after switching between authorized shared-QA parish fixtures.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app on `localhost:3001` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true`, `checks.supabase: true`, and `checks.parishes: true` |
| Staff session | Safe QA staff account authenticated in the browser |
| Communications URL | `/dashboard/communications` |
| Secrets printed | `false` |

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff session could access Communications | Passed |
| Communications page loaded at `/dashboard/communications` | Passed |
| Initial Communications scope label displayed the current active parish | Passed: `Communications are scoped to Vinea QA Google Calendar Parish A.` |
| Parish selector listed `Vinea QA Google Calendar Parish B` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish A` | Passed |
| Selecting Parish B updated the selected option | Passed: `Vinea QA Google Calendar Parish B` |
| Selecting Parish B updated the Communications scope label after the server refresh settled | Passed: `Communications are scoped to Vinea QA Google Calendar Parish B.` |
| Selecting Parish A updated the selected option | Passed: `Vinea QA Google Calendar Parish A` |
| Selecting Parish A updated the Communications scope label after the server refresh settled | Passed: `Communications are scoped to Vinea QA Google Calendar Parish A.` |
| Communication write controls remained visible but were not opened or submitted | Passed |
| Page stayed on `/dashboard/communications` | Passed |
| Page did not show a not-found state | Passed |
| No communication touchpoint was saved and no follow-up date was updated | Passed |
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
  "communicationsScopeLabels": {
    "initial": "Communications are scoped to Vinea QA Google Calendar Parish A.",
    "afterSelectingParishB": "Communications are scoped to Vinea QA Google Calendar Parish B.",
    "afterSelectingParishA": "Communications are scoped to Vinea QA Google Calendar Parish A."
  },
  "selectedOptions": {
    "afterSelectingParishB": "Vinea QA Google Calendar Parish B",
    "afterSelectingParishA": "Vinea QA Google Calendar Parish A"
  },
  "writeControlsVisibleButNotSubmitted": true,
  "notFoundStateObserved": false,
  "communicationMutated": false,
  "secretsPrinted": false
}
```

## Known Limitations

- This was a shared-QA browser verification, not a production verification.
- Raw staff credentials, database URLs, auth tokens, fixture UUIDs, communication bodies, and signed URLs were intentionally not recorded.
- This QA confirmed selected-parish context display only. It did not save a communication touchpoint, update a follow-up date, promote production RLS, or change Communications authorization behavior.

## Outcome

Current status: `COMMUNICATIONS_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

The Communications selected-parish scope label follows authorized parish switching in the shared-QA browser path.
