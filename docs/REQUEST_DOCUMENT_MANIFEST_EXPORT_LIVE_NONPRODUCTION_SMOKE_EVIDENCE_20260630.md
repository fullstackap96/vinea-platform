# Request Document Manifest Export Live Non-Production Smoke Evidence - 2026-06-30

Status: Completed as a live non-production HTTP smoke against the local Vinea app target only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated beyond the approved safe export audit metadata, and no secrets were exposed.

Current decision: `REQUEST DOCUMENT MANIFEST LIVE NON-PRODUCTION SMOKE PASSED, PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260630`

## Approved Scope

- Route under smoke: `/api/exports/requests/documents/manifest`
- Export preset: `request_document_manifest`
- App target: `localhost non-production`
- Runtime flags used only in the local non-production dev server:
  - `VINEA_EXPORT_RUNTIME=ENABLED`
  - `VINEA_EXPORT_RUNTIME_ACK=APPROVED_EXPORT_RUNTIME_QA`
  - `VINEA_EXPORT_RUNTIME_ENV=NON_PRODUCTION`
- Rollback owner: `Codex local QA operator`
- Rollback method: stop the flagged local dev server, restart without export flags, and verify the route returns generic unavailable behavior.

## Fixture Handling

- Safe staff fixture: existing non-production QA staff environment values were used internally and were not printed.
- Same-parish document manifest fixture: the smoke derived safe same-parish requests, workflow steps, and request-document metadata from the QA staff account's active parish memberships.
- Cross-parish denial fixture: used a forged unauthorized active parish cookie against the authenticated QA staff session to verify generic cross-parish/unauthorized parish denial.
- Family-portal denial method: used unauthenticated direct route access as the safe family-facing substitute.
- No staff passwords, session cookies, Supabase service role keys, auth tokens, parish IDs, request IDs, raw CSV contents, document paths, signed URLs, original filenames, or family portal tokens were recorded.

## Smoke Results

| Gate | Expected result | Evidence result | Status |
|---|---|---|---|
| Pre-smoke health | `/api/health` returns `checks.schema: true` | HTTP `200`, schema check true | Passed |
| Flag-off baseline | Export route returns generic unavailable behavior before auth, query, audit, or delivery | HTTP `404`, `export_unavailable` | Passed |
| Flag-on unauthenticated boundary | Runtime gate opens, but non-staff access is denied before parish scope, query, audit, or delivery | HTTP `401` | Passed |
| Same-parish manifest export | Authenticated staff with active parish membership receives manifest CSV only for approved fields | HTTP `200`, CSV content type, approved header, 174 rows including header | Passed |
| CSV field exclusions | CSV excludes signed URL, storage path, original filename, token, note, communication, AI, Google, file-content, and sacramental/canonical markers | Forbidden marker list empty | Passed |
| Blocked-field denial | `fields=request_reference,signed_url` is denied generically before query or delivery | HTTP `403` | Passed |
| Storage-path field denial | `fields=request_reference,storage_path` is denied generically before query or delivery | HTTP `403` | Passed |
| Cross-parish/forged-cookie denial | Unauthorized active parish cookie is denied generically | HTTP `403` | Passed |
| Family/unauthenticated denial | Family-facing or unauthenticated direct route access is denied | HTTP `401` | Passed |
| Audit metadata | Approved same-parish export writes safe audit metadata | `export.request_document_manifest.downloaded`, target `export/request_document_manifest`, route id present, preset id present | Passed |
| Audit metadata exclusions | Audit metadata excludes raw CSV, tokens, signed URLs, storage paths, original filenames, service role material, document paths, passwords, notes, communications, AI material, and sacramental/canonical markers | Forbidden metadata marker list empty | Passed |
| Runtime gate evidence | Audit metadata records the route's gate state | `runtimeGateState=enabled_non_production` | Passed |
| Storage/file API safety | Route source does not call signed URL, storage, or file download APIs | No `createSignedUrl`, `storage.from`, or `.download(` usage | Passed |
| Rollback | Disabling flags returns route to unavailable behavior | Post-rollback health HTTP `200` with schema true; export route HTTP `404`, `export_unavailable` | Passed |

