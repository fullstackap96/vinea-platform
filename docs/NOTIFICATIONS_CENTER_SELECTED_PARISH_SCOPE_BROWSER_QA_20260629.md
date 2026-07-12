# Notifications Center Selected-Parish Scope Browser QA

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, records were not mutated, and no secrets were exposed.

## Scope

This verification checked that the dashboard `Needs attention` Notifications Center selected-parish scope label follows the active parish selector after switching between authorized shared-QA parish fixtures.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app on `localhost:3000` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true` |
| Staff session | Safe QA staff account authenticated in the browser |
| Dashboard URL | `/dashboard` |
| Secrets printed | `false` |

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff session could access Dashboard | Passed |
| Dashboard loaded at `/dashboard` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish B` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish A` | Passed |
| Selecting Parish B updated the selected option | Passed: `Vinea QA Google Calendar Parish B` |
| Opening `Needs attention` after selecting Parish B displayed matching scope label | Passed: `Scoped to Vinea QA Google Calendar Parish B` |
| Selecting Parish A updated the selected option | Passed: `Vinea QA Google Calendar Parish A` |
| Opening `Needs attention` after selecting Parish A displayed matching scope label | Passed: `Scoped to Vinea QA Google Calendar Parish A` |
| Page stayed on `/dashboard` | Passed |
| Page did not show a not-found state | Passed |
| Google Calendar was not opened or mutated | Passed |
| Production was not accessed | Passed |
| Migrations/RLS were unchanged | Passed |
| Records were not mutated | Passed |

## Sanitized Evidence Snapshot

```json
{
  "health": {
    "statusCode": 200,
    "checks": {
      "schema": true
    }
  },
  "notificationScopeLabels": {
    "afterSelectingParishB": "Scoped to Vinea QA Google Calendar Parish B",
    "afterSelectingParishA": "Scoped to Vinea QA Google Calendar Parish A"
  },
  "selectedOptions": {
    "afterSelectingParishB": "Vinea QA Google Calendar Parish B",
    "afterSelectingParishA": "Vinea QA Google Calendar Parish A"
  },
  "notFoundStateObserved": false,
  "recordsMutated": false,
  "secretsPrinted": false
}
```

## Known Limitations

- This was a shared-QA browser verification, not a production verification.
- Raw staff credentials, database URLs, auth tokens, fixture UUIDs, and signed URLs were intentionally not recorded.
- This QA confirmed selected-parish context display only. It did not promote production RLS or change Notifications Center authorization behavior.

## Outcome

Current status: `NOTIFICATIONS_CENTER_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

The Notifications Center selected-parish scope label follows authorized parish switching in the shared-QA browser path.
