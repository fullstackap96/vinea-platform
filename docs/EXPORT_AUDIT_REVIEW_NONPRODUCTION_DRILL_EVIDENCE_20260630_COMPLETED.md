# Vinea Export Audit Review Non-Production Drill Evidence - 2026-06-30

Status: Completed as a live non-production export audit review drill against the local Vinea app backed by shared QA Supabase. Production was not accessed, production export flags were not enabled, staff-facing production export UI was not added, migrations were not applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated beyond approved safe export audit metadata, and no secrets were exposed.

Current decision state: `EXPORT AUDIT REVIEW NON-PRODUCTION DRILL PASSED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_EVIDENCE_20260630_COMPLETED`

## Review Identity

- Evidence record id: `EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_20260630`
- Environment: `local non-production app backed by shared QA Supabase`
- App URL label: `localhost non-production`
- Supabase project label: `shared QA Supabase`
- Export route ids:
  - `request_list_basic`
  - `request_document_manifest`
- Review type: `non-production export audit review drill`
- Reviewer: `Codex local QA operator`
- Monitoring owner: `Codex local QA operator`
- Rollback owner: `Codex local QA operator`
- Review started at: `2026-07-01T00:19:15.555Z`
- Review completed at: `2026-07-01T00:19:32.894Z`

## Approval And Boundary Check

- Production access approved for this review: `no`
- Export runtime flags before review: `off`
- Export runtime flags during review:
  - `VINEA_EXPORT_RUNTIME`
  - `VINEA_EXPORT_RUNTIME_ACK`
  - `VINEA_EXPORT_RUNTIME_ENV`
- Export runtime flags after review: `off`
- Production export approval reference: `NOT_APPLICABLE_NON_PRODUCTION`
- Confirm no unapproved production flags were enabled: `pass`
- Confirm no staff-facing production UI was added: `pass`
- Confirm no migrations were applied: `pass`
- Confirm operational RLS was not changed: `pass`
- Confirm Google Calendar data was not touched: `pass`
- Confirm records were not mutated beyond approved safe audit metadata: `pass`

## Fixture And Scope Summary

- Staff fixture label: `Existing non-production QA staff environment values, not printed`
- Active parish label/id: `Derived active parish with display name`
- Safe staff memberships found: `3`
- Same-parish request fixture label: `derived_from_staff_membership`
- Same-parish requests found: `37`
- Same-parish workflow steps found: `189`
- Same-parish documents found: `5`
- Document set label: `derived_from_same_parish_request_documents`
- Cross-parish denied fixture label: `forged_unauthorized_active_parish_cookie`
- Family/unauthenticated denial method: `unauthenticated_direct_route_access`
- Blocked-field attempt label:
  - `request_list_basic denied sensitive-field pattern`
  - `request_document_manifest denied signed-link pattern`
  - `request_document_manifest denied storage-location pattern`

## Drill Results

| Gate | Expected | Actual | Pass/Fail | Evidence note |
|---|---|---|---|---|
| Pre-drill health | `/api/health` returns `checks.schema: true` | HTTP `200`, schema true | Pass | Verified before flag-off, flag-on, and rollback phases |
| Flag-off request-list baseline | Route unavailable before auth/query/audit/delivery | HTTP `404`, `export_unavailable` | Pass | Runtime flags off |
| Flag-off document-manifest baseline | Route unavailable before auth/query/audit/delivery | HTTP `404`, `export_unavailable` | Pass | Runtime flags off |
| Flag-on unauthenticated request-list boundary | Non-staff denied before delivery | HTTP `401` | Pass | Family-facing substitute |
| Flag-on unauthenticated document-manifest boundary | Non-staff denied before delivery | HTTP `401` | Pass | Family-facing substitute |
| Same-parish request-list export | CSV delivered only for approved fields | HTTP `200`, approved header, 38 rows including header | Pass | Raw CSV not stored in evidence |
| Same-parish document-manifest export | Manifest CSV delivered only for approved fields | HTTP `200`, approved header, 174 rows including header | Pass | Raw manifest not stored in evidence |
| Request-list blocked-field attempt | Denied before query/delivery | HTTP `403` | Pass | Sensitive field pattern denied |
| Document-manifest signed-link field attempt | Denied before query/delivery | HTTP `403` | Pass | Signed-link field pattern denied |
| Document-manifest storage-location field attempt | Denied before query/delivery | HTTP `403` | Pass | Storage-location field pattern denied |
| Request-list forged active parish cookie | Denied generically | HTTP `403` | Pass | Unauthorized parish cookie rejected |
| Document-manifest forged active parish cookie | Denied generically | HTTP `403` | Pass | Unauthorized parish cookie rejected |
| CSV field exclusions | No secret/file/internal markers | Forbidden marker list empty | Pass | Checked in memory only |
| Audit metadata | Safe downloaded audit metadata exists | 2 downloaded events | Pass | One per approved export route |
| Denied audit metadata | Safe denied audit metadata exists for denial paths | 7 denied events | Pass | Blocked-field, forged active-parish, and unauthenticated/family-substitute paths |
| Audit metadata exclusions | No secret/file/internal markers | Forbidden marker list empty | Pass | Checked metadata only |
| Rollback | Flags disabled and routes unavailable | Both routes HTTP `404`, `export_unavailable` | Pass | Post-rollback downloaded event count `0` |

