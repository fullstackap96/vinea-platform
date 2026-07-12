# Non-Production Restore Drill Evidence - Safe Reusable Disposable Target - 2026-07-01

Status: Passed with follow-ups after an approved reusable disposable database reset, repo schema replay, and app/auth restore smoke. The approved reusable disposable Supabase target was reset with the guarded disposable-only cleanup script, then restored by replaying the repo-owned disposable base schema bootstrap and all repo migrations. A local non-production Vinea app was then started against only the approved disposable Supabase app credentials, temporary synthetic auth/request/family-portal fixtures were created inside that disposable target, `/api/health`, staff sign-in, selected-parish request detail access, selected-parish denial, and family portal safety were verified, and the synthetic fixtures were cleaned up. Production and shared QA were not accessed, production flags were not enabled, production navigation was not added, production smoke was not run, production runtime behavior was not changed, operational RLS was not changed outside the approved disposable restore-drill target, Google Calendar data was not touched, records outside the approved disposable target were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, private documents were not accessed, raw row data was not queried or recorded, raw IDs were not recorded, and no secrets were exposed.

Current decision state: `NON-PRODUCTION DISPOSABLE DATABASE RESTORE/REPLAY AND APP/AUTH SMOKE COMPLETED WITH FOLLOW-UPS; STORAGE AND PRODUCTION TRUST CLAIMS REMAIN NO-GO`

Completion marker: `NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET`

## Related Docs

