import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md'
)

describe('synthetic storage/document restore smoke evidence', () => {
  it('records a completed disposable-only synthetic smoke without production or sensitive data exposure', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Smoke result = Passed with sanitized evidence.',
      'Production was not accessed',
      'shared QA was not accessed',
      'real private documents were not accessed',
      'Google Calendar was not touched',
      'external integrations were not called',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'raw IDs were not recorded',
      'signed URL values were not created or recorded',
      'storage paths were not recorded',
      'original filenames were not recorded',
      'token material was not recorded',
      'private document contents were not recorded',
      'secrets were not exposed',
      'migrations were not applied',
      'operational RLS was not changed',
      'Current decision state: `SYNTHETIC STORAGE/DOCUMENT RESTORE SMOKE PASSED AGAINST APPROVED DISPOSABLE TARGET; STRONGER LIMITED NON-PRODUCTION BACKUP/RESTORE WORDING APPROVED; PUBLIC BACKUP/RESTORE CLAIMS REMAIN NO-GO`',
      'Completion marker: `SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('links the approval packet, prior restore evidence, runbook, and trust-center docs', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md',
      'docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md',
      'docs/BACKUP_RESTORE_RUNBOOK_20260627.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('documents health, storage, document route, cross-parish denial, family portal, and cleanup checks', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '`/api/health` returned HTTP `200` and `checks.schema: true`',
      'Private request-documents bucket was available',
      'Synthetic storage object upload succeeded',
      'Synthetic request document row creation succeeded',
      'Staff document manifest/status route returned only safe route payload fields in evidence',
      'Cross-parish staff document route denial returned HTTP `404`',
      'Direct anonymous storage access returned non-success status',
      'Family portal token creation did not expose token hash in evidence',
      'Family portal document surface did not expose unsafe markers in evidence',
      'Synthetic rows were cleaned up',
      'Synthetic storage object was cleaned up',
      'Synthetic auth user was cleaned up',
      '"syntheticStorageObjectDeleted": true',
      '"errors": []',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps production, real document, signed URL, and public trust-center claims blocked', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Production backup/restore readiness is complete.',
      'Real parish document restore has been tested.',
      'Production storage restore has been tested.',
      'Production signed URL safety has been tested.',
      'Production RPO/RTO has been measured.',
      'Public backup/restore trust-center claims are approved.',
      'Product owner, backup/restore owner, and security/data owner approved stronger limited non-production wording in `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`.',
      'Current storage restore claim: `LIMITED NON-PRODUCTION DATABASE REPLAY, APP/AUTH SMOKE, AND SYNTHETIC DOCUMENT-STORAGE SMOKE ONLY; PRODUCTION AND REAL DOCUMENT RESTORE CLAIMS REMAIN NO-GO`',
      'Current public trust-center decision: `NO-GO`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('does not include obvious secrets, connection strings, token material, raw IDs, storage paths, filenames, or signed URLs', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const forbidden of [
      'postgresql://',
      'SUPABASE_SERVICE_ROLE_KEY=',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=',
      'GOOGLE_CLIENT_SECRET=',
      'OPENAI_API_KEY=',
      'access_token=',
      'refresh_token=',
      'sb-',
      'eyJ',
      'http://127.0.0.1:3223',
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
      expect(evidence).not.toContain(forbidden)
    }
  })
})