## Audit Event Review

Record safe audit-event metadata only. Raw CSV rows, document contents, storage paths, signed URLs, original filenames, portal tokens, token hashes, notes, communications, AI prompts, AI outputs, and credentials were not captured.

| Check | Expected | Actual | Pass/Fail | Evidence note |
|---|---|---|---|---|
| Downloaded event count | One approved success event per route | `2` | Pass | `request_list_basic` and `request_document_manifest` |
| Denied event count | Denied audit metadata for blocked-field, forged active-parish, and unauthenticated/family-substitute paths | `7` | Pass | No forbidden field names, storage/file markers, or token material copied |
| Staff user id present | Safe audit metadata includes staff context | Present in route-owned audit metadata | Pass | Raw id not copied |
| Active parish id present | Selected active parish | Present in route-owned audit metadata | Pass | Raw id not copied |
| Parish ids included | Same parish only unless separately approved | Same-parish scope only | Pass | Derived from active parish membership |
| Export type present | Route id and preset id | Present | Pass | Both export route ids and presets present |
| Blocked fields handled | Denied before query/delivery | HTTP `403` | Pass | No delivery occurred |
| Route scope source present | Active parish/membership/object checks | Present in route-owned metadata | Pass | Checked via sanitized marker review |
| No secret/file material | No credential, token, signed URL, storage path, original filename, or raw file content | Forbidden marker list empty | Pass | Metadata checked as sanitized JSON |

## Expected Allow And Deny Event Summary

- Flag-off baseline result: `unavailable`
- Same-parish success event count: `2`
- Cross-parish denial event count: `2 audit events; HTTP denials verified`
- Blocked-field denial event count: `3 audit events; HTTP denials verified`
- Family/unauthenticated denial event count: `2 audit events; HTTP denials verified`
- Unexpected delivery event count: `0`
- Post-rollback downloaded event count: `0`
- Post-rollback denied event count: `0`

## Suspicious Pattern Review

- No export delivery event outside the approved window: `pass`
- No export delivery while flags were expected to be off: `pass`
- No export delivery from family portal, anonymous, or unauthenticated context: `pass`
- No cross-parish request included in same-parish export: `pass`
- No parish id outside staff active memberships: `pass`
- No signed URL, storage path, original filename, token, note, communication, AI material, or sacramental/canonical detail in `request_document_manifest`: `pass`
- No repeated suspicious denied attempts requiring escalation: `pass`
- No unusually high row count compared with approved fixture: `pass`
- No malformed downloaded audit event missing route/preset/gate metadata: `pass`
- No malformed denied audit event missing route/preset/gate metadata: `pass`
- No credential-shaped material in audit metadata: `pass`
- Denied export audit events present: `pass`

## Escalation Decision

- Severity classification: `none`
- Escalation required: `no`
- Incident response runbook invoked: `not applicable`
- Customer communication required: `not applicable`
- Follow-up issue/link: `None for denied export audit logging in non-production; production exports remain NO-GO`

## Rollback Verification

- Flags disabled or returned to baseline: `pass`
- Flag-off route response verified: `unavailable`
- No new `*.downloaded` export audit events after rollback: `pass`
- No new `*.denied` export audit events after rollback: `pass`
- Monitoring owner confirms review window complete: `pass`
- Rollback owner sign-off: `Codex local QA operator, 2026-07-01T00:19:32.894Z`

## Evidence Storage And Redaction

- Evidence storage location label: `repository docs and sanitized local output artifact`
- Raw exports stored: `NO`
- Screenshots redacted: `not applicable`
- CSV/file contents excluded: `pass`
- Tokens and signed URLs excluded: `pass`
- Original filenames and storage paths excluded: `pass`
- Notes, communications, AI material, and sacramental/canonical details excluded: `pass`
- Credentials and connection strings excluded: `pass`

