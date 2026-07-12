# Synthetic Storage/Document Restore Smoke Approval Packet - 2026-07-01

Status: Prepared as a product-owner approval packet only. No storage/document restore smoke was executed, production was not accessed, shared QA was not accessed, real private documents were not accessed, storage was not accessed, signed URLs were not created, Google Calendar was not touched, external integrations were not called, raw exports were not exposed, raw metadata was not exposed, raw IDs were not recorded, secrets were not exposed, runtime behavior was not changed, operational RLS was not changed, and no migrations were applied while preparing this packet.

Current decision state: `SYNTHETIC STORAGE/DOCUMENT RESTORE SMOKE APPROVAL PACKET PREPARED; SMOKE NOT EXECUTED; PUBLIC BACKUP/RESTORE CLAIMS REMAIN NO-GO`

Completion marker: `SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701`

## Purpose

This packet defines the exact product-owner approval needed before Vinea runs a synthetic-only storage/document restore smoke against the approved disposable restore target.

Supporting references:

- Synthetic storage/document restore smoke evidence: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md`
- Storage-excluded restore-readiness decision packet: `docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md`
- Non-production restore-drill disposable database replay and app/auth smoke evidence: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md`
- Backup/restore runbook: `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`
- Trust-center readiness packet: `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- Trust-center evidence gap register: `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`

This packet does not approve production access, shared-QA access, real private document access, production data restoration, production RLS changes, migrations, runtime changes, Google Calendar, email, OpenAI, public intake, raw export exposure, raw metadata exposure, signed URL value capture, raw ID capture, or public backup/restore readiness claims.

## Required Approval Phrase

The future execution prompt must include this exact phrase:

```text
APPROVED_SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE
```

If the phrase is missing or altered, the smoke must remain blocked before execution.

## Approved Target Boundary

Target type: `approved reusable disposable restore target only`

The future smoke may use only the already approved disposable restore target label from the completed restore drill evidence. The future prompt must not include database URLs, passwords, project refs if treated as sensitive, raw bucket names, raw storage paths, raw document IDs, raw request IDs, signed URLs, tokens, private filenames, or document contents.

Do not run this smoke against:

- Production.
- Shared QA.
- A parish customer environment.
- Any target containing real private parish documents.
- Any target that cannot be cleaned up safely.

## Synthetic Fixture Scope

The future smoke must use only synthetic labels and synthetic content:

| Fixture | Required rule |
|---|---|
| Synthetic parish label | Use a human-readable disposable label only |
| Synthetic staff label | Use a temporary safe staff label only |
| Synthetic request label | Use a temporary safe request label only |
| Synthetic workflow/document step label | Use a temporary safe step label only |
| Synthetic document label | Use a generic label such as `Synthetic restore smoke document` |
| Synthetic file content | Use harmless test content only, with no parishioner, sacramental, canonical, pastoral, financial, or private data |
| Synthetic file name in evidence | Record only a generic label; do not record original filename values |
| Family portal label | Use a temporary token label only; do not record token values or hashes |

## Required Checks

Minimum checks before any stronger restore claim:

1. Confirm the app health check remains green against the approved disposable target.
2. Create or restore one synthetic request document record in the disposable target.
3. Create or restore one synthetic storage object, if the approved implementation requires object-level verification.
4. Verify staff document list/status behavior can see only safe manifest/status fields.
5. Verify staff document behavior does not expose storage paths, signed URLs, token material, raw IDs, original filenames, private content, internal notes, communications, AI material, or sacramental/canonical details in evidence.
6. Verify direct anonymous storage access is denied, recording only pass/fail.
7. Verify family portal document surface remains safe, recording only pass/fail and safe labels.
8. Verify cleanup removes synthetic document rows, synthetic portal tokens, synthetic workflow-step links, and synthetic storage objects.
9. Record sanitized evidence only.

Signed URL creation remains blocked unless the future prompt separately approves a signed-URL safety check. If approved, evidence must record only pass/fail and must not record the signed URL value, path, token, query string, or object identifier.

## Required Owner Sign-Offs

| Owner role | Required approval | Approval state |
|---|---|---|
| Product owner | Confirms the synthetic-only storage/document smoke is approved for the disposable target only | `PENDING` |
| Backup/restore owner | Confirms the smoke is part of restore-readiness evidence, not production restore | `PENDING` |
| Security/data owner | Confirms no real private documents, raw IDs, raw metadata, signed URLs, or secrets are recorded | `PENDING` |
| Environment owner | Confirms the target is the approved disposable restore target | `PENDING` |
| Cleanup owner | Confirms synthetic rows/objects/tokens can be cleaned up safely | `PENDING` |
| Evidence owner | Confirms evidence filename and redaction rules | `PENDING` |

## Evidence File Naming

Use this filename pattern:

```text
docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_YYYYMMDD_APPROVED_DISPOSABLE_TARGET.md
```

Evidence rules:

- Start with `Smoke result = Blocked before execution`.
- Use labels only.
- Record pass/fail outcomes, not raw values.
- Do not include raw project refs if treated as sensitive.
- Do not include raw database URLs, raw bucket names, storage paths, signed URLs, query strings, object identifiers, original filenames, token values, token hashes, raw request IDs, raw document IDs, raw staff IDs, private document contents, internal notes, communications, AI prompts/outputs, sacramental/canonical details, or secrets.
- Keep public backup/restore readiness claims `NO-GO` until evidence is reviewed.

## Stop Conditions

Stop before execution if any of these are true:

- The target is production, shared QA, customer data, or could reasonably be confused with one of those targets.
- The exact approval phrase is missing.
- Any required owner sign-off is missing.
- The smoke would require real private documents.
- The smoke would require recording raw IDs, raw metadata, raw exports, storage paths, signed URLs, token values, token hashes, original filenames, private document contents, internal notes, communication bodies, AI material, or sacramental/canonical details.
- Cleanup could affect anything outside the approved disposable target.
- The operator cannot prove that Google Calendar, email, OpenAI, public intake, production exports, production smoke, migrations, operational RLS changes, and production runtime behavior remain out of scope.
- The synthetic storage object or synthetic document row cannot be safely cleaned up.

## Exact Approval Language For Future Prompt

Copy this only when the product owner is ready to run the smoke:

```text
Approve execution of the synthetic-only storage/document restore smoke against the approved reusable disposable restore target only, using docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md and evidence file docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_YYYYMMDD_APPROVED_DISPOSABLE_TARGET.md.

