# Onboarding Selected-Parish Scope Browser QA

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

## Scope

This verification checked that the dashboard setup card and the full `/dashboard/onboarding` page selected-parish labels follow the active parish selector after switching between authorized shared-QA parish fixtures.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app on `localhost:3000` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true` |
| Staff session | Safe QA staff account authenticated in the browser |
| Dashboard URL | `/dashboard` |
| Onboarding URL | `/dashboard/onboarding` |
| Secrets printed | `false` |

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff session could access Dashboard | Passed |
| Dashboard loaded at `/dashboard` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish B` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish A` | Passed |
| Dashboard setup card displayed Parish A label | Passed: `Setup is scoped to Vinea QA Google Calendar Parish A` |
| Selecting Parish B updated the selected option | Passed: `Vinea QA Google Calendar Parish B` |
| Dashboard setup card displayed Parish B label | Passed: `Setup is scoped to Vinea QA Google Calendar Parish B` |
| Onboarding page loaded at `/dashboard/onboarding` | Passed |
| Onboarding page displayed Parish B label | Passed: `Onboarding is scoped to Vinea QA Google Calendar Parish B` |
| Selecting Parish A updated the selected option | Passed: `Vinea QA Google Calendar Parish A` |
| Onboarding page displayed Parish A label | Passed: `Onboarding is scoped to Vinea QA Google Calendar Parish A` |
| Pages did not show a not-found state | Passed |
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
  "dashboardSetupScopeLabels": {
    "initialParishA": "Setup is scoped to Vinea QA Google Calendar Parish A",
    "afterSelectingParishB": "Setup is scoped to Vinea QA Google Calendar Parish B"
  },
  "onboardingScopeLabels": {
    "afterSelectingParishB": "Onboarding is scoped to Vinea QA Google Calendar Parish B",
    "afterSelectingParishA": "Onboarding is scoped to Vinea QA Google Calendar Parish A"
  },
  "selectedOptions": {
    "dashboardInitial": "Vinea QA Google Calendar Parish A",
    "dashboardAfterSelectingParishB": "Vinea QA Google Calendar Parish B",
    "onboardingAfterSelectingParishB": "Vinea QA Google Calendar Parish B",
    "onboardingAfterSelectingParishA": "Vinea QA Google Calendar Parish A"
  },
  "notFoundStateObserved": false,
  "recordsMutated": false,
  "secretsPrinted": false
}
```

## Known Limitations

- This was a shared-QA browser verification, not a production verification.
- Raw staff credentials, database URLs, auth tokens, fixture UUIDs, and signed URLs were intentionally not recorded.
- This QA confirmed selected-parish context display only. It did not promote production RLS or change onboarding authorization behavior.

## Outcome

Current status: `ONBOARDING_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

The onboarding selected-parish labels follow authorized parish switching in the shared-QA browser path.
