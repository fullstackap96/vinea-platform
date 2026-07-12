import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const templatePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md'
)
const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

describe('membership-aware RLS disposable QA evidence template', () => {
  it('keeps evidence documentation out of applied Supabase migrations', () => {
    const template = readFileSync(templatePath, 'utf8')
    const migrationNames = readdirSync(migrationsDir)

    expect(template).toContain('Status: Blank evidence template.')
    expect(template).toContain('Disposable environment only')
    expect(template).toContain('Not production')
    expect(template).toContain('Not current shared QA')
    expect(migrationNames).not.toContain(
      'MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EVIDENCE_TEMPLATE.md'
    )
  })

  it('links the execution checklist, promotion checklist, candidate, and rollback draft', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      'docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EXECUTION_CHECKLIST.md',
      'docs/MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md',
      'docs/sql/membership_aware_operational_rls_migration_candidate.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
      'scripts/run-membership-aware-rls-disposable-validation.mjs',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('requires environment identity and preflight evidence', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '## Environment Identity',
      'Supabase project or branch name:',
      'Supabase project reference:',
      'Database name from `select current_database()`',
      'Git commit SHA:',
      'Repository migrations applied before test',
      '## Preflight Results',
      'current_staff_parish_ids()',
      'is_authorized_for_parish(uuid)',
      'request_belongs_to_primary_parish(uuid)',
      'Baseline policy snapshot captured',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('requires forward, rollback, manual workflow, and external QA evidence', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '## Forward Validation Results',
      'Forward candidate applied cleanly',
      'Forward Cross-Parish Allow/Deny Matrix',
      '## Rollback Validation Results',
      'Rollback draft applied cleanly after forward candidate',
      'Single-primary-parish staff access works after rollback',
      '## Manual Staff Workflow QA Results',
      'Request status',
      'People list/detail/create/edit',
      'Mass Intentions list/detail/create/edit',
      '## Public, Family, Document, And External QA Results',
      'Family portal safe details only',
      'Google Calendar safe test credentials only',
      'AI summary/draft data isolation',
    ]) {
      expect(template).toContain(expected)
    }
  })

  it('requires automated outputs, unresolved risks, cleanup, sign-off, and final decision', () => {
    const template = readFileSync(templatePath, 'utf8')

    for (const expected of [
      '## Automated Check Outputs',
      'Guarded disposable RLS validation script:',
      'Full test suite:',
      'Build:',
      'Lint:',
      'Health:',
      '## Unresolved Risks',
      '## Cleanup Confirmation',
      'Uploaded test files removed from Supabase Storage',
      'Temporary Supabase branch/project destroyed',
      '## Sign-Off',
      'Product Owner',
      'Technical Owner',
      'QA Owner',
      'Security/Data Owner',
      '## Final Decision',
    ]) {
      expect(template).toContain(expected)
    }
  })
})
