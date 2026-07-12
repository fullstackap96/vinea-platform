import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const candidatePath = join(
  process.cwd(),
  'docs',
  'sql',
  'membership_aware_operational_rls_migration_candidate.sql'
)
const forwardDraftPath = join(
  process.cwd(),
  'docs',
  'sql',
  'membership_aware_operational_rls_draft.sql'
)
const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

function extractPolicyTargets(sql: string) {
  return Array.from(
    sql.matchAll(/ALTER\s+POLICY\s+"([^"]+)"\s+ON\s+public\.([a-z0-9_]+)/gi)
  )
    .map((match) => ({
      policy: match[1],
      table: match[2],
    }))
    .sort((a, b) => `${a.table}:${a.policy}`.localeCompare(`${b.table}:${b.policy}`))
}

describe('membership-aware operational RLS migration candidate', () => {
  it('keeps the candidate outside applied Supabase migrations', () => {
    const candidate = readFileSync(candidatePath, 'utf8')
    const migrationNames = readdirSync(migrationsDir)

    expect(candidate).toContain('MIGRATION CANDIDATE ONLY - NOT A SUPABASE MIGRATION')
    expect(candidatePath).toContain(join('docs', 'sql'))
    expect(candidatePath).not.toContain(join('supabase', 'migrations'))
    expect(migrationNames).not.toContain(
      'membership_aware_operational_rls_migration_candidate.sql'
    )
  })

  it('documents preflight gates, rollback reference, and disposable QA requirement', () => {
    const candidate = readFileSync(candidatePath, 'utf8')

    for (const expected of [
      'docs/sql/membership_aware_operational_rls_draft.sql',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
      'docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_QA_EXECUTION_CHECKLIST.md',
      'Confirm this is not production and not the current shared QA database.',
      'Confirm /api/health returns checks.schema: true',
      'resolveStaffWriteParishContext()',
      'Keep the rollback draft paired with this candidate during review.',
    ]) {
      expect(candidate).toContain(expected)
    }
  })

  it('preserves the forward draft operational policy coverage', () => {
    const candidate = readFileSync(candidatePath, 'utf8')
    const forwardDraft = readFileSync(forwardDraftPath, 'utf8')

    expect(extractPolicyTargets(candidate)).toEqual(extractPolicyTargets(forwardDraft))
  })

  it('uses membership-aware helper semantics and avoids primary parish rollback semantics', () => {
    const candidate = readFileSync(candidatePath, 'utf8')

    expect(candidate).toContain(
      'CREATE OR REPLACE FUNCTION public.request_belongs_to_staff_parish(p_request_id uuid)'
    )
    expect(candidate).toContain('public.is_authorized_for_parish(')
    expect(candidate).toContain('public.request_belongs_to_staff_parish(request_id)')
    expect(candidate).toContain(
      'REVOKE EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) FROM PUBLIC'
    )
    expect(candidate).toContain(
      'GRANT EXECUTE ON FUNCTION public.request_belongs_to_staff_parish(uuid) TO authenticated'
    )
    expect(candidate).not.toContain('public.request_belongs_to_primary_parish(request_id)')
    expect(candidate).not.toMatch(/DROP\s+FUNCTION\s+IF\s+EXISTS\s+public\.request_belongs_to_staff_parish/i)
  })
})
