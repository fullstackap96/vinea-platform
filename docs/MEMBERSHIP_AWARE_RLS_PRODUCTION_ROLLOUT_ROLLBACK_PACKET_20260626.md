# Membership-Aware Operational RLS Production Rollout And Rollback Packet - 2026-06-26

Status: Prepared as a production runbook only. Do not execute this packet until product owner, technical owner, QA owner, and security/data owner approvals are all recorded. Production was not touched while preparing this packet, no migrations were applied, and runtime behavior was not changed.

## Scope

Migration:

- Forward migration: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`
- Rollback SQL: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`
- Production sign-off template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md`
- Production smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Production rollout evidence template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md`
- Production final approval readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`

Out of scope:

- Runtime public intake routing.
- Public intake feature flags.
- Operational table schema redesign.
- Staff membership data changes.
- Any production data cleanup.

## Named Sign-Off Placeholders

Do not continue until every row is completed by a named person.

| Role | Name | Date/time | Decision | Evidence reviewed |
|---|---|---:|---|---|
| Product owner | `PENDING` | `PENDING` | `PENDING` | Production readiness gate, shared QA smoke, rollback packet |
| Technical owner | `PENDING` | `PENDING` | `PENDING` | Forward SQL, rollback SQL, health checks, migration command |
| QA owner | `PENDING` | `PENDING` | `PENDING` | Shared QA workflow/document/family portal evidence and production smoke plan |
| Security/data owner | `PENDING` | `PENDING` | `PENDING` | Cross-parish deny evidence, direct storage privacy, family portal safety |
| Rollback owner | `PENDING` | `PENDING` | `PENDING` | Rollback SQL, rollback decision deadline, verification steps |

Approved decisions:

- `Proceed`
- `Hold`
- `Proceed with named conditions`

Any `Hold` blocks production.

## Required Environment Values

Set these only in the secure deployment shell. Do not commit or print secrets.

```powershell
$env:PRODUCTION_SUPABASE_DB_URL = "<production postgres connection string>"
$env:VINEA_PRODUCTION_BASE_URL = "https://<production Vinea app host>"
$env:PGSSLMODE = "require"
```

Safety checks before any SQL:

```powershell
$uri = [Uri]$env:PRODUCTION_SUPABASE_DB_URL
if ($uri.Host -notlike "db.*.supabase.co" -and $uri.Host -notlike "*.pooler.supabase.com") {
  throw "Refusing rollout: database host is not a Supabase host."
}
if ($env:VINEA_PRODUCTION_BASE_URL -notmatch "^https://") {
  throw "Refusing rollout: production app URL must be HTTPS."
}
"Target database host: $($uri.Host)"
"Target app host: $env:VINEA_PRODUCTION_BASE_URL"
```

## Pre-Rollout Checks

Run before applying the migration.

1. Confirm the exact git commit or release tag intended for production.
2. Confirm the production deployment currently matches that commit or release tag.
3. Confirm no unrelated deployment is in progress.
4. Confirm rollback owner is present.
5. Confirm `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md` is complete, including production-safe staff credentials and production-safe request/document/family portal test records.
6. Confirm `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_EVIDENCE_TEMPLATE_20260626.md` has an evidence owner and storage location ready for the rollout window.
7. Confirm `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md` has final decision `GO` before touching production.
8. Confirm public intake runtime routing is not being changed in this rollout.
9. Run automated checks locally on the exact production-intended commit:

```powershell
npm.cmd test -- --reporter=dot
npm.cmd run lint
npm.cmd run build
```

8. Capture pre-apply health:

```powershell
Invoke-RestMethod -Uri "$env:VINEA_PRODUCTION_BASE_URL/api/health" -Method Get
```

Pass criteria:

- `ok` is `true`.
- `checks.schema` is `true`.
- `checks.supabase` is `true`.
- No deploy, auth, Supabase, or route error spike is already active.

## Forward Migration Command

Run only after every sign-off is complete and pre-rollout checks pass.

```powershell
psql "$env:PRODUCTION_SUPABASE_DB_URL" `
  -v ON_ERROR_STOP=1 `
  -f "supabase/migrations/20260626170000_membership_aware_operational_rls.sql"
```

Immediately record:

- Operator name.
- Timestamp.
- Database host, without credentials.
- Command exit status.
- Any SQL output or error text, with secrets removed.

## Post-Apply Verification

Run immediately after the forward migration.

### Health

```powershell
Invoke-RestMethod -Uri "$env:VINEA_PRODUCTION_BASE_URL/api/health" -Method Get
```

Pass criteria:

- HTTP status is `200`.
- `ok` is `true`.
- `checks.schema` is `true`.
- `checks.supabase` is `true`.

### Policy Shape Verification

Use a read-only SQL session.

```powershell
psql "$env:PRODUCTION_SUPABASE_DB_URL" `
  -v ON_ERROR_STOP=1 `
  -c "select count(*) filter (where qual::text ilike '%request_belongs_to_staff_parish%' or qual::text ilike '%is_authorized_for_parish%') as membership_refs, count(*) filter (where qual::text ilike '%primary_parish_id%' or qual::text ilike '%request_belongs_to_primary_parish%') as primary_refs from pg_policies where schemaname = 'public';"
