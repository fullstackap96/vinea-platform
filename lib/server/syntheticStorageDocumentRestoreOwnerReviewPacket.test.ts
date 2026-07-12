import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md'
)

describe('synthetic storage/document restore owner review packet', () => {
  it('is a non-runtime owner-review packet with the correct safety boundary', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Approved for stronger limited non-production backup/restore wording only.',
      'Production was not accessed',
      'shared QA was not accessed',
      'storage was not accessed',
      'signed URLs were not created',
      'Google Calendar was not touched',
      'external integrations were not called',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'raw IDs were not recorded',
      'private documents were not accessed',
      'token material was not recorded',
      'secrets were not exposed',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'no migrations were applied',
      'Current decision state: `STRONGER LIMITED NON-PRODUCTION BACKUP/RESTORE WORDING APPROVED; PRODUCTION RESTORE, REAL DOCUMENT RECOVERY, SIGNED URL RESTORE BEHAVIOR, PRODUCTION RPO/RTO, PUBLIC TRUST-CENTER BACKUP/RESTORE CLAIMS, FORMAL COMPLIANCE CLAIMS, AND DIOCESAN/ENTERPRISE RESTORE ASSURANCE REMAIN NO-GO`',
      'Completion marker: `SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('links the synthetic evidence, prior restore evidence, runbook, and trust-center docs', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md',
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md',
      'docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md',
      'docs/BACKUP_RESTORE_RUNBOOK_20260627.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires product, backup/restore, and security/data owner decisions before stronger wording', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '| Product owner | Confirms the wording is useful, accurate, and not overstated for sales-support use | `APPROVED_LIMITED_NONPRODUCTION_WORDING` |',
      '| Backup/restore owner | Confirms the wording accurately represents the restore process tested and what restore scope remains unproven | `APPROVED_LIMITED_NONPRODUCTION_WORDING` |',
      '| Security/data owner | Confirms the wording does not imply production security, real-document recovery, signed URL safety, RPO/RTO, or compliance evidence that does not exist | `APPROVED_LIMITED_NONPRODUCTION_WORDING` |',
      'Approval source: `Product-owner instruction in Codex development thread on 2026-07-02 approving stronger limited non-production backup/restore wording and reaffirming all production/public NO-GO boundaries.`',
      'All three reviewer roles are recorded as approved for the limited wording only.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines stronger limited wording while keeping production and public claims blocked', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Vinea has completed non-production restore-readiness rehearsals in an approved disposable environment, including database schema replay, app/auth smoke testing, and a synthetic document-storage smoke.',
      'Production restore, real parish document recovery, signed URL recovery, and RPO/RTO measurement are not yet claimed.',
      'Vinea has rehearsed database replay, core app/auth access, and synthetic document-storage safety checks in a non-production disposable environment.',
      'production restore, real customer documents, signed URL behavior, and RPO/RTO remain future evidence gates.',
      'Vinea maintains a backup/restore runbook and has recorded non-production disposable restore evidence, including database replay, app/auth smoke testing, and synthetic document-storage smoke testing.',
      'Production restore drills, real customer document restore, signed URL restore behavior, and RPO/RTO measurements are not yet complete.',
      'Vinea has completed production backup/restore drills.',
      'Vinea has completed full backup/restore readiness.',
      'Vinea can restore real parish documents in production.',
      'Vinea has measured production RPO.',
      'Vinea has measured production RTO.',
      'Vinea has completed a public trust-center-ready backup/restore program.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines the production restore, storage, RPO, RTO, and final sign-off evidence still required', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Named production restore owner, backup owner, security/data owner, incident owner, support owner, and evidence owner.',
      'Production restore drill evidence showing pre-restore health, restore execution, post-restore health, cleanup/deactivation, monitoring, and rollback decision.',
      'Production RPO measurement recorded as a time-bound value with evidence source.',
      'Production RTO measurement recorded as elapsed restore time with evidence source.',
      'Production storage restore evidence for document bucket/object recovery, using approved production-safe fixtures only.',
      'Production staff document route smoke after restore.',
      'Production family portal safety smoke after restore.',
      'Production direct storage privacy smoke after restore.',
      'Signed URL behavior smoke after restore, if and only if separately approved, with URL values redacted from evidence.',
      'Product-owner, backup/restore owner, security/data owner, and support owner sign-off on the final claim language.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('contains exact owner approval language and preserves the NO-GO boundary', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'I approve the stronger limited non-production backup/restore wording for Vinea based on docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md and docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md.',
      'Production restore, real parish document recovery, signed URL restore behavior, production RPO/RTO, public trust-center backup/restore claims, formal compliance claims, and diocesan/enterprise restore assurance remain NO-GO.',
      'I do not approve stronger limited backup/restore wording yet.',
      'Keep public trust-center backup/restore claims `NO-GO`',
      'Current outcome: `Stronger limited non-production backup/restore wording approved`',
      'Current approved claim: `LIMITED NON-PRODUCTION DATABASE REPLAY, APP/AUTH SMOKE, AND SYNTHETIC DOCUMENT-STORAGE SMOKE ONLY`',
      'Prior approved claim: `LIMITED STORAGE-EXCLUDED WORDING`',
      'Current public trust-center decision: `NO-GO`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('does not include obvious secrets, connection strings, token material, raw IDs, storage paths, filenames, or signed URLs', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'eyJ',
      'kikqtorplsswepqitjys',
      'gnfomgsuottcuueasfvi',
      'synthetic-restore-smoke.txt',
      'request-documents/',
      'token_hash',
      'signedUrl=',
      'signedUrl":"',
      '00000000-0000-4000-8000-000000000000',
      '00000000-0000-4000-8000-000000000001',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
