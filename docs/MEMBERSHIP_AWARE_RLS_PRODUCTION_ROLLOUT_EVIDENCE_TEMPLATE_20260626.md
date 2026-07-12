# Membership-Aware Operational RLS Production Rollout Evidence Template - 2026-06-26

Status: Template prepared only. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed while preparing this template.

## Purpose

Use this template during the actual production rollout window for membership-aware operational RLS. It captures the evidence needed to prove the rollout was prepared, executed, monitored, cleaned up, or rolled back safely.

Related docs:

- Production smoke-test data checklist: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md`
- Production sign-off template: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md`
- Production rollout/rollback packet: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md`
- Production readiness gate: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md`
- Production final approval readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`
- Forward migration: `supabase/migrations/20260626170000_membership_aware_operational_rls.sql`
- Rollback SQL: `docs/sql/membership_aware_operational_rls_rollback_draft.sql`

## Safety Rules

- Do not paste database passwords, service role keys, session cookies, family portal raw tokens, or signed document URLs into this evidence record.
- Record database and app target identity without secrets.
- Use only the production-safe staff account, parish, request, workflow step, documents, and family portal plan listed in the smoke-test data checklist.
- Do not combine runtime public intake routing, unrelated deployments, or unrelated data cleanup with this rollout.
- Stop and use the rollback decision section if any high-severity permission, privacy, health, or staff access issue appears.

## Rollout Identity

Record before execution:

| Field | Value |
|---|---|
| Evidence owner | `PENDING` |
| Rollout operator | `PENDING` |
| Rollout date/time window | `PENDING` |
| Rollback decision deadline | `PENDING` |
| Production app host, no secrets | `PENDING` |
| Production database host, no credentials | `PENDING` |
| Git commit or release tag | `PENDING` |
| Public intake runtime routing unchanged | `PENDING` |
| Operational RLS production approval prompt/link | `PENDING` |
| Final approval readiness decision is `GO` | `PENDING` |

Pass criteria:

- The target host identities match the approved production environment.
- The commit or release tag matches the production-intended code.
- The rollout window includes enough time for forward verification, smoke tests, monitoring, cleanup, and rollback if needed.

## Completed Smoke-Test Data Checklist

Record before execution:

| Required checklist item | Status | Evidence note |
|---|---|---|
| Staff account selected | `PENDING` | `PENDING` |
| Active parish selected | `PENDING` | `PENDING` |
| Production-safe request selected | `PENDING` | `PENDING` |
| Workflow step selected | `PENDING` | `PENDING` |
| Staff test document content prepared | `PENDING` | `PENDING` |
| Family test document content prepared | `PENDING` | `PENDING` |
| Family portal token plan prepared | `PENDING` | `PENDING` |
| Monitoring owner/channel prepared | `PENDING` | `PENDING` |
| Cleanup/evidence plan prepared | `PENDING` | `PENDING` |

Pass criteria:

- `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SMOKE_TEST_DATA_CHECKLIST_20260626.md` is complete.
- No real parishioner private document is used.
- The raw family portal token is not stored in this record.

## Named Sign-Offs

Record before execution:

| Role | Name | Date/time | Decision | Evidence reviewed | Conditions |
|---|---|---:|---|---|---|
| Product owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Technical owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| QA owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Security/data owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |
| Rollback owner | `PENDING` | `PENDING` | `PENDING` | `PENDING` | `PENDING` |

Pass criteria:

- Every role has a named approver.
- No decision is `Hold` or `Reject`.
- Any named conditions are explicit and satisfied before execution.

## Automated Checks

Record immediately before execution:

| Check | Command | Result | Evidence note |
|---|---|---|---|
| Tests | `npm.cmd test -- --reporter=dot` | `PENDING` | `PENDING` |
| Lint | `npm.cmd run lint` | `PENDING` | `PENDING` |
| Build | `npm.cmd run build` | `PENDING` | `PENDING` |

Pass criteria:

- Tests pass on the production-intended commit.
- Lint has no errors.
- Build completes successfully.

## Pre-Apply Health

Record before applying the migration:

| Field | Value |
|---|---|
| Timestamp | `PENDING` |
| HTTP status | `PENDING` |
| `ok` | `PENDING` |
| `checks.schema` | `PENDING` |
| `checks.supabase` | `PENDING` |
| Error spike already active? | `PENDING` |
| Evidence location | `PENDING` |

Pass criteria:

- HTTP status is `200`.
- `ok` is `true`.
- `checks.schema` is `true`.
- `checks.supabase` is `true`.
- No relevant error spike is already active.

## Forward Migration Output

Record immediately after running the forward migration:

| Field | Value |
|---|---|
| Command used | `psql "$env:PRODUCTION_SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "supabase/migrations/20260626170000_membership_aware_operational_rls.sql"` |
| Operator | `PENDING` |
| Timestamp | `PENDING` |
| Exit status | `PENDING` |
| Sanitized SQL output location | `PENDING` |
| Errors observed | `PENDING` |

