import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md'
)

describe('membership-aware RLS manual QA completed evidence', () => {
  it('records the approved disposable target and safety boundaries', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Completed against the approved reusable disposable Supabase project only.',
      'Target host: `db.kikqtorplsswepqitjys.supabase.co`',
      'Required confirmation accepted: `MEMBERSHIP_AWARE_RLS_MANUAL_QA`',
      'Reusable disposable project confirmation accepted: `ALLOW_KIKQ_REUSE`',
      'Shared QA project `gnfomgsuottcuueasfvi` touched: `No`',
      '`supabase/migrations` changed: `No`',
      'Secret printed or committed: `No`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('records successful authenticated allow deny coverage', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '"totalCases": 207',
      '"passedCases": 207',
      '"failedCases": 0',
      'People',
      'Households',
      'Sacramental Records',
      'Mass Intentions',
      'Requests',
      'Request Notes',
      'Request Communications',
      'Workflow Steps',
      'Documents',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps promotion blocked until health route QA and sign-off are complete', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      '`/api/health` was not captured during this runner-only gate.',
      'Family portal safety was not re-tested in this runner.',
      'sign-off are still required',
      'Decision: `Do Not Promote Yet`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
