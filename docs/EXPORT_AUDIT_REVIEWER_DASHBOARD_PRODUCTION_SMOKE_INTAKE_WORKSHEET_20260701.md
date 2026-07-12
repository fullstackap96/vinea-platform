# Export Audit Reviewer Dashboard Production Smoke Intake Worksheet - 2026-07-01

Status: Prepared as a human-fillable intake worksheet only. Production was not accessed, production flags were not enabled, production navigation was not added, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, and no secrets were exposed.

Current decision state: `PRODUCTION EXPORT AUDIT REVIEWER DASHBOARD SMOKE NOT APPROVED BY THIS WORKSHEET`

Completion marker: `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260701`

## Purpose

Use this worksheet to collect the non-secret labels needed before a future production smoke test of the export audit reviewer dashboard.

This worksheet supports the formal approval packet:

- `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_READINESS_APPROVAL_PACKET_20260701.md`

It does not approve production flags, production dashboard exposure, production navigation, production exports, reviewer disposition writes, migrations, operational RLS changes, Google Calendar behavior, storage access, signed URL creation, raw audit metadata exposure, raw export exposure, or record mutation.

## Recommended Non-Secret Filled Draft

These are recommended non-secret labels for a future production dashboard smoke. They intentionally avoid passwords, database URLs, raw IDs, session cookies, service-role keys, tokens, signed URLs, storage paths, raw audit metadata, raw exports, document names, internal notes, communication bodies, AI material, and sacramental/canonical details.

Current draft status: `RECOMMENDED LABELS PREPARED - PRODUCT OWNER MUST CONFIRM PUBLIC URL, ROLLOUT WINDOW, AND NAMED OWNERS BEFORE APPROVAL`