- Approval packet: `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md`
- Filled approval inputs: `docs/NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md`
- Execution packet: `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md`
- Evidence template: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md`
- Backup/restore runbook: `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`
- App/auth smoke runner: `scripts/run-nonproduction-restore-app-auth-smoke.mjs`

## Safety Confirmation

| Field | Value |
|---|---|
| Drill environment type | `Approved reusable disposable Supabase project` |
| Target project/ref/host, no secrets | `db.kikqtorplsswepqitjys.supabase.co` |
| Confirmed not production | `Pass` |
| Confirmed not shared QA | `Pass` |
| Production credentials used? | `No` |
| Production private documents restored? | `No` |
| Runtime public intake routing changed? | `No` |
| Operational RLS changed in production or shared QA? | `No` |
| Disposable-only schema replay included current repo policy definitions? | `Yes, only inside the approved reusable disposable restore-drill target` |
| Destructive cleanup approved by environment owner | `Pass, disposable-only reset approval was provided for the reusable disposable target` |

## Drill Identity

| Field | Value |
|---|---|
| Drill date/time | `2026-07-01, local Codex session` |
| Backup owner | `Codex local QA operator` |
| Restore operator | `Codex local QA operator` |
| Security/data reviewer | `Alex Perez` |
| Evidence owner | `Codex local QA operator` |
| Evidence storage location | `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md` |
| Backup source description, no secrets | `Repo-owned disposable base schema bootstrap plus repo migrations` |
| Restore target description, no secrets | `Approved reusable disposable Supabase restore-drill target` |
| App instance used? | `Yes, local non-production app bound to approved disposable Supabase credentials only` |

## Pre-Restore Baseline

| Check | Result | Evidence note |
|---|---|---|
| Target confirmed non-production | `Pass` | Host matched the approved reusable disposable Supabase target and did not match the blocked shared-QA host. |
| Existing target data inventory captured | `Pass` | Sanitized schema inventory only: `29` public tables and `16` public functions. No row data was queried or recorded. |
| Baseline `/api/health` captured, if app used | `Not run before app-auth follow-up` | The original database replay did not use an app instance; the follow-up app/auth smoke captured `/api/health` after replay. |
| Baseline schema/migration state captured | `Pass with follow-up` | Required tables were present before the reset. Migration tracking count was unavailable because the migration tracking table was not present or not visible in this target. |
| Baseline storage bucket/object state captured | `Excluded` | Storage was explicitly excluded by approval scope. |
| Cleanup/reset plan confirmed | `Pass` | Cleanup owner named and guarded disposable-only reset path approved. |

## Restore Execution

Record sanitized execution details only.

| Step | Result | Evidence note |
|---|---|---|
| Restore source selected | `Pass` | Safe source selected: repo-owned disposable base schema bootstrap plus repo migrations. |
| Disposable target reset executed | `Pass` | Guarded reset ran only against `db.kikqtorplsswepqitjys.supabase.co`, executed `44` approved cleanup statements, and left `0` approved cleanup tables, `0` approved cleanup functions, and `0` approved cleanup types remaining. |
| Database restore/replay executed | `Pass` | Guarded bootstrap/replay ran only against the approved reusable disposable target and replayed the disposable base schema plus `40` repo migration files. |
| App/auth smoke executed | `Pass` | Local app was started against disposable Supabase credentials only and verified health, synthetic staff sign-in, selected-parish request detail, selected-parish denial, and family portal safety. |
| Storage restore/replay executed or intentionally excluded | `Excluded` | Storage remained excluded; no storage was accessed. |
| Environment configuration verified | `Pass` | Local app used disposable Supabase URL, anon key, and service-role key by variable name only; Google, email, OpenAI, storage, and production flags were not used. |
| App redeploy/restart performed if needed | `Local dev only` | Local non-production app process was started and stopped for the smoke. |
| Errors observed | `None in final run` | The final run passed all app/auth smoke checks and synthetic cleanup. |
| Sanitized command/output location | `Recorded in this evidence file and local command output summary only` | No secret output was recorded. |

## Read-Only Preflight Result

```json
{
  "ok": true,
  "target": {
    "host": "db.kikqtorplsswepqitjys.supabase.co",
    "approvedReusableDisposable": true,
    "blockedSharedQa": false
  },
  "checks": {
    "connected": true,
    "publicTableCount": 29,
    "publicFunctionCount": 16,
    "migrationCount": null,
    "requiredTables": {
      "parishes": true,
      "staff_users": true,
      "people": true,
      "households": true,
      "requests": true,
      "request_documents": true,
      "request_workflow_steps": true,
      "audit_events": true
    },
    "storageScope": "excluded",
    "mutationScope": "none-read-only-preflight",
    "restoreExecution": "approved-for-follow-up-disposable-database-replay"
  }
}
```

## Disposable Reset Result

```json
{
  "ok": true,
  "status": "completed",
  "target": {
    "host": "db.kikqtorplsswepqitjys.supabase.co",
    "approvedReusableDisposable": true,
    "blockedSharedQa": false
  },
  "reset": {
    "executeReset": true,
    "executedApprovedCleanupStatements": 44,
    "remainingApprovedCleanupTables": 0,
    "remainingApprovedCleanupFunctions": 0,
    "remainingApprovedCleanupTypes": 0
  },
  "privacy": {
    "storageAccessed": false,
    "signedUrlsCreated": false,
    "rawRowsQueried": false,
    "secretsPrinted": false
  }
}
```

## Database Restore/Replay Verification Result

```json
{
  "ok": true,
  "target": {
    "host": "db.kikqtorplsswepqitjys.supabase.co",
    "approvedReusableDisposable": true,
    "blockedSharedQa": false
  },
  "verification": {
    "publicTableCount": 29,
    "publicFunctionCount": 17,
    "missingTables": [],
    "missingFunctions": [],
    "storageScope": "excluded",
    "externalIntegrations": "not used",
    "rawRowsQueried": false,
    "secretsPrinted": false
  }
}
```

Required tables verified after replay:

- `audit_events`
- `checklist_items`
- `parish_memberships`
- `parishes`
- `parishioners`
- `rate_limit_buckets`
- `request_communications`
- `request_documents`
- `request_portal_tokens`
- `request_workflow_steps`
- `requests`
- `staff_users`
- `workflow_templates`

Required functions verified after replay:

- `check_public_intake_rate_limit`
- `create_request_workflow_steps_from_active_template`
- `current_staff_parish_ids`
- `is_authorized_for_parish`
- `primary_parish_id`
- `request_belongs_to_primary_parish`

## App/Auth Restore Smoke Result

The smoke used `scripts/run-nonproduction-restore-app-auth-smoke.mjs` with confirmation marker `NONPRODUCTION_RESTORE_APP_AUTH_SMOKE`. It created only temporary synthetic fixtures inside the approved reusable disposable target and cleaned them up before completion.

```json
{
  "status": "completed",
  "target": {
    "supabaseHost": "kikqtorplsswepqitjys.supabase.co",
    "appBaseUrl": "http://127.0.0.1:3222",
    "approvedReusableDisposable": true,
    "blockedSharedQa": false
  },
  "fixtures": {
    "staff": "temporary synthetic staff user",
    "activeParish": "temporary synthetic parish A",
    "deniedParish": "temporary synthetic parish B without membership",
    "request": "temporary synthetic baptism request",
    "familyPortal": "temporary family portal token used internally but not recorded"
  },
  "checks": [
    {
      "name": "api_health",
      "passed": true,
      "status": 200,
      "schemaTrue": true
    },
    {
      "name": "synthetic_staff_sign_in",
      "passed": true
    },
    {
      "name": "selected_parish_same_parish_detail_access",
      "passed": true,
      "status": 200
    },
    {
      "name": "selected_parish_request_detail_page",
      "passed": true,
      "status": 200
    },
    {
      "name": "selected_parish_cross_parish_denial",
      "passed": true,
      "status": 404
    },
    {
      "name": "family_portal_token_create_without_hash_exposure",
      "passed": true,
      "status": 200
    },
    {
      "name": "family_portal_page_safety_without_storage",
      "passed": true,
      "status": 200
    }
  ],
  "exclusions": {
    "storageAccessed": false,
    "signedUrlsCreated": false,
    "googleCalendarTouched": false,
    "externalIntegrationsCalled": false,
    "rawExportsExposed": false,
    "rawMetadataExposed": false,
    "privateDocumentsAccessed": false,
    "rawIdsPrinted": false,
    "secretsPrinted": false
  },
  "cleanup": {
    "authUserDeleted": true,
    "syntheticRowsDeleted": true,
    "errors": []
  }
}
```

## Synthetic Cleanup Verification

```json
{
  "ok": true,
  "host": "db.kikqtorplsswepqitjys.supabase.co",
  "syntheticCleanupCounts": {
    "parishes": 0,
    "staff_users": 0,
    "memberships": 0,
    "parishioners": 0,
    "requests": 0,
    "workflow_steps": 0
  },
  "rawRowsReturned": false,
  "secretsPrinted": false
}
```

## Post-Restore Verification

| Check | Result | Evidence note |
|---|---|---|
| `/api/health` healthy, if app used | `Pass` | Local disposable app returned HTTP `200` with `checks.schema: true`. |
| Expected tables present | `Pass` | Required table presence checks passed after reset and replay. |
| Expected migration state present | `Pass with follow-up` | Repo migration file count was `40`; migration tracking count was not used as evidence because this target does not provide a reliable migration-history table for this drill. |
| Staff sign-in or safe service smoke works | `Pass` | Temporary synthetic staff auth user signed in against the disposable Supabase project. |
| Staff authorization limits parish scope | `Pass` | Same-parish selected-parish request detail access returned HTTP `200`; selected unauthorized parish substitute returned HTTP `404`. |
| People/households safe records present | `Not run` | No row data was queried. |
| Request detail safe record opens | `Pass` | Temporary synthetic request detail page returned HTTP `200` without login, unauthorized, or not-found state. |
| Workflow step safe record present | `Not run` | No row data was queried. |
| Sacramental record safe record present | `Not run` | No canonical/private details were queried. |
| Mass intention safe record present | `Not run` | No row data was queried. |
| Audit event safe record present or intentionally excluded | `Excluded` | Audit metadata was not queried or recorded. |
| Staff document route works with synthetic file | `Excluded` | Storage and app document upload routes were excluded. |
| Signed URL route works with synthetic file | `Excluded` | Signed URL creation was prohibited. |
| Direct storage access denied | `Excluded` | Storage was not accessed. |
| Family portal safe page does not expose internal data | `Pass` | Temporary synthetic family portal page returned HTTP `200`, did not expose token hash, signed URL markers, storage path markers, internal notes, audit markers, service role marker, or the synthetic staff email. |
| Public intake healthy or known degraded mode recorded | `Not run` | Runtime behavior was not changed or exercised. |
| Google Calendar/email/AI healthy or known degraded mode recorded | `Excluded` | Integrations were excluded by approval scope. |

## Privacy And Data Handling Review

| Review item | Result | Evidence note |
|---|---|---|
| No real parishioner private documents used | `Pass` | Storage was excluded and no documents were accessed. |
| No secrets in evidence | `Pass` | Evidence contains labels, counts, status codes, and allowed object names only. |
| No raw family portal tokens in evidence | `Pass` | The temporary family portal token was used internally only and not recorded. |
| No signed document URLs in evidence | `Pass` | No signed URLs were created. |
| No raw row data or raw metadata in evidence | `Pass` | Only schema object presence, safe labels, status codes, and sanitized counts were recorded. |
| No raw IDs in evidence | `Pass` | Synthetic object IDs and the raw family portal token were used internally only and not recorded. |
| No cross-parish data exposure observed | `Pass` | Unauthorized selected-parish substitute returned a generic not-found response for the same synthetic request. |
| Security/data reviewer approval | `Pending review` | Evidence is ready for product/security review. |

## Recovery Objective Observation

These are observations, not approved public commitments.

| Field | Value |
|---|---|
| Observed restore point age | `Not measured` |
| Observed restore duration | `Not measured as a formal RTO; database reset/replay and app/auth smoke completed during local Codex session` |
| Observed verification duration | `Read-only schema verification and app/auth smoke completed during local Codex session` |
| Proposed RPO adjustment | `Pending after backup owner review` |
| Proposed RTO adjustment | `Pending after a timed full storage/document drill or explicit storage exclusion decision` |

## Cleanup Confirmation

| Cleanup item | Result | Evidence note |
|---|---|---|
| Synthetic database records removed or intentionally retained | `Pass` | Count-only cleanup verification showed `0` remaining synthetic parishes, staff users, memberships, parishioners, requests, and workflow steps for the restore-smoke labels. |
| Synthetic storage files removed or intentionally retained | `Not needed` | Storage was not accessed. |
| Temporary tokens revoked | `Pass by deletion` | Temporary family portal token row was removed during synthetic request cleanup. The raw token was not recorded. |
| Temporary credentials disabled or confirmed non-production only | `Pass` | Temporary synthetic auth user was deleted. |
| Temporary environment variables cleared | `Not changed` | Existing process-scoped non-production variables were read by name/host only. |
| Target reset or ownership handed back | `Pass with note` | Target now contains the replayed repo schema and remains the approved reusable disposable QA target. |

## Final Result

| Field | Value |
|---|---|
| Drill result | `Passed with follow-ups` |
| Restore readiness claim allowed? | `No` |
| Required follow-ups | `Run storage/document synthetic checks only if separately approved, then review timing/RPO/RTO with the backup owner before any stronger public restore-readiness claim.` |
| Follow-up owner | `Codex local QA operator` |
| Next drill date | `Pending product-owner approval for storage/document synthetic scope or timed restore objective review` |

## Final Outcome

- Current outcome: `Disposable database reset, repo schema replay, local app health, synthetic staff sign-in, selected-parish request detail access, selected-parish denial, family portal safety, and synthetic cleanup completed with sanitized evidence; storage/document file handling and production trust claims remain unverified`
- Current recommendation: `Do not claim full restore readiness until synthetic storage/document checks and timed restore objective review are separately approved, executed, verified, cleaned up, and reviewed`
