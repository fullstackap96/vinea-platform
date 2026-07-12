# Vinea Backup And Restore Runbook - 2026-06-27

Status: Prepared as a backup/restore readiness runbook only. Production was not accessed, no migrations were applied, runtime behavior was not changed, and operational RLS was not changed while preparing this runbook.

## Purpose

This runbook defines how Vinea should prepare for, approve, execute, verify, and document backup and restore work for parish data.

It is written for production readiness, but the current evidence requirement is non-production only. Do not claim production restore readiness until this runbook has been executed in a disposable or explicitly approved non-production environment and evidence has been recorded.

Related docs:

- Trust-center readiness packet: `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- Non-production restore-drill evidence template: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md`
- Non-production restore-drill execution packet: `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md`
- Non-production restore-drill execution approval packet: `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md`
- Non-production restore-drill filled approval inputs: `docs/NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md`
- Non-production restore-drill disposable database replay and app/auth smoke evidence: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md`
- Storage-excluded restore-readiness decision packet: `docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md`
- Synthetic storage/document restore smoke approval packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md`
- Synthetic storage/document restore smoke evidence: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md`
- Synthetic storage/document restore owner review packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`
- Production RLS final approval readiness record: `docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_FINAL_APPROVAL_READINESS_RECORD_20260626.md`
- Build status: `docs/VINEA_BUILD_STATUS.md`

## Current Readiness

Current backup/restore readiness: `RUNBOOK PREPARED, NON-PRODUCTION DISPOSABLE DATABASE REPLAY AND APP/AUTH SMOKE RECORDED, STORAGE-EXCLUDED WORDING APPROVED FOR LIMITED INTERNAL/SALES-SUPPORT USE, SYNTHETIC STORAGE/DOCUMENT SMOKE EVIDENCE RECORDED, STRONGER LIMITED NON-PRODUCTION WORDING APPROVED, PRODUCTION RESTORE DRILL NOT YET EXECUTED`

Current execution support: `NON-PRODUCTION RESTORE DRILL EXECUTION PACKET AND APPROVAL PACKET PREPARED`

Current trust-center claim allowed:

> Vinea has a backup and restore runbook prepared and has completed a non-production disposable database schema replay plus app/auth smoke. Storage-excluded wording is approved for limited internal and sales-support use only, while storage/document plus production restore-readiness claims are still pending.

Do not claim:

> Vinea has completed production restore drills.

## Safety Rules

- Do not run restore commands against production from this runbook without a separate explicit production incident approval.
- Do not use production credentials in disposable or shared QA restore drills.
- Do not paste database passwords, service role keys, raw backup URLs, signed storage URLs, session cookies, or family portal tokens into evidence.
- Do not restore production private parishioner documents into an unapproved environment.
- Do not run destructive cleanup without a named environment owner and rollback/cleanup plan.
- Do not combine backup/restore drills with operational RLS promotion, public intake routing, or unrelated production changes.

## Roles

| Role | Responsibility | Required before production claim |
|---|---|---|
| Backup owner | Owns backup/restore runbook and evidence | `PENDING` |
| Restore operator | Executes approved restore drill or incident restore | `PENDING` |
| Product owner | Approves customer-impacting restore decisions | `PENDING` |
| Security/data owner | Confirms data handling and privacy rules | `PENDING` |
| Parish communication owner | Owns parish-facing communication during incidents | `PENDING` |
| Evidence owner | Stores sanitized restore evidence | `PENDING` |

## Data Coverage

The restore plan must account for these Vinea data areas:

| Data area | Examples | Required restore consideration |
|---|---|---|
| Supabase Postgres database | parishes, staff users, people, households, requests, records, mass intentions, audit events | Point-in-time or snapshot restore strategy |
| Supabase Storage | request documents and family portal uploads | Object recovery strategy and privacy verification |
| Supabase Auth | staff identities and sessions | Auth impact and sign-in verification |
| Environment configuration | Supabase URL/keys, email, Google, OpenAI, feature flags | Secret inventory and redeploy verification |
| Application deployment | Vercel deployment, Next.js build, migrations | Known-good release and rollback strategy |
| External integrations | Google Calendar, email provider, AI provider | Reconnect or degraded-mode plan |
| Audit/evidence docs | rollout records, QA evidence, restore evidence | Evidence retention and access owner |