- `PRODUCTION_APP_URL`: `Public production Vinea app URL - product owner confirms exact public URL before approval`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_DASHBOARD_DEPLOYMENT_LABEL`: `Current production Vercel deployment`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPABASE_LABEL`: `Vinea production Supabase project`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_SAFE_STAFF`: `Designated production smoke staff reviewer for Parish A`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_PARISH_A`: `Designated production smoke parish - Parish A`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_DOWNLOADED_EVENT`: `Existing safe downloaded export audit event for Parish A`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_DENIED_EVENT`: `Existing safe denied export audit event for Parish A`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_EMPTY_FILTER_CASE`: `Saved-filter case expected to show an empty safe state`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_METHOD`: `Route-level forged active parish or unauthorized parish switch denial substitute`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_FAMILY_OR_UNAUTH_DENIAL_METHOD`: `Signed-out browser dashboard/API check`
- `EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_OWNER`: `Vinea product owner`
- `EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL`: `Owner-managed rollout notes channel`
- `EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER`: `Vinea product owner`
- `EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER`: `Vinea engineering owner`
- `EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER`: `Vinea product owner`
- `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ROLLOUT_WINDOW`: `Product-owner-approved low-traffic production smoke window`

Recommended confirmations:

- Staff reviewer is authorized for `PRODUCTION_EXPORT_AUDIT_REVIEWER_PARISH_A`: `yes - confirm during future smoke setup without recording raw IDs`
- Dashboard remains direct-URL-only unless a separate production navigation approval exists: `yes`
- Production exports remain `NO-GO`: `yes`
- Dashboard is read-only: `yes`
- No export/download controls will be used or expected: `yes`
- Downloaded event label contains safe read-model metadata only: `yes`
- Denied event label contains safe read-model metadata only: `yes`
- Empty filter shows no private fallback data: `yes`
- Cross-parish denial method does not require recording raw parish, request, staff, or audit IDs: `yes`
- Family/unauthenticated denial method does not require recording a family portal token: `yes`
- Monitoring covers `/api/health`, dashboard route status, reviewer API status, denial status, server errors, and leakage signals: `yes`
- Support owner understands no production export route, export button, file access, raw metadata, or production navigation is approved: `yes`
- Rollback is by disabling production reviewer dashboard flags only: `yes`
- Evidence storage will keep screenshots and notes free of secrets, raw audit metadata, raw exports, storage paths, signed URLs, document names, private notes, communications, AI material, and sacramental/canonical details: `yes`

## Important Safety Rules

Fill this worksheet with labels and plain-language descriptions only.

Do include:

- A production app URL that is already public.
- Human names or role labels for owners.
- Safe fixture labels, such as `Designated production smoke staff reviewer`.
- Plain-language audit-event labels, such as `Safe downloaded export audit event for Parish A`.
- A rollout date/time window and timezone.
- A monitoring channel name, such as `Vinea ops notes channel` or `Owner text thread`.
- An evidence storage owner label.

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
- Raw UUIDs for parish, staff, request, document, storage, or audit records.
- Family portal tokens or token hashes.
- Public intake tokens or token hashes.
- Signed URLs.
- Document storage paths.
- Original filenames.
- Document names if they reveal private details.
- Raw audit metadata.
- Raw export contents.
- Internal notes.
- Communication bodies.
- AI material.
- Sacramental/canonical details.

If a value feels like a password, token, database connection, secret key, raw ID, document path, filename, file content, raw audit payload, raw export, or sensitive pastoral/family data, do not paste it here.

## Values To Fill

### Production Target

Fill:

- `PRODUCTION_APP_URL`: `[FILL: public production app URL only]`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_DASHBOARD_DEPLOYMENT_LABEL`: `[FILL: deployment label only, no Vercel token]`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPABASE_LABEL`: `[FILL: Supabase project label only, no database URL or keys]`
- `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ROLLOUT_WINDOW`: `[FILL: date/time window and timezone]`

Confirm:

- Window is low-traffic or otherwise acceptable: `[FILL: yes/no]`
- Product owner, monitoring owner, support owner, rollback owner, and evidence storage owner are available during the window: `[FILL: yes/no]`

### Safe Staff Reviewer

Choose a real production staff account that is allowed to use Vinea and belongs to the test parish. Record a label, not the password.

Good examples:

- `Designated production smoke staff reviewer`
- `Parish A administrator account`
- `Pastor account for Parish A`

Fill:

- `PRODUCTION_EXPORT_AUDIT_REVIEWER_SAFE_STAFF`: `[FILL: safe staff reviewer label only, no password]`

Confirm:

- Staff reviewer can sign in without sharing credentials in this worksheet: `[FILL: yes/no]`
- Staff reviewer is authorized for the active parish: `[FILL: yes/no]`

### Active Parish

Choose the parish that the staff reviewer should select in the active parish switcher.

Fill:

- `PRODUCTION_EXPORT_AUDIT_REVIEWER_PARISH_A`: `[FILL: parish display name or safe parish label only]`

Confirm:

- Active parish label is enough for the smoke tester to select the parish without recording raw IDs: `[FILL: yes/no]`

### Downloaded Audit Event Fixture

Choose an existing safe downloaded export audit event for the selected parish.

Good examples:

- `Safe request_list_basic downloaded audit event`
- `Safe request_document_manifest downloaded audit event`
- `Recent successful export smoke audit event with safe metadata only`

Fill:

- `PRODUCTION_EXPORT_AUDIT_REVIEWER_DOWNLOADED_EVENT`: `[FILL: safe downloaded audit event label only, no raw metadata]`

Confirm:

- Event belongs to the active parish: `[FILL: yes/no]`
- Event read-model fields are safe to display: `[FILL: yes/no]`
- Event label does not include raw audit metadata, raw export contents, storage paths, signed URLs, document names, notes, communications, AI material, or sacramental/canonical details: `[FILL: yes/no]`

### Denied Audit Event Fixture

Choose an existing safe denied export audit event for the selected parish.

Good examples:

- `Safe blocked-field denied export event`
- `Safe unauthenticated denied export event`
- `Safe cross-parish denied export event`

Fill:

- `PRODUCTION_EXPORT_AUDIT_REVIEWER_DENIED_EVENT`: `[FILL: safe denied audit event label only, no raw metadata]`

Confirm:

- Event belongs to the active parish: `[FILL: yes/no]`
- Event read-model fields are safe to display: `[FILL: yes/no]`
- Event label does not reveal private denial target details: `[FILL: yes/no]`

### Empty Saved-Filter Fixture

Choose a saved-filter state that should return no rows and show the safe empty state.

Good examples:

- `Saved filter with no matching denied events`
- `Document manifest safety review filter with no current rows`

Fill:

- `PRODUCTION_EXPORT_AUDIT_REVIEWER_EMPTY_FILTER_CASE`: `[FILL: empty saved-filter label only]`

Confirm:

- Empty state does not show private fallback data: `[FILL: yes/no]`

### Cross-Parish Denial Method

Choose a safe way to prove the reviewer dashboard/API cannot read another parish's audit events.

Preferred choices:

- Use a forged active parish cookie route-level check.
- Switch to an unauthorized parish and confirm generic denial.
- Use a documented route-level substitute that proves unauthorized active parish scope is denied.

Fill:

- `PRODUCTION_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_METHOD`: `[FILL: cross-parish or forged-parish denial method label only]`

Confirm:

- Denial method does not require recording raw parish, staff, request, document, or audit IDs: `[FILL: yes/no]`
- Expected result is generic denial or unavailable behavior: `[FILL: yes/no]`

### Family Or Unauthenticated Denial Method

Choose a way to verify family-facing or unauthenticated users cannot access the reviewer dashboard/API.

Preferred choices:

- Open the dashboard route in a signed-out browser.
- Open the API route in a signed-out browser.
- Use a safe family portal session without recording the portal token.

Fill:

- `PRODUCTION_EXPORT_AUDIT_REVIEWER_FAMILY_OR_UNAUTH_DENIAL_METHOD`: `[FILL: signed-out browser, incognito browser, safe family portal session, or route-level substitute]`

Confirm:

- No family portal token will be recorded: `[FILL: yes/no]`
- Expected result is unauthenticated, unavailable, or generic denial before any read-model data is returned: `[FILL: yes/no]`

### Monitoring Owner And Channel

Choose who watches the production smoke and where observations are recorded.

Fill:

- `EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_OWNER`: `[FILL: person or role name]`
- `EXPORT_AUDIT_REVIEWER_DASHBOARD_MONITORING_CHANNEL`: `[FILL: channel or communication path]`

Confirm:

- Monitoring covers `/api/health`: `[FILL: yes/no]`
- Monitoring covers `/dashboard/admin/export-audit-reviewer`: `[FILL: yes/no]`
- Monitoring covers `/api/export-audit-reviewer`: `[FILL: yes/no]`
- Monitoring covers unauthenticated, family, and forged active parish denials: `[FILL: yes/no]`
- Monitoring covers unexpected server errors: `[FILL: yes/no]`
- Monitoring covers possible sensitive-data leakage signals: `[FILL: yes/no]`

### Support Owner

Choose who handles staff/customer questions if the dashboard is unavailable or if a denial is reported.

Fill:

- `EXPORT_AUDIT_REVIEWER_DASHBOARD_SUPPORT_OWNER`: `[FILL: person or role name]`

Confirm:

- Support owner understands production exports remain `NO-GO`: `[FILL: yes/no]`
- Support owner understands production navigation is not approved: `[FILL: yes/no]`
- Support owner will not request screenshots containing private parishioner data, raw audit metadata, raw exports, document links, signed URLs, storage paths, tokens, passwords, internal notes, communications, AI material, or sacramental/canonical details: `[FILL: yes/no]`

### Rollback Owner

Choose who is responsible for turning production dashboard exposure back off.

Fill:

- `EXPORT_AUDIT_REVIEWER_DASHBOARD_ROLLBACK_OWNER`: `[FILL: person or role name]`
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_ROLLBACK_METHOD`: `[FILL: rollback method label only]`

