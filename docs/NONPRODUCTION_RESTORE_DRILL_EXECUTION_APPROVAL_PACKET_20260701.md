# Non-Production Restore Drill Execution Approval Packet - 2026-07-01

Status: Prepared as a product-owner approval packet only. No restore drill was executed, production was not accessed, production flags were not enabled, production navigation was not added, production smoke was not run, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, and no secrets were exposed while preparing this packet.

Current decision state: `NON-PRODUCTION RESTORE DRILL EXECUTION APPROVAL PACKET PREPARED; RESTORE DRILL NOT EXECUTED; BACKUP/RESTORE PUBLIC CLAIMS REMAIN NO-GO`

Completion marker: `NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701`

## Purpose

This packet defines the exact product-owner approval needed before Vinea executes the non-production restore drill described in:

- `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md`

Supporting references:

- `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`
- `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md`
- `docs/NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md`
- `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`

This packet does not approve production access, production restore work, production data restoration, production RLS changes, migrations, runtime changes, destructive cleanup, storage access, signed URL creation, raw export exposure, raw metadata exposure, or public backup/restore readiness claims.

## Required Approval Phrase

The future execution prompt must include this exact phrase:

```text
APPROVED_NONPRODUCTION_RESTORE_DRILL_EXECUTION
```

If the phrase is missing or altered, the drill must remain blocked before execution.

## Required Target Labels

The product owner must provide non-secret labels only. Do not paste database URLs, passwords, tokens, raw IDs, raw backup URLs, storage paths, signed URLs, document names, or private content.

| Label | Required value type | Approval state |
|---|---|---|
| `RESTORE_DRILL_TARGET_TYPE` | `Disposable Supabase project`, `approved shared QA`, or `approved non-production app/database pair` | `PENDING` |
| `RESTORE_DRILL_TARGET_LABEL` | Human-readable target label | `PENDING` |
| `RESTORE_DRILL_TARGET_HOST_OR_PROJECT_REF_LABEL` | Host/project label without credentials | `PENDING` |
| `RESTORE_DRILL_APP_URL_LABEL` | Non-production app label or `not used` | `PENDING` |
| `RESTORE_DRILL_BACKUP_SOURCE_LABEL` | Safe backup/source description without raw URL | `PENDING` |
| `RESTORE_DRILL_DATABASE_SCOPE_LABEL` | Database restore/replay scope label | `PENDING` |
| `RESTORE_DRILL_STORAGE_SCOPE_LABEL` | `excluded`, `synthetic-only`, or separately approved non-production scope label | `PENDING` |
| `RESTORE_DRILL_AUTH_SCOPE_LABEL` | Safe staff fixture label or service-level substitute | `PENDING` |
| `RESTORE_DRILL_INTEGRATION_SCOPE_LABEL` | Integrations disabled/degraded label or non-production-only label | `PENDING` |
| `RESTORE_DRILL_CLEANUP_PLAN_LABEL` | Cleanup/reset plan label | `PENDING` |
| `RESTORE_DRILL_EVIDENCE_FILE_LABEL` | Dated evidence filename label | `PENDING` |

Do not approve execution until every target label is filled with a non-secret value.

## Required Owner Sign-Offs

| Owner role | Required approval | Approval state |
|---|---|---|
| Product owner | Confirms the drill is approved and non-production only | `PENDING` |
| Backup owner | Confirms source/restore scope is safe and non-secret | `PENDING` |
| Restore operator | Confirms execution packet, stop conditions, and evidence process | `PENDING` |
| Security/data owner | Confirms privacy boundaries and evidence redaction | `PENDING` |
| Environment owner | Confirms target is disposable or explicitly approved non-production | `PENDING` |
| Cleanup owner | Confirms cleanup/reset plan and target boundary | `PENDING` |
| Evidence owner | Confirms evidence filename and storage location | `PENDING` |
| Support/parish communication owner | Confirms no customer communication is needed, or owns the notice if needed | `PENDING` |

## Evidence File Naming

Use a dated copy of the evidence template:

