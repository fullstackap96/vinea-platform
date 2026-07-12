# Synthetic Storage/Document Restore Owner Review Packet - 2026-07-02

Status: Approved for stronger limited non-production backup/restore wording only. Production was not accessed, shared QA was not accessed, storage was not accessed, signed URLs were not created, Google Calendar was not touched, external integrations were not called, raw exports were not exposed, raw metadata was not exposed, raw IDs were not recorded, private documents were not accessed, token material was not recorded, secrets were not exposed, runtime behavior was not changed, operational RLS was not changed, and no migrations were applied while approving this packet.

Current decision state: `STRONGER LIMITED NON-PRODUCTION BACKUP/RESTORE WORDING APPROVED; PRODUCTION RESTORE, REAL DOCUMENT RECOVERY, SIGNED URL RESTORE BEHAVIOR, PRODUCTION RPO/RTO, PUBLIC TRUST-CENTER BACKUP/RESTORE CLAIMS, FORMAL COMPLIANCE CLAIMS, AND DIOCESAN/ENTERPRISE RESTORE ASSURANCE REMAIN NO-GO`

Completion marker: `SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702`

Primary evidence:

- Synthetic storage/document restore smoke evidence: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md`

Supporting evidence and policy references:

- Synthetic storage/document restore smoke approval packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md`
- Storage-excluded restore-readiness decision packet: `docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md`
- Non-production restore-drill disposable database replay and app/auth smoke evidence: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md`
- Backup/restore runbook: `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`
- Trust-center readiness packet: `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`
- Trust-center evidence gap register: `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`

## Review Purpose

This packet gives the product owner, backup/restore owner, and security/data owner one place to decide what Vinea may safely say after the synthetic storage/document restore smoke passed in the approved disposable target.

This packet does not approve public trust-center backup/restore claims. It does not approve production restore readiness, real parish document restore claims, signed URL restore claims, production RPO/RTO claims, or formal compliance claims.

## Evidence Summary

The completed evidence shows:

- A guarded synthetic-only smoke ran against the approved reusable disposable restore target.
- The local non-production app returned `/api/health` with `checks.schema: true`.
- The private request-documents bucket was available.
- A temporary synthetic storage object was uploaded.
- A temporary synthetic request-document row was created.
- Staff document manifest/status behavior returned only safe route payload fields in evidence.
- Cross-parish staff document access was denied.
- Direct anonymous storage access returned a non-success status.
- Family portal document-surface behavior stayed safe.
- Synthetic rows, synthetic storage object, and synthetic auth user were cleaned up.

The completed evidence also records that production, shared QA, real private documents, signed URL values, storage paths, original filenames, token material, private document contents, raw IDs, raw metadata, raw exports, secrets, migrations, operational RLS changes, and production runtime behavior were excluded.

## Required Reviewers

| Role | Required decision | Sign-off label |
|---|---|---|
| Product owner | Confirms the wording is useful, accurate, and not overstated for sales-support use | `APPROVED_LIMITED_NONPRODUCTION_WORDING` |
| Backup/restore owner | Confirms the wording accurately represents the restore process tested and what restore scope remains unproven | `APPROVED_LIMITED_NONPRODUCTION_WORDING` |
| Security/data owner | Confirms the wording does not imply production security, real-document recovery, signed URL safety, RPO/RTO, or compliance evidence that does not exist | `APPROVED_LIMITED_NONPRODUCTION_WORDING` |

Approval source: `Product-owner instruction in Codex development thread on 2026-07-02 approving stronger limited non-production backup/restore wording and reaffirming all production/public NO-GO boundaries.`

All three reviewer roles are recorded as approved for the limited wording only. This approval does not authorize production access, production restore claims, public trust-center claims, formal compliance claims, production RPO/RTO claims, real parish document restore claims, signed URL restore behavior claims, or diocesan/enterprise restore assurance.

## Approved Stronger Limited Wording

Recommended limited internal wording:

> Vinea has completed non-production restore-readiness rehearsals in an approved disposable environment, including database schema replay, app/auth smoke testing, and a synthetic document-storage smoke. The synthetic storage smoke verified private document bucket availability, synthetic document object creation, staff document manifest safety, cross-parish denial, direct anonymous storage denial, family portal document-surface safety, and cleanup. Production restore, real parish document recovery, signed URL recovery, and RPO/RTO measurement are not yet claimed.

Recommended limited sales-support wording:

> Vinea has rehearsed database replay, core app/auth access, and synthetic document-storage safety checks in a non-production disposable environment. These checks help validate the backup/restore process for synthetic fixtures, but production restore, real customer documents, signed URL behavior, and RPO/RTO remain future evidence gates.

Recommended security-questionnaire wording:

> Vinea maintains a backup/restore runbook and has recorded non-production disposable restore evidence, including database replay, app/auth smoke testing, and synthetic document-storage smoke testing. Production restore drills, real customer document restore, signed URL restore behavior, and RPO/RTO measurements are not yet complete.

## Still NO-GO

Do not claim:

- Vinea has completed production backup/restore drills.
- Vinea has completed full backup/restore readiness.
- Vinea can restore real parish documents in production.
- Vinea has tested production Supabase Storage restore.
- Vinea has tested signed URL generation after production restore.
- Vinea has tested direct production storage privacy after restore.
- Vinea has measured production RPO.
- Vinea has measured production RTO.
- Vinea has completed a public trust-center-ready backup/restore program.
- Vinea has SOC 2, HIPAA, PCI, ISO 27001, or other formal backup/security certification from this evidence.
- Vinea has completed diocesan or enterprise backup/restore assurance.

## Production Evidence Still Required

Before public backup/restore claims or stronger customer-facing restore commitments, Vinea still needs:

1. Named production restore owner, backup owner, security/data owner, incident owner, support owner, and evidence owner.
2. Approved production restore runbook version and rollback/stop-condition owner.
3. Production-safe restore drill target and scope approved in writing.
4. Production backup source and restore target identified without recording secrets.
5. Production restore drill evidence showing pre-restore health, restore execution, post-restore health, cleanup/deactivation, monitoring, and rollback decision.
6. Production RPO measurement recorded as a time-bound value with evidence source.
7. Production RTO measurement recorded as elapsed restore time with evidence source.
8. Production storage restore evidence for document bucket/object recovery, using approved production-safe fixtures only.
9. Production staff document route smoke after restore.
10. Production family portal safety smoke after restore.
11. Production direct storage privacy smoke after restore.
12. Signed URL behavior smoke after restore, if and only if separately approved, with URL values redacted from evidence.
13. Evidence review confirming no raw IDs, storage paths, original filenames, token material, private document contents, secrets, raw metadata, or signed URL values are recorded.
14. Product-owner, backup/restore owner, security/data owner, and support owner sign-off on the final claim language.

## Owner Decision Options

Approved:

- `APPROVE STRONGER LIMITED NON-PRODUCTION WORDING`: Allows the stronger limited internal, sales-support, and security-questionnaire wording above. Public trust-center backup/restore claims remain `NO-GO`.

Allowed but conservative:

- `KEEP STORAGE-EXCLUDED WORDING ONLY`: Continue using only the previously approved storage-excluded language until production restore, RPO/RTO, or additional synthetic restore evidence is available.

Not approved by this packet:

- `APPROVE PUBLIC BACKUP/RESTORE CLAIMS`: Not supported by the evidence.
- `APPROVE PRODUCTION RESTORE READINESS`: Not supported by the evidence.
- `APPROVE REAL DOCUMENT RESTORE CLAIMS`: Not supported by the evidence.
- `APPROVE RPO/RTO CLAIMS`: Not supported by the evidence.

## Approval Language

Approval recorded:

```text
I approve the stronger limited non-production backup/restore wording for Vinea based on docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md and docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md. I understand this approves only internal, sales-support, and security-questionnaire wording about non-production disposable database replay, app/auth smoke, and synthetic document-storage smoke evidence. Production restore, real parish document recovery, signed URL restore behavior, production RPO/RTO, public trust-center backup/restore claims, formal compliance claims, and diocesan/enterprise restore assurance remain NO-GO.
```

To reject stronger wording and keep the current storage-excluded posture:

```text
I do not approve stronger limited backup/restore wording yet. Keep Vinea's backup/restore claim limited to the previously approved storage-excluded wording until additional owner-reviewed evidence is available.
```

## Final Recommendation

Use the stronger limited non-production wording only in internal, sales-support, or security-questionnaire contexts. Keep public trust-center backup/restore claims `NO-GO` until production restore, production storage restore, signed URL restore behavior, RPO/RTO, monitoring, rollback, and final owner sign-off evidence are complete.

## What Changed Plain English

This packet now records approval for careful wording about the fake-document restore test. Vinea can use the limited non-production wording in internal, sales-support, and security-questionnaire contexts, but still cannot claim production restore readiness, real document recovery, public trust-center backup/restore readiness, or RPO/RTO.

## Final Outcome

- Current outcome: `Stronger limited non-production backup/restore wording approved`
- Current approved claim: `LIMITED NON-PRODUCTION DATABASE REPLAY, APP/AUTH SMOKE, AND SYNTHETIC DOCUMENT-STORAGE SMOKE ONLY`
- Prior approved claim: `LIMITED STORAGE-EXCLUDED WORDING`
- Current public trust-center decision: `NO-GO`
