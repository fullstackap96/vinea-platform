import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const signoffPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PRODUCT_OWNER_SIGNOFF_20260626.md'
)

describe('membership-aware RLS product-owner sign-off record', () => {
  it('records product-owner approval without promoting or applying operational RLS', () => {
    const signoff = readFileSync(signoffPath, 'utf8')

    for (const expected of [
      'Product-owner decision: `Approve next controlled non-production promotion preparation`',
      'Migration candidate moved into `supabase/migrations`: `No`',
      'Operational RLS applied to shared QA or production: `No`',
      'Runtime public intake routing enabled: `No`',
      'Outcome: `Product-owner sign-off recorded; promotion not executed`',
    ]) {
      expect(signoff).toContain(expected)
    }
  })

  it('links the completed disposable, manual QA, route QA, candidate, and rollback evidence', () => {
    const signoff = readFileSync(signoffPath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md',
      'docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_PLAN_20260626.md',
      'docs/sql/membership_aware_operational_rls_migration_candidate.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
    ]) {
      expect(signoff).toContain(expected)
    }
  })

  it('records advisory technical, QA, and security/data readiness while requiring explicit approval', () => {
    const signoff = readFileSync(signoffPath, 'utf8')

    for (const expected of [
      '| Technical owner | Advisory Codex readiness recorded; named human sign-off pending |',
      '| QA owner | Advisory Codex readiness recorded; named human sign-off pending |',
      '| Security/data owner | Advisory Codex readiness recorded; named human sign-off pending |',
      '`Recommend non-production-only promotion after explicit prompt`',
      'Do not move the candidate into `supabase/migrations` without a new explicit approval.',
      'Do not apply production RLS before non-production promotion and verification.',
    ]) {
      expect(signoff).toContain(expected)
    }
  })

  it('keeps the candidate filename out of migrations while allowing the approved promoted migration', () => {
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
    const migrationNames = existsSync(migrationsDir) ? readdirSync(migrationsDir) : []

    expect(migrationNames).not.toContain('membership_aware_operational_rls_migration_candidate.sql')
    expect(migrationNames).toContain('20260626170000_membership_aware_operational_rls.sql')
  })
})
