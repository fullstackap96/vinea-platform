import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationPath = join(
  process.cwd(),
  'supabase',
  'migrations',
  '20260626170000_membership_aware_operational_rls.sql'
)
const candidatePath = join(
  process.cwd(),
  'docs',
  'sql',
  'membership_aware_operational_rls_migration_candidate.sql'
)
const scriptPath = join(
  process.cwd(),
  'scripts',
  'run-membership-aware-rls-nonproduction-promotion.mjs'
)

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

describe('promoted membership-aware operational RLS migration', () => {
  it('exists as a promoted Supabase migration with evidence and rollback references', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    for (const expected of [
      'SUPABASE MIGRATION - MEMBERSHIP-AWARE OPERATIONAL RLS',
      'docs/MEMBERSHIP_AWARE_RLS_PRODUCT_OWNER_SIGNOFF_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION_PLAN_20260626.md',
      'docs/MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_MANUAL_QA_EVIDENCE_20260626_COMPLETED.md',
      'docs/MEMBERSHIP_AWARE_RLS_ROUTE_BROWSER_QA_EVIDENCE_20260626_COMPLETED.md',
      'docs/sql/membership_aware_operational_rls_rollback_draft.sql',
    ]) {
      expect(migration).toContain(expected)
    }

    expect(migration).not.toContain('MIGRATION CANDIDATE ONLY - NOT A SUPABASE MIGRATION')
  })

  it('preserves candidate policy coverage and membership-aware helper semantics', () => {
    const migration = readFileSync(migrationPath, 'utf8')
    const candidate = readFileSync(candidatePath, 'utf8')

    expect(extractPolicyTargets(migration)).toEqual(extractPolicyTargets(candidate))
    expect(migration).toContain(
      'CREATE OR REPLACE FUNCTION public.request_belongs_to_staff_parish(p_request_id uuid)'
    )
    expect(migration).toContain('public.is_authorized_for_parish(')
    expect(migration).toContain('public.request_belongs_to_staff_parish(request_id)')
  })

  it('keeps the non-production runner guarded and pointed at the promoted migration', () => {
    const script = readFileSync(scriptPath, 'utf8')

    for (const expected of [
      'NON_PRODUCTION_SUPABASE_DB_URL',
      'VINEA_MEMBERSHIP_RLS_NONPRODUCTION_CONFIRM',
      'MEMBERSHIP_AWARE_RLS_NONPRODUCTION_PROMOTION',
      'gnfomgsuottcuueasfvi',
      '20260626170000_membership_aware_operational_rls.sql',
      'appliedToSupabaseMigrations: true',
      'Refusing to run against blocked project ref',
    ]) {
      expect(script).toContain(expected)
    }
  })
})