Confirm:

- Rollback is by disabling production reviewer dashboard flags only: `[FILL: yes/no]`
- Rollback does not require a migration: `[FILL: yes/no]`
- Rollback does not require an operational RLS change: `[FILL: yes/no]`
- Rollback does not require Google Calendar changes: `[FILL: yes/no]`
- Rollback does not require storage cleanup, signed URL revocation, export file cleanup, or record mutation: `[FILL: yes/no]`
- Rollback verification is dashboard/API returning generic unavailable behavior: `[FILL: yes/no]`

### Evidence Storage Owner

Choose who stores the smoke evidence and confirms it is redacted.

Fill:

- `EXPORT_AUDIT_REVIEWER_DASHBOARD_EVIDENCE_STORAGE_OWNER`: `[FILL: person or role name]`

Confirm:

- Evidence will not include passwords, cookies, tokens, keys, raw database URLs, or raw IDs: `[FILL: yes/no]`
- Evidence will not include raw audit metadata, raw exports, storage paths, signed URLs, original filenames, private notes, communication bodies, AI material, or sacramental/canonical details: `[FILL: yes/no]`
- Evidence will include flag-off baseline, flag-on dashboard check, saved filters, denial checks, monitoring observations, rollback verification, and final sign-off: `[FILL: yes/no]`