```

Pass criteria:

- Membership-aware references are present.
- Primary-parish operational policy references are cleared or limited only to compatibility functions outside the promoted operational policies.
- `request_belongs_to_staff_parish(uuid)` exists.

### Active-Parish-Cookie Request Detail And Document Smoke

Use production-safe staff credentials and a production-safe test request. Do not use real parishioner private documents.

1. Sign in as an authorized staff user.
2. Select or set the intended active parish so the browser has `vinea_active_parish_id`.
3. Open the request detail page for a request in that active parish.
4. Confirm the page returns HTTP `200` and does not show login or unauthorized content.
5. Open the request document panel.
6. Upload a safe text file tied to a family-facing workflow step.
7. Open the staff signed URL route for the uploaded document.
8. Fetch the signed URL and confirm the safe text file content is returned.
9. Attempt direct Supabase Storage access as anon and confirm it is denied.
10. Approve or reject the test document and confirm the status update is visible.

Pass criteria:

- Request detail page works with `vinea_active_parish_id` present.
- Document list/upload/signed URL/review works for authorized staff.
- Direct storage access remains private.
- No unauthorized parish request or document appears.

### Family Portal Safety Smoke

Use the same production-safe test request.

1. Generate a family portal token from the staff request detail page or route.
2. Confirm the response does not expose `token_hash`.
3. Open the family portal URL in a clean browser/session.
4. Confirm the family portal shows only safe family-facing request details.
5. Confirm it does not show internal notes, staff-only notes, AI notes, audit logs, token hashes, or private parish data.
6. Upload a safe family document.
7. Confirm staff can see the uploaded document on the request.

Pass criteria:

- Family portal loads with HTTP `200`.
- Family upload works only for the token-scoped request.
- No staff-only or cross-parish data is exposed.

### Staff Workflow Smoke

Use production-safe test records only.

1. Dashboard loads for authorized staff.
2. Request list honors selected parish.
3. Request status update works.
4. Assignment update works.
5. Follow-up date update works.
6. Internal note creation works.
7. Workflow step update works.
8. People, Households, Sacramental Records, Mass Intentions, Settings, Reports, Calendar, Communications, Intake Queue, Notifications, and Global Search open without cross-parish leakage.

## Monitoring Expectations

Watch for at least 30 minutes after apply, and longer if parish staff are actively using the app.

Monitor:

- `/api/health` status and `checks.schema`.
- Staff login failures.
- `403` or `404` spikes on `/dashboard/requests/[id]`.
- `403` or `404` spikes on `/api/requests/[id]/documents`.
- `403` or `404` spikes on `/api/requests/[id]/portal-token`.
- Supabase policy errors mentioning RLS, `is_authorized_for_parish`, or `request_belongs_to_staff_parish`.
- Family portal errors on `/family/request/[token]`.
- Document upload or signed URL errors.
- Support messages from parish staff about missing requests, people, records, documents, or mass intentions.

## Rollback Decision Criteria

Rollback immediately if any high-severity issue occurs and cannot be fixed within the rollout window:

- `/api/health` is not `ok: true` or `checks.schema: true`.
- Authorized staff cannot sign in or load the dashboard.
- Authorized staff cannot open request details for their parish.
- Authorized staff cannot access required request documents.
- Family portal exposes internal notes, staff-only data, audit logs, AI notes, token hashes, or private parish data.
- Unauthorized cross-parish data becomes visible.
- More than one core operational workflow fails for authorized staff.
- Supabase reports broad RLS policy errors across operational tables.

Hold and investigate without immediate rollback if:

- One isolated safe test record fails but live staff workflows remain healthy.
- A non-critical report or dashboard widget fails while request, document, and family portal safety remain intact.
- A known monitoring delay causes temporary uncertainty but no user-facing errors are observed.

## Rollback Command

Run only if rollback criteria are met or the rollback owner decides to revert during the approved window.

```powershell
psql "$env:PRODUCTION_SUPABASE_DB_URL" `
  -v ON_ERROR_STOP=1 `
  -f "docs/sql/membership_aware_operational_rls_rollback_draft.sql"
```

Immediately after rollback:

```powershell
Invoke-RestMethod -Uri "$env:VINEA_PRODUCTION_BASE_URL/api/health" -Method Get
```

Then rerun:

- Staff sign-in.
- Dashboard load.
- Request list.
- Request detail.
- Document list.
- Family portal safety check.

Rollback pass criteria:

- `/api/health` returns `ok: true` and `checks.schema: true`.
- Single-primary-parish staff access works.
- Request detail and document access return to the previous primary-parish scoped behavior.
- No family portal safety regression is present.

## Evidence Capture Template

| Field | Value |
|---|---|
| Production app host | `PENDING` |
| Production database host, no secret | `PENDING` |
| Git commit/release tag | `PENDING` |
| Rollout operator | `PENDING` |
| Rollback owner | `PENDING` |
| Product owner approval | `PENDING` |
| Technical owner approval | `PENDING` |
| QA owner approval | `PENDING` |
| Security/data owner approval | `PENDING` |
| Pre-apply health | `PENDING` |
| Forward migration result | `PENDING` |
| Post-apply health | `PENDING` |
| Policy shape verification | `PENDING` |
| Active-parish-cookie request/document smoke | `PENDING` |
| Family portal safety smoke | `PENDING` |
| Staff workflow smoke | `PENDING` |
| Monitoring result | `PENDING` |
| Rollback performed | `PENDING` |
| Final decision | `PENDING` |

## Final Decision Options

- `Proceed`: all checks passed and monitoring is clean.
- `Hold`: migration was not applied because a preflight or approval gate failed.
- `Rollback`: migration was applied, rollback criteria were met, rollback command was run, and post-rollback checks passed.

## Final Safety Statement

This packet is not production approval. It is the exact runbook to use only after named approvals are complete and the product owner explicitly approves production application.
