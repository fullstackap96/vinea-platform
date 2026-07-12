# Request List Basic Export Production Smoke Intake Worksheet - 2026-06-30

Status: Prepared as a human-fillable intake worksheet only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

Current decision state: `PRODUCTION REQUEST_LIST_BASIC EXPORT SMOKE NOT APPROVED BY THIS WORKSHEET`

Completion marker: `REQUEST_LIST_BASIC_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630`

## Recommended Non-Secret Filled Draft

These are recommended non-secret labels for the future production smoke. They intentionally avoid passwords, database URLs, raw IDs, tokens, signed URLs, document paths, raw CSV contents, internal notes, communication bodies, and sacramental/canonical details.

Current draft status: `RECOMMENDED LABELS PREPARED - PRODUCT OWNER MUST CONFIRM PUBLIC URL AND ROLLOUT WINDOW BEFORE APPROVAL`

- `PRODUCTION_APP_URL`: `Public production Vinea app URL - product owner confirms exact public URL before approval`
- `PRODUCTION_SUPABASE_PROJECT_LABEL`: `Vinea production Supabase project`
- `PRODUCTION_DEPLOYMENT_LABEL`: `Current production Vercel deployment`
- `PRODUCTION_EXPORT_SAFE_STAFF`: `Designated production smoke staff account for Parish A`
- `PRODUCTION_EXPORT_PARISH_A`: `Designated production smoke parish - Parish A`
- `PRODUCTION_EXPORT_SAME_PARISH_REQUEST`: `Safe same-parish join parish request for request_list_basic export smoke`
- `PRODUCTION_EXPORT_CROSS_PARISH_DENIED_REQUEST`: `Route-level cross-parish denial substitute using unauthorized active parish scope`
- `PRODUCTION_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD`: `Signed-out browser export route check`
- `PRODUCTION_EXPORT_BLOCKED_FIELD_ATTEMPT`: `request_reference plus access_token/internal_notes blocked-field attempt`
- `PRODUCTION_EXPORT_AUDIT_INSPECTION_METHOD`: `Staff Audit Log page filtered to export.request_list_basic.downloaded`
- `REQUEST_LIST_BASIC_EXPORT_MONITORING_OWNER`: `Vinea product owner`
- `REQUEST_LIST_BASIC_EXPORT_MONITORING_CHANNEL`: `Owner-managed rollout notes channel`
- `REQUEST_LIST_BASIC_EXPORT_SUPPORT_OWNER`: `Vinea product owner`
- `REQUEST_LIST_BASIC_EXPORT_ROLLBACK_OWNER`: `Vinea engineering owner`
- `REQUEST_LIST_BASIC_EXPORT_ROLLBACK_DECISION_DEADLINE`: `Within 30 minutes after the approved production smoke window ends`
- `REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW`: `Product-owner-approved low-traffic production smoke window`

Recommended confirmations:

- Request belongs to `PRODUCTION_EXPORT_PARISH_A`: `yes - confirm during future smoke setup without recording raw IDs`
- Request is safe for basic operational export: `yes - select a routine request without unusually sensitive circumstances`
- Request does not require exposing internal notes, documents, communications, sacramental/canonical details, AI output, or token material: `yes`
- Denial fixture does not require recording raw parish or request IDs: `yes`
- Expected cross-parish result is generic denial with no CSV delivery: `yes`
- No family portal token will be recorded: `yes`
- Expected family/unauthenticated result is unauthenticated or generic denial before query, audit, or delivery: `yes`
- Blocked-field attempt includes a token-like field name, such as `access_token`: `yes`
- Blocked-field attempt includes a staff-only field name, such as `internal_notes`: `yes`
- Expected blocked-field result is generic denial with no CSV delivery: `yes`
- Audit check will not record raw CSV contents: `yes`
- Audit check will not record secrets, tokens, signed URLs, document paths, notes, or communication bodies: `yes`
- Expected audit action is `export.request_list_basic.downloaded`: `yes`
- Monitoring covers `/api/health`: `yes`
- Monitoring covers export route success and denial status codes: `yes`
- Monitoring covers audit event creation: `yes`
- Monitoring covers unexpected server errors: `yes`
- Monitoring covers possible sensitive-data leakage signals: `yes`
- Support owner understands no broad export UI is approved: `yes`
- Support owner will not request raw CSV files, passwords, tokens, document links, internal notes, or screenshots with sensitive data: `yes`
- Rollback does not require a migration: `yes`
- Rollback does not require an operational RLS change: `yes`
- Rollback does not require Google Calendar changes: `yes`
- Rollback verification is `/api/exports/requests/basic` returning generic unavailable behavior: `yes`
- Window is low-traffic or otherwise acceptable: `yes - product owner confirms exact time`
- Product owner, monitoring owner, support owner, rollback owner, and engineering owner are available: `yes - confirm before future approval`

