# Request List Basic Export Production Final Approval Prompt - 2026-06-30

Status: Final approval prompt template prepared only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed while preparing this template.

Current decision state: `PRODUCTION REQUEST_LIST_BASIC EXPORT SMOKE NOT APPROVED BY THIS TEMPLATE`

Completion marker: `REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630`

## Purpose

This document converts the confirmed non-secret labels from `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md` into the final product-owner approval prompt needed before a future production smoke of the `request_list_basic` export route.

This template validates against:

- `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`
- `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630.md`

This template does not approve production export runtime flags, continued production export availability, staff-facing production UI, migrations, operational RLS changes, Google Calendar behavior, or any export beyond `request_list_basic`.

## Product Owner Confirmed Public Production Values

The product owner confirmed these public, non-secret values for the future approval prompt:

- `PRODUCTION_APP_URL=https://vineaplatform.com`
- `REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=July 2, 2026, 8:00-8:30 PM Central`

These values must not be changed to database URLs, preview URLs, private admin URLs, secrets, tokens, passwords, raw IDs, or screenshots.

## Confirmed Non-Secret Labels

These labels are confirmed for the future approval prompt:

- `PRODUCTION_SUPABASE_PROJECT_LABEL=Vinea production Supabase project`
- `PRODUCTION_DEPLOYMENT_LABEL=Current production Vercel deployment`
- `PRODUCTION_EXPORT_SAFE_STAFF=Designated production smoke staff account for Parish A`
- `PRODUCTION_EXPORT_PARISH_A=Designated production smoke parish - Parish A`
- `PRODUCTION_EXPORT_SAME_PARISH_REQUEST=Safe same-parish join parish request for request_list_basic export smoke`
- `PRODUCTION_EXPORT_CROSS_PARISH_DENIED_REQUEST=Route-level cross-parish denial substitute using unauthorized active parish scope`
- `PRODUCTION_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=Signed-out browser export route check`
- `PRODUCTION_EXPORT_BLOCKED_FIELD_ATTEMPT=request_reference plus access_token/internal_notes blocked-field attempt`
- `PRODUCTION_EXPORT_AUDIT_INSPECTION_METHOD=Staff Audit Log page filtered to export.request_list_basic.downloaded`
- `REQUEST_LIST_BASIC_EXPORT_MONITORING_OWNER=Vinea product owner`
- `REQUEST_LIST_BASIC_EXPORT_MONITORING_CHANNEL=Owner-managed rollout notes channel`
- `REQUEST_LIST_BASIC_EXPORT_SUPPORT_OWNER=Vinea product owner`
- `REQUEST_LIST_BASIC_EXPORT_ROLLBACK_OWNER=Vinea engineering owner`
- `REQUEST_LIST_BASIC_EXPORT_ROLLBACK_DECISION_DEADLINE=Within 30 minutes after the approved production smoke window ends`

## Final Approval Prompt Template

Do not use this prompt unless you are intentionally approving the narrow production smoke.

```text
Approve production smoke for request_list_basic export only. Use PRODUCTION_APP_URL=https://vineaplatform.com, PRODUCTION_SUPABASE_PROJECT_LABEL=Vinea production Supabase project, PRODUCTION_DEPLOYMENT_LABEL=Current production Vercel deployment, REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=July 2, 2026, 8:00-8:30 PM Central, PRODUCTION_EXPORT_SAFE_STAFF=Designated production smoke staff account for Parish A, PRODUCTION_EXPORT_PARISH_A=Designated production smoke parish - Parish A, PRODUCTION_EXPORT_SAME_PARISH_REQUEST=Safe same-parish join parish request for request_list_basic export smoke, PRODUCTION_EXPORT_CROSS_PARISH_DENIED_REQUEST=Route-level cross-parish denial substitute using unauthorized active parish scope, PRODUCTION_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=Signed-out browser export route check, PRODUCTION_EXPORT_BLOCKED_FIELD_ATTEMPT=request_reference plus access_token/internal_notes blocked-field attempt, PRODUCTION_EXPORT_AUDIT_INSPECTION_METHOD=Staff Audit Log page filtered to export.request_list_basic.downloaded, REQUEST_LIST_BASIC_EXPORT_MONITORING_OWNER=Vinea product owner, REQUEST_LIST_BASIC_EXPORT_MONITORING_CHANNEL=Owner-managed rollout notes channel, REQUEST_LIST_BASIC_EXPORT_SUPPORT_OWNER=Vinea product owner, REQUEST_LIST_BASIC_EXPORT_ROLLBACK_OWNER=Vinea engineering owner, and REQUEST_LIST_BASIC_EXPORT_ROLLBACK_DECISION_DEADLINE=Within 30 minutes after the approved production smoke window ends. Run flag-off baseline first, then enable only the approved production export flags for the approved smoke window. Verify health, same-parish CSV success, CSV field exclusions, cross-parish denial, blocked-field denial, family or unauthenticated denial, safe audit metadata, monitoring observations, and rollback. Do not add staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, expose secrets, or expand exports beyond request_list_basic.
```

## Validation Result

Current validation result: `READY_FOR_SEPARATE_PRODUCT_OWNER_APPROVAL_PROMPT`

This template satisfies the confirmed non-secret label requirements from the readiness packet and now includes the confirmed public production values:

- `PRODUCTION_APP_URL=https://vineaplatform.com`
- `REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=July 2, 2026, 8:00-8:30 PM Central`

This document still does not approve the production smoke by itself. Production exports remain `NO-GO` until the exact approval prompt above is intentionally submitted as a separate product-owner instruction.

## Hard Stops

Do not use this prompt if:

- The production app URL differs from `https://vineaplatform.com` without product-owner confirmation.
- The rollout window differs from `July 2, 2026, 8:00-8:30 PM Central` without product-owner confirmation.
- Any value includes a password, one-time code, session cookie, database URL, Supabase key, Vercel token, Google OAuth token, OpenAI API key, raw UUID, family portal token, token hash, signed URL, document storage path, raw CSV, internal note, communication body, or sacramental/canonical detail.
- The intended smoke requires a migration.
- The intended smoke requires an operational RLS change.
- The intended smoke requires Google Calendar behavior.
- The intended smoke adds or exposes staff-facing production export UI.
- The intended smoke expands beyond `request_list_basic`.

## What Changed Plain English

This document gives you the final approval prompt in one place and now includes the public production website address and the exact smoke-test window. Nothing has been turned on. The prompt is ready to copy and paste only if you intentionally want to approve that narrow production smoke later.

## Next Recommended Safe Step

When you are ready to approve the future production smoke, provide the exact final approval prompt from this document as a separate instruction. Production exports remain `NO-GO` until that separate approval is provided and the approved flags are intentionally enabled only for the approved window.
