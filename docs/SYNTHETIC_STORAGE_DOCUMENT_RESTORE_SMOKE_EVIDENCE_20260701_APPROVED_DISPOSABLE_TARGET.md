# Synthetic Storage/Document Restore Smoke Evidence - 2026-07-01

Smoke result = Passed with sanitized evidence.

Status: Executed against the approved reusable disposable restore target only. Production was not accessed, shared QA was not accessed, real private documents were not accessed, Google Calendar was not touched, email was not called, OpenAI was not called, public intake was not called, external integrations were not called, raw exports were not exposed, raw metadata was not exposed, raw IDs were not recorded, signed URL values were not created or recorded, storage paths were not recorded, original filenames were not recorded, token material was not recorded, private document contents were not recorded, secrets were not exposed, migrations were not applied, operational RLS was not changed, and production runtime behavior was not changed.

Current decision state: `SYNTHETIC STORAGE/DOCUMENT RESTORE SMOKE PASSED AGAINST APPROVED DISPOSABLE TARGET; STRONGER LIMITED NON-PRODUCTION BACKUP/RESTORE WORDING APPROVED; PUBLIC BACKUP/RESTORE CLAIMS REMAIN NO-GO`

Completion marker: `SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET`

Related approval and restore evidence:

- Synthetic storage/document restore smoke approval packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md`
- Storage-excluded restore-readiness decision packet: `docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md`
- Non-production restore-drill disposable database replay and app/auth smoke evidence: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md`
- Backup/restore runbook: `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`
- Trust-center readiness packet: `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- Trust-center evidence gap register: `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`
- Owner review packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`

## Execution Scope

| Item | Result |
|---|---|
| Target | `Approved reusable disposable restore target` |
| App URL | `Local non-production app instance` |
| Approval phrase | `APPROVED_SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE` |
| Fixture type | `Synthetic only` |
| Storage object | `Temporary synthetic storage object` |
| Request document row | `Temporary synthetic document row` |
| Family portal token | `Temporary token used internally but not recorded` |
| Cleanup | `Passed` |

## Sanitized Verification Results

| Check | Result |
|---|---|
| `/api/health` returned HTTP `200` and `checks.schema: true` | `Passed` |
| Private request-documents bucket was available | `Passed` |
| Synthetic storage object upload succeeded | `Passed` |
| Synthetic request document row creation succeeded | `Passed` |
| Staff document manifest/status route returned only safe route payload fields in evidence | `Passed` |
| Cross-parish staff document route denial returned HTTP `404` | `Passed` |
| Direct anonymous storage access returned non-success status | `Passed` |
| Family portal token creation did not expose token hash in evidence | `Passed` |
| Family portal document surface did not expose unsafe markers in evidence | `Passed` |
| Synthetic rows were cleaned up | `Passed` |
| Synthetic storage object was cleaned up | `Passed` |
| Synthetic auth user was cleaned up | `Passed` |

## Sanitized JSON Evidence

```json
{
  "status": "completed",
  "target": {
    "supabaseHost": "approved disposable Supabase host",
    "appBaseUrl": "local non-production app instance",
    "approvedReusableDisposable": true,
    "blockedSharedQa": false
  },
  "fixtures": {
    "staff": "temporary synthetic staff user",
    "activeParish": "temporary synthetic parish A",
    "deniedParish": "temporary synthetic parish B without membership",
    "request": "temporary synthetic baptism request",
    "workflowStep": "temporary synthetic family-facing workflow step",
    "document": "temporary synthetic document row",
    "storageObject": "temporary synthetic storage object",
    "familyPortal": "temporary family portal token used internally but not recorded"
  },
  "checks": [
    { "name": "api_health", "passed": true, "status": 200, "schemaTrue": true },
    { "name": "private_documents_bucket_available", "passed": true },
    { "name": "synthetic_storage_object_uploaded", "passed": true },
    { "name": "synthetic_request_document_row_created", "passed": true },
    { "name": "staff_document_manifest_safe", "passed": true, "status": 200 },
    { "name": "cross_parish_staff_document_denial", "passed": true, "status": 404 },
    { "name": "direct_anonymous_storage_denied", "passed": true, "status": 400 },
    { "name": "family_portal_token_create_without_hash_exposure", "passed": true, "status": 200 },
    { "name": "family_portal_document_surface_safe", "passed": true, "status": 200 }
  ],
  "exclusions": {
    "productionAccessed": false,
    "sharedQaAccessed": false,
    "realPrivateDocumentsAccessed": false,
    "signedUrlsCreated": false,
    "signedUrlValuesPrinted": false,
    "storagePathsPrinted": false,
    "originalFilenamesPrinted": false,
    "googleCalendarTouched": false,
    "externalIntegrationsCalled": false,
    "rawExportsExposed": false,
    "rawMetadataExposed": false,
    "rawIdsPrinted": false,
    "secretsPrinted": false,
    "operationalRlsChanged": false,
    "migrationsApplied": false
  },
  "cleanup": {
    "authUserDeleted": true,
    "syntheticRowsDeleted": true,
    "syntheticStorageObjectDeleted": true,
    "errors": []
  }
}
```

## What This Evidence Supports

This evidence supports the following limited internal claim:

> Vinea has completed a non-production disposable database replay, app/auth smoke, and synthetic storage/document smoke against an approved disposable target. The synthetic storage/document smoke verified a private document bucket, synthetic storage object upload, synthetic request document row creation, staff document manifest safety, cross-parish document denial, direct anonymous storage denial, family portal document-surface safety, and cleanup.

## What This Evidence Does Not Support

Do not claim:

- Production backup/restore readiness is complete.
- Real parish document restore has been tested.
- Production storage restore has been tested.
- Production signed URL safety has been tested.
- Production RPO/RTO has been measured.
- Public backup/restore trust-center claims are approved.
- Formal compliance, certification, or audit status exists.

## Remaining Follow-Up

- Product owner, backup/restore owner, and security/data owner approved stronger limited non-production wording in `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`.
- Public backup/restore trust-center claims remain `NO-GO`.
- Production RLS, production exports, production monitoring, retention approval, and incident-response drill evidence remain separate blockers.

## What Changed Plain English

Vinea ran a fake-document restore smoke in the safe disposable environment. The test created a temporary fake document object and matching request-document row, confirmed staff could see the safe document status, confirmed another parish was denied, confirmed anonymous storage access did not work, confirmed the family portal stayed safe, and cleaned everything up.

## Final Outcome

- Current outcome: `Synthetic storage/document restore smoke passed against approved disposable target`
- Current storage restore claim: `LIMITED NON-PRODUCTION DATABASE REPLAY, APP/AUTH SMOKE, AND SYNTHETIC DOCUMENT-STORAGE SMOKE ONLY; PRODUCTION AND REAL DOCUMENT RESTORE CLAIMS REMAIN NO-GO`
- Current public trust-center decision: `NO-GO`
