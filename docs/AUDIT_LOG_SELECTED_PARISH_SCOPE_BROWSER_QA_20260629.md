# Audit Log Selected-Parish Scope Browser QA

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, and no secrets were exposed.

## Scope

This verification checked that the Audit Log selected-parish scope label follows the active parish selector after switching between authorized shared-QA parish fixtures.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app on `localhost:3001` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true`, `checks.supabase: true`, and `checks.parishes: true` |
| Staff session | Safe QA staff account authenticated in the browser |
| Audit Log URL | `/dashboard/admin/audit-log` |
| Secrets printed | `false` |

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff session could access Audit Log | Passed |
| Audit Log page loaded at `/dashboard/admin/audit-log` | Passed |
| Initial Audit Log scope label displayed the current active parish | Passed: `Audit log is scoped to Vinea QA Google Calendar Parish A.` |
| Parish selector listed `Vinea QA Google Calendar Parish B` | Passed |
| Parish selector listed `Vinea QA Google Calendar Parish A` | Passed |
| Selecting Parish B updated the selected option | Passed: `Vinea QA Google Calendar Parish B` |
| Selecting Parish B updated the Audit Log scope label after the server refresh settled | Passed: `Audit log is scoped to Vinea QA Google Calendar Parish B.` |
| Selecting Parish A updated the selected option | Passed: `Vinea QA Google Calendar Parish A` |
| Selecting Parish A updated the Audit Log scope label after the server refresh settled | Passed: `Audit log is scoped to Vinea QA Google Calendar Parish A.` |
| Refresh control still worked after parish switching | Passed |
| Page stayed on `/dashboard/admin/audit-log` | Passed |
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
  "auditLogScopeLabels": {
    "initial": "Audit log is scoped to Vinea QA Google Calendar Parish A.",
    "afterSelectingParishB": "Audit log is scoped to Vinea QA Google Calendar Parish B.",
    "afterSelectingParishA": "Audit log is scoped to Vinea QA Google Calendar Parish A.",
    "afterRefresh": "Audit log is scoped to Vinea QA Google Calendar Parish A."
  },
  "selectedOptions": {
    "afterSelectingParishB": "Vinea QA Google Calendar Parish B",
    "afterSelectingParishA": "Vinea QA Google Calendar Parish A"
  },
  "refreshControlStillWorked": true,
  "notFoundStateObserved": false,
  "secretsPrinted": false
}
```

## Known Limitations

- This was a shared-QA browser verification, not a production verification.
- Raw staff credentials, database URLs, auth tokens, fixture UUIDs, and signed URLs were intentionally not recorded.
- This QA confirmed selected-parish context display only. It did not promote production RLS or change Audit Log authorization behavior.

## Outcome

Current status: `AUDIT_LOG_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

The Audit Log selected-parish scope label follows authorized parish switching in the shared-QA browser path.
