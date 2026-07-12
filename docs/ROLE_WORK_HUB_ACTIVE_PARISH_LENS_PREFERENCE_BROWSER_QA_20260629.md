# Role Work Hub Active-Parish Lens Preference Browser QA

Status: Completed against shared QA through a local non-production Vinea app instance on 2026-06-29. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, request or communication records were not mutated, and no secrets were exposed.

## Scope

This verification checked that Role Work Hub lens preferences persist separately by active parish. The test selected one role lens for Parish A, selected a different role lens for Parish B, switched back to Parish A, and confirmed the original Parish A lens was restored.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app on `localhost:3001` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true`, `checks.supabase: true`, and `checks.parishes: true` |
| Staff session | Safe QA staff account authenticated in a temporary local Chrome browser profile |
| Dashboard URL | `/dashboard` |
| Secrets printed | `false` |

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff session could access Dashboard home | Passed |
| Dashboard loaded at `/dashboard` | Passed |
| Role Work Hub rendered | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish A` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish B` | Passed |
| Browser-local Role Work Hub lens storage was cleared before the test | Passed |
| Selecting Parish A updated the selected option | Passed: `Vinea QA Google Calendar Parish A` |
| Selecting Pastor lens for Parish A persisted that lens | Passed: active tab `Pastor`, stored lens value `pastor` |
| Selecting Parish B updated the selected option | Passed: `Vinea QA Google Calendar Parish B` |
| Selecting Front desk lens for Parish B persisted that lens | Passed: active tab `Front desk`, stored lens value `receptionist` |
| Switching back to Parish A restored the original Parish A lens | Passed: active tab `Pastor` |
| Switching back to Parish B restored the original Parish B lens | Passed: active tab `Front desk` |
| Two parish-scoped storage entries existed after the test | Passed: storage key shape `vinea:dashboard-role-work-hub:active-lens:<parish-id>` with values `receptionist` and `pastor` |
| Page stayed on `/dashboard` | Passed |
| Page did not show a not-found state | Passed |
| Request and communication records were not mutated | Passed |
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
  "afterParishASelectPastor": {
    "selectedParish": "Vinea QA Google Calendar Parish A",
    "scopeLabel": "Role work hub is scoped to Vinea QA Google Calendar Parish A.",
    "activeTab": "Pastor",
    "storedLens": "pastor",
    "notFound": false
  },
  "afterParishBSelectFrontDesk": {
    "selectedParish": "Vinea QA Google Calendar Parish B",
    "scopeLabel": "Role work hub is scoped to Vinea QA Google Calendar Parish B.",
    "activeTab": "Front desk",
    "storedLens": "receptionist",
    "notFound": false
  },
  "afterSwitchBackToParishA": {
    "selectedParish": "Vinea QA Google Calendar Parish A",
    "activeTab": "Pastor",
    "notFound": false
  },
  "afterSwitchBackToParishB": {
    "selectedParish": "Vinea QA Google Calendar Parish B",
    "activeTab": "Front desk",
    "storage": [
      {
        "keyShape": "vinea:dashboard-role-work-hub:active-lens:<parish-id>",
        "value": "receptionist"
      },
      {
        "keyShape": "vinea:dashboard-role-work-hub:active-lens:<parish-id>",
        "value": "pastor"
      }
    ],
    "notFound": false
  },
  "requestOrCommunicationMutated": false,
  "googleCalendarMutated": false,
  "productionAccessed": false,
  "migrationsOrRlsChanged": false,
  "secretsPrinted": false
}
```

## Known Limitations

- This was a shared-QA browser verification, not a production verification.
- Raw staff credentials, database URLs, auth tokens, fixture UUIDs, request details, communication bodies, and signed URLs were intentionally not recorded.
- This QA confirmed browser-local lens preference behavior only. It did not save request changes, save communication touchpoints, promote production RLS, or change Role Work Hub authorization behavior.

## Outcome

Current status: `ROLE_WORK_HUB_ACTIVE_PARISH_LENS_PREFERENCE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

The Role Work Hub restores separate active-parish lens preferences in the shared-QA browser path.
