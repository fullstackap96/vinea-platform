import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const script = readFileSync(
  resolve(
    process.cwd(),
    'scripts/run-function-privilege-hardening-shared-qa-promotion.mjs',
  ),
  'utf8',
)
const candidate = readFileSync(
  resolve(
    process.cwd(),
    'docs/sql/shared_qa_function_privilege_hardening_candidate.sql',
  ),
  'utf8',
)
const rollback = readFileSync(
  resolve(
    process.cwd(),
    'docs/sql/shared_qa_function_privilege_hardening_rollback_candidate.sql',
  ),
  'utf8',
)
const packet = readFileSync(
  resolve(
    process.cwd(),
    'docs/SHARED_QA_DATABASE_SECURITY_PROMOTION_APPROVAL_PACKET_20260807.md',
  ),
  'utf8',
)

describe('shared-QA function privilege promotion package', () => {
  it('fails closed on target, approval, execute, and candidate identity', () => {
    for (const marker of [
      "const sharedQaProjectRef = 'gnfomgsuottcuueasfvi'",
      "const approvedHost = `db.${sharedQaProjectRef}.supabase.co`",
      "'kikqtorplsswepqitjys'",
      'FUNCTION_PRIVILEGE_SHARED_QA_PROMOTION',
      'EXECUTE_FUNCTION_PRIVILEGE_SHARED_QA_PROMOTION',
      '82D84FF5C81B215330A49F51ED1DB7F7025D982FC2405DA83CD1736CA3622DF8',
      'candidate hash does not match',
    ]) {
      expect(script).toContain(marker)
    }
  })

  it('requires repaired history before applying the candidate', () => {
    for (const version of ['20260625193000', '20260626170000', '20260630170000']) {
      expect(script).toContain(version)
    }

    const preflight = script.indexOf('missingVersions.length > 0')
    const begin = script.indexOf("await sql.unsafe('BEGIN')")
    const apply = script.indexOf('await sql.unsafe(candidateBody)')
    expect(preflight).toBeGreaterThan(-1)
    expect(begin).toBeGreaterThan(preflight)
    expect(apply).toBeGreaterThan(begin)
  })

  it('commits only after exact privilege checks and rolls back otherwise', () => {
    for (const marker of [
      'allAnonRevoked',
      'authenticatedSurfaceExact',
      'serviceRoleSurfaceExact',
      'scheduleSearchPathFixed',
      "await sql.unsafe('ROLLBACK')",
      "await sql.unsafe('COMMIT')",
      'rolled_back_validation_failure',
    ]) {
      expect(script).toContain(marker)
    }

    expect(script.indexOf('if (!allChecksPass(result))')).toBeLessThan(
      script.indexOf("await sql.unsafe('COMMIT')"),
    )
  })

  it('uses catalog and migration metadata only and emits no secret values', () => {
    expect(script).toContain('supabase_migrations.schema_migrations')
    expect(script).toContain('pg_catalog.pg_proc')
    expect(script).not.toMatch(/from\s+public\.(requests|people|parishioners|documents)/i)
    expect(script).not.toContain('writeFileSync')
    expect(script).not.toContain('console.log(databaseUrl)')
    expect(script).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
  })

  it('keeps forward and rollback SQL outside migrations and free of data/RLS work', () => {
    for (const source of [candidate, rollback]) {
      expect(source).not.toMatch(/CREATE\s+POLICY|ALTER\s+POLICY/i)
      expect(source).not.toMatch(/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i)
      expect(source).not.toMatch(/INSERT\s+INTO|UPDATE\s+public\.|DELETE\s+FROM/i)
    }
    expect(rollback).toContain('NON-APPLIED EMERGENCY ROLLBACK CANDIDATE')
    expect(rollback).toContain('RESET search_path')
  })

  it('documents official history-only repair semantics and keeps writes unapproved', () => {
    for (const marker of [
      'supabase migration repair 20260625193000 20260626170000 20260630170000 --status applied',
      '--status reverted',
      'No migration SQL is replayed.',
      'Shared-QA migration-history repair and privilege application remain `NO-GO`',
      'Production application',
      'Exact Approval Language',
    ]) {
      expect(packet).toContain(marker)
    }
  })
})
