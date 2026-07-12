import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checklistPath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md'
)
const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

describe('membership-aware RLS promotion readiness checklist', () => {
  it('records repo and shared QA promotion while blocking production application', () => {
    const checklist = readFileSync(checklistPath, 'utf8')
    const migrationNames = readdirSync(migrationsDir)

    expect(checklist).toContain('Repo migration promoted and applied to shared QA only.')
    expect(checklist).toContain('Do not apply the promoted migration to production')
    expect(checklist).toContain('Do not promote directly from draft SQL to production.')
    expect(checklist).toContain('Non-production apply and rollback passed against `kikqtorplsswepqitjys`.')
    expect(checklist).toContain(
      'Shared QA apply, rollback rehearsal, final forward application, health check, authenticated workflow smoke, document/family portal smoke, and active-parish-cookie request detail/document smoke have passed against `gnfomgsuottcuueasfvi`.'
    )
    expect(checklist).toContain(
      'Production rollout/rollback packet has been prepared but is not approval to apply production RLS.'
    )
    expect(checklist).toContain(
      'Production sign-off template has been prepared; all production approvals remain pending.'
    )
    expect(migrationNames).toContain('20260626170000_membership_aware_operational_rls.sql')
    expect(migrationNames).not.toContain(
      'MEMBERSHIP_AWARE_RLS_PROMOTION_READINESS_CHECKLIST.md'
    )
    expect(migrationNames).not.toContain(
      'membership_aware_operational_rls_migration_candidate.sql'
    )
  })

  it('requires the migration candidate, rollback draft, and QA checklist references', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      'docs/sql/membership_aware_operational_rls_migration_candidate.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
      'docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EXECUTION_CHECKLIST.md',
      'docs/MEMBERSHIP_AWARE_RLS_QA_VALIDATION_PLAN.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCT_OWNER_SIGNOFF_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_PLAN_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_EVIDENCE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_READINESS_GATE_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_ROLLOUT_ROLLBACK_PACKET_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCTION_SIGNOFF_TEMPLATE_20260626.md',
      'docs/VINEA_BUILD_STATUS.md',
      'supabase/migrations/20260626170000_membership_aware_operational_rls.sql',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('defines evidence gates for disposable forward validation and rollback validation', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '## Gate 2: Disposable Forward Validation Evidence',
      'Forward candidate applies cleanly in a disposable Supabase environment.',
      'Every cross-parish allow case from the QA validation plan passes.',
      'Every cross-parish deny case from the QA validation plan passes.',
      '## Gate 3: Rollback Evidence',
      'Rollback draft applies cleanly after the forward candidate in the same disposable environment.',
      'request_belongs_to_staff_parish(uuid)` is removed after rollback',
      'Single-primary-parish staff access still works after rollback.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('requires manual staff workflow and public/family/document/external QA', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '## Gate 4: Manual Staff Workflow QA',
      'Request status, assignment, follow-up, notes, workflow steps, and documents work',
      'People list, detail, create, and edit flows work',
      'Household list, detail, create, and edit flows work',
      'Sacramental record list, detail, create, edit, and certificate flows work',
      'Mass Intention list, detail, create, and edit flows work',
      '## Gate 5: Public, Family, Document, And External Action QA',
      'Family portal token access shows only safe family-facing request details.',
      'Google Calendar tests use safe test credentials only.',
      'AI summary and draft actions do not expose cross-parish or family-private data.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })

  it('requires automated checks, sign-off, promotion procedure, and explicit no-go criteria', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const expected of [
      '## Gate 6: Automated Checks',
      'npm.cmd test -- --reporter=dot',
      'npm.cmd run build',
      'npm.cmd run lint',
      'checks.schema: true',
      'Production readiness gate docs validation tests pass.',
      '## Gate 7: Approval Sign-Off',
      'Product owner approval',
      'Technical owner approval',
      'QA owner approval',
      'Security/data owner approval',
      'Product owner production approval must be separate from non-production and shared QA approval.',
      '## Promotion Procedure After Approval',
      '## Explicit No-Go Conditions',
      'Disposable QA evidence is missing.',
      'Rollback evidence is missing.',
      'Any cross-parish deny case fails.',
    ]) {
      expect(checklist).toContain(expected)
    }
  })
})
