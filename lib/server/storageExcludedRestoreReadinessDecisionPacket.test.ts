import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md'
)

describe('storage-excluded restore readiness decision packet', () => {
  it('is non-runtime and keeps production, shared QA, storage, and integrations out of scope', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Approved for limited internal and sales-support wording only.',
      'Production was not accessed',
      'shared QA was not accessed',
      'storage was not accessed',
      'signed URLs were not created',
      'Google Calendar was not touched',
      'external integrations were not called',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'private documents were not accessed',
      'raw IDs were not recorded',
      'secrets were not exposed',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'no migrations were applied',
      'Current decision state: `STORAGE-EXCLUDED RESTORE READINESS WORDING APPROVED FOR LIMITED INTERNAL/SALES-SUPPORT USE; STORAGE REMAINS UNTESTED; PUBLIC BACKUP/RESTORE CLAIMS REMAIN NO-GO`',
      'Completion marker: `STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('links the completed restore evidence and trust-center docs', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Backup/restore runbook: `docs/BACKUP_RESTORE_RUNBOOK_20260627.md`',
      'Non-production restore-drill disposable database replay and app/auth smoke evidence: `docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md`',
      'Trust-center readiness packet: `docs/TRUST_CENTER_READINESS_PACKET_20260627.md`',
      'Trust-center evidence gap register: `docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md`',
      'Synthetic storage/document restore smoke approval packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md`',
      'Synthetic storage/document restore smoke evidence: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md`',
      'Synthetic storage/document restore owner review and limited wording approval packet: `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md`',
      'Guarded disposable app/auth smoke runner: `scripts/run-nonproduction-restore-app-auth-smoke.mjs`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines safe claims while blocking backup/restore overclaims', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Vinea has completed a non-production disposable database replay and app/auth restore smoke against an approved disposable Supabase target.',
      'Storage and document file recovery were intentionally excluded and remain untested.',
      'Vinea has rehearsed database schema replay and core app/auth access in a non-production disposable environment.',
      'File storage and document restore coverage are not yet claimed.',
      'This packet does not approve public trust-center backup/restore claims by itself, and it does not approve stronger customer-facing claims that imply file recovery, production restore, signed URL safety after restore, or RPO/RTO measurement.',
      'Current approval outcome: `APPROVED FOR LIMITED STORAGE-EXCLUDED WORDING ONLY`',
      'Vinea has completed production backup/restore drills.',
      'Vinea has completed full backup/restore readiness.',
      'Vinea has completed storage or document file recovery testing.',
      'Vinea has verified signed URL behavior after restore.',
      'Vinea has restored private parish documents.',
      'Vinea has measured production RPO or RTO.',
      'Vinea has a public trust-center-ready backup/restore program.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('documents untested storage scope and future synthetic smoke requirements', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Supabase Storage bucket restore.',
      'Supabase Storage object restore.',
      'Request document upload after restore.',
      'Request document download after restore.',
      'Signed URL generation after restore.',
      'Direct storage privacy after restore.',
      'Family portal document upload or download after restore.',
      'Use only an approved disposable or explicitly approved non-production target.',
      'Do not use private parish documents.',
      'Create or restore a synthetic document object only.',
      'Verify direct anonymous storage access is denied.',
      'Clean up synthetic document rows, portal tokens, and storage objects.',
      'Record sanitized evidence and stop immediately if the target is not approved or any secret/raw object identifier would be printed.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('contains exact product-owner approval language and preserves the NO-GO boundary', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'I approve the storage-excluded restore-readiness decision for Vinea based on docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md.',
      'storage/document file recovery, signed URLs, direct storage privacy, production restore, RPO/RTO, and public trust-center backup/restore claims remain NO-GO',
      'I approve a synthetic-only storage/document restore smoke against an approved disposable or explicitly approved non-production target.',
      'Use the stronger limited non-production wording approved in `docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_OWNER_REVIEW_PACKET_20260702.md` for internal, sales-support, and security-questionnaire contexts only.',
      'Keep public backup/restore claims `NO-GO`',
      'Current outcome: `Storage-excluded restore-readiness wording approved for limited internal/sales-support use only`',
      'Current restore claim: `LIMITED NON-PRODUCTION DATABASE REPLAY, APP/AUTH SMOKE, AND SYNTHETIC DOCUMENT-STORAGE SMOKE ONLY`',
      'Current public trust-center decision: `NO-GO`',
      'Current next evidence gate: `PRODUCTION RESTORE, REAL DOCUMENT RECOVERY, SIGNED URL RESTORE BEHAVIOR, PRODUCTION RPO/RTO, AND PUBLIC CLAIM EVIDENCE PENDING`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('does not include obvious secrets, connection strings, token material, or raw IDs', () => {
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
      '00000000-0000-4000-8000-000000000000',
      '00000000-0000-4000-8000-000000000001',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
