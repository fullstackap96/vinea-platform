import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const planPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_PLAN_20260626.md'
)

describe('membership-aware RLS non-production promotion plan', () => {
  it('keeps this phase as planning only with shared QA and production blocked', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'Status: Prepared plan and role-readiness record only.',
      'Do not move the migration candidate into `supabase/migrations` from this document.',
      'Do not apply operational RLS to shared QA or production from this document.',
      'Applying operational RLS to shared QA project `gnfomgsuottcuueasfvi`.',
      'Applying operational RLS to production.',
      'Enabling runtime public intake routing.',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('records advisory role readiness without pretending named human sign-off occurred', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'These entries are readiness recommendations, not named human signatures.',
      '| Technical owner | `Advisory ready; named sign-off pending` |',
      '| QA owner | `Advisory ready; named sign-off pending` |',
      '| Security/data owner | `Advisory ready; named sign-off pending` |',
      'Recommend non-production-only promotion after explicit prompt',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('defines future promotion, verification, rollback, and evidence capture steps', () => {
    const plan = readFileSync(planPath, 'utf8')

    for (const expected of [
      'Suggested pattern: `supabase/migrations/YYYYMMDDHHMMSS_membership_aware_operational_rls.sql`',
      'Run focused validation tests',
      'Apply the new migration to the approved non-production target only.',
      'Confirm `/api/health` returns `checks.schema: true`.',
      'Apply `docs/sql/membership_aware_operational_rls_rollback_draft.sql`.',
      'Final decision: `Ready for shared QA`, `Do Not Promote`, or `Promote After Fixes`.',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('keeps membership-aware operational RLS candidate out of applied migrations', () => {
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
    const migrationNames = existsSync(migrationsDir) ? readdirSync(migrationsDir) : []

    expect(migrationNames).toContain('20260626170000_membership_aware_operational_rls.sql')
    expect(migrationNames).not.toContain('membership_aware_operational_rls_migration_candidate.sql')
  })
})