## Final No-Go Checklist

Current recommendation: `NO-GO UNTIL THIS WORKSHEET IS FILLED WITH NON-SECRET VALUES AND A SEPARATE PRODUCTION DASHBOARD GATE IMPLEMENTATION APPROVAL IS PROVIDED`

Before any future production smoke preparation:

- `PRODUCTION_APP_URL` is filled with a public URL only.
- `EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_ROLLOUT_WINDOW` is filled with an exact date/time window and timezone.
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_SAFE_STAFF` is a label only and no password is recorded.
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_PARISH_A` is a label only and no raw parish ID is recorded.
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_DOWNLOADED_EVENT` is a label only and no raw audit metadata is recorded.
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_DENIED_EVENT` is a label only and no raw audit metadata is recorded.
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_EMPTY_FILTER_CASE` is a label only.
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_CROSS_PARISH_DENIAL_METHOD` is a label only and no raw IDs are recorded.
- `PRODUCTION_EXPORT_AUDIT_REVIEWER_FAMILY_OR_UNAUTH_DENIAL_METHOD` records no family portal token.
- Monitoring owner and channel are filled.
- Support owner is filled.
- Rollback owner and rollback method are filled.
- Evidence storage owner is filled.
- Dashboard remains read-only.
- Production exports remain `NO-GO`.
- Production navigation remains `NO-GO` unless a separate approval packet is completed.
- Production dashboard exposure remains `NO-GO` until a future production-specific dashboard gate implementation is approved and then separately smoke-approved.

## Copy/Paste Summary For Future Approval

Use this only after every field above is filled with non-secret values and the product owner is ready to approve production smoke preparation for the dashboard gate implementation:

```text
Approve production smoke preparation for the export audit reviewer dashboard only using the filled non-secret worksheet `docs/EXPORT_AUDIT_REVIEWER_DASHBOARD_PRODUCTION_SMOKE_INTAKE_WORKSHEET_20260701.md`. Implement the production-specific reviewer dashboard gate behind disabled-by-default flags, preserving flag-off production blocking, requiring route/surface allowlist, approval id, expiration inside the approved rollout window, rollback owner, monitoring channel, support owner, and evidence storage owner labels, and keeping production navigation disabled. Do not enable production flags, add production navigation, enable production exports, apply migrations, change operational RLS, touch Google Calendar data, mutate records, access storage, create signed URLs, expose raw exports, expose raw metadata, expose secrets, or run the production smoke yet. After implementation, production dashboard exposure remains NO-GO until I separately approve the exact production smoke rollout window.
```

Production export audit reviewer dashboard smoke remains `NO-GO` until this worksheet is filled, the production dashboard gate implementation is separately approved, the gate implementation passes checks, and the product owner later approves the exact production smoke rollout window.

## What Changed Plain English

This worksheet gives you a safe way to prepare for a future production test of the export-audit review screen without pasting secrets or private parish data. It asks for labels like "safe staff reviewer" and "safe downloaded audit event" instead of passwords, IDs, files, or raw logs.

It does not turn anything on. It helps Vinea avoid a rushed production rollout by making the future approval path boring, explicit, and easy to review.
