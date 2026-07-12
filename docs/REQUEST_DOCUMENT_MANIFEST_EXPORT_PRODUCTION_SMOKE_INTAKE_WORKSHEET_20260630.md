# Request Document Manifest Export Production Smoke Intake Worksheet - 2026-06-30

Status: Prepared as a human-fillable intake worksheet only. Production was not accessed, production flags were not enabled, no staff-facing production UI was added, no migrations were applied, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, and no secrets were exposed.

Current decision state: `PRODUCTION REQUEST_DOCUMENT_MANIFEST EXPORT SMOKE NOT APPROVED BY THIS WORKSHEET`

Completion marker: `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260630`

## Recommended Non-Secret Filled Draft

These are recommended non-secret labels for a future production smoke. They intentionally avoid passwords, database URLs, raw IDs, family portal tokens, signed URLs, storage paths, original filenames, document contents, raw CSV contents, internal notes, communication bodies, AI material, and sacramental/canonical details.

Current draft status: `RECOMMENDED LABELS PREPARED - PRODUCT OWNER MUST CONFIRM PUBLIC URL AND ROLLOUT WINDOW BEFORE APPROVAL`

- `PRODUCTION_APP_URL`: `Public production Vinea app URL - product owner confirms exact public URL before approval`
- `PRODUCTION_SUPABASE_PROJECT_LABEL`: `Vinea production Supabase project`
- `PRODUCTION_DEPLOYMENT_LABEL`: `Current production Vercel deployment`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF`: `Designated production smoke staff account for Parish A`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A`: `Designated production smoke parish - Parish A`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST`: `Safe same-parish request for request_document_manifest export smoke`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET`: `Safe same-parish document checklist set with generic labels only`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST`: `Route-level cross-parish denial substitute using unauthorized active parish scope`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD`: `Signed-out browser export route check`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT`: `request_id plus signed_url/storage_path/original_filename/portal_token blocked-field attempt`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD`: `Staff Audit Log page filtered to export.request_document_manifest.downloaded`
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD`: `Export route returns generic unavailable behavior after flags are disabled`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER`: `Vinea product owner`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL`: `Owner-managed rollout notes channel`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER`: `Vinea product owner`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER`: `Vinea engineering owner`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE`: `Within 30 minutes after the approved production smoke window ends`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW`: `Product-owner-approved low-traffic production smoke window`

Recommended confirmations:

- Request belongs to `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A`: `yes - confirm during future smoke setup without recording raw IDs`
- Request is safe for a manifest-only document readiness export: `yes - select a routine request without unusually sensitive circumstances`
- Request does not involve a funeral, private family crisis, canonical case, sacramental record correction, or other sensitive pastoral context: `yes`
- Document labels are generic and safe to display in a manifest-only CSV: `yes`
- Document set does not require opening files, exposing original filenames, exposing storage paths, or creating signed URLs: `yes`
- Denial fixture does not require recording raw parish, request, document, or staff IDs: `yes`
- Expected cross-parish result is generic denial with no CSV delivery: `yes`
- No family portal token will be recorded: `yes`
- Expected family/unauthenticated result is unauthenticated or generic denial before query, audit, or delivery: `yes`
- Blocked-field attempt includes `signed_url`: `yes`
- Blocked-field attempt includes `storage_path`: `yes`
- Blocked-field attempt includes `original_filename`: `yes`
- Blocked-field attempt includes `portal_token`: `yes`
- Expected blocked-field result is generic denial with no CSV delivery: `yes`
- Audit check will not record raw CSV contents: `yes`
- Audit check will not record secrets, tokens, signed URLs, document paths, original filenames, notes, communication bodies, AI material, or document contents: `yes`
- Expected audit action is `export.request_document_manifest.downloaded`: `yes`
- Monitoring covers `/api/health`: `yes`
- Monitoring covers export route success and denial status codes: `yes`
- Monitoring covers audit event creation: `yes`
- Monitoring covers unexpected server errors: `yes`
- Monitoring covers possible sensitive-data leakage signals: `yes`
- Support owner understands no staff-facing production export UI is approved: `yes`
- Support owner will not request raw CSV files, passwords, tokens, signed URLs, storage paths, original filenames, document files, internal notes, communications, or screenshots with sensitive data: `yes`
- Rollback does not require a migration: `yes`
- Rollback does not require an operational RLS change: `yes`
- Rollback does not require Google Calendar changes: `yes`
- Rollback does not require storage object mutation or document deletion: `yes`
- Rollback verification is `/api/exports/requests/documents/manifest` returning generic unavailable behavior: `yes`
- Window is low-traffic or otherwise acceptable: `yes - product owner confirms exact time`
- Product owner, monitoring owner, support owner, rollback owner, and engineering owner are available: `yes - confirm before future approval`

## Purpose

Use this worksheet to collect the non-secret values needed before a future production smoke test of the `request_document_manifest` export route.

This worksheet supports the formal approval packet:

- `docs/REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_READINESS_APPROVAL_PACKET_20260630.md`

It does not approve production flags, production export availability, staff-facing production UI, signed URL delivery, storage path exposure, original filename export, document file delivery, bulk document export, migrations, operational RLS changes, Google Calendar behavior, or any export beyond `request_document_manifest`.

## Important Safety Rules

Fill this worksheet with labels and plain-language descriptions only.

Do include:

- A production app URL that is already public.
- Human names or role labels for owners.
- Safe fixture labels, such as "Production QA Staff - Parish A".
- Plain-language record labels, such as "Routine baptism request with generic document checklist labels".
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
- Raw UUIDs for parish, request, staff, document, storage, or audit records.
- Family portal tokens or token hashes.
- Public intake tokens or token hashes.
- Signed URLs.
- Document storage paths.
- Original filenames.
- Document file contents.
- Raw CSV contents.
- Internal notes.
- Communication bodies.
- AI material.
- Sacramental/canonical details.

If a value feels like a password, token, database connection, secret key, raw ID, document path, filename, file content, or sensitive pastoral/family data, do not paste it here.

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

- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF`: `[FILL: safe staff label only, no password]`

