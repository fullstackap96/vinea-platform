# Workflow Templates Selected-Parish Scope Browser QA

Date: 2026-06-29

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, workflow templates were not mutated, parish records were not mutated, and no secrets were exposed.

Completion marker: `WORKFLOW_TEMPLATES_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

## Environment

| Item | Result |
| --- | --- |
| App origin | `http://localhost:3000` |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| `/api/health` | HTTP `200`, `ok: true`, `checks.schema: true` |
| Browser session | Safe authenticated QA staff session |
| Production accessed | No |
| Migrations applied | No |
| Operational RLS changed | No |
| Google Calendar touched | No |
| Workflow templates mutated | No |
| Parish records mutated | No |
| Secrets printed | No |

## Browser Verification

1. Opened `/dashboard/settings` in the local non-production app.
2. Confirmed the safe authenticated QA staff session could see the approved shared-QA parish fixtures.
3. Confirmed `/api/health` returned HTTP `200`, `ok: true`, and `checks.schema: true`.
4. Confirmed Parish A selected-parish display showed:
   - `Settings are scoped to Vinea QA Google Calendar Parish A.`
   - `Workflow templates are scoped to Vinea QA Google Calendar Parish A.`
5. Switched to Parish B and confirmed, after the normal selected-parish refresh:
   - `Settings are scoped to Vinea QA Google Calendar Parish B.`
   - `Workflow templates are scoped to Vinea QA Google Calendar Parish B.`
6. Switched back to Parish A and confirmed:
   - `Settings are scoped to Vinea QA Google Calendar Parish A.`
   - `Workflow templates are scoped to Vinea QA Google Calendar Parish A.`
7. Confirmed no Save step, Refresh-only data mutation, public intake routing save, staff access change, Google Calendar action, migration, RLS, or production action was performed.

## Observation

The selected-parish switch can take a short client refresh moment before the Workflow Templates panel updates. After the refresh settled, the Workflow Templates label matched the selected parish in both directions.

## Safety Confirmation

```json
{
  "productionAccessed": false,
  "migrationsApplied": false,
  "operationalRlsChanged": false,
  "googleCalendarTouched": false,
  "workflowTemplatesMutated": false,
  "parishRecordsMutated": false,
  "recordsMutated": false,
  "secretsPrinted": false
}
```

## Known Risks

- This was shared-QA browser verification, not production verification.
- This does not approve or apply production membership-aware operational RLS.
- Production RLS remains `NO-GO` until explicit production approval, production-safe smoke fixtures, monitoring, rollback readiness, and live smoke evidence are complete.
