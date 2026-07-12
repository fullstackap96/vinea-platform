import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(
  process.cwd(),
  'scripts',
  'run-membership-aware-rls-disposable-validation.mjs'
)

function readScript() {
  return readFileSync(scriptPath, 'utf8')
}

describe('membership-aware operational RLS disposable validation script', () => {
  it('requires an explicit disposable confirmation and refuses shared QA', () => {
    const script = readScript()

    for (const expected of [
      'DISPOSABLE_SUPABASE_DB_URL is required.',
      'VINEA_MEMBERSHIP_RLS_DISPOSABLE_CONFIRM',
      'MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION',
      'gnfomgsuottcuueasfvi',
      'Refusing to run against blocked project ref',
      'database host must be a local disposable database or db.<project_ref>.supabase.co',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('keeps the reusable disposable project blocked unless the extra confirmation is present', () => {
    const script = readScript()

    for (const expected of [
      "const reusableDisposableProjectConfirmation = process.env.VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT",
      "const reusableDisposableProjectRef = 'kikqtorplsswepqitjys'",
      "const reusableDisposableProjectConfirmationValue = 'ALLOW_KIKQ_REUSE'",
      'isApprovedReusableDisposableProject',
      'reusableDisposableProjectConfirmation !== reusableDisposableProjectConfirmationValue',
      'Refusing to run against reusable disposable project ref',
      'VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=',
      'reusableDisposableProjectAllowed: isApprovedReusableDisposableProject',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('applies the forward candidate before rollback and keeps both outside migrations', () => {
    const script = readScript()

    const forwardRead = script.indexOf("readFileSync(forwardPath, 'utf8')")
    const rollbackRead = script.indexOf("readFileSync(rollbackPath, 'utf8')")

    expect(script).toContain('membership_aware_operational_rls_migration_candidate.sql')
    expect(script).toContain('membership_aware_operational_rls_rollback_draft.sql')
    expect(script).toContain('appliedToSupabaseMigrations: false')
    expect(forwardRead).toBeGreaterThan(-1)
    expect(rollbackRead).toBeGreaterThan(-1)
    expect(forwardRead).toBeLessThan(rollbackRead)
    expect(script).not.toContain("join(root, 'supabase', 'migrations')")
  })

  it('outputs sanitized JSON evidence without writing secrets or evidence files', () => {
    const script = readScript()

    for (const expected of [
      "status: 'started'",
      'missingFoundationFunctions',
      'forwardPassed',
      'rollbackPassed',
      'JSON.stringify(evidence, null, 2)',
      'request_belongs_to_staff_parish',
      'is_authorized_for_parish',
      'request_belongs_to_primary_parish',
    ]) {
      expect(script).toContain(expected)
    }

    expect(script).not.toContain('writeFileSync')
    expect(script).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(script).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  })
})