```text
docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_YYYYMMDD_<TARGET_LABEL>.md
```

Filename rules:

- Use labels only.
- Do not include raw project refs if the environment owner considers them sensitive.
- Do not include raw database names, raw parish names, raw request IDs, raw staff IDs, raw document IDs, raw audit event IDs, tokens, passwords, host credentials, or backup URLs.
- Start with `Drill result = Blocked before execution`.
- Keep `Restore readiness claim allowed? = No` until evidence review is complete.

## Stop Conditions

Stop before execution if any of these are true:

- The target is production or could reasonably be confused with production.
- The target is not disposable or explicitly approved non-production.
- The exact approval phrase is missing.
- Any required target label is missing.
- Any required owner sign-off is missing.
- A production credential is required.
- A production private document would be copied into an unapproved target.
- Evidence would require secrets, raw private data, raw metadata, raw exports, storage paths, signed URLs, original filenames, internal notes, communication bodies, AI prompts/outputs, token material, or sacramental/canonical details.
- Cleanup could affect anything outside the approved drill target.
- Storage access, signed URL creation, or file-content checks are needed without a separately approved synthetic or non-production-only storage scope.
- The operator cannot prove the drill remains separate from operational RLS promotion, public intake routing, Google Calendar QA, production exports, or production smoke.

## Minimum Approval Gate

Before execution, the product owner must confirm:

- The target is disposable or explicitly approved non-production.
- The backup/source label is safe and non-secret.
- The database, storage, auth, integration, app, evidence, and cleanup scope labels are filled.
- The named owners are available.
- The evidence file name is approved.
- The stop conditions above are accepted.
- Public backup/restore claims remain `NO-GO` until evidence is reviewed.

## Exact Approval Language For Future Prompt

Copy and fill this only when the target and owners are ready:

```text
Approve execution of the non-production restore drill only against <RESTORE_DRILL_TARGET_LABEL> using docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md and a dated evidence file named <RESTORE_DRILL_EVIDENCE_FILE_LABEL>.

I confirm the target is disposable or explicitly approved non-production, the approval phrase is APPROVED_NONPRODUCTION_RESTORE_DRILL_EXECUTION, the backup/source label is non-secret, the database/storage/auth/integration/app/cleanup/evidence scope labels are filled, the named owners are available, the stop conditions are accepted, and cleanup is approved for the target only.

Do not access production, apply migrations, change runtime behavior, change operational RLS, touch Google Calendar data, mutate records outside the approved non-production drill target, access storage or create signed URLs unless a separately approved synthetic/non-production storage scope is explicitly provided in this prompt, expose raw exports, raw metadata, private documents, raw IDs, or secrets.

After execution, update the evidence file, run checks, and keep public backup/restore readiness claims NO-GO until evidence is reviewed and explicitly approved.
```

## Approval Outcome States

| Outcome | Meaning | Next step |
|---|---|---|
| `APPROVED` | All labels, owners, phrase, and stop conditions are complete | Execute only the approved non-production drill |
| `BLOCKED_TARGET` | Target is missing, production-like, or not explicitly approved | Do not execute |
| `BLOCKED_OWNER` | Required owner or cleanup/evidence owner is missing | Do not execute |
| `BLOCKED_PRIVACY` | Evidence or restore scope would expose private data or secrets | Do not execute |
| `BLOCKED_SCOPE` | Drill would mix with migrations, runtime changes, RLS changes, Google Calendar, exports, or production smoke | Do not execute |

## What Changed Plain English

This packet is the permission form for a future practice restore. It says what safe target labels, owner approvals, evidence filename, stop rules, and exact approval wording are needed before anyone runs the restore drill. It does not run the drill or touch any system.

## Next Recommended Safe Step

Use this packet to collect product-owner approval only after a disposable or explicitly approved non-production restore target is ready. Until the drill is executed and reviewed, backup/restore public readiness claims remain `NO-GO`.

Recommended non-secret labels and owner names are staged in `docs/NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md` for product-owner review.
