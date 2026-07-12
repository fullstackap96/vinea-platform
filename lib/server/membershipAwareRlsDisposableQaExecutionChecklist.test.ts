import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checklistPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EXECUTION_CHECKLIST.md'
)
const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

describe('membership-aware RLS disposable QA execution checklist', () => {
  it('keeps execution guidance out of applied Supabase migrations', () => {
    const checklist = readFileSync(checklistPath, 'utf8')
    const migrationNames = readdirSync(migrationsDir)

    expect(checklist).toContain('Do not run against current QA or production.')
    expect(checklist).toContain('Do not run this checklist against production.')
    expect(checklist).toContain('Do not run this checklist against the current shared QA database.')
    expect(checklist).toContain('Use only a temporary Supabase branch')
    expect(checklist).toContain('Do not add the forward or rollback SQL drafts to `supabase/migrations`')
    expect(migrationNames).not.toContain(
      'MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EXECUTION_CHECKLIST.md'
    )
    expect(migrationNames).not.toContain('membership_aware_operational_rls_draft.sql')
    expect(migrationNames).not.toContain(
      'membership_aware_operational_rls_rollback_draft.sql'
    )
  })

  it('documents exact forward candidate, rollback draft, and guarded runner inputs', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    expect(checklist).toContain('docs/sql/membership_aware_operational_rls_migration_candidate.sql')
    expect(checklist).toContain(
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql'
    )
    expect(checklist).toContain('scripts/run-membership-aware-rls-disposable-validation.mjs')
    expect(checklist).toContain('VINEA_MEMBERSHIP_RLS_DISPOSABLE_CONFIRM')
    expect(checklist).toContain('MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION')
    expect(checklist).toContain('## Forward Draft Application')
    expect(checklist).toContain('## Rollback Draft Application')
    expect(checklist).toContain('Do not create a migration file.')
    expect(checklist).toContain('The script does not replace authenticated manual allow/deny workflow QA.')
  })

  it('includes verification queries for policy state before, during, and after the draft run', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'select current_database() as database_name;',
      'from pg_policies',
      "to_regprocedure('public.request_belongs_to_staff_parish(uuid)') is not null",
      "to_regprocedure('public.request_belongs_to_staff_parish(uuid)') is null",
      "qual ilike '%is_authorized_for_parish%'",
      "qual ilike '%primary_parish_id%'",
      "qual ilike '%request_belongs_to_staff_parish%'",
      "qual ilike '%request_belongs_to_primary_parish%'",
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('defines pass and fail criteria for forward, rollback, and app validation', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const heading of [
      '## Preflight Verification',
      '## Forward Allow/Deny Validation',
      '## Rollback Behavior Validation',
      '## Final Go/No-Go',
    ]) {
      expect(checklist).toContain(heading)
    }

    expect(checklist).toMatch(/Pass criteria:/g)
    expect(checklist).toMatch(/Fail criteria:/g)
    expect(checklist).toContain('Every authorized parish read returns the expected row.')
    expect(checklist).toContain('Every unauthorized parish read returns no rows.')
    expect(checklist).toContain('Any unrelated parish row is visible.')
    expect(checklist).toContain('checks.schema: true')
  })

  it('requires operational, public, family, storage, and cleanup coverage', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'People',
      'Households',
      'Sacramental Records',
      'Mass Intentions',
      'Request workflow steps',
      'Request documents',
      'Public intake still creates safe disposable requests.',
      'Family portal access still shows only family-facing request details',
      'Staff document URLs remain mediated by server routes and signed URL logic.',
      'Destroy the temporary Supabase branch/project.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })
})
