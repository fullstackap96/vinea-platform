import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md'
)

describe('membership-aware RLS disposable validation completed evidence', () => {
  it('records the guarded disposable target and safety boundaries', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed against the approved reusable disposable Supabase project only.',
      'Target host: `db.kikqtorplsswepqitjys.supabase.co`',
      'Required confirmation accepted: `MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION`',
      'Reusable disposable project confirmation accepted: `ALLOW_KIKQ_REUSE`',
      'Shared QA project `gnfomgsuottcuueasfvi` touched: `No`',
      '`supabase/migrations` changed: `No`',
      'appliedToSupabaseMigrations": false',
      'Secret printed or committed: `No`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records successful forward and rollback policy-shape validation', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Forward candidate applied cleanly: `Pass`',
      'Forward membership-aware references: `45`',
      'Forward primary-parish references: `0`',
      'Primary-parish references cleared: `Pass`',
      'Rollback draft applied cleanly after forward candidate: `Pass`',
      'Rollback membership-aware references: `0`',
      'Rollback primary-parish references: `45`',
      'Rollback tables covered matched forward tables: `Pass`',
      '"forwardPassed": true',
      '"rollbackPassed": true',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps promotion blocked until manual authenticated QA is complete', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Manual authenticated cross-parish allow/deny workflow QA has not been completed.',
      'Operational RLS remains unpromoted',
      'Decision: `Do Not Promote Yet`',
      'manual authenticated allow/deny workflow QA and promotion sign-off remain required',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
