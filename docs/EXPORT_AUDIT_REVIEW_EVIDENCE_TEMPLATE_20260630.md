# Vinea Export Audit Review Evidence Template - 2026-06-30

Status: Evidence template prepared only. Production was not accessed, production export flags were not enabled, no staff-facing production UI was added, no migrations were applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this template.

This template supports `docs/EXPORT_AUDIT_REVIEW_RUNBOOK_20260630.md`. It is not approval to enable production exports, not legal advice, not automated monitoring, and not a customer-facing trust-center claim.

Current decision state: `EXPORT AUDIT REVIEW EVIDENCE TEMPLATE PREPARED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEW_EVIDENCE_TEMPLATE_20260630`

## Review Identity

- Evidence record id: `[FILL: non-secret evidence id]`
- Environment: `[FILL: non-production, shared QA, staging, or approved production smoke window]`
- App URL label: `[FILL: label only; no credentials]`
- Supabase project label: `[FILL: label only; no database URL]`
- Export route id: `[FILL: request_list_basic, request_document_manifest, or future approved route id]`
- Review type: `[FILL: non-production smoke, production smoke, suspicious denial review, incident follow-up, or routine review]`
- Reviewer: `[FILL: reviewer name]`
- Monitoring owner: `[FILL: owner label]`
- Monitoring channel: `[FILL: channel label only]`
- Rollback owner: `[FILL: owner label]`
- Review started at: `[FILL: timestamp and timezone]`
- Review completed at: `[FILL: timestamp and timezone]`

## Approval And Boundary Check

- Production access approved for this review: `[FILL: yes/no/not applicable]`
- Export runtime flags before review: `[FILL: flag names only, no secret values]`
- Export runtime flags after review: `[FILL: flag names only, no secret values]`
- Production export approval reference: `[FILL: approval id or NOT_APPLICABLE_NON_PRODUCTION]`
- Rollback deadline: `[FILL: timestamp or NOT_APPLICABLE_NON_PRODUCTION]`
- Confirm no unapproved production flags were enabled: `[FILL: pass/fail]`
- Confirm no staff-facing production UI was added: `[FILL: pass/fail]`
- Confirm no migrations were applied: `[FILL: pass/fail]`
- Confirm operational RLS was not changed: `[FILL: pass/fail]`
- Confirm Google Calendar data was not touched: `[FILL: pass/fail]`
- Confirm records were not mutated beyond approved safe audit metadata: `[FILL: pass/fail]`

## Fixture And Scope Summary

- Staff fixture label: `[FILL: non-secret label]`
- Active parish label/id: `[FILL: non-secret label or approved id]`
- Parish ids included in export audit event: `[FILL: count or approved labels only]`
- Same-parish request fixture label: `[FILL: non-secret label]`
- Cross-parish denied fixture label: `[FILL: non-secret label or route-level denial substitute]`
- Family/unauthenticated denial method: `[FILL: label only]`
- Blocked-field attempt label: `[FILL: label only]`
- Export reason label, if required: `[FILL: label only or NOT_REQUIRED]`

## Audit Event Review

Record safe audit-event metadata only. Do not paste raw CSV rows, document contents, storage paths, signed URLs, original filenames, portal tokens, token hashes, notes, communications, AI prompts, AI outputs, or credentials.

| Check | Expected | Actual | Pass/Fail | Evidence note |
|---|---|---|---|---|
| `event_type` present | `export.<route_id>.<result>` | `[FILL]` | `[FILL]` | `[FILL]` |
| Staff user id present | non-secret id or redacted id label | `[FILL]` | `[FILL]` | `[FILL]` |
| Active parish id present | selected active parish | `[FILL]` | `[FILL]` | `[FILL]` |
| Parish ids included | same parish only unless separately approved | `[FILL]` | `[FILL]` | `[FILL]` |
| Export type present | route id | `[FILL]` | `[FILL]` | `[FILL]` |
| Target object scope present | request/list/document manifest scope | `[FILL]` | `[FILL]` | `[FILL]` |
| Requested fields safe | route allowlist only | `[FILL]` | `[FILL]` | `[FILL]` |
| Blocked fields handled | denied before query/delivery | `[FILL]` | `[FILL]` | `[FILL]` |
| Row count reasonable | approved fixture range | `[FILL]` | `[FILL]` | `[FILL]` |
| Route scope source present | active parish/membership/object check | `[FILL]` | `[FILL]` | `[FILL]` |
| Created timestamp present | timestamp recorded | `[FILL]` | `[FILL]` | `[FILL]` |
| No secret/file material | no credential, token, signed URL, storage path, original filename, or raw file content | `[FILL]` | `[FILL]` | `[FILL]` |

## Expected Allow And Deny Event Summary

