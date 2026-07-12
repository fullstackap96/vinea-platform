import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const packetPath = join(
  process.cwd(),
  'docs',
  'NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701.md'
)

describe('non-production restore drill execution packet', () => {
  it('is planning-only and preserves non-production boundaries', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Status: Prepared as a non-runtime execution packet/checklist only.',
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
      'Current decision state: `NON-PRODUCTION RESTORE DRILL EXECUTION PACKET PREPARED; RESTORE DRILL NOT EXECUTED; BACKUP/RESTORE PUBLIC CLAIMS REMAIN NO-GO`',
      'Completion marker: `NONPRODUCTION_RESTORE_DRILL_EXECUTION_PACKET_20260701`',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('links the runbook, evidence template, and trust-center docs', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'docs/NONPRODUCTION_RESTORE_DRILL_EVIDENCE_TEMPLATE_20260627.md',
      'docs/BACKUP_RESTORE_RUNBOOK_20260627.md',
      'docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md',
      'docs/TRUST_CENTER_READINESS_PACKET_20260627.md',
      'docs/TRUST_CENTER_EVIDENCE_GAP_REGISTER_20260701.md',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('requires explicit future approval and forbids production targets', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'APPROVED_NONPRODUCTION_RESTORE_DRILL_EXECUTION',
      'This packet must not be executed from a prompt that omits the exact approval phrase above.',
      'Use `docs/NONPRODUCTION_RESTORE_DRILL_EXECUTION_APPROVAL_PACKET_20260701.md` to collect the required target labels, owner sign-offs, evidence filename, stop-condition acceptance, and exact approval language before execution.',
      'Forbidden target:',
      'Production Supabase project.',
      'Production Vercel deployment.',
      'Production storage bucket.',
      'Do not proceed unless every row is `PASS`.',
      'Stop immediately if:',
      'The target appears to be production.',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('covers setup, baseline, restore execution, verification, cleanup, and abort handling', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      '## Evidence File Setup',
      '## Baseline Capture Steps',
      '## Restore Execution Steps',
      '## Post-Restore Verification Matrix',
      '## Cleanup And Reset Steps',
      '## Final Evidence Review',
      '## Blocked Or Aborted Drill Handling',
      'Health',
      'Schema',
      'Staff sign-in',
      'Staff authorization',
      'Documents',
      'Direct storage privacy',
      'Family portal',
      'Public intake',
      'Integrations',
    ]) {
      expect(packet).toContain(expected)
    }
  })

  it('keeps backup/restore claims conservative until evidence exists', () => {
    const packet = readFileSync(packetPath, 'utf8')

    for (const expected of [
      'Allowed post-drill internal claim after a passed drill:',
      'Vinea has completed a non-production restore drill and recorded sanitized evidence.',
      'Still do not claim:',
      'Vinea has completed production restore drills.',
      'Vinea is formally certified for backup and disaster recovery.',
      'Until a drill is actually executed and evidence is reviewed, public backup/restore readiness claims remain `NO-GO`.',
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
