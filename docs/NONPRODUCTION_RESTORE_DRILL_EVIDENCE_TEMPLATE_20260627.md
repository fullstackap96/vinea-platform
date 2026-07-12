# Vinea Non-Production Restore Drill Evidence Template - 2026-06-27

Status: Template prepared only. No restore drill was executed while preparing this template. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed.

## Purpose

Use this template, or a dated copy of it, to capture evidence from a disposable or explicitly approved non-production Vinea restore drill.

Related docs:

- Backup/restore runbook: `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`
- Non-production restore-drill execution packet: `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md`
- Trust-center readiness packet: `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- Build status: `docs/VINEA_BUILD_STATUS.md`

## Safety Confirmation

| Field | Value |
|---|---|
| Drill environment type | `PENDING` |
| Target project/ref/host, no secrets | `PENDING` |
| Confirmed not production | `PENDING` |
| Production credentials used? | `No` |
| Production private documents restored? | `No` |
| Runtime public intake routing changed? | `No` |
| Operational RLS changed? | `No` |
| Destructive cleanup approved by environment owner | `PENDING` |

Pass criteria:

- The target is disposable or explicitly approved non-production.
- No production secret, raw backup URL, signed URL, service role key, session cookie, or family portal raw token appears in evidence.

## Drill Identity

| Field | Value |
|---|---|
| Drill date/time | `PENDING` |
| Backup owner | `PENDING` |
| Restore operator | `PENDING` |
| Security/data reviewer | `PENDING` |
| Evidence owner | `PENDING` |
| Evidence storage location | `PENDING` |
| Backup source description, no secrets | `PENDING` |
| Restore target description, no secrets | `PENDING` |
| App instance used? | `PENDING` |

## Pre-Restore Baseline

| Check | Result | Evidence note |
|---|---|---|
| Target confirmed non-production | `PENDING` | `PENDING` |
| Existing target data inventory captured | `PENDING` | `PENDING` |
| Baseline `/api/health` captured, if app used | `PENDING` | `PENDING` |
| Baseline schema/migration state captured | `PENDING` | `PENDING` |
| Baseline storage bucket/object state captured | `PENDING` | `PENDING` |
| Cleanup/reset plan confirmed | `PENDING` | `PENDING` |

## Restore Execution

Record sanitized execution details only.

| Step | Result | Evidence note |
|---|---|---|
| Restore source selected | `PENDING` | `PENDING` |
| Database restore/replay executed | `PENDING` | `PENDING` |
| Storage restore/replay executed or intentionally excluded | `PENDING` | `PENDING` |
| Environment configuration verified | `PENDING` | `PENDING` |
| App redeploy/restart performed if needed | `PENDING` | `PENDING` |
| Errors observed | `PENDING` | `PENDING` |
| Sanitized command/output location | `PENDING` | `PENDING` |

## Post-Restore Verification

| Check | Result | Evidence note |
|---|---|---|
| `/api/health` healthy, if app used | `PENDING` | `PENDING` |
| Expected tables present | `PENDING` | `PENDING` |
| Expected migration state present | `PENDING` | `PENDING` |
| Staff sign-in or safe service smoke works | `PENDING` | `PENDING` |
| Staff authorization limits parish scope | `PENDING` | `PENDING` |
| People/households safe records present | `PENDING` | `PENDING` |
| Request detail safe record opens | `PENDING` | `PENDING` |
| Workflow step safe record present | `PENDING` | `PENDING` |
| Sacramental record safe record present | `PENDING` | `PENDING` |
| Mass intention safe record present | `PENDING` | `PENDING` |
| Audit event safe record present or intentionally excluded | `PENDING` | `PENDING` |
| Staff document route works with synthetic file | `PENDING` | `PENDING` |
| Signed URL route works with synthetic file | `PENDING` | `PENDING` |
| Direct storage access denied | `PENDING` | `PENDING` |
| Family portal safe page does not expose internal data | `PENDING` | `PENDING` |
| Public intake healthy or known degraded mode recorded | `PENDING` | `PENDING` |
| Google Calendar/email/AI healthy or known degraded mode recorded | `PENDING` | `PENDING` |

## Privacy And Data Handling Review

| Review item | Result | Evidence note |
|---|---|---|
| No real parishioner private documents used | `PENDING` | `PENDING` |
| No secrets in evidence | `PENDING` | `PENDING` |
| No raw family portal tokens in evidence | `PENDING` | `PENDING` |
| No signed document URLs in evidence | `PENDING` | `PENDING` |
| No cross-parish data exposure observed | `PENDING` | `PENDING` |
| Security/data reviewer approval | `PENDING` | `PENDING` |

## Recovery Objective Observation

These are observations, not approved public commitments.

| Field | Value |
|---|---|
| Observed restore point age | `PENDING` |
| Observed restore duration | `PENDING` |
| Observed verification duration | `PENDING` |
| Proposed RPO adjustment | `PENDING` |
| Proposed RTO adjustment | `PENDING` |

## Cleanup Confirmation

| Cleanup item | Result | Evidence note |
|---|---|---|
| Synthetic database records removed or intentionally retained | `PENDING` | `PENDING` |
| Synthetic storage files removed or intentionally retained | `PENDING` | `PENDING` |
| Temporary tokens revoked | `PENDING` | `PENDING` |
| Temporary credentials disabled or confirmed non-production only | `PENDING` | `PENDING` |
| Temporary environment variables cleared | `PENDING` | `PENDING` |
| Target reset or ownership handed back | `PENDING` | `PENDING` |

## Final Result

| Field | Value |
|---|---|
| Drill result | `PENDING` |
| Restore readiness claim allowed? | `No` |
| Required follow-ups | `PENDING` |
| Follow-up owner | `PENDING` |
| Next drill date | `PENDING` |

Allowed drill results:

- `Passed`
- `Passed with follow-ups`
- `Failed`
- `Blocked before execution`

## Final Outcome

- Current outcome: `Evidence template prepared; non-production restore drill not executed`
- Current recommendation: `Do not claim restore-drill completion until this template is filled from an actual non-production drill`
