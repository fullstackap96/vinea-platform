# Role Work Hub Selected-Parish Scope Browser QA

Status: Completed against shared QA through a local non-production Vinea app instance on 2026-06-29. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, request or communication records were not mutated, and no secrets were exposed.

## Scope

This verification checked that the Role Work Hub selected-parish scope label follows the active parish selector after switching between authorized shared-QA parish fixtures.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app on `localhost:3001` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true`, `checks.supabase: true`, and `checks.parishes: true` |
| Staff session | Safe QA staff account authenticated in the browser |
| Dashboard URL | `/dashboard` |
| Secrets printed | `false` |

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff session could access Dashboard home | Passed |
| Dashboard loaded at `/dashboard` | Passed |
| Role Work Hub rendered | Passed |
| Initial Role Work Hub scope label displayed the current active parish | Passed: `Role work hub is scoped to Vinea QA Google Calendar Parish A.` |
| Parish selector listed `Vinea QA Google Calendar Parish B` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish A` | Passed |
| Selecting Parish B updated the selected option | Passed: `Vinea QA Google Calendar Parish B` |
| Selecting Parish B updated the Role Work Hub scope label after the server refresh settled | Passed: `Role work hub is scoped to Vinea QA Google Calendar Parish B.` |
| Selecting Parish A updated the selected option | Passed: `Vinea QA Google Calendar Parish A` |
| Selecting Parish A updated the Role Work Hub scope label after the server refresh settled | Passed: `Role work hub is scoped to Vinea QA Google Calendar Parish A.` |
| Page stayed on `/dashboard` | Passed |
| Page did not show a not-found state | Passed |
| Request and communication records were not mutated | Passed |
| Google Calendar was not opened or mutated | Passed |
| Production was not accessed | Passed |
| Migrations/RLS were unchanged | Passed |

## Issue Found And Fixed

The first browser pass showed that the Role Work Hub label did not render on `/dashboard` even though the component supported it. The dashboard home page was passing the active parish id into `DashboardPageCore`, but not the active parish display name. The fix passes the same validated active parish name used by the parish switcher into the dashboard home.

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
  "roleWorkHubScopeLabels": {
    "initial": "Role work hub is scoped to Vinea QA Google Calendar Parish A.",
    "afterSelectingParishB": "Role work hub is scoped to Vinea QA Google Calendar Parish B.",
    "afterSelectingParishA": "Role work hub is scoped to Vinea QA Google Calendar Parish A."
  },
  "selectedOptions": {
    "initial": "Vinea QA Google Calendar Parish A",
    "afterSelectingParishB": "Vinea QA Google Calendar Parish B",
    "afterSelectingParishA": "Vinea QA Google Calendar Parish A"
  },
  "notFoundStateObserved": false,
  "requestOrCommunicationMutated": false,
  "googleCalendarMutated": false,
  "secretsPrinted": false
}
```

## Known Limitations

- This was a shared-QA browser verification, not a production verification.
- Raw staff credentials, database URLs, auth tokens, fixture UUIDs, request details, communication bodies, and signed URLs were intentionally not recorded.
- This QA confirmed selected-parish context display only. It did not save request changes, save communication touchpoints, promote production RLS, or change Role Work Hub authorization behavior.

## Outcome

Current status: `ROLE_WORK_HUB_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

The Role Work Hub selected-parish scope label follows authorized parish switching in the shared-QA browser path.
