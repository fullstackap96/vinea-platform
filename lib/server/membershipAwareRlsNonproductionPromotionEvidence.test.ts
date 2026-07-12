import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md'
)

describe('membership-aware RLS non-production promotion evidence', () => {
  it('records the approved non-production target and blocks shared QA and production', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Approved target host: `db.kikqtorplsswepqitjys.supabase.co`',
      'Shared QA project `gnfomgsuottcuueasfvi` touched: `No`',
      'Production touched: `No`',
      'Operational RLS applied to shared QA or production: `No`',
      'Secret printed or committed: `No`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records promoted migration apply and rollback verification', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
      'Forward migration applied: `Pass`',
      '`request_belongs_to_staff_parish(uuid)` existed after forward migration: `Pass`',
      'Membership-aware references: `45`',
      'Primary-parish references: `0`',
      'Rollback draft applied after forward migration: `Pass`',
      '`request_belongs_to_staff_parish(uuid)` removed after rollback: `Pass`',
      'Rollback verification passed: `Yes`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records final rollback state and remaining gates', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'The non-production target was rolled back after the forward verification.',
      '`/api/health` was not captured during this runner-only promotion step.',
      'Full browser route QA was not rerun during this promotion step',
      'Decision: `Promoted To Repo Migration; Non-Production Apply/Rollback Passed`',
      'Apply the promoted migration to an explicitly approved shared QA target',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