## Purpose

Use this worksheet to collect the non-secret values needed before a future production smoke test of the `request_list_basic` export route.

This worksheet supports the formal approval packet:

- `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`
- `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md`

It does not approve production flags, production export availability, staff-facing production UI, migrations, operational RLS changes, Google Calendar behavior, or any export beyond `request_list_basic`.

## Important Safety Rules

Fill this worksheet with labels and plain-language descriptions only.

Do include:

- A production app URL that is already public.
- Human names or role labels for owners.
- Safe fixture labels, such as "Production QA Staff - Parish A".
- Plain-language record labels, such as "Baptism request created for export smoke test".
- A rollout date/time window.
- A monitoring channel name, such as "Vinea ops Slack channel" or "Owner text thread".

Do not include:

- Passwords.
- One-time codes.
- Session cookies.
- Database URLs.
- Supabase anon keys.
- Supabase service role keys.
- Vercel tokens.
- Google OAuth tokens.
- OpenAI API keys.
- Raw UUIDs for parish, request, staff, document, or audit records.
- Family portal tokens or token hashes.
- Signed URLs.
- Document storage paths.
- Raw CSV contents.
- Internal notes.
- Communication bodies.
- Sacramental/canonical details.

If a value feels like a password, token, database connection, secret key, raw ID, or sensitive pastoral/family data, do not paste it here.

## How To Find Safe Values

### Production App URL

Use the normal production Vinea web address. This is safe to record because it is public.

Fill:

- `PRODUCTION_APP_URL`: `[FILL: public production app URL only]`

### Safe Staff Fixture

Choose a real staff account that is allowed to use Vinea in production and belongs to the test parish. Record a label, not the password.

Good examples:

- `Parish A admin staff account`
- `Pastor account for Parish A`
- `Designated production smoke staff`

Fill:

- `PRODUCTION_EXPORT_SAFE_STAFF`: `[FILL: safe staff label only, no password]`

### Active Parish Fixture

Choose the parish that the staff account should select in the active parish switcher.

Fill:

- `PRODUCTION_EXPORT_PARISH_A`: `[FILL: parish display name or safe parish label only]`

### Same-Parish Request Fixture

Choose one request from the selected parish that is safe to appear in a basic request-list export.

The request should be safe because the export only includes basic operational fields, but still avoid records with unusually sensitive circumstances.

Good examples:

- `Safe baptism request for export smoke`
- `Safe join parish request for export smoke`
- `Safe wedding request with no sensitive notes used for export smoke`

Fill:

- `PRODUCTION_EXPORT_SAME_PARISH_REQUEST`: `[FILL: safe request label only, no raw request ID]`

Confirm:

- Request belongs to `PRODUCTION_EXPORT_PARISH_A`: `[FILL: yes/no]`
- Request is safe for basic operational export: `[FILL: yes/no]`
- Request does not require exposing internal notes, documents, communications, sacramental/canonical details, AI output, or token material: `[FILL: yes/no]`

### Cross-Parish Denial Fixture

Choose a safe way to prove staff cannot export outside the selected active parish.

Preferred choices:

- Select Parish A and attempt to export a known Parish B fixture.
- Select Parish B and attempt to export a known Parish A fixture.
- Use a documented route-level substitute that proves unauthorized active parish scope is denied.

Fill:

- `PRODUCTION_EXPORT_CROSS_PARISH_DENIED_REQUEST`: `[FILL: safe cross-parish denial label or substitute only]`

Confirm:

- Denial fixture does not require recording raw parish or request IDs: `[FILL: yes/no]`
- Expected result is generic denial with no CSV delivery: `[FILL: yes/no]`

### Family Or Unauthenticated Denial Method

Choose a way to verify family-facing or unauthenticated users cannot access the staff export route.

Preferred choices:

- Open the export route in a signed-out browser.
- Use a private/incognito browser.
- Use a safe family portal session without recording the portal token.

Fill:

- `PRODUCTION_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD`: `[FILL: signed-out browser, incognito browser, safe family portal session, or route-level substitute]`

Confirm:

- No family portal token will be recorded: `[FILL: yes/no]`
- Expected result is unauthenticated or generic denial before query, audit, or delivery: `[FILL: yes/no]`

### Blocked-Field Attempt

Choose a safe blocked-field attempt that proves risky fields cannot be requested.

Recommended label:

- `request_reference plus access_token/internal_notes blocked-field attempt`

Do not paste actual tokens or note contents.