Pass criteria:

- Exit status is success.
- SQL output contains no unresolved errors.
- Evidence excludes credentials.

## Post-Apply Health

Record immediately after the forward migration:

| Field | Value |
|---|---|
| Timestamp | `PENDING` |
| HTTP status | `PENDING` |
| `ok` | `PENDING` |
| `checks.schema` | `PENDING` |
| `checks.supabase` | `PENDING` |
| Evidence location | `PENDING` |

Pass criteria:

- HTTP status is `200`.
- `ok` is `true`.
- `checks.schema` is `true`.
- `checks.supabase` is `true`.

## Policy Shape Verification

Record after post-apply health passes:

| Field | Value |
|---|---|
| Membership-aware operational policy references present | `PENDING` |
| Primary-parish operational policy references cleared | `PENDING` |
| `request_belongs_to_staff_parish(uuid)` exists | `PENDING` |
| Sanitized query output location | `PENDING` |

Pass criteria:

- Membership-aware policy references are present for operational tables.
- Primary-parish operational policy references are absent except for documented compatibility helpers outside the promoted policy shape.
- `request_belongs_to_staff_parish(uuid)` exists.

## Active-Parish-Cookie Request And Document Smoke

Use the production-safe staff account, active parish, request, workflow step, and staff test document from the smoke-test data checklist.

| Step | Result | Evidence note |
|---|---|---|
| Staff signs in successfully | `PENDING` | `PENDING` |
| Active parish selected or cookie present | `PENDING` | `PENDING` |
| `vinea_active_parish_id` present during smoke | `PENDING` | `PENDING` |
| Request detail page returns HTTP `200` | `PENDING` | `PENDING` |
| Request detail page does not show unauthorized/login shell | `PENDING` | `PENDING` |
| Document panel loads | `PENDING` | `PENDING` |
| Staff safe document upload succeeds | `PENDING` | `PENDING` |
| Staff signed URL route succeeds | `PENDING` | `PENDING` |
| Signed URL fetch returns only safe synthetic file content | `PENDING` | `PENDING` |
| Direct Supabase Storage access is denied | `PENDING` | `PENDING` |
| Document approve/reject action works | `PENDING` | `PENDING` |
| No unrelated parish request or document appears | `PENDING` | `PENDING` |

Pass criteria:

- Authorized staff can use request detail and document routes with `vinea_active_parish_id` present.
- Direct storage remains private.
- No cross-parish or staff-only data leaks.

## Family Portal Safety Smoke

Use the production-safe request and family portal token plan from the smoke-test data checklist.

| Step | Result | Evidence note |
|---|---|---|
| Portal token generated for safe request | `PENDING` | `PENDING` |
| Token creation response does not expose `token_hash` | `PENDING` | `PENDING` |
| Raw token not stored in this record | `PENDING` | `PENDING` |
| Family portal opened in clean session | `PENDING` | `PENDING` |
| Family portal returns HTTP `200` | `PENDING` | `PENDING` |
| Family portal shows only safe family-facing request details | `PENDING` | `PENDING` |
| Internal notes absent | `PENDING` | `PENDING` |
| Staff-only notes absent | `PENDING` | `PENDING` |
| AI notes absent | `PENDING` | `PENDING` |
| Audit logs absent | `PENDING` | `PENDING` |
| Token hashes absent | `PENDING` | `PENDING` |
| Private parish data absent | `PENDING` | `PENDING` |
| Safe family document upload succeeds | `PENDING` | `PENDING` |
| Staff can see the family-uploaded document | `PENDING` | `PENDING` |

