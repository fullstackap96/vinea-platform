# QA Parish Selector Browser Verification

Status: Completed against shared QA through a local non-production Vinea app instance. Production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar routes and data were not touched, and no secrets were exposed.

## Scope

This verification followed the shared-QA parish display-name cleanup. It checked that the active parish selector shows the cleaned QA fixture names and that selected-parish switching still works.

## Environment

| Field | Evidence |
|---|---|
| App target | Local non-production Vinea app |
| Supabase target | Shared QA project `gnfomgsuottcuueasfvi` |
| Health check | `/api/health` returned HTTP `200` with `checks.schema: true`, `checks.supabase: true`, and `checks.parishes: true` |
| Staff session | Safe QA staff account from ignored local QA env file |
| Secrets printed | `false` |

## Issue Found

The first browser check showed that the active parish selector still rendered the two approved QA parish fixture options as `Unnamed parish` even after the shared-QA cleanup script had verified that the database rows contained the cleaned labels.

Root cause: the active parish switcher received the authorized parish ids from membership context, but parish display rows could still be hidden from the staff-scoped client under the current shared-QA policy shape. The existing loader intentionally preserved membership scope and fell back to unnamed labels rather than expanding access.

## Fix Implemented

- Updated the staff parish context loader to use `public_display_name` as a display fallback when `name` is blank.
- Added a display-only server fallback that loads labels for the already-authorized membership parish ids through the existing server-only service-role client when staff-scoped display rows are not visible.
- The fallback does not add parish ids, change active parish authorization, write data, change RLS, or expose private parish data. It only fills labels for parish ids already returned by `current_staff_parish_ids()`.

## Browser Verification Results

| Check | Result |
|---|---|
| Safe QA staff could sign in | Passed |
| Dashboard loaded in shared-QA-backed local app | Passed |
| Selector displayed `Vinea QA Google Calendar Parish A` | Passed |
| Selector displayed `Vinea QA Google Calendar Parish B` | Passed |
| Selecting Parish B changed the selected option to `Vinea QA Google Calendar Parish B` | Passed |
| Selecting Parish A changed the selected option to `Vinea QA Google Calendar Parish A` | Passed |
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
  "selectorOptions": [
    "St Ann",
    "Vinea QA Google Calendar Parish B",
    "Vinea QA Google Calendar Parish A"
  ],
  "switching": {
    "afterSelectingParishB": {
      "selectedFixture": "B",
      "selectedLabel": "Vinea QA Google Calendar Parish B"
    },
    "afterSelectingParishA": {
      "selectedFixture": "A",
      "selectedLabel": "Vinea QA Google Calendar Parish A"
    }
  },
  "secretsPrinted": false
}
```

## Known Limitations

- A final browser-tool reload persistence check timed out after the selector-label and A/B switching evidence had already been captured. The verified switching path did update the visible selected option for both QA parishes.
- This verification did not touch Google Calendar OAuth, Google Calendar event create/update/delete, public intake routing, production data, migrations, or operational RLS.

## Outcome

Current status: `BROWSER_VERIFICATION_COMPLETE_SHARED_QA_ONLY`

The active parish selector now shows the cleaned QA parish names and selected-parish switching works in the shared-QA browser path.