- Flag-off baseline result: `[FILL: unavailable/denied/pass/fail]`
- Same-parish success event count: `[FILL: count only]`
- Cross-parish denial event count: `[FILL: count only]`
- Blocked-field denial event count: `[FILL: count only]`
- Family/unauthenticated denial event count: `[FILL: count only]`
- Unexpected delivery event count: `[FILL: count only; must be zero unless separately explained]`
- Post-rollback downloaded event count: `[FILL: count only; must be zero]`

## Suspicious Pattern Review

Mark each as pass/fail and explain failures without exposing secrets.

- No export delivery event outside the approved window: `[FILL]`
- No export delivery while flags were expected to be off: `[FILL]`
- No export delivery from family portal, anonymous, or unauthenticated context: `[FILL]`
- No cross-parish request included in same-parish export: `[FILL]`
- No parish id outside staff active memberships: `[FILL]`
- No signed URL, storage path, original filename, token, note, communication, AI material, or sacramental/canonical detail in `request_document_manifest`: `[FILL]`
- No repeated suspicious denied attempts requiring escalation: `[FILL]`
- No unusually high row count compared with approved fixture: `[FILL]`
- No malformed audit event missing staff, active parish, export type, requested fields, route scope source, or timestamp: `[FILL]`
- No credential-shaped material in audit metadata: `[FILL]`

## Escalation Decision

- Severity classification: `[FILL: none, severity 3, severity 2, severity 1]`
- Escalation required: `[FILL: yes/no]`
- Incident response runbook invoked: `[FILL: yes/no/not applicable]`
- Incident commander notified: `[FILL: label only or NOT_APPLICABLE]`
- Technical lead notified: `[FILL: label only or NOT_APPLICABLE]`
- Security/data owner notified: `[FILL: label only or NOT_APPLICABLE]`
- Support owner notified: `[FILL: label only or NOT_APPLICABLE]`
- Customer communication required: `[FILL: yes/no/not applicable]`
- Follow-up issue/link: `[FILL: non-secret reference or NOT_APPLICABLE]`

## Rollback Verification

- Flags disabled or returned to baseline: `[FILL: pass/fail]`
- Flag-off route response verified: `[FILL: unavailable/denied/pass/fail]`
- No new `*.downloaded` export audit events after rollback: `[FILL: pass/fail]`
- Monitoring owner confirms review window complete: `[FILL: pass/fail]`
- Rollback owner sign-off: `[FILL: name and timestamp]`

## Evidence Storage And Redaction

- Evidence storage location label: `[FILL: non-secret location label]`
- Raw exports stored: `NO_UNLESS_SEPARATELY_APPROVED`
- Screenshots redacted: `[FILL: yes/no/not applicable]`
- CSV/file contents excluded: `[FILL: pass/fail]`
- Tokens and signed URLs excluded: `[FILL: pass/fail]`
- Original filenames and storage paths excluded: `[FILL: pass/fail]`
- Notes, communications, AI material, and sacramental/canonical details excluded: `[FILL: pass/fail]`
- Credentials and connection strings excluded: `[FILL: pass/fail]`

## Final Outcome

- Review outcome: `[FILL: pass, pass with follow-up, blocked, escalated, rollback required]`
- Remaining risks: `[FILL: non-secret summary]`
- Required follow-up before next approval: `[FILL: non-secret summary]`
- Final reviewer sign-off: `[FILL: name and timestamp]`
- Product owner sign-off required before production export progression: `[FILL: yes/no]`

## Sanitized JSON Evidence Skeleton

```json
{
  "evidenceRecordId": "FILL_NON_SECRET_LABEL",
  "environment": "FILL_NON_SECRET_LABEL",
  "exportRouteId": "request_document_manifest",
  "reviewType": "FILL_NON_SECRET_LABEL",
  "productionExportsRemainNoGo": true,
  "runtimeBehaviorChanged": false,
  "migrationsApplied": false,
  "operationalRlsChanged": false,
  "recordsMutatedBeyondAuditMetadata": false,
  "auditEventSummary": {
    "downloadedEvents": "FILL_COUNT_ONLY",
    "deniedEvents": "FILL_COUNT_ONLY",
    "unexpectedDeliveryEvents": "FILL_COUNT_ONLY",
    "postRollbackDownloadedEvents": "FILL_COUNT_ONLY"
  },
  "secretMaterialExcluded": true,
  "fileMaterialExcluded": true,
  "signedUrlMaterialExcluded": true,
  "storagePathMaterialExcluded": true,
  "originalFilenameMaterialExcluded": true,
  "aiMaterialExcluded": true,
  "sacramentalCanonicalDetailExcluded": true,
  "severity": "none",
  "rollbackVerified": "FILL_PASS_FAIL",
  "finalOutcome": "FILL_NON_SECRET_LABEL"
}
```