Fill:

- `PRODUCTION_EXPORT_BLOCKED_FIELD_ATTEMPT`: `[FILL: blocked-field attempt label only]`

Confirm:

- Attempt includes a token-like field name, such as `access_token`: `[FILL: yes/no]`
- Attempt includes a staff-only field name, such as `internal_notes`: `[FILL: yes/no]`
- Expected result is generic denial with no CSV delivery: `[FILL: yes/no]`

### Audit Inspection Method

Choose how the smoke tester will verify safe audit metadata.

Good examples:

- `Staff Audit Log page filtered to export action`
- `Approved production admin query by engineering owner`
- `Existing audit evidence helper, sanitized output only`

Fill:

- `PRODUCTION_EXPORT_AUDIT_INSPECTION_METHOD`: `[FILL: audit inspection method label only]`

Confirm:

- Audit check will not record raw CSV contents: `[FILL: yes/no]`
- Audit check will not record secrets, tokens, signed URLs, document paths, notes, or communication bodies: `[FILL: yes/no]`
- Expected audit action is `export.request_list_basic.downloaded`: `[FILL: yes/no]`

### Monitoring Owner And Channel

Choose who watches the smoke and where observations are recorded.

Fill:

- `REQUEST_LIST_BASIC_EXPORT_MONITORING_OWNER`: `[FILL: person or role name]`
- `REQUEST_LIST_BASIC_EXPORT_MONITORING_CHANNEL`: `[FILL: channel or communication path]`

Confirm monitoring covers:

- `/api/health`: `[FILL: yes/no]`
- Export route success and denial status codes: `[FILL: yes/no]`
- Audit event creation: `[FILL: yes/no]`
- Unexpected server errors: `[FILL: yes/no]`
- Possible sensitive-data leakage signals: `[FILL: yes/no]`

### Support Owner

Choose who handles staff/customer questions if the smoke creates confusion or a denial is reported.

Fill:

- `REQUEST_LIST_BASIC_EXPORT_SUPPORT_OWNER`: `[FILL: person or role name]`

Confirm:

- Support owner understands no broad export UI is approved: `[FILL: yes/no]`
- Support owner will not request raw CSV files, passwords, tokens, document links, internal notes, or screenshots with sensitive data: `[FILL: yes/no]`

### Rollback Owner And Deadline

Choose who is responsible for turning the feature back off and by when.

Fill:

- `REQUEST_LIST_BASIC_EXPORT_ROLLBACK_OWNER`: `[FILL: person or role name]`
- `REQUEST_LIST_BASIC_EXPORT_ROLLBACK_DECISION_DEADLINE`: `[FILL: date/time and timezone]`

Confirm:

- Rollback does not require a migration: `[FILL: yes/no]`
- Rollback does not require an operational RLS change: `[FILL: yes/no]`
- Rollback does not require Google Calendar changes: `[FILL: yes/no]`
- Rollback verification is `/api/exports/requests/basic` returning generic unavailable behavior: `[FILL: yes/no]`

### Rollout Window

Choose the exact production smoke window.

Fill:

- `REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW`: `[FILL: date/time window and timezone]`

Confirm:

- Window is low-traffic or otherwise acceptable: `[FILL: yes/no]`
- Product owner, monitoring owner, support owner, rollback owner, and engineering owner are available: `[FILL: yes/no]`

## Copy/Paste Summary For Future Approval

After every field above is filled with non-secret values, copy this block into the future approval prompt and replace every bracketed placeholder.

```text
Approve production smoke for request_list_basic export only. Use PRODUCTION_APP_URL=[FILL], PRODUCTION_SUPABASE_PROJECT_LABEL=[FILL: non-secret project label], PRODUCTION_DEPLOYMENT_LABEL=[FILL: deployment label], REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=[FILL], PRODUCTION_EXPORT_SAFE_STAFF=[FILL], PRODUCTION_EXPORT_PARISH_A=[FILL], PRODUCTION_EXPORT_SAME_PARISH_REQUEST=[FILL], PRODUCTION_EXPORT_CROSS_PARISH_DENIED_REQUEST=[FILL], PRODUCTION_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=[FILL], PRODUCTION_EXPORT_BLOCKED_FIELD_ATTEMPT=[FILL], PRODUCTION_EXPORT_AUDIT_INSPECTION_METHOD=[FILL], REQUEST_LIST_BASIC_EXPORT_MONITORING_OWNER=[FILL], REQUEST_LIST_BASIC_EXPORT_MONITORING_CHANNEL=[FILL], REQUEST_LIST_BASIC_EXPORT_SUPPORT_OWNER=[FILL], REQUEST_LIST_BASIC_EXPORT_ROLLBACK_OWNER=[FILL], and REQUEST_LIST_BASIC_EXPORT_ROLLBACK_DECISION_DEADLINE=[FILL]. Run flag-off baseline first, then enable only the approved production export flags for the approved smoke window. Verify health, same-parish CSV success, CSV field exclusions, cross-parish denial, blocked-field denial, family or unauthenticated denial, safe audit metadata, monitoring observations, and rollback. Do not add staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, expose secrets, or expand exports beyond request_list_basic.
```

