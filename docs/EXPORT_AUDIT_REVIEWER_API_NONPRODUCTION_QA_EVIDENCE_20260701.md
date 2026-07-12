# Export Audit Reviewer API Non-Production QA Evidence - 2026-07-01

Status: Completed as route-level non-production QA evidence for the API-only export audit reviewer prototype. Production was not accessed, production flags were not enabled, staff-facing dashboard UI was not added, migrations were not applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, and no secrets were exposed.

Environment identity: `local Vitest route harness`

Approved non-production gate values used only inside focused tests:

- `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE=ENABLED`
- `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK=APPROVED_EXPORT_AUDIT_REVIEWER_QA`
- `VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV=NON_PRODUCTION`
- `VERCEL_ENV=preview`
- `NODE_ENV=test`

Completion marker: `EXPORT_AUDIT_REVIEWER_API_NONPRODUCTION_QA_EVIDENCE_20260701`

## Scope Tested

The focused route QA verified:

- flag-off blocking before staff authentication,
- production-environment blocking even when prototype flags are present,
- staff authentication before parish scope or audit-event reads,
- selected active parish membership scope,
- forged active parish cookie denial before audit-event reads,
- legacy primary-parish fallback denial because the prototype requires membership-backed scope,
- `audit_events`-only read behavior,
- selected active parish `parish_id` filtering,
- approved export audit action filtering,
- saved-filter behavior,
- forbidden data exclusion from serialized responses,
- rollback by disabling prototype flags.

## Evidence Summary

| Gate | Result | Evidence |
|---|---|---|
| Flag-off baseline | Pass | Route returned `404 export_audit_reviewer_unavailable` before staff auth or database work. |
| Production block | Pass | Route returned unavailable when `NODE_ENV=production` even with prototype flags present. |
| Staff auth | Pass | Unauthenticated/non-staff response returned before parish scope or audit-event reads. |
| Active parish membership scope | Pass | Enabled route resolved selected parish only through membership-backed active parish context. |
| Forged parish denial | Pass | Unauthorized active parish cookie returned generic `403` before audit-event reads. |
| Legacy fallback denial | Pass | Primary-parish fallback source returned generic `403`; membership source is required. |
| Audit-event scope | Pass | Query used only `audit_events`, constrained by selected `parish_id`, approved export actions, newest-first order, and bounded limit. |
| Saved filters | Pass | `exports_denied_recent` returned only denied reviewer rows and included saved-filter metadata. |
| Forbidden data exclusions | Pass | Serialized response excluded raw requested field names, blocked field names, signed URL markers, storage path markers, database URL markers, and raw metadata keys. |
| Rollback | Pass | After disabling prototype flags, route returned unavailable before staff auth or database work. |

## Forbidden Data Checked

The QA response was checked for absence of:

- raw CSV rows,
- raw export files,
- raw audit metadata blobs,
- raw requested field names,
- raw blocked field names,
- document contents,
- storage paths,
- signed URLs,
- original filenames,
- portal token values,
- portal token hashes,
- OAuth tokens,
- email provider tokens,
- database URLs,
- service-role keys,
- API keys,
- notes,
- communications,
- AI prompts,
- AI outputs,
- sacramental/canonical detail.

## Runtime Boundary

The API-only prototype remains non-production only and hidden behind disabled-by-default flags.

Production exports remain `NO-GO`.

Production export monitoring remains `NO-GO`.

Staff-facing dashboard UI remains `NO-GO`.

Production export flags remain `NO-GO`.

Operational RLS changes remain outside this phase.

## What Changed Plain English

Vinea now has test evidence that the hidden export audit reviewer API stays off by default, refuses production, checks staff and parish membership, shows only safe audit summary rows, and shuts back off when the flags are disabled.

This matters because export governance needs to be proven carefully before Vinea ever shows export monitoring in production or turns on production exports.