I confirm the approval phrase is APPROVED_SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE, the target is the approved disposable restore target only, the smoke may use synthetic document rows and synthetic storage objects only, all required owners are available, cleanup is approved for the disposable target only, evidence must use labels/pass-fail outcomes only, and public backup/restore claims remain NO-GO until evidence is reviewed.

Do not access production, shared QA, real private documents, Google Calendar, email, OpenAI, public intake, external integrations, raw exports, raw metadata, raw IDs, signed URL values, storage paths, original filenames, token material, private document contents, secrets, migrations, operational RLS changes, or production runtime behavior.

After execution, update the evidence file, verify cleanup, run checks, update build status, summarize, and include estimated completion percentage.
```

## Approval Outcome States

| Outcome | Meaning | Next step |
|---|---|---|
| `APPROVED` | Phrase, target, owners, evidence filename, synthetic scope, and stop conditions are complete | Execute only the synthetic smoke against the approved disposable target |
| `BLOCKED_TARGET` | Target is missing, production-like, shared-QA-like, or not the approved disposable restore target | Do not execute |
| `BLOCKED_OWNER` | Required owner or cleanup/evidence owner is missing | Do not execute |
| `BLOCKED_PRIVACY` | Evidence or smoke scope would expose private documents, raw IDs, raw metadata, signed URLs, paths, tokens, or secrets | Do not execute |
| `BLOCKED_SCOPE` | Smoke would mix with migrations, RLS changes, runtime changes, Google Calendar, exports, production smoke, or external integrations | Do not execute |

## What Changed Plain English

This packet is the permission form for a future document-storage restore practice run. It says the test must use fake/synthetic document data only, must stay on the approved disposable target, must avoid real parish documents, and must not record file paths, signed links, raw IDs, tokens, or secrets.

## Final Outcome

- Current outcome: `Synthetic storage/document restore smoke approval packet prepared; smoke executed and evidence recorded separately`
- Current storage restore claim: `SYNTHETIC NON-PRODUCTION EVIDENCE RECORDED; PRODUCTION AND REAL DOCUMENT RESTORE CLAIMS REMAIN NO-GO`
- Current public trust-center decision: `NO-GO`