Recommended draft approval prompt, still requiring product-owner confirmation of the exact public URL and rollout window:

```text
Approve production smoke for request_list_basic export only. Use PRODUCTION_APP_URL=<confirm exact public production Vinea app URL>, PRODUCTION_SUPABASE_PROJECT_LABEL=Vinea production Supabase project, PRODUCTION_DEPLOYMENT_LABEL=Current production Vercel deployment, REQUEST_LIST_BASIC_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<confirm product-owner-approved low-traffic production smoke window>, PRODUCTION_EXPORT_SAFE_STAFF=Designated production smoke staff account for Parish A, PRODUCTION_EXPORT_PARISH_A=Designated production smoke parish - Parish A, PRODUCTION_EXPORT_SAME_PARISH_REQUEST=Safe same-parish join parish request for request_list_basic export smoke, PRODUCTION_EXPORT_CROSS_PARISH_DENIED_REQUEST=Route-level cross-parish denial substitute using unauthorized active parish scope, PRODUCTION_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=Signed-out browser export route check, PRODUCTION_EXPORT_BLOCKED_FIELD_ATTEMPT=request_reference plus access_token/internal_notes blocked-field attempt, PRODUCTION_EXPORT_AUDIT_INSPECTION_METHOD=Staff Audit Log page filtered to export.request_list_basic.downloaded, REQUEST_LIST_BASIC_EXPORT_MONITORING_OWNER=Vinea product owner, REQUEST_LIST_BASIC_EXPORT_MONITORING_CHANNEL=Owner-managed rollout notes channel, REQUEST_LIST_BASIC_EXPORT_SUPPORT_OWNER=Vinea product owner, REQUEST_LIST_BASIC_EXPORT_ROLLBACK_OWNER=Vinea engineering owner, and REQUEST_LIST_BASIC_EXPORT_ROLLBACK_DECISION_DEADLINE=Within 30 minutes after the approved production smoke window ends. Run flag-off baseline first, then enable only the approved production export flags for the approved smoke window. Verify health, same-parish CSV success, CSV field exclusions, cross-parish denial, blocked-field denial, family or unauthenticated denial, safe audit metadata, monitoring observations, and rollback. Do not add staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, expose secrets, or expand exports beyond request_list_basic.
```

## Final Readiness Checklist

Current recommendation: `NO-GO UNTIL THIS WORKSHEET IS FILLED WITH NON-SECRET VALUES AND THE EXACT FUTURE APPROVAL PROMPT IS PROVIDED`

Before approval, confirm:

- `PRODUCTION_APP_URL` is filled with a public app URL only.
- `PRODUCTION_EXPORT_SAFE_STAFF` is a label only and no password is recorded.
- `PRODUCTION_EXPORT_PARISH_A` is a label only.
- `PRODUCTION_EXPORT_SAME_PARISH_REQUEST` is a label only and no raw request ID is recorded.
- `PRODUCTION_EXPORT_CROSS_PARISH_DENIED_REQUEST` is a label or substitute only.
- `PRODUCTION_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD` does not expose portal tokens.
- `PRODUCTION_EXPORT_BLOCKED_FIELD_ATTEMPT` is a field-name test only and contains no real token or note content.
- `PRODUCTION_EXPORT_AUDIT_INSPECTION_METHOD` avoids raw CSV, tokens, signed URLs, document paths, notes, and communication bodies.
- Monitoring owner and channel are filled.
- Support owner is filled.
- Rollback owner and rollback decision deadline are filled.
- Rollout window is filled.
- Product owner is ready to provide the exact future approval language.

## What Changed Plain English

This worksheet gives you a safe fill-in form for the future production export test. It tells you what labels and owner names to provide, and it warns you not to paste passwords, database links, raw IDs, tokens, documents, notes, or private parish details.

## Next Recommended Safe Step

Use `docs/REQUEST_LIST_BASIC_EXPORT_PRODUCTION_FINAL_APPROVAL_PROMPT_20260630.md` when the exact public production URL and exact low-traffic rollout window are ready. Production exports remain `NO-GO` until you later provide the exact approval prompt from that completed template.