Pass criteria:

- Family portal is limited to the token-scoped request.
- Family upload works without exposing staff-only data.
- No token hash or raw secret is recorded in evidence.

## Monitoring Observations

Monitor for at least 30 minutes after apply.

| Observation | Result | Evidence note |
|---|---|---|
| Monitoring owner active | `PENDING` | `PENDING` |
| Monitoring channel active | `PENDING` | `PENDING` |
| `/api/health` remains healthy | `PENDING` | `PENDING` |
| No staff sign-in failure spike | `PENDING` | `PENDING` |
| No request detail `403` or `404` spike | `PENDING` | `PENDING` |
| No document route `403` or `404` spike | `PENDING` | `PENDING` |
| No family portal error spike | `PENDING` | `PENDING` |
| No broad Supabase RLS/policy error spike | `PENDING` | `PENDING` |
| No parish staff reports of missing data | `PENDING` | `PENDING` |
| Monitoring completed for at least 30 minutes | `PENDING` | `PENDING` |

Pass criteria:

- No high-severity health, permission, privacy, or staff workflow issue appears during the monitoring window.

## Cleanup And Deactivation

Record after smoke testing:

| Cleanup item | Result | Evidence note |
|---|---|---|
| Staff test document cleaned up or intentionally retained as evidence | `PENDING` | `PENDING` |
| Family test document cleaned up or intentionally retained as evidence | `PENDING` | `PENDING` |
| Request status restored if changed | `PENDING` | `PENDING` |
| Workflow step status restored if changed | `PENDING` | `PENDING` |
| Staff assignment/follow-up restored if changed | `PENDING` | `PENDING` |
| Family portal token deactivated or expiration confirmed | `PENDING` | `PENDING` |
| Evidence screenshots/logs reviewed for secrets | `PENDING` | `PENDING` |

Pass criteria:

- Temporary access is closed.
- No secrets, raw tokens, signed URLs, or private documents are preserved in evidence.
- Test changes are restored or intentionally retained with an owner and reason.

## Rollback Decision

Record before the rollback decision deadline:

| Field | Value |
|---|---|
| Decision | `PENDING` |
| Decision time | `PENDING` |
| Decision maker | `PENDING` |
| Reason | `PENDING` |
| Rollback owner available | `PENDING` |

Allowed decisions:

- `Continue production rollout`
- `Rollback now`
- `Hold and monitor with named conditions`

Rollback immediately if:

- `/api/health` is not `ok: true` or `checks.schema: true`.
- Authorized staff cannot open safe request detail or document routes.
- Unauthorized cross-parish data becomes visible.
- Direct storage privacy fails.
- Family portal exposes internal notes, AI notes, audit logs, token hashes, or private parish data.
- Supabase reports broad RLS/policy errors that cannot be corrected within the rollout window.

If rollback is executed, record:

| Rollback field | Value |
|---|---|
| Rollback command used | `psql "$env:PRODUCTION_SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "docs/sql/membership_aware_operational_rls_rollback_draft.sql"` |
| Rollback timestamp | `PENDING` |
| Rollback exit status | `PENDING` |
| Post-rollback `/api/health` | `PENDING` |
| Post-rollback request/document smoke | `PENDING` |
| Post-rollback sanitized output location | `PENDING` |

Rollback pass criteria:

- Rollback command succeeds.
- `/api/health` is healthy after rollback.
- Request detail, document routes, and family portal return to the expected prior behavior.

## Final Outcome

Record at the end of the rollout window:

| Field | Value |
|---|---|
| Final outcome | `PENDING` |
| Production RLS final state | `PENDING` |
| Rollback executed? | `PENDING` |
| Unresolved issues | `PENDING` |
| Follow-up owner | `PENDING` |
| Evidence package location | `PENDING` |
| Product owner final acknowledgement | `PENDING` |

Allowed final outcomes:

- `Production rollout completed and monitored`
- `Production rollout completed with named follow-ups`
- `Production rollout rolled back`
- `Production rollout held before migration`

## Current Template Outcome

- Current outcome: `Evidence template prepared; production rollout not executed`
- Current recommendation: `Do not apply production RLS until the checklist, sign-offs, and rollout approval are complete`
