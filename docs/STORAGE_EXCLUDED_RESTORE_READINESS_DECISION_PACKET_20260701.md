# Storage-Excluded Restore Readiness Decision Packet

Status: Approved for limited internal and sales-support wording only. Production was not accessed, shared QA was not accessed, storage was not accessed, signed URLs were not created, Google Calendar was not touched, external integrations were not called, raw exports were not exposed, raw metadata was not exposed, private documents were not accessed, raw IDs were not recorded, secrets were not exposed, runtime behavior was not changed, operational RLS was not changed, and no migrations were applied while approving this packet.

Current decision state: `STORAGE-EXCLUDED RESTORE READINESS WORDING APPROVED FOR LIMITED INTERNAL/SALES-SUPPORT USE; STORAGE REMAINS UNTESTED; PUBLIC BACKUP/RESTORE CLAIMS REMAIN NO-GO`

Completion marker: `STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701`

Related evidence and runbooks:

- Backup/restore runbook: `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`
- Non-production restore-drill disposable database replay and app/auth smoke evidence: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md`
- Trust-center readiness packet: `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- Trust-center evidence gap register: `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`
- Synthetic storage/document restore smoke approval packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md`
- Synthetic storage/document restore smoke evidence: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md`
- Synthetic storage/document restore owner review and limited wording approval packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`
- Guarded disposable app/auth smoke runner: `scripts/run-nonproduction-restore-app-auth-smoke.mjs`

## Evidence Completed

The completed disposable restore evidence supports only a limited database-and-app/auth claim:

- Approved reusable disposable Supabase target was reset and replayed from the repo-owned base schema plus repo migrations.
- Schema verification completed after replay.
- A local non-production Vinea app was started against only the approved disposable Supabase target.
- `/api/health` returned HTTP `200` with `checks.schema: true`.
- A temporary synthetic staff auth user was able to sign in.
- A temporary synthetic active parish and denied parish were used to test selected-parish scope.
- A same-parish synthetic request detail access check returned HTTP `200`.
- A wrong-parish selected-parish denial substitute returned HTTP `404`.
- A synthetic family portal page safety check returned HTTP `200`.
- Synthetic fixture cleanup was verified with count-only checks.

## What Vinea May Safely Claim

Approved internal wording:

> Vinea has completed a non-production disposable database replay and app/auth restore smoke against an approved disposable Supabase target. The smoke verified schema health, synthetic staff sign-in, selected-parish request-detail access, selected-parish denial behavior, family portal page safety, and cleanup of synthetic fixtures. Storage and document file recovery were intentionally excluded and remain untested.

Approved limited sales-support wording:

> Vinea has rehearsed database schema replay and core app/auth access in a non-production disposable environment. File storage and document restore coverage are not yet claimed.

This packet does not approve public trust-center backup/restore claims by itself, and it does not approve stronger customer-facing claims that imply file recovery, production restore, signed URL safety after restore, or RPO/RTO measurement.

## Approval Record

- Approval date: `2026-07-01`
- Approval source: `Product-owner instruction in Codex development thread`
- Approved scope: `Limited internal and sales-support wording only`
- Explicitly excluded from approval: production access, shared-QA access, storage access, signed URL testing, Google Calendar, external integrations, raw exports, raw metadata, private documents, raw IDs, secrets, runtime behavior changes, operational RLS changes, migrations, public trust-center backup/restore claims, full restore readiness claims, and production backup/restore claims.
- Current approval outcome: `APPROVED FOR LIMITED STORAGE-EXCLUDED WORDING ONLY`

## What Vinea Must Not Claim Yet

Do not claim:

- Vinea has completed production backup/restore drills.
- Vinea has completed full backup/restore readiness.
- Vinea has completed storage or document file recovery testing.
- Vinea has verified signed URL behavior after restore.
- Vinea has verified direct storage privacy after restore.
- Vinea has restored private parish documents.
- Vinea has measured production RPO or RTO.
- Vinea has completed production incident restore procedures.
- Vinea has a public trust-center-ready backup/restore program.
- Vinea has any formal backup, compliance, or certification status based on this evidence.

## What Remains Untested

The completed evidence did not test:

- Supabase Storage bucket restore.
- Supabase Storage object restore.
- Request document upload after restore.
- Request document download after restore.
- Signed URL generation after restore.
- Direct storage privacy after restore.
- Staff request-document route safety after restored storage objects exist.
- Family portal document upload or download after restore.
- Document approval or rejection after restore.
- Production backup/PITR restore execution.
- Production RPO/RTO measurement.
- External integrations after restore, including Google Calendar, email, AI, and public intake integrations.

## Decision Options

Recommended option:

- `APPROVE LIMITED STORAGE-EXCLUDED READINESS LANGUAGE`: Vinea may use the limited internal and reviewed sales-support wording above, while storage/document recovery and public trust-center backup/restore claims remain `NO-GO`.

More complete option:

- `REQUIRE SYNTHETIC STORAGE/DOCUMENT RESTORE SMOKE FIRST`: Vinea should run a separately approved synthetic storage/document restore smoke before using any backup/restore readiness language beyond the app/auth smoke.

Not recommended:

- `CLAIM FULL RESTORE READINESS NOW`: This would overstate the evidence because storage, production restore, and RPO/RTO were not tested.

## Future Synthetic Storage/Document Restore Smoke Requirements

A future storage/document restore smoke must be separately approved and must use only synthetic data.

Minimum scope:

- Use only an approved disposable or explicitly approved non-production target.
- Do not access production or shared QA.
- Do not use private parish documents.
- Create or restore a synthetic document object only.
- Verify staff document manifest or document-status behavior without exposing original filenames, storage paths, file contents, token material, raw IDs, or signed URLs in evidence.
- If signed URL behavior is approved for testing, record only pass/fail and redacted labels, not URL values.
- Verify direct anonymous storage access is denied.
- Verify the family portal remains safe and does not expose internal notes, staff-only data, audit logs, AI material, token hashes, storage paths, signed URLs, or private parish data.
- Clean up synthetic document rows, portal tokens, and storage objects.
- Record sanitized evidence and stop immediately if the target is not approved or any secret/raw object identifier would be printed.

Explicit exclusions unless separately approved:

- Real parish documents.
- Production project access.
- Shared QA project access.
- Google Calendar, email, OpenAI, or other external integration calls.
- Raw export generation.
- Raw metadata capture.
- Private document content.

## Product Owner Approval Language

To approve only the storage-excluded readiness wording:

```text
I approve the storage-excluded restore-readiness decision for Vinea based on docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md. I understand this approves only limited wording that database replay and app/auth smoke passed in a non-production disposable target, while storage/document file recovery, signed URLs, direct storage privacy, production restore, RPO/RTO, and public trust-center backup/restore claims remain NO-GO.
```

To approve a future synthetic-only storage/document restore smoke:

```text
I approve a synthetic-only storage/document restore smoke against an approved disposable or explicitly approved non-production target. The smoke must not use production, shared QA, real private documents, external integrations, raw paths, signed URLs, token material, raw IDs, secrets, or raw document contents in evidence, and it must include cleanup verification.
```

## Current Recommendation

Use the stronger limited non-production wording approved in `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md` for internal, sales-support, and security-questionnaire contexts only. Keep public backup/restore claims `NO-GO`.

## What Changed Plain English

Vinea now has a clear decision packet for the restore work that was already completed. It explains that the safe test database was rebuilt and the app worked against it, but file/document storage was not tested. This keeps Vinea honest and helps avoid promising more than the evidence proves.

## Final Outcome

- Current outcome: `Storage-excluded restore-readiness wording approved for limited internal/sales-support use only`
- Current restore claim: `LIMITED NON-PRODUCTION DATABASE REPLAY, APP/AUTH SMOKE, AND SYNTHETIC DOCUMENT-STORAGE SMOKE ONLY`
- Current public trust-center decision: `NO-GO`
- Current next evidence gate: `PRODUCTION RESTORE, REAL DOCUMENT RECOVERY, SIGNED URL RESTORE BEHAVIOR, PRODUCTION RPO/RTO, AND PUBLIC CLAIM EVIDENCE PENDING`