## Recovery Objectives

These values must be reviewed and approved before public trust-center publication:

| Objective | Proposed internal target | Status |
|---|---:|---|
| Recovery point objective | `PENDING` | Not approved |
| Recovery time objective | `PENDING` | Not approved |
| Restore-drill cadence | `Quarterly non-production drill proposed` | Not approved |
| Evidence retention period | `PENDING` | Not approved |
| Parish communication threshold | `PENDING` | Not approved |

## Non-Production Restore Drill Scope

The first restore drill must use only a disposable or explicitly approved non-production Supabase target.

Minimum drill scope:

1. Record non-production target identity without secrets.
2. Confirm the target is not production.
3. Capture baseline `/api/health` for the non-production app if an app instance is used.
4. Restore or replay a safe backup source into the approved non-production target.
5. Verify expected database tables and migration state.
6. Verify expected storage bucket/object behavior with synthetic files only.
7. Verify staff sign-in or service-level smoke only with safe non-production credentials.
8. Verify request/detail/document/family portal smoke only with safe synthetic records.
9. Confirm direct storage privacy is preserved.
10. Confirm audit/event data expected for the drill is present or intentionally excluded.
11. Capture post-restore `/api/health` if an app instance is used.
12. Clean up or reset the non-production target.
13. Record sanitized evidence in `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md` or a dated copy.

Use `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md` to guide the drill only after an explicitly approved disposable or non-production target is selected and the approval gate in `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md` is complete.

## Production Incident Restore Approval Gates

Production restore remains blocked unless all are true:

- Product owner approves the production restore.
- Security/data owner approves the data handling plan.
- Backup owner confirms the backup source and restore target.
- Restore operator confirms exact commands and rollback/abort path.
- Parish communication owner confirms notification expectations.
- Evidence owner confirms sanitized evidence storage.
- Production app/database target identities are recorded without secrets.
- Current incident severity and customer impact are recorded.
- A post-restore smoke-test plan exists.

## Verification Checklist

After any approved restore, verify:

- `/api/health` returns healthy for the restored environment if applicable.
- Staff authentication works with approved safe credentials.
- Staff authorization still limits access to the expected parish scope.
- People, households, requests, sacramental records, mass intentions, audit events, and workflow steps are present as expected.
- Request documents and family portal uploads are recoverable only through authorized routes.
- Direct storage access is denied.
- Family portal does not expose internal notes, AI notes, audit logs, token hashes, or private parish data.
- Public intake behavior is either healthy or explicitly in a known degraded mode.
- Google Calendar, email, and AI integrations are either healthy or explicitly disabled/degraded with owner awareness.

## Cleanup Requirements

For non-production drills:

- Remove synthetic restored records if the target is shared.
- Remove synthetic storage files unless retained as evidence.
- Revoke temporary tokens, signed URLs, and test credentials.
- Clear temporary environment variables.
- Record cleanup owner and timestamp.

For production incidents:

- Record what data was restored.
- Record what data, if any, was lost or manually reconciled.
- Record customer/parish communication sent.
- Record follow-up tasks and owners.

## Trust-Center Publication Gate

Do not publish backup/restore readiness claims until:

1. This runbook has a named backup owner.
2. A non-production restore drill is completed, including app/auth/storage scope if those areas are part of the public claim.
3. Restore-drill evidence is recorded and reviewed.
4. RPO/RTO are approved.
5. Production incident approval gates are reviewed.
6. Public wording avoids overclaiming formal certifications or untested production restore drills.

## Final Outcome

- Current outcome: `Backup/restore runbook prepared; disposable database replay and app/auth smoke evidence recorded; storage-excluded wording approved for limited internal/sales-support use; synthetic storage/document smoke evidence recorded; stronger limited non-production wording approved; production restore evidence pending`
- Current recommendation: `Use only the approved limited non-production wording from docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md until production restore, real document recovery, signed URL restore behavior, production RPO/RTO, and public trust-center evidence are complete`
