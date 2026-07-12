# Export Audit Reviewer API Live Non-Production Smoke Evidence - 2026-07-01 - Completed

Status: Completed as a live non-production HTTP smoke against the local Vinea app backed by shared QA Supabase. Production was not accessed, production flags were not enabled, dashboard UI was not added, migrations were not applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, and no secrets were exposed.

Current outcome: `LIVE NON-PRODUCTION EXPORT AUDIT REVIEWER API SMOKE PASSED; PRODUCTION EXPORTS REMAIN NO-GO`

Completion marker: `EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_COMPLETED_20260701`

## Review Identity

- Evidence record id: `EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_20260701`
- Environment: `local non-production app backed by shared QA Supabase`
- App target label: `localhost non-production`
- Configured app URL label: `NON_PRODUCTION_APP_URL local target, value not printed`
- Route under smoke: `/api/export-audit-reviewer`
- Reviewer: `Codex local QA operator`
- Monitoring owner: `Codex local QA operator`
- Rollback owner: `Codex local QA operator`
- Review started at: `2026-07-01T15:44:42.409Z`
- Review completed at: `2026-07-01T15:44:59.718Z`

## Approval And Boundary Check

- Production access approved for this review: `no`
- Reviewer prototype flags before review: `off`
- Reviewer prototype flags during review:
  - `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE`
  - `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK`
  - `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV`
- Reviewer prototype flags after review: `off`
- Production export approval reference: `NOT_APPLICABLE_NON_PRODUCTION`
- Confirm no production flags were enabled: `pass`
- Confirm no dashboard UI was added: `pass`
- Confirm no migrations were applied: `pass`
- Confirm operational RLS was not changed: `pass`
- Confirm Google Calendar data was not touched: `pass`
- Confirm records were not mutated: `pass`
- Confirm storage was not accessed: `pass`
- Confirm signed URLs were not created: `pass`
- Confirm raw exports were not exposed: `pass`
- Confirm secrets were not printed: `pass`

## Filled Non-Secret Fixture Labels

- Staff fixture label: `Existing non-production QA staff environment values, not printed`
- Active parish fixture label: `Derived active parish with display name`
- Safe staff memberships found: `3`
- Approved export audit events found for selected parish: `10`
- Downloaded request-list event fixture: `Prior non-production export drill event: export.request_list_basic.downloaded`
- Denied request-list event fixture: `Prior non-production export drill event: export.request_list_basic.denied`
- Downloaded document-manifest event fixture: `Prior non-production export drill event: export.request_document_manifest.downloaded`
- Denied document-manifest event fixture: `Prior non-production export drill event: export.request_document_manifest.denied`
- Cross-parish denial fixture: `forged_unauthorized_active_parish_cookie`
- Family/unauthenticated denial method: `unauthenticated_direct_route_access`

## Smoke Results

| Gate | Expected | Actual | Pass/Fail | Evidence note |
|---|---|---|---|---|
| Flag-off health | `/api/health` returns `checks.schema: true` | HTTP `200`, schema true | Pass | Verified before enabling reviewer flags |
| Flag-off reviewer baseline | Reviewer unavailable before auth or data reads | HTTP `404`, `export_audit_reviewer_unavailable` | Pass | Prototype flags off |
| Flag-on health | `/api/health` returns `checks.schema: true` | HTTP `200`, schema true | Pass | Verified after enabling non-production reviewer flags |
| Staff authentication boundary | Unauthenticated/family substitute denied before data reads | HTTP `401` | Pass | No parish scope or audit rows returned |
| Selected active parish membership scope | Authenticated staff gets selected-parish reviewer summary only | HTTP `200`, `scopeSource: membership` | Pass | Active parish selected through safe staff cookie |
| Saved filter: all | Reviewer returns safe read-model summary | HTTP `200`, `rowCount: 10` | Pass | JSON only; no raw exports |
| Saved filter: downloaded | Downloaded export events are filterable | HTTP `200`, `rowCount: 7` | Pass | `exports_downloaded_recent` |
| Saved filter: denied | Denied export events are filterable | HTTP `200`, `rowCount: 3` | Pass | `exports_denied_recent` |
| Saved filter: document manifest | Document-manifest events are filterable | HTTP `200`, `rowCount: 6` | Pass | `document_manifest_safety_review` |
| Saved filter: request list | Request-list events are filterable | HTTP `200`, `rowCount: 4` | Pass | `request_list_basic_safety_review` |
| Forged active parish denial | Unauthorized active parish cookie denied generically | HTTP `403` | Pass | Generic unavailable message; no cross-parish rows |
| Forbidden data exclusions | No token/file/internal markers in responses | Empty forbidden marker list | Pass | Checked serialized route summaries |
| No storage or signed URL usage | Reviewer does not create file access | No storage access, signed URLs, or raw exports | Pass | Route remained audit-events read-only |
| No export delivery audit mutation | Reviewer route writes no export delivery audit events | New approved export event count `0` | Pass | Checked after route calls |
| Rollback health | `/api/health` returns `checks.schema: true` after flags off | HTTP `200`, schema true | Pass | Verified after disabling flags |
| Rollback reviewer baseline | Reviewer unavailable again after flags off | HTTP `404`, `export_audit_reviewer_unavailable` | Pass | Rollback by disabling flags |

## Saved Filter Response Summary

| Filter | Status | Row count | Scope source | Production exports |
|---|---:|---:|---|---|
| `all` | `200` | `10` | `membership` | `NO_GO` |
| `exports_downloaded_recent` | `200` | `7` | `membership` | `NO_GO` |
| `exports_denied_recent` | `200` | `3` | `membership` | `NO_GO` |
| `document_manifest_safety_review` | `200` | `6` | `membership` | `NO_GO` |
| `request_list_basic_safety_review` | `200` | `4` | `membership` | `NO_GO` |

## Forbidden Data Review

The live smoke checked API response summaries for forbidden data markers. The reviewer API did not expose raw CSV rows, raw export files, raw audit metadata blobs, storage paths, signed URLs, original filenames, portal tokens, token hashes, OAuth tokens, email provider tokens, database URLs, service-role keys, API keys, notes, communications, AI prompts, AI outputs, sacramental/canonical detail, or family-facing private data.

## Rollback Verification

- Reviewer prototype flags disabled or returned to baseline: `pass`
- Flag-off route response verified after rollback: HTTP `404`
- No new export delivery audit events created by reviewer route: `pass`
- Rollback owner sign-off: `Codex local QA operator, 2026-07-01T15:44:59.718Z`

## Evidence Storage And Redaction

- Sanitized JSON evidence location: `docs/EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_EVIDENCE_20260701.json`
- Raw exports stored: `NO`
- Tokens and signed URLs excluded: `pass`
- Original filenames and storage paths excluded: `pass`
- Notes, communications, AI material, and sacramental/canonical details excluded: `pass`
- Credentials and connection strings excluded: `pass`

## What Changed Plain English

I ran the hidden export-audit reviewer API through a real local non-production app session. With the feature flags off, the route stayed closed. With the approved non-production flags on, a safe staff session could see only selected-parish export audit summaries. Anonymous access was blocked, a forged parish selection was blocked, and turning the flags back off closed the route again.

This helps Vinea prove that future export monitoring can be reviewed safely without exposing parish documents, private notes, raw exports, tokens, or cross-parish data.
