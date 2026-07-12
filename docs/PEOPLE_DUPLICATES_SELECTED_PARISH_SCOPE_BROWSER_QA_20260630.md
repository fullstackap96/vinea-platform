# People Duplicates Selected-Parish Scope Browser QA

Date: 2026-06-30

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, Find duplicates was not clicked, duplicate people were not loaded, people were not merged, parish records were not mutated, records were not mutated, and no secrets were exposed.

Completion marker: `PEOPLE_DUPLICATES_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

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
| Find duplicates clicked | No |
| Duplicate people loaded | No |
| People merged | No |
| Parish records mutated | No |
| Records mutated | No |
| Secrets printed | No |

## Browser Verification

1. Started a local non-production Vinea app on `localhost:3000`.
2. Confirmed `/api/health` returned HTTP `200`, `ok: true`, and `checks.schema: true`.
3. Opened `/dashboard/people/duplicates` in a safe authenticated QA staff browser session.
4. Confirmed the initial page displayed:
   - `Duplicate review`
   - `People duplicate review is scoped to Vinea QA Google Calendar Parish A.`
   - `Find duplicates`
   - `Load possible duplicates to begin cleanup.`
5. Switched to Parish B using only the active parish selector.
6. Confirmed after the normal selected-parish refresh:
   - `People duplicate review is scoped to Vinea QA Google Calendar Parish B.`
   - `Load possible duplicates to begin cleanup.`
   - `Start by finding duplicates.`
7. Switched back to Parish A using only the active parish selector.
8. Confirmed after the normal selected-parish refresh:
   - `People duplicate review is scoped to Vinea QA Google Calendar Parish A.`
   - `Load possible duplicates to begin cleanup.`
   - `Start by finding duplicates.`
9. Confirmed no Find duplicates click, duplicate candidate load, merge confirmation, migration, RLS, production, Google Calendar, parish-record, or record mutation action was performed.

## Observation

The selected-parish switch can take a short client refresh moment before the duplicate review page updates. After the refresh settled, the People duplicate review selected-parish label matched the active parish in both directions.

## Safety Confirmation

```json
{
  "productionAccessed": false,
  "migrationsApplied": false,
  "operationalRlsChanged": false,
  "googleCalendarTouched": false,
  "findDuplicatesClicked": false,
  "duplicatePeopleLoaded": false,
  "peopleMerged": false,
  "parishRecordsMutated": false,
  "recordsMutated": false,
  "secretsPrinted": false
}
```

## Known Risks

- This was shared-QA browser verification, not production verification.
- This pass verified display and selected-parish switching only; it did not run duplicate detection or merge behavior.
- This does not approve or apply production membership-aware operational RLS.
- Production RLS remains `NO-GO` until explicit production approval, production-safe smoke fixtures, monitoring, rollback readiness, and live smoke evidence are complete.
