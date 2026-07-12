# Request Document Manifest Export Production Final Approval Prompt - 2026-06-30

Status: Final approval prompt template prepared only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this template.

Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT SMOKE NOT APPROVED BY THIS TEMPLATE`

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630`

## Purpose

This document converts the recommended non-secret labels from `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md` into the final product-owner approval prompt template needed before a future production smoke of the `request_document_manifest` export route.

This template validates against:

- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`
- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md`

This template does not approve production export runtime flags, continued production export availability, staff-facing production UI, migrations, operational RLS changes, Google Calendar behavior, signed URL delivery, storage path exposure, original filename export, document file delivery, bulk document export, or any export beyond `request_document_manifest`.

## Product Owner Values Still Required

Production exports remain `NO-GO` until the product owner provides these exact public, non-secret values in a separate future approval prompt:

- `PRODUCTION_APP_URL=<exact public production URL>`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<exact low-traffic production smoke window>`

Do not replace these with database URLs, preview URLs, private admin URLs, secrets, tokens, passwords, raw IDs, screenshots, or approximate time windows.

## Recommended Non-Secret Labels

These labels are recommended for the future approval prompt:

- `PRODUCTION_SUPABASE_PROJECT_LABEL=Vinea production Supabase project`
- `PRODUCTION_DEPLOYMENT_LABEL=Current production Vercel deployment`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF=Designated production smoke staff account for Parish A`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A=Designated production smoke parish - Parish A`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST=Safe same-parish request for request_document_manifest export smoke`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET=Safe same-parish document checklist set with generic labels only`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST=Route-level cross-parish denial substitute using unauthorized active parish scope`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=Signed-out browser export route check`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT=request_id plus signed_url/storage_path/original_filename/portal_token blocked-field attempt`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD=Staff Audit Log page filtered to export.request_document_manifest.downloaded`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD=Export route returns generic unavailable behavior after flags are disabled`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER=Vinea product owner`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL=Owner-managed rollout notes channel`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER=Vinea product owner`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER=Vinea engineering owner`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE=Within 30 minutes after the approved production smoke window ends`

## Final Approval Prompt Template

Do not use this prompt unless you are intentionally approving the narrow production smoke and have replaced the two placeholders with exact public production values.

```text
Approve production smoke for request_document_manifest export only. Use PRODUCTION_APP_URL=<exact public production URL>, PRODUCTION_SUPABASE_PROJECT_LABEL=Vinea production Supabase project, PRODUCTION_DEPLOYMENT_LABEL=Current production Vercel deployment, REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<exact low-traffic production smoke window>, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF=Designated production smoke staff account for Parish A, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A=Designated production smoke parish - Parish A, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST=Safe same-parish request for request_document_manifest export smoke, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET=Safe same-parish document checklist set with generic labels only, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST=Route-level cross-parish denial substitute using unauthorized active parish scope, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=Signed-out browser export route check, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT=request_id plus signed_url/storage_path/original_filename/portal_token blocked-field attempt, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD=Staff Audit Log page filtered to export.request_document_manifest.downloaded, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD=Export route returns generic unavailable behavior after flags are disabled, REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER=Vinea product owner, REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL=Owner-managed rollout notes channel, REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER=Vinea product owner, REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER=Vinea engineering owner, and REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE=Within 30 minutes after the approved production smoke window ends. Run flag-off baseline first, then enable only the approved production export flags for the approved smoke window. Verify health, same-parish manifest CSV success, CSV field exclusions, cross-parish denial, blocked-field denial, family or unauthenticated denial, safe audit metadata, no signed URL/storage/file API usage, monitoring observations, and rollback. Keep the export manifest-only. Do not add staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, expose secrets, create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or expand exports beyond request_document_manifest.
```

## Validation Result

Current validation result: `WAITING_FOR_EXACT_PRODUCT_OWNER_VALUES_AND_SEPARATE_APPROVAL_PROMPT`

This template satisfies the recommended non-secret label requirements from the readiness packet and worksheet, but it intentionally keeps the production app URL and rollout window as placeholders.

This document still does not approve the production smoke by itself. Production exports remain `NO-GO` until the exact public production URL, exact low-traffic production smoke window, and final approval prompt above are intentionally submitted as a separate product-owner instruction.

## Hard Stops

Do not use this prompt if:

- The production app URL is not an exact public production URL.
- The rollout window is not an exact date, start time, end time, and timezone.
- Any value includes a password, one-time code, session cookie, database URL, Supabase key, Vercel token, Google OAuth token, OpenAI API key, raw UUID, family portal token, token hash, signed URL, document storage path, original filename, raw CSV, internal note, communication body, document content, or sacramental/canonical detail.
- The intended smoke requires a migration.
- The intended smoke requires an operational RLS change.
- The intended smoke requires Google Calendar behavior.
- The intended smoke adds or exposes staff-facing production export UI.
- The intended smoke creates signed URLs, exposes storage paths, exports original filenames, or delivers document files.
- The intended smoke expands beyond `request_document_manifest`.

## What Changed Plain English

This document gives you the final approval prompt format for the future production test of the document checklist export. It does not turn anything on. It leaves the real production website address and rollout window blank on purpose, so production exports stay blocked until you provide those exact values and explicitly approve the smoke later.

## Next Recommended Safe Step

If you want to continue safely without approving production exports, prepare a production smoke evidence template for `request_document_manifest` so the future rollout window has a clean place to record flag-off baseline, flag-on checks, audit evidence, monitoring, rollback, and final sign-off.
