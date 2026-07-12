# Non-Production Restore Drill Filled Approval Inputs - 2026-07-01

Status: Prepared as non-secret filled approval inputs only. This document does not approve execution by itself. No restore drill was executed, production was not accessed, production flags were not enabled, production navigation was not added, production smoke was not run, migrations were not applied, runtime behavior was not changed, operational RLS was not changed, Google Calendar data was not touched, records were not mutated, storage was not accessed, signed URLs were not created, raw exports were not exposed, raw metadata was not exposed, and no secrets were exposed while preparing these inputs.

Current decision state: `NON-PRODUCTION RESTORE DRILL FILLED APPROVAL INPUTS PREPARED; RESTORE DRILL NOT APPROVED OR EXECUTED; BACKUP/RESTORE PUBLIC CLAIMS REMAIN NO-GO`

Completion marker: `NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701`

## Purpose

This document pre-fills non-secret labels and recommended owner names for a future product-owner approval prompt using:

- `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md`

Execution packet:

- `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md`

Evidence template:

- `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md`

Latest disposable database replay evidence:

- `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md`

This document is not the final approval prompt. The drill remains blocked until the product owner explicitly provides the future approval language and the exact approval phrase in a new prompt.

## Recommended Non-Secret Target Labels

| Label | Filled non-secret value | Approval state |
|---|---|---|
| `RESTORE_DRILL_TARGET_TYPE` | `approved reusable disposable Supabase project` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| `RESTORE_DRILL_TARGET_LABEL` | `Safe reusable disposable Supabase restore-drill target` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| `RESTORE_DRILL_TARGET_HOST_OR_PROJECT_REF_LABEL` | `Approved reusable disposable Supabase project label: kikqtorplsswepqitjys` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| `RESTORE_DRILL_APP_URL_LABEL` | `Local or preview non-production Vinea app label, only if explicitly approved for this drill; otherwise not used` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| `RESTORE_DRILL_BACKUP_SOURCE_LABEL` | `Repo-owned schema replay plus approved non-production seed/synthetic fixture source; no raw backup URL` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| `RESTORE_DRILL_DATABASE_SCOPE_LABEL` | `Non-production database schema replay and safe fixture verification only` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| `RESTORE_DRILL_STORAGE_SCOPE_LABEL` | `excluded unless a separate synthetic-only storage scope is explicitly approved in the future prompt` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| `RESTORE_DRILL_AUTH_SCOPE_LABEL` | `Safe non-production staff fixture or service-level substitute; no password/session evidence` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| `RESTORE_DRILL_INTEGRATION_SCOPE_LABEL` | `Integrations disabled or degraded; no Google Calendar, email, OpenAI, or external credential use` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| `RESTORE_DRILL_CLEANUP_PLAN_LABEL` | `Reset or clean only the approved reusable disposable restore-drill target; no production/shared-QA cleanup` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| `RESTORE_DRILL_EVIDENCE_FILE_LABEL` | `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md` | `READY_FOR_PRODUCT_OWNER_REVIEW` |

## Recommended Owner Names

| Owner role | Recommended non-secret owner label | Approval state |
|---|---|---|
| Product owner | `Alex Perez` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| Backup owner | `Codex local QA operator` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| Restore operator | `Codex local QA operator` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| Security/data owner | `Alex Perez` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| Environment owner | `Alex Perez` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| Cleanup owner | `Codex local QA operator` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| Evidence owner | `Codex local QA operator` | `READY_FOR_PRODUCT_OWNER_REVIEW` |
| Support/parish communication owner | `Alex Perez; no customer communication expected for non-production drill unless a blocker changes the scope` | `READY_FOR_PRODUCT_OWNER_REVIEW` |

## Required Human Review Before Execution

Before the drill can run, the product owner must confirm:

- The reusable disposable project label is still the intended non-production target.
- The project is not production and is not shared QA.
- The target may be reset or cleaned up by the named cleanup owner.
- The backup/source label is acceptable without using a raw backup URL.
- Storage remains excluded unless a separate synthetic-only storage scope is explicitly approved.
- No production credentials, private documents, Google Calendar data, external integration credentials, raw exports, raw metadata, or secrets are needed.
- Public backup/restore claims remain `NO-GO`.

## Filled Future Approval Prompt Draft

Do not use this draft until the product owner has reviewed the labels above. When ready, copy this into a future prompt and keep the approval phrase exactly as written:

```text
Approve execution of the non-production restore drill only against Safe reusable disposable Supabase restore-drill target using docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md and a dated evidence file named docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md.

I confirm the target is disposable or explicitly approved non-production, the approval phrase is APPROVED_NONPRODUCTION_RESTORE_DRILL_EXECUTION, the backup/source label is Repo-owned schema replay plus approved non-production seed/synthetic fixture source with no raw backup URL, the database/storage/auth/integration/app/cleanup/evidence scope labels are filled, the named owners are available, the stop conditions are accepted, and cleanup is approved for the target only.

Do not access production, apply migrations, change runtime behavior, change operational RLS, touch Google Calendar data, mutate records outside the approved non-production drill target, access storage or create signed URLs unless a separately approved synthetic/non-production storage scope is explicitly provided in this prompt, expose raw exports, raw metadata, private documents, raw IDs, or secrets.

After execution, update docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md, run checks, and keep public backup/restore readiness claims NO-GO until evidence is reviewed and explicitly approved.
```

## Stop Conditions Preserved

The future drill must still stop before execution if:

- The target appears production-like or cannot be confirmed non-production.
- The target is shared QA instead of the approved reusable disposable target.
- The approval phrase is missing or altered.
- Any required owner is unavailable.
- Any required credential, backup source, or evidence would expose secrets.
- Any step requires production data, private documents, Google Calendar data, external integration credentials, storage paths, signed URLs, raw exports, raw metadata, internal notes, communication bodies, AI material, or sacramental/canonical details.
- Cleanup could affect anything outside the approved target.

## What Changed Plain English

This document fills in the safe labels and recommended owner names for a future restore drill approval. It gives you a ready-to-review draft prompt, but it does not run the drill or approve it by itself.

## Next Recommended Safe Step

Review the labels and owner names. If they are correct, send the filled future approval prompt in a new message to execute the drill against the approved non-production target only.
