import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(
  process.cwd(),
  'scripts',
  'run-membership-aware-rls-shared-qa-promotion.mjs'
)

describe('membership-aware RLS shared QA promotion runner', () => {
  it('requires the approved shared QA URL and explicit confirmation', () => {
    const script = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'SHARED_QA_SUPABASE_DB_URL',
      'VINEA_MEMBERSHIP_RLS_SHARED_QA_CONFIRM',
      'MEMBERSHIP_AWARE_RLS_SHARED_QA_PROMOTION',
      'gnfomgsuottcuueasfvi',
      'db\\.gnfomgsuottcuueasfvi\\.supabase\\.co',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('blocks the reusable disposable project and refuses non-shared-QA hosts', () => {
    const script = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'kikqtorplsswepqitjys',
      'Refusing to run: target host is not approved shared QA project ref',
      'Refusing to run against blocked project ref',
      'database host must be the approved shared QA direct database host',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('applies forward, rehearses rollback, and reapplies forward as the final QA state', () => {
    const script = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      '20260626170000_membership_aware_operational_rls.sql',
      'membership_aware_operational_rls_rollback_draft.sql',
      "finalTargetState: 'forward_applied_membership_aware'",
      'rollbackRehearsal',
      'finalForward',
      'rollbackRehearsalPassed',
      'finalForwardPassed',
    ]) {
      expect(script).toContain(expected)
    }

    expect(script.match(/await queryUnsafe\(forwardSql\)/g)).toHaveLength(2)
    expect(script.match(/await queryUnsafe\(rollbackSql\)/g)).toHaveLength(1)
  })
})
