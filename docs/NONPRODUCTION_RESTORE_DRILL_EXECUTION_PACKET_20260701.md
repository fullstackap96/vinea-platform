# Non-Production Restore Drill Execution Packet - 2026-07-01

Status: Prepared as a non-runtime execution packet/checklist only. No restore drill was executed, production was not accessed, production flags were not enabled, production navigation was not added, production smoke was not run, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, and no secrets were exposed while preparing this packet.

Current decision state: `NON-PRODUCTION RESTORE DRILL EXECUTION PACKET PREPARED; RESTORE DRILL NOT EXECUTED; BACKUP/RESTORE PUBLIC CLAIMS REMAIN NO-GO`

Completion marker: `NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701`

## Purpose

This packet turns the backup/restore runbook into a step-by-step checklist for a future disposable or explicitly approved non-production restore drill.

It is designed to help an operator fill a dated copy of:

- `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md`

Primary runbook:

- `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`

Related trust-center docs:

- `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md`
- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`

This packet does not approve production access, production restore work, production data restoration, production RLS changes, migrations, runtime changes, destructive cleanup, storage access, signed URL creation, or public backup/restore readiness claims.

## Execution Boundary

Allowed future target:

- Disposable Supabase project, or
- Explicitly approved non-production Supabase project, or
- Explicitly approved non-production app/database pair used only for a restore drill.

Forbidden target:

- Production Supabase project.
- Production Vercel deployment.
- Production storage bucket.
- Any environment containing private production parishioner documents unless separately approved by product owner and security/data owner.

Required future approval phrase before execution:

```text
APPROVED_NONPRODUCTION_RESTORE_DRILL_EXECUTION
```

This packet must not be executed from a prompt that omits the exact approval phrase above.

Use `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md` to collect the required target labels, owner sign-offs, evidence filename, stop-condition acceptance, and exact approval language before execution.

## Evidence Privacy Rules

Record labels, counts, pass/fail observations, timestamps, redacted screenshots, and owner names only.

Do not paste:

- Database URLs.
- Database passwords.
- Supabase anon keys.
- Supabase service role keys.
- Vercel tokens.
- Google OAuth tokens.
- OpenAI API keys.
- Session cookies.
- Raw backup URLs.
- Signed URLs.
- Storage paths.
- Original filenames.
- Family portal tokens or token hashes.
- Public intake tokens or token hashes.
- Raw parish IDs.
- Raw staff IDs.
- Raw request IDs.
- Raw document IDs.
- Raw audit event IDs.
- Private document contents.
- Internal notes.
- Communication bodies.
- AI prompts, outputs, provider payloads, or token material.
- Sacramental/canonical details.

If a piece of evidence would require private data, record a redacted observation instead.

## Pre-Execution Approval Checklist

| Gate | Required evidence before execution | Result |
|---|---|---|
| Target ownership | Non-production environment owner approves the drill | `PENDING` |
| Target identity | Target project/ref/host label recorded without secrets | `PENDING` |
| Production exclusion | Operator confirms target is not production | `PENDING` |
| Backup source | Safe backup/source snapshot description recorded without raw URL or secret | `PENDING` |
| Restore scope | Database, storage, auth, app, and integration scope selected | `PENDING` |
| Data privacy | No production private documents included unless separately approved | `PENDING` |
| Cleanup owner | Cleanup/reset owner is named | `PENDING` |
| Evidence owner | Evidence storage owner is named | `PENDING` |
| Rollback/abort path | Abort criteria and cleanup plan are documented | `PENDING` |
| Approval phrase | `APPROVED_NONPRODUCTION_RESTORE_DRILL_EXECUTION` supplied | `PENDING` |

Do not proceed unless every row is `PASS`.

## Evidence File Setup

Before the drill:

1. Create a dated evidence copy from `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md`.
2. Use a filename like `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_YYYYMMDD_<TARGET_LABEL>.md`.
3. Fill only non-secret labels.
4. Record `Drill result` as `Blocked before execution` until the drill actually starts.
5. Keep `Restore readiness claim allowed?` as `No` until the evidence is reviewed and approved.

Pass criteria:

- The evidence file has no secrets, raw IDs, raw backup URLs, signed URLs, storage paths, document names, private content, raw metadata, or raw exports.

## Baseline Capture Steps

| Step | Expected evidence | Pass/fail criteria |
|---|---|---|
| Confirm target identity | Non-secret target label and host/ref label | Target is disposable or approved non-production |
| Confirm production exclusion | Product owner/security owner statement or operator confirmation | Target is not production |
| Capture app health if app used | `/api/health` observation only | Health observed or degraded mode documented |
| Capture schema state | Table/migration summary counts only | Expected baseline recorded without raw row data |
| Capture storage baseline if storage used | Bucket/object count labels only | Synthetic-only or approved non-production objects |
| Capture auth baseline if auth used | Safe staff fixture label only | No passwords or session cookies recorded |
| Confirm cleanup plan | Named cleanup owner and target reset plan | Cleanup path is known before restore starts |

## Restore Execution Steps

Use only future-approved commands or Supabase/Vercel console actions. This packet intentionally does not include executable commands or secrets.

| Step | Expected action | Evidence note |
|---|---|---|
| Select source | Select safe backup/source snapshot or schema replay source | Description only, no raw URL |
| Restore database | Restore/replay into approved non-production target | Sanitized result and duration only |
| Restore storage | Restore synthetic storage objects or document exclusion decision | Synthetic-only or excluded |
| Verify auth posture | Confirm safe staff fixture or service-level check | No password/session evidence |
| Verify app config | Confirm non-production env labels | No env secret values |
| Restart/redeploy if needed | Restart approved non-production app only | Deployment label only |
| Record errors | Capture sanitized errors | No credentials, raw data, or private content |

Stop immediately if:

- The target appears to be production.
- A production credential is required.
- A production private document would be copied into an unapproved target.
- A destructive cleanup would affect anything outside the approved target.
- Evidence would require exposing a secret or private parishioner data.

## Post-Restore Verification Matrix

| Area | Required check | Pass/fail criteria |
|---|---|---|
| Health | `/api/health` if app instance is used | HTTP 200 and `checks.schema=true`, or degraded mode documented |
| Schema | Expected base tables and migration state | Required tables present and no unexpected missing schema |
| Staff sign-in | Safe non-production staff fixture | Sign-in works or service-level substitute documented |
| Staff authorization | Parish scope limits access | Same-parish allowed and cross-parish denied or substitute documented |
| People/households | Safe records visible | Counts or labels only |
| Requests | Safe request detail opens | No internal/private data copied into evidence |
| Workflow steps | Safe workflow step present | Counts or labels only |
| Sacramental records | Safe record present or intentionally excluded | No canonical/private details copied |
| Mass intentions | Safe record present or intentionally excluded | Counts or labels only |
| Audit events | Safe audit event present or intentionally excluded | No raw metadata copied |
| Documents | Synthetic document route works if storage is included | No real private documents |
| Direct storage privacy | Direct storage access denied | No signed URLs pasted |
| Family portal | Safe family page excludes internal data | No token material recorded |
| Public intake | Healthy or known degraded mode | No production routing changes |
| Integrations | Google/email/AI healthy or disabled/degraded | No external credential values recorded |

## Cleanup And Reset Steps

| Step | Expected action | Pass/fail criteria |
|---|---|---|
| Disable temporary access | Remove temporary non-production credentials or confirm they were not created | No secrets retained |
| Remove synthetic records | Delete or retain only with evidence-owner approval | Shared non-production target left clean |
| Remove synthetic storage | Delete or retain only with evidence-owner approval | No private files retained |
| Clear temporary env vars | Clear process/local variables used for the drill | No secrets in shell history/evidence |
| Reset target ownership | Hand back target to owner | Owner confirms target state |
| Final evidence review | Security/data reviewer checks evidence | No secrets or private data in evidence |

## Final Evidence Review

Before claiming a completed non-production restore drill:

- Evidence file has `Drill result` set to `Passed`, `Passed with follow-ups`, or `Failed`.
- Evidence file does not contain secrets or raw private data.
- Security/data reviewer approved evidence handling.
- Backup owner reviewed restore results.
- Follow-up owner is assigned for any failures.
- Restore readiness claim remains conservative unless product owner approves stronger wording.

Allowed post-drill internal claim after a passed drill:

> Vinea has completed a non-production restore drill and recorded sanitized evidence.

Still do not claim:

> Vinea has completed production restore drills.

Still do not claim:

> Vinea is formally certified for backup and disaster recovery.

## Blocked Or Aborted Drill Handling

If the drill is blocked before execution:

1. Fill the evidence file with `Drill result = Blocked before execution`.
2. Record the blocker using labels only.
3. Do not run partial restore steps.
4. Do not change cleanup scope.
5. Keep backup/restore public claims blocked.

Common blockers:

- No approved non-production target.
- No safe backup/source description.
- Missing environment owner.
- Missing cleanup owner.
- Missing evidence owner.
- Target cannot be confirmed non-production.
- Required evidence would expose secrets or private data.

## What Changed Plain English

This packet gives Vinea a safe step-by-step plan for a future practice restore. It tells the operator what to check before starting, what to record during the drill, what must pass afterward, and how to clean up. It does not run the drill and it does not touch any database.

## Next Recommended Safe Step

Use this packet only after an explicitly approved disposable or non-production target is selected. Until a drill is actually executed and evidence is reviewed, public backup/restore readiness claims remain `NO-GO`.