## Sanitized JSON Evidence

```json
{
  "evidenceRecordId": "EXPORT_AUDIT_REVIEW_NONPRODUCTION_DRILL_20260630",
  "environment": "local non-production app backed by shared QA Supabase",
  "productionTouched": false,
  "productionFlagsEnabled": false,
  "productionUiAdded": false,
  "migrationsApplied": false,
  "operationalRlsChanged": false,
  "googleCalendarTouched": false,
  "recordsMutatedBeyondAuditMetadata": false,
  "secretsPrinted": false,
  "runtimeFlagsUsed": [
    "VINEA_EXPORT_RUNTIME",
    "VINEA_EXPORT_RUNTIME_ACK",
    "VINEA_EXPORT_RUNTIME_ENV"
  ],
  "fixtureDiscovery": {
    "safeStaffFixture": "Existing non-production QA staff environment values, not printed",
    "safeStaffMembershipsFound": 3,
    "safeActiveParishFixture": "Derived active parish with display name",
    "sameParishRequestFixture": "derived_from_staff_membership",
    "sameParishRequestsFound": 37,
    "sameParishWorkflowStepsFound": 189,
    "sameParishDocumentsFound": 5,
    "documentFixtureSource": "derived_from_same_parish_request_documents",
    "crossParishDeniedFixture": "forged_unauthorized_active_parish_cookie",
    "familyOrUnauthenticatedDenialMethod": "unauthenticated_direct_route_access"
  },
  "flagOffBaseline": {
    "health": { "status": 200, "schemaTrue": true },
    "requestListStatus": 404,
    "requestListError": "export_unavailable",
    "documentManifestStatus": 404,
    "documentManifestError": "export_unavailable"
  },
  "flagOn": {
    "health": { "status": 200, "schemaTrue": true },
    "unauthenticated": {
      "requestListStatus": 401,
      "documentManifestStatus": 401
    },
    "requestListBasic": {
      "status": 200,
      "contentTypeCsv": true,
      "approvedHeader": true,
      "rowCountIncludingHeader": 38,
      "forbiddenCsvMarkers": []
    },
    "requestDocumentManifest": {
      "status": 200,
      "contentTypeCsv": true,
      "approvedHeader": true,
      "rowCountIncludingHeader": 174,
      "forbiddenCsvMarkers": []
    },
    "deniedCases": {
      "blockedFieldStatus": 403,
      "blockedSignedUrlFieldStatus": 403,
      "blockedStoragePathFieldStatus": 403,
      "forgedCookieRequestListStatus": 403,
      "forgedCookieDocumentManifestStatus": 403,
      "familyOrUnauthenticatedRequestListStatus": 401,
      "familyOrUnauthenticatedDocumentManifestStatus": 401
    },
    "audit": {
      "eventCount": 9,
      "downloadedEvents": 2,
      "deniedEvents": 7,
      "latestActions": [
        "export.request_document_manifest.denied",
        "export.request_list_basic.denied",
        "export.request_document_manifest.downloaded",
        "export.request_list_basic.downloaded"
      ],
      "latestTargetIds": [
        "request_document_manifest",
        "request_list_basic"
      ],
      "hasRuntimeGateState": true,
      "routeIdPresent": true,
      "exportPresetIdPresent": true,
      "forbiddenMetadataMarkers": []
    }
  },
  "rollback": {
    "health": { "status": 200, "schemaTrue": true },
    "requestListStatus": 404,
    "requestListError": "export_unavailable",
    "documentManifestStatus": 404,
    "documentManifestError": "export_unavailable",
    "postRollbackDownloadedEvents": 0,
    "postRollbackDeniedEvents": 0,
    "flagsDisabled": true
  },
  "finalOutcome": "pass",
  "followUp": "Denied export audit events were present for blocked-field, forged active-parish, and unauthenticated/family-substitute denial paths.",
  "productionExportsRemainNoGo": true
}
```

## Final Outcome

- Review outcome: `pass`
- Remaining risks:
  - Production exports remain `NO-GO`.
  - Staff-facing production export UI remains unapproved.
  - Production-specific export runtime gate implementation remains unapproved.
- Required follow-up before next approval:
  - Keep production exports disabled until explicit production approval, production-safe fixtures, production runtime gate implementation, monitoring owner/channel, rollback owner, and production smoke evidence are complete.
- Final reviewer sign-off: `Codex local QA operator, 2026-07-01T00:19:32.894Z`
- Product owner sign-off required before production export progression: `yes`
