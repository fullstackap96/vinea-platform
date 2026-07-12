import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(
  process.cwd(),
  'scripts',
  'run-membership-aware-rls-manual-qa.mjs'
)

describe('membership-aware RLS manual QA runner', () => {
  it('requires disposable confirmations and blocks the shared QA project', () => {
    const script = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'DISPOSABLE_SUPABASE_DB_URL is required.',
      'VINEA_MEMBERSHIP_RLS_MANUAL_QA_CONFIRM',
      'MEMBERSHIP_AWARE_RLS_MANUAL_QA',
      'gnfomgsuottcuueasfvi',
      'kikqtorplsswepqitjys',
      'ALLOW_KIKQ_REUSE',
      'db.<project_ref>.supabase.co',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('applies the forward candidate, then always attempts rollback and cleanup', () => {
    const script = readFileSync(scriptPath, 'utf8')

    expect(script).toContain(
      'membership_aware_operational_rls_migration_candidate.sql'
    )
    expect(script).toContain('membership_aware_operational_rls_rollback_draft.sql')
    expect(script).toContain('await sql.unsafe(forwardSql)')
    expect(script).toContain('await sql.unsafe(rollbackSql)')
    expect(script).toContain('await cleanupQaData(sql)')
    expect(script).toContain('ensureDisposableLegacyRequestColumns')
    expect(script).toContain('confirmed_baptism_date')
    expect(script).toContain('appliedToSupabaseMigrations: false')
  })

  it('covers the required operational surfaces and staff identities', () => {
    const script = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'qa.staff.a@example.test',
      'qa.staff.ab@example.test',
      'qa.staff.c@example.test',
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
      expect(script).toContain(expected)
    }
  })

  it('simulates authenticated staff sessions without storing credentials', () => {
    const script = readFileSync(scriptPath, 'utf8')

    expect(script).toContain('set local role authenticated')
    expect(script).toContain("'request.jwt.claims'")
    expect(script).toContain("'request.jwt.claim.email'")
    expect(script).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(script).not.toContain('SUPABASE_ANON_KEY')
  })
})
