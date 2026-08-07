import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const script = readFileSync(
  resolve(
    process.cwd(),
    'scripts/run-function-privilege-hardening-disposable-validation.mjs',
  ),
  'utf8',
)

describe('function privilege hardening disposable validator', () => {
  it('requires exact confirmation and blocks shared QA', () => {
    for (const marker of [
      'DISPOSABLE_SUPABASE_DB_URL is required.',
      'VINEA_FUNCTION_PRIVILEGE_DISPOSABLE_CONFIRM',
      'FUNCTION_PRIVILEGE_DISPOSABLE_VALIDATION',
      'gnfomgsuottcuueasfvi',
      'Refusing to run against blocked project ref',
      'db.<project_ref>.supabase.co',
    ]) {
      expect(script).toContain(marker)
    }
  })

  it('keeps the reusable disposable target behind its second confirmation', () => {
    for (const marker of [
      "const reusableDisposableProjectRef = 'kikqtorplsswepqitjys'",
      "const reusableDisposableConfirmationValue = 'ALLOW_KIKQ_REUSE'",
      'VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=',
      'reusableDisposableAllowed: isApprovedReusableDisposable',
    ]) {
      expect(script).toContain(marker)
    }
  })

  it('loads only the non-applied docs candidate', () => {
    expect(script).toContain('shared_qa_function_privilege_hardening_candidate.sql')
    expect(script).toContain('NON-APPLIED SECURITY CANDIDATE')
    expect(script).not.toContain("join(root, 'supabase', 'migrations')")
    expect(script).not.toContain('apply_migration')
  })

  it('applies and verifies inside a transaction that must roll back', () => {
    const begin = script.indexOf("await sql.unsafe('BEGIN')")
    const apply = script.indexOf('await sql.unsafe(candidateBody)')
    const rollback = script.indexOf("await sql.unsafe('ROLLBACK')")

    expect(begin).toBeGreaterThan(-1)
    expect(apply).toBeGreaterThan(begin)
    expect(rollback).toBeGreaterThan(apply)
    expect(script).toContain('baselineRestored')
    expect(script).toContain('transactionRollbackRequired: true')
  })

  it('checks the exact privilege and search-path outcomes without customer data', () => {
    for (const marker of [
      "has_function_privilege('anon', p.oid, 'EXECUTE')",
      "has_function_privilege('authenticated', p.oid, 'EXECUTE')",
      "has_function_privilege('service_role', p.oid, 'EXECUTE')",
      'allAnonRevoked',
      'authenticatedSurfaceExact',
      'serviceRpcSurfacePreserved',
      'serviceRoleSurfaceExact',
      'serviceRoleFunctions.has(row.functionName)',
      'scheduleSearchPathFixed',
      'pg_catalog.pg_proc',
    ]) {
      expect(script).toContain(marker)
    }

    expect(script).not.toMatch(/from\s+public\.(requests|people|parishioners|documents)/i)
    expect(script).not.toContain('writeFileSync')
    expect(script).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
  })
})
