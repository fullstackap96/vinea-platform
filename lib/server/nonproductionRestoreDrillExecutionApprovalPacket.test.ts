import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const approvalPacketPath = join(
  process.cwd(),
  'docs',
  'NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md'
)

describe('non-production restore drill execution approval packet', () => {
  it('is approval-only and preserves the no-runtime boundary', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a product-owner approval packet only.',
      'No restore drill was executed',
      'production was not accessed',
      'production flags were not enabled',
      'production smoke was not run',
      'migrations were not applied',
      'runtime behavior was not changed',
      'operational RLS was not changed',
      'Google Calendar data was not touched',
      'records were not mutated',
      'storage was not accessed',
      'signed URLs were not created',
      'raw exports were not exposed',
      'raw metadata was not exposed',
      'no secrets were exposed',
      'Current decision state: `NON-PRODUCTION RESTORE DRILL EXECUTION APPROVAL PACKET PREPARED; RESTORE DRILL NOT EXECUTED; BACKUP/RESTORE PUBLIC CLAIMS REMAIN NO-GO`',
      'Completion marker: `NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('links the execution packet, runbook, evidence template, and trust-center docs', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md',
      'docs/BACKUP_RESTORE_RUNBOOK_20260627.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires exact approval phrase, target labels, and owner sign-offs', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'APPROVED_NONPRODUCTION_RESTORE_DRILL_EXECUTION',
      'If the phrase is missing or altered, the drill must remain blocked before execution.',
      '`RESTORE_DRILL_TARGET_TYPE`',
      '`RESTORE_DRILL_TARGET_LABEL`',
      '`RESTORE_DRILL_TARGET_HOST_OR_PROJECT_REF_LABEL`',
      '`RESTORE_DRILL_APP_URL_LABEL`',
      '`RESTORE_DRILL_BACKUP_SOURCE_LABEL`',
      '`RESTORE_DRILL_DATABASE_SCOPE_LABEL`',
      '`RESTORE_DRILL_STORAGE_SCOPE_LABEL`',
      '`RESTORE_DRILL_AUTH_SCOPE_LABEL`',
      '`RESTORE_DRILL_INTEGRATION_SCOPE_LABEL`',
      '`RESTORE_DRILL_CLEANUP_PLAN_LABEL`',
      '`RESTORE_DRILL_EVIDENCE_FILE_LABEL`',
      '| Product owner | Confirms the drill is approved and non-production only | `PENDING` |',
      '| Backup owner | Confirms source/restore scope is safe and non-secret | `PENDING` |',
      '| Restore operator | Confirms execution packet, stop conditions, and evidence process | `PENDING` |',
      '| Security/data owner | Confirms privacy boundaries and evidence redaction | `PENDING` |',
      '| Cleanup owner | Confirms cleanup/reset plan and target boundary | `PENDING` |',
      '| Evidence owner | Confirms evidence filename and storage location | `PENDING` |',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('defines evidence naming, stop conditions, and exact future approval language', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

    for (const expected of [
      'docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_YYYYMMDD_<TARGET_LABEL>.md',
      'Start with `Drill result = Blocked before execution`.',
      'Keep `Restore readiness claim allowed? = No` until evidence review is complete.',
      '## Stop Conditions',
      'The target is production or could reasonably be confused with production.',
      'The exact approval phrase is missing.',
      'Any required target label is missing.',
      'Any required owner sign-off is missing.',
      'A production credential is required.',
      'Cleanup could affect anything outside the approved drill target.',
      'Storage access, signed URL creation, or file-content checks are needed without a separately approved synthetic or non-production-only storage scope.',
      '## Exact Approval Language For Future Prompt',
      'Approve execution of the non-production restore drill only against <RESTORE_DRILL_TARGET_LABEL>',
      'After execution, update the evidence file, run checks, and keep public backup/restore readiness claims NO-GO until evidence is reviewed and explicitly approved.',
      'Recommended non-secret labels and owner names are staged in `docs/NONPRODUCTION_RESTORE_DRILL_FILLED_APPROVAL_INPUTS_20260701.md` for product-owner review.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('does not include obvious credential, token, connection-string, raw ID, or executable-command material', () => {
    const packet = readFileSync(approvalPacketPath, 'utf8')

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
