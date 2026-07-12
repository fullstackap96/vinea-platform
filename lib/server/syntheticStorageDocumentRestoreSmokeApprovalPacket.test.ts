import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701.md'
)

describe('synthetic storage/document restore smoke approval packet', () => {
  it('is approval-only and preserves the no-runtime/no-data-access boundary', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a product-owner approval packet only.',
      'No storage/document restore smoke was executed',
      'production was not accessed',
      'shared QA was not accessed',
      'real private documents were not accessed',
      'storage was not accessed',
      'signed URLs were not created',
      'Google Calendar was not touched',
      'external integrations were not called',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'raw IDs were not recorded',
      'secrets were not exposed',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'no migrations were applied',
      'Current decision state: `SYNTHETIC STORAGE/DOCUMENT RESTORE SMOKE APPROVAL PACKET PREPARED; SMOKE NOT EXECUTED; PUBLIC BACKUP/RESTORE CLAIMS REMAIN NO-GO`',
      'Completion marker: `SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_APPROVAL_PACKET_20260701`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('links the storage-excluded decision, restore evidence, runbook, and trust-center docs', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'docs/STORAGE_EXCLUDED_RESTORE_READINESS_DECISION_PACKET_20260701.md',
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_20260701_APPROVED_DISPOSABLE_TARGET.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_20260701_SAFE_REUSABLE_DISPOSABLE_TARGET.md',
      'docs/BACKUP_RESTORE_RUNBOOK_20260627.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires the exact approval phrase, approved disposable target, synthetic-only fixtures, and owner sign-offs', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'APPROVED_SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE',
      'If the phrase is missing or altered, the smoke must remain blocked before execution.',
      'Target type: `approved reusable disposable restore target only`',
      'The future smoke must use only synthetic labels and synthetic content:',
      '| Synthetic parish label | Use a human-readable disposable label only |',
      '| Synthetic staff label | Use a temporary safe staff label only |',
      '| Synthetic request label | Use a temporary safe request label only |',
      '| Synthetic workflow/document step label | Use a temporary safe step label only |',
      '| Synthetic document label | Use a generic label such as `Synthetic restore smoke document` |',
      '| Synthetic file content | Use harmless test content only, with no parishioner, sacramental, canonical, pastoral, financial, or private data |',
      '| Product owner | Confirms the synthetic-only storage/document smoke is approved for the disposable target only | `PENDING` |',
      '| Security/data owner | Confirms no real private documents, raw IDs, raw metadata, signed URLs, or secrets are recorded | `PENDING` |',
      '| Cleanup owner | Confirms synthetic rows/objects/tokens can be cleaned up safely | `PENDING` |',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines required checks, evidence rules, stop conditions, and exact future approval language', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Confirm the app health check remains green against the approved disposable target.',
      'Create or restore one synthetic request document record in the disposable target.',
      'Create or restore one synthetic storage object, if the approved implementation requires object-level verification.',
      'Verify direct anonymous storage access is denied, recording only pass/fail.',
      'Signed URL creation remains blocked unless the future prompt separately approves a signed-URL safety check.',
      'docs/SYNTHETIC_STORAGE_DOCUMENT_RESTORE_SMOKE_EVIDENCE_YYYYMMDD_APPROVED_DISPOSABLE_TARGET.md',
      'Start with `Smoke result = Blocked before execution`.',
      'Record pass/fail outcomes, not raw values.',
      'Keep public backup/restore readiness claims `NO-GO` until evidence is reviewed.',
      '## Stop Conditions',
      'The target is production, shared QA, customer data, or could reasonably be confused with one of those targets.',
      'The smoke would require real private documents.',
      'Cleanup could affect anything outside the approved disposable target.',
      '## Exact Approval Language For Future Prompt',
      'Approve execution of the synthetic-only storage/document restore smoke against the approved reusable disposable restore target only',
      'After execution, update the evidence file, verify cleanup, run checks, update build status, summarize, and include estimated completion percentage.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('keeps storage restore and public trust-center claims blocked until future evidence is reviewed', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Current outcome: `Synthetic storage/document restore smoke approval packet prepared; smoke executed and evidence recorded separately`',
      'Current storage restore claim: `SYNTHETIC NON-PRODUCTION EVIDENCE RECORDED; PRODUCTION AND REAL DOCUMENT RESTORE CLAIMS REMAIN NO-GO`',
      'Current public trust-center decision: `NO-GO`',
      '`BLOCKED_PRIVACY`',
      '`BLOCKED_SCOPE`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('does not include obvious credential, token, connection-string, raw ID, or executable-command material', () => {
    const packet = readFileSync(packetPath, 'utf8')

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
      'supabase db reset',
      'supabase db dump',
      'psql ',
      'pg_restore',
      '00000000-0000-4000-8000-000000000000',
      '00000000-0000-4000-8000-000000000001',
    ]) {
      expect(packet).not.toContain(forbidden)
    }
  })
})
