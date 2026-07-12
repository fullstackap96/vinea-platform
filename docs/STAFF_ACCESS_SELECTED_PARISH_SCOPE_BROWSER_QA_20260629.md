# Staff Access Selected-Parish Scope Browser QA

Date: 2026-06-29

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, staff records were not mutated, parish records were not mutated, and no secrets were exposed.

Completion marker: `STAFF_ACCESS_SELECTED_PARISH_SCOPE_BROWSER_QA_COMPLETE_SHARED_QA_ONLY`

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
| Staff records mutated | No |
| Secrets printed | No |

## Browser Verification

1. Opened `/dashboard/settings` in the local non-production app.
2. Confirmed the safe authenticated QA staff session could see the approved shared-QA parish fixtures.
3. Confirmed the Staff login access section was visible.
4. Confirmed Parish B selected-parish reload displayed:
   - `Settings are scoped to Vinea QA Google Calendar Parish B.`
   - `Staff access is scoped to Vinea QA Google Calendar Parish B.`
5. Switched back to Parish A and confirmed:
   - `Settings are scoped to Vinea QA Google Calendar Parish A.`
   - `Staff access is scoped to Vinea QA Google Calendar Parish A.`
6. Confirmed no not-found state appeared.
7. Confirmed no Add access, role change, deactivate/reactivate, Google Calendar, migration, RLS, or production action was performed.

## Issue Found And Fixed

During the first browser pass, the active parish selector changed from Parish A to Parish B, but the client-loaded Settings content still displayed Parish A until the page was reloaded. This meant the Staff Access label could become stale after a selected-parish switch.

The fix was intentionally narrow:

- The server Settings page now passes the server-validated active parish id into the Settings client component.
- The Settings client component reloads its client-fetched parish settings when that active parish id changes.
- The Staff Access API authorization path was not changed.
- Operational RLS was not changed.

## Safety Confirmation

```json
{
  "productionAccessed": false,
  "migrationsApplied": false,
  "operationalRlsChanged": false,
  "googleCalendarTouched": false,
  "staffRecordsMutated": false,
  "recordsMutated": false,
  "secretsPrinted": false
}
```

## Known Risks

- This was shared-QA browser verification, not production verification.
- This does not approve or apply production membership-aware operational RLS.
- Production RLS remains `NO-GO` until explicit production approval, production-safe smoke fixtures, monitoring, rollback readiness, and live smoke evidence are complete.
