# QA Parish Display Name Cleanup Dry-Run Evidence

Status: Completed as a dry-run only. The guarded cleanup script read the approved shared-QA parish fixture rows and produced sanitized JSON evidence. No execute flag was set, no writes were performed, production was not accessed, no migrations were applied, operational RLS was not changed, Google Calendar was not touched, and no secrets were exposed.

## Environment

| Field | Evidence |
|---|---|
| Target Supabase project ref | `gnfomgsuottcuueasfvi` |
| Target type | Shared QA only |
| Script | `scripts/cleanup-qa-parish-display-names.mjs` |
| Confirmation phrase | `VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_CONFIRM=QA_PARISH_DISPLAY_NAME_CLEANUP` |
| Execute flag set | `No` |
| Dry-run | `true` |
| Secrets printed | `false` |

## Sanitized Dry-Run Output

```json
{
  "ok": true,
  "target": {
    "supabaseProjectRef": "gnfomgsuottcuueasfvi",
    "appHost": "khaki-falcons-jam.loca.lt"
  },
  "dryRun": true,
  "execute": false,
  "approvedColumns": [
    "name",
    "public_display_name"
  ],
  "approvedFixtureVariables": [
    "QA_ACTIVE_PARISH_A_ID",
    "QA_ACTIVE_PARISH_B_ID"
  ],
  "changes": [
    {
      "envName": "QA_ACTIVE_PARISH_A_ID",
      "idPresent": true,
      "currentName": {
        "present": true,
        "length": 33
      },
      "currentPublicDisplayName": {
        "present": false,
        "length": 0
      },
      "nextLabel": "Vinea QA Google Calendar Parish A"
    },
    {
      "envName": "QA_ACTIVE_PARISH_B_ID",
      "idPresent": true,
      "currentName": {
        "present": true,
        "length": 33
      },
      "currentPublicDisplayName": {
        "present": false,
        "length": 0
      },
      "nextLabel": "Vinea QA Google Calendar Parish B"
    }
  ],
  "secretsPrinted": false
}
```

## Interpretation

- Both approved QA parish fixture IDs resolved to existing parish rows.
- Both parish `name` values are already present.
- Both parish `public_display_name` values are blank.
- Execute mode remains unapproved and was not used.

## Approval Status

Current status: `DRY_RUN_COMPLETE_EXECUTE_NOT_APPROVED`

Execute mode remains blocked until:

- Product owner explicitly approves shared-QA fixture display-name cleanup execution.
- The dry-run evidence above is accepted.
- The run uses `VINEA_QA_PARISH_DISPLAY_NAME_CLEANUP_EXECUTE=EXECUTE_QA_PARISH_DISPLAY_NAME_CLEANUP`.
