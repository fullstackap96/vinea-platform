# Export Audit Reviewer API Live Non-Production Smoke Evidence - 2026-07-01 - Blocked

Status: Blocked before any live route calls. Production was not accessed, production flags were not enabled, reviewer prototype flags were not enabled, dashboard UI was not added, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, and no secrets were exposed.

Current outcome: `LIVE NON-PRODUCTION EXPORT AUDIT REVIEWER API SMOKE BLOCKED; SAFE FIXTURE LABELS MISSING`

Completion marker: `EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_BLOCKED_20260701`

## Why The Smoke Was Blocked

The product-owner approval prompt still contained placeholders for the required fixture labels:

- `SAFE_EXPORT_AUDIT_REVIEWER_QA_STAFF=<safe staff fixture label>`
- `SAFE_EXPORT_AUDIT_REVIEWER_PARISH_A=<safe parish fixture label>`
- `SAFE_EXPORT_AUDIT_REVIEWER_REQUEST_LIST_DOWNLOADED_EVENT=<safe downloaded request-list audit fixture label>`
- `SAFE_EXPORT_AUDIT_REVIEWER_REQUEST_LIST_DENIED_EVENT=<safe denied request-list audit fixture label>`
- `SAFE_EXPORT_AUDIT_REVIEWER_DOCUMENT_MANIFEST_DOWNLOADED_EVENT=<safe downloaded document-manifest audit fixture label>`
- `SAFE_EXPORT_AUDIT_REVIEWER_DOCUMENT_MANIFEST_DENIED_EVENT=<safe denied document-manifest audit fixture label>`
- `SAFE_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_FIXTURE=<safe cross-parish or forged-parish denial fixture label>`
- `ROLLBACK_OWNER_NAME=<rollback owner>`

Running a live HTTP/browser smoke with these placeholder values would violate the go/no-go checklist in `docs/EXPORT_AUDIT_REVIEWER_API_LIVE_NONPRODUCTION_SMOKE_APPROVAL_PACKET_20260701.md`.

## Environment Variable Presence Check

The current shell/user environment was checked by variable name only. No secret values were printed.

| Variable | Present by name | Notes |
|---|---:|---|
| `NON_PRODUCTION_APP_URL` | Yes | Value was not printed. |
| `SAFE_EXPORT_AUDIT_REVIEWER_QA_STAFF` | No | Required before live smoke. |
| `SAFE_EXPORT_AUDIT_REVIEWER_PARISH_A` | No | Required before live smoke. |
| `SAFE_EXPORT_AUDIT_REVIEWER_REQUEST_LIST_DOWNLOADED_EVENT` | No | Required before live smoke. |
| `SAFE_EXPORT_AUDIT_REVIEWER_REQUEST_LIST_DENIED_EVENT` | No | Required before live smoke. |
| `SAFE_EXPORT_AUDIT_REVIEWER_DOCUMENT_MANIFEST_DOWNLOADED_EVENT` | No | Required before live smoke. |
| `SAFE_EXPORT_AUDIT_REVIEWER_DOCUMENT_MANIFEST_DENIED_EVENT` | No | Required before live smoke. |
| `SAFE_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_FIXTURE` | No | Required before live smoke. |
| `ROLLBACK_OWNER_NAME` | No | Required before live smoke. |

## Actions Not Taken

- Did not call `/api/health`.
- Did not call `/api/export-audit-reviewer`.
- Did not enable `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE`.
- Did not enable `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK`.
- Did not enable `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV`.
- Did not sign in as a staff user.
- Did not inspect live audit events.
- Did not mutate records.
- Did not access storage.
- Did not create signed URLs.
- Did not access production.

## Next Required Product-Owner Input

Provide a new approval prompt with real non-secret fixture labels, not placeholders.

Use labels like:

- `NON_PRODUCTION_APP_URL=<actual approved non-production app URL>`
- `SAFE_EXPORT_AUDIT_REVIEWER_QA_STAFF=Safe shared-QA staff account label`
- `SAFE_EXPORT_AUDIT_REVIEWER_PARISH_A=Safe Parish A display label`
- `SAFE_EXPORT_AUDIT_REVIEWER_REQUEST_LIST_DOWNLOADED_EVENT=Existing safe request-list downloaded audit event label`
- `SAFE_EXPORT_AUDIT_REVIEWER_REQUEST_LIST_DENIED_EVENT=Existing safe request-list denied audit event label`
- `SAFE_EXPORT_AUDIT_REVIEWER_DOCUMENT_MANIFEST_DOWNLOADED_EVENT=Existing safe document-manifest downloaded audit event label`
- `SAFE_EXPORT_AUDIT_REVIEWER_DOCUMENT_MANIFEST_DENIED_EVENT=Existing safe document-manifest denied audit event label`
- `SAFE_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_FIXTURE=Safe Parish B switch or forged-parish-cookie denial substitute`
- `ROLLBACK_OWNER_NAME=Codex local QA operator`

Do not include passwords, tokens, cookies, database URLs, service-role keys, API keys, or raw audit metadata in the approval prompt.

## What Changed Plain English

I stopped before running the live test because the request still used placeholder labels. Those labels tell us exactly which safe staff account, parish, and audit-log examples to use. Without them, we could accidentally test the wrong environment or make evidence that cannot be trusted.

This keeps Vinea safe while still making progress: the missing information is now clearly listed, and the next prompt can fill it without exposing secrets.
