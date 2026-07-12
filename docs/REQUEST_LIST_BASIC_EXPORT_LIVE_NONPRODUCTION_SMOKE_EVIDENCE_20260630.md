# Request List Basic Export Live Non-Production Smoke Evidence - 2026-06-30

Status: Completed as a live non-production HTTP smoke against the local Vinea app target only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated beyond the approved safe export audit metadata, and no secrets were exposed.

Current decision: `LIVE NON-PRODUCTION EXPORT SMOKE PASSED, PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `REQUEST_LIST_BASIC_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630`

## Approved Scope

- Route under smoke: `/api/exports/requests/basic`
- Export preset: `request_list_basic`
- App target: `localhost non-production`
- Runtime flags used only in the local non-production dev server:
  - `VINEA_EXPORT_RUNTIME=ENABLED`
  - `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
  - `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`
- Rollback owner: `Codex local QA operator`
- Rollback method: stop the flagged local dev server, restart without export flags, and verify the route returns generic unavailable behavior.

## Fixture Handling

- Safe staff fixture: existing non-production QA staff environment values were used internally and were not printed.
- Same-parish request fixture: the stored `QA_REQUEST_ID` was not usable in the current non-production database, so the smoke derived a safe same-parish request from the QA staff account's active parish memberships.
- Cross-parish denial fixture: used a forged unauthorized active parish cookie against the authenticated QA staff session to verify generic cross-parish/unauthorized parish denial.
- Family-portal denial method: used unauthenticated direct route access as the safe family-facing substitute.
- No staff passwords, session cookies, Supabase service role keys, auth tokens, parish IDs, request IDs, raw CSV contents, document paths, signed URLs, or family portal tokens were recorded.

## Smoke Results

| Gate | Expected result | Evidence result | Status |
|---|---|---|---|
| Pre-smoke health | `/api/health` returns `checks.schema: true` | HTTP `200`, schema check true | Passed |
| Flag-off baseline | Export route returns generic unavailable behavior before auth, query, audit, or delivery | HTTP `404`, `export_unavailable` | Passed |
| Flag-on unauthenticated boundary | Runtime gate opens, but non-staff access is denied before parish scope, query, audit, or delivery | HTTP `401`, `Unauthorized` | Passed |
| Same-parish export | Authenticated staff with active parish membership receives CSV only for approved basic fields | HTTP `200`, CSV content type, approved header, derived same-parish request present | Passed |
| CSV field exclusions | CSV excludes token, note, communication, signed URL, document, Google, and AI markers | Forbidden marker list empty | Passed |
| Blocked-field denial | `fields=request_reference,access_token` is denied generically before query or delivery | HTTP `403` | Passed |
| Cross-parish/forged-cookie denial | Unauthorized active parish cookie is denied generically | HTTP `403` | Passed |
| Family/unauthenticated denial | Family-facing or unauthenticated direct route access is denied | HTTP `401` | Passed |
| Audit metadata | Approved same-parish export writes safe audit metadata | `export.request_list_basic.downloaded`, target `export/request_list_basic`, route id present, preset id present | Passed |
| Audit metadata exclusions | Audit metadata excludes raw CSV, tokens, signed URLs, service role material, document paths, passwords, and internal notes | Forbidden metadata marker list empty | Passed |
| Runtime gate evidence | Audit metadata records the route's gate state | `runtimeGateState=enabled_non_production` | Passed |
| Rollback | Disabling flags returns route to unavailable behavior | Post-rollback health HTTP `200` with schema true; export route HTTP `404`, `export_unavailable` | Passed |

## Sanitized Evidence JSON

```json
{
  "target": "localhost non-production",
  "fixtureDiscovery": {
    "safeStaffMembershipsFound": 3,
    "requestedQaRequestIdUsable": false,
    "sameParishFixtureSource": "derived_from_staff_membership"
  },
  "healthBefore": {
    "status": 200,
    "schemaTrue": true
  },
  "sameParishExport": {
    "status": 200,
    "contentTypeCsv": true,
    "approvedHeader": true,
    "containsSameRequestFixture": true,
    "forbiddenCsvMarkers": []
  },
  "deniedCases": {
    "blockedFieldStatus": 403,
    "crossParishOrForgedCookieStatus": 403,
    "familyOrUnauthenticatedStatus": 401
  },
  "audit": {
    "eventCountAfterSameParishExport": 1,
    "latestTargetType": "export",
    "latestTargetId": "request_list_basic",
    "hasSafeMetadata": true,
    "runtimeGateState": "enabled_non_production",
    "routeIdPresent": true,
    "exportPresetIdPresent": true,
    "forbiddenMetadataMarkers": []
  },
  "rollback": {
    "healthStatus": 200,
    "schemaTrue": true,
    "exportRouteStatus": 404,
    "exportRouteError": "export_unavailable"
  }
}
```

## Commands And Actions Run

- Started local non-production app with export flags off.
- Verified `/api/health`.
- Verified flag-off baseline at `/api/exports/requests/basic`.
- Restarted local non-production app with the exact approved export QA flags.
- Authenticated internally with safe QA staff credentials without printing them.
- Derived a safe same-parish request fixture from active QA staff parish memberships.
- Verified same-parish export success.
- Verified blocked-field denial.
- Verified forged active parish cookie denial.
- Verified unauthenticated/family substitute denial.
- Inspected safe audit metadata with service-role access without printing secrets.
- Stopped flagged local server.
- Restarted local app without export flags and verified rollback.
- Stopped the temporary local server.

## Forbidden Data Review

This evidence does not include:

- Staff passwords.
- Session cookies.
- Supabase service role keys.
- Supabase anon keys.
- Database URLs.
- Google OAuth access or refresh tokens.
- OpenAI API keys.
- Family portal tokens or token hashes.
- Public intake token hashes.
- Signed URL material.
- Raw CSV contents.
- Raw exported request rows.
- Parish IDs.
- Request IDs.
- Internal notes or communication bodies.
- Document storage paths or document contents.
- Sacramental/canonical record details.

## Remaining Risks

- This was a local non-production HTTP smoke, not a hosted preview browser smoke and not a production smoke.
- The stored `QA_REQUEST_ID` fixture is stale and should be refreshed before future export QA.
- No staff-facing production export UI exists.
- Production export flags remain off and are not approved.
- Sensitive exports, document exports, people/household exports, diocesan exports, support break-glass exports, and staff-visible export history remain incomplete.
- Production RLS remains `NO-GO` until explicit approval, production target details, live smoke evidence, monitoring evidence, and rollback readiness are complete.

## Outcome

Current recommendation: `NO-GO FOR PRODUCTION EXPORTS`

Next recommended safe step: prepare a production export readiness packet only after product owner approves production-safe fixture labels, monitoring owner/channel, rollback owner, staff-facing UI boundary, support handling, and production smoke gates.