### Active Parish Fixture

Choose the parish that the staff account should select in the active parish switcher.

Fill:

- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A`: `[FILL: parish display name or safe parish label only]`

### Same-Parish Request Fixture

Choose one request from the selected parish that is safe for a manifest-only document readiness export.

The request should not involve a funeral, unusually sensitive pastoral situation, canonical case, sacramental record correction, or family crisis.

Good examples:

- `Routine baptism request with generic document checklist labels`
- `Routine wedding request with generic prep document labels`
- `Routine OCIA request with generic received/missing document labels`

Fill:

- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST`: `[FILL: safe request label only, no raw request ID]`

Confirm:

- Request belongs to `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A`: `[FILL: yes/no]`
- Request is safe for a manifest-only document readiness export: `[FILL: yes/no]`
- Request does not involve a funeral, private family crisis, canonical case, sacramental record correction, or other sensitive pastoral context: `[FILL: yes/no]`

### Safe Document Set Fixture

Choose a same-parish document checklist set with generic labels that are safe to verify in a manifest-only CSV.

Good examples:

- `Birth certificate received`
- `Preparation form received`
- `Sponsor form missing`
- `Marriage prep form received`

Do not choose labels that reveal private family circumstances, original filenames, file contents, storage paths, or sacramental/canonical details.

Fill:

- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET`: `[FILL: safe document set label only, no filenames or paths]`

Confirm:

- Document labels are generic and safe to display in a manifest-only CSV: `[FILL: yes/no]`
- Document set does not require opening files, exposing original filenames, exposing storage paths, or creating signed URLs: `[FILL: yes/no]`

### Cross-Parish Denial Fixture

Choose a safe way to prove staff cannot export a document manifest outside the selected active parish.

Preferred choices:

- Select Parish A and attempt to export a known Parish B fixture by label only.
- Select Parish B and attempt to export a known Parish A fixture by label only.
- Use a documented route-level substitute that proves unauthorized active parish scope is denied.

Fill:

- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST`: `[FILL: safe cross-parish denial label or substitute only]`

Confirm:

- Denial fixture does not require recording raw parish, request, document, or staff IDs: `[FILL: yes/no]`
- Expected result is generic denial with no CSV delivery: `[FILL: yes/no]`

### Family Or Unauthenticated Denial Method

Choose a way to verify family-facing or unauthenticated users cannot access the staff export route.

Preferred choices:

- Open the export route in a signed-out browser.
- Use a private/incognito browser.
- Use a safe family portal session without recording the portal token.

Fill:

- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD`: `[FILL: signed-out browser, incognito browser, safe family portal session, or route-level substitute]`

Confirm:

- No family portal token will be recorded: `[FILL: yes/no]`
- Expected result is unauthenticated or generic denial before query, audit, or delivery: `[FILL: yes/no]`

### Blocked-Field Attempt

Choose a safe blocked-field attempt that proves risky document fields cannot be requested.

Recommended label:

- `request_id plus signed_url/storage_path/original_filename/portal_token blocked-field attempt`

Do not paste actual tokens, signed URLs, paths, filenames, or file contents.

Fill:

- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT`: `[FILL: blocked-field attempt label only]`