## Safety Fix During Smoke

The first flag-on smoke attempt correctly caught that a broad same-parish manifest could include a request type containing a sacramental/canonical marker. The route was tightened before completing the smoke:

- Any manifest row containing sacramental/canonical markers in approved CSV fields is now excluded from the pilot export.
- Focused route tests now include a deliberately restricted request/document row and prove it does not appear in the manifest CSV.
- The completed smoke confirmed the final CSV and audit metadata contain no sacramental/canonical markers.

## Sanitized Evidence JSON

```json
{
  "target": "local-dev-non-production-http-smoke",
  "route": "/api/exports/requests/documents/manifest",
  "productionTouched": false,
  "migrationsApplied": false,
  "operationalRlsChanged": false,
  "googleCalendarTouched": false,
  "flagOff": {
    "mode": "flagoff",
    "healthStatus": 200,
    "schemaTrue": true,
    "exportRouteStatus": 404,
    "exportRouteError": "export_unavailable"
  },
  "flagOn": {
    "mode": "flagon",
    "healthStatus": 200,
    "schemaTrue": true,
    "fixtureDiscovery": {
      "safeStaffMembershipsFound": 3,
      "sameParishRequestsFound": 37,
      "sameParishWorkflowStepsFound": 189,
      "sameParishDocumentsFound": 5,
      "documentFixtureSource": "derived_from_same_parish_request_documents"
    },
    "unauthenticatedStatus": 401,
    "sameParishManifest": {
      "status": 200,
      "contentTypeCsv": true,
      "approvedHeader": true,
      "rowCountIncludingHeader": 174,
      "forbiddenCsvMarkers": []
    },
    "deniedCases": {
      "blockedSignedUrlFieldStatus": 403,
      "blockedStoragePathFieldStatus": 403,
      "crossParishOrForgedCookieStatus": 403,
      "familyOrUnauthenticatedStatus": 401
    },
    "audit": {
      "latestTargetType": "export",
      "latestTargetId": "request_document_manifest",
      "action": "export.request_document_manifest.downloaded",
      "hasSafeMetadata": true,
      "runtimeGateState": "enabled_non_production",
      "routeIdPresent": true,
      "exportPresetIdPresent": true,
      "forbiddenMetadataMarkers": []
    },
    "noSignedUrlStorageOrFileApiUsage": true
  },
  "rollback": {
    "mode": "flagoff",
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
- Verified flag-off baseline at `/api/exports/requests/documents/manifest`.
- Restarted local non-production app with the exact approved export QA flags.
- Authenticated internally with safe QA staff credentials without printing them.
- Derived safe same-parish request, workflow-step, and request-document fixtures from active QA staff parish memberships.
- Verified same-parish manifest CSV success.
- Verified blocked signed URL field denial.
- Verified blocked storage path field denial.
- Verified forged active parish cookie denial.
- Verified unauthenticated/family substitute denial.
- Inspected safe audit metadata with service-role access without printing secrets.
- Verified the route source contains no signed URL, storage, or download API usage.
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
- Raw exported request/document rows.
- Parish IDs.
- Request IDs.
- Original filenames.
- Document storage paths or document contents.
- Internal notes or communication bodies.
- AI material.
- Sacramental/canonical record details.

## Remaining Risks

- This was a local non-production HTTP smoke, not a hosted preview browser smoke and not a production smoke.
- The smoke used derived non-production fixtures because the approval prompt still contained non-secret placeholder fixture labels.
- Production export flags remain off and are not approved.
- No staff-facing production export UI exists.
- Bulk document file export remains disabled and unapproved.
- Sensitive exports, document file exports, people/household exports, diocesan exports, support break-glass exports, and staff-visible export history remain incomplete.
- Production RLS remains `NO-GO` until explicit approval, production target details, live smoke evidence, monitoring evidence, and rollback readiness are complete.

## Outcome

Current recommendation: `NO-GO FOR PRODUCTION EXPORTS`

Next recommended safe step: prepare a production readiness approval packet for `request_document_manifest` only after product owner approves production-safe fixture labels, monitoring owner/channel, rollback owner, support handling, staff-facing UI boundary, and production smoke gates.