Confirm:

- Attempt includes `signed_url`: `[FILL: yes/no]`
- Attempt includes `storage_path`: `[FILL: yes/no]`
- Attempt includes `original_filename`: `[FILL: yes/no]`
- Attempt includes `portal_token`: `[FILL: yes/no]`
- Expected result is generic denial with no CSV delivery: `[FILL: yes/no]`

### Audit Inspection Method

Choose how the smoke tester will verify safe audit metadata.

Good examples:

- `Staff Audit Log page filtered to export.request_document_manifest.downloaded`
- `Approved production admin query by engineering owner with sanitized output only`
- `Existing audit evidence helper, sanitized output only`

Fill:

- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD`: `[FILL: audit inspection method label only]`

Confirm:

- Audit check will not record raw CSV contents: `[FILL: yes/no]`
- Audit check will not record secrets, tokens, signed URLs, document paths, original filenames, notes, communication bodies, AI material, or document contents: `[FILL: yes/no]`
- Expected audit action is `export.request_document_manifest.downloaded`: `[FILL: yes/no]`

### Monitoring Owner And Channel

Choose who watches the smoke and where observations are recorded.

Fill:

- `REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER`: `[FILL: person or role name]`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL`: `[FILL: channel or communication path]`

Confirm monitoring covers:

- `/api/health`: `[FILL: yes/no]`
- Export route success and denial status codes: `[FILL: yes/no]`
- Audit event creation: `[FILL: yes/no]`
- Unexpected server errors: `[FILL: yes/no]`
- Possible sensitive-data leakage signals: `[FILL: yes/no]`

### Support Owner

Choose who handles staff/customer questions if the smoke creates confusion or a denial is reported.

Fill:

- `REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER`: `[FILL: person or role name]`

Confirm:

- Support owner understands no staff-facing production export UI is approved: `[FILL: yes/no]`
- Support owner will not request raw CSV files, passwords, tokens, signed URLs, storage paths, original filenames, document files, internal notes, communications, or screenshots with sensitive data: `[FILL: yes/no]`

### Rollback Owner And Deadline

Choose who is responsible for turning the feature back off and by when.

Fill:

- `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER`: `[FILL: person or role name]`
- `REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE`: `[FILL: date/time and timezone]`

Confirm:

- Rollback does not require a migration: `[FILL: yes/no]`
- Rollback does not require an operational RLS change: `[FILL: yes/no]`
- Rollback does not require Google Calendar changes: `[FILL: yes/no]`
- Rollback does not require storage object mutation or document deletion: `[FILL: yes/no]`
- Rollback verification is `/api/exports/requests/documents/manifest` returning generic unavailable behavior: `[FILL: yes/no]`

### Rollback Verification Method

Choose how the smoke tester will record that rollback succeeded.

Fill:

- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD`: `[FILL: rollback verification method label only]`

Good example:

- `Export route returns generic unavailable behavior after flags are disabled`

### Rollout Window

Choose the exact production smoke window.

Fill:

- `REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW`: `[FILL: date/time window and timezone]`

Confirm:

- Window is low-traffic or otherwise acceptable: `[FILL: yes/no]`
- Product owner, monitoring owner, support owner, rollback owner, and engineering owner are available: `[FILL: yes/no]`

## Copy/Paste Summary For Future Approval

After every field above is filled with non-secret values, copy this block into the future approval prompt and replace every bracketed placeholder.

```text
Approve production smoke for request_document_manifest export only. Use PRODUCTION_APP_URL=[FILL], PRODUCTION_SUPABASE_PROJECT_LABEL=[FILL: non-secret project label], PRODUCTION_DEPLOYMENT_LABEL=[FILL: deployment label], REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW=[FILL], PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF=[FILL], PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A=[FILL], PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST=[FILL], PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET=[FILL], PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST=[FILL], PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=[FILL], PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT=[FILL], PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD=[FILL], PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD=[FILL], REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER=[FILL], REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL=[FILL], REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER=[FILL], REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER=[FILL], and REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE=[FILL]. Run flag-off baseline first, then enable only the approved production export flags for the approved smoke window. Verify health, same-parish manifest CSV success, CSV field exclusions, cross-parish denial, blocked-field denial, family or unauthenticated denial, safe audit metadata, no signed URL/storage/file API usage, monitoring observations, and rollback. Keep the export manifest-only. Do not add staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, expose secrets, create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or expand exports beyond request_document_manifest.
```

Recommended draft approval prompt, still requiring product-owner confirmation of the exact public URL and rollout window:

```text
Approve production smoke for request_document_manifest export only. Use PRODUCTION_APP_URL=<confirm exact public production Vinea app URL>, PRODUCTION_SUPABASE_PROJECT_LABEL=Vinea production Supabase project, PRODUCTION_DEPLOYMENT_LABEL=Current production Vercel deployment, REQUEST_DOCUMENT_MANIFEST_EXPORT_PRODUCTION_ROLLOUT_WINDOW=<confirm product-owner-approved low-traffic production smoke window>, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF=Designated production smoke staff account for Parish A, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A=Designated production smoke parish - Parish A, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST=Safe same-parish request for request_document_manifest export smoke, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET=Safe same-parish document checklist set with generic labels only, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST=Route-level cross-parish denial substitute using unauthorized active parish scope, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD=Signed-out browser export route check, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT=request_id plus signed_url/storage_path/original_filename/portal_token blocked-field attempt, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD=Staff Audit Log page filtered to export.request_document_manifest.downloaded, PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD=Export route returns generic unavailable behavior after flags are disabled, REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_OWNER=Vinea product owner, REQUEST_DOCUMENT_MANIFEST_EXPORT_MONITORING_CHANNEL=Owner-managed rollout notes channel, REQUEST_DOCUMENT_MANIFEST_EXPORT_SUPPORT_OWNER=Vinea product owner, REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_OWNER=Vinea engineering owner, and REQUEST_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_DECISION_DEADLINE=Within 30 minutes after the approved production smoke window ends. Run flag-off baseline first, then enable only the approved production export flags for the approved smoke window. Verify health, same-parish manifest CSV success, CSV field exclusions, cross-parish denial, blocked-field denial, family or unauthenticated denial, safe audit metadata, no signed URL/storage/file API usage, monitoring observations, and rollback. Keep the export manifest-only. Do not add staff-facing production UI, apply migrations, change operational RLS, touch Google Calendar data, mutate records beyond approved audit metadata, expose secrets, create signed URLs, expose storage paths, export original filenames, deliver document files, expose tokens, notes, communications, AI material, sacramental/canonical details, or expand exports beyond request_document_manifest.
```

## Final Readiness Checklist

Current recommendation: `NO-GO UNTIL THIS WORKSHEET IS FILLED WITH NON-SECRET VALUES AND THE EXACT FUTURE APPROVAL PROMPT IS PROVIDED`

Before approval, confirm:

- `PRODUCTION_APP_URL` is filled with a public app URL only.
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAFE_STAFF` is a label only and no password is recorded.
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_PARISH_A` is a label only.
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_SAME_PARISH_REQUEST` is a label only and no raw request ID is recorded.
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_DOCUMENT_SET` is a label only and no original filenames, storage paths, signed URLs, or document contents are recorded.
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_CROSS_PARISH_DENIED_REQUEST` is a label or substitute only.
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_FAMILY_OR_UNAUTH_DENIAL_METHOD` does not expose portal tokens.
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_BLOCKED_FIELD_ATTEMPT` is a field-name test only and contains no real token, signed URL, storage path, original filename, or document content.
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_AUDIT_INSPECTION_METHOD` avoids raw CSV, tokens, signed URLs, document paths, original filenames, document contents, notes, communication bodies, and AI material.
- `PRODUCTION_DOCUMENT_MANIFEST_EXPORT_ROLLBACK_VERIFICATION_METHOD` is filled.
- Monitoring owner and channel are filled.
- Support owner is filled.
- Rollback owner and rollback decision deadline are filled.
- Rollout window is filled.
- Product owner is ready to provide the exact future approval language.

## What Changed Plain English

This worksheet gives you a safe fill-in form for the future production document checklist export test. It tells you what labels and owner names to provide, and it warns you not to paste passwords, database links, raw IDs, tokens, signed links, file paths, filenames, document contents, notes, or private parish details.

## Next Recommended Safe Step

Use this worksheet to prepare non-secret production labels and owners only. Production `request_document_manifest` export remains `NO-GO` until the worksheet is filled and the product owner later provides the exact approval prompt from this completed template.
