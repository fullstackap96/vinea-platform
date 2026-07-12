import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(process.cwd(), 'scripts', 'run-disposable-base-schema-bootstrap.mjs')

function readScript() {
  return readFileSync(scriptPath, 'utf8')
}

describe('disposable base schema bootstrap runner script', () => {
  it('requires explicit disposable confirmation and refuses shared QA', () => {
    const script = readScript()

    for (const expected of [
      'DISPOSABLE_SUPABASE_DB_URL is required.',
      'VINEA_DISPOSABLE_BOOTSTRAP_CONFIRM',
      'DISPOSABLE_BASE_SCHEMA_BOOTSTRAP',
      'gnfomgsuottcuueasfvi',
      'Refusing to run against blocked project ref',
      'database host must be a local disposable database or db.<project_ref>.supabase.co',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('keeps kikqtorplsswepqitjys blocked unless the reusable disposable confirmation is present', () => {
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

    expect(script).not.toContain(
      "'kikqtorplsswepqitjys', // prior/current disposable target, intentionally not reused"
    )
  })

  it('applies the base bootstrap before sorted repo migrations', () => {
    const script = readScript()

    const bootstrapRead = script.indexOf(
      "readFileSync(bootstrapPath, 'utf8')"
    )
    const migrationLoop = script.indexOf('for (const file of migrationFiles)')

    expect(script).toContain('disposable_base_schema_bootstrap_candidate.sql')
    expect(script).toContain("'supabase', 'migrations'")
    expect(script).toContain(".filter((file) => file.endsWith('.sql'))")
    expect(script).toContain('.sort((a, b) => a.localeCompare(b))')
    expect(bootstrapRead).toBeGreaterThan(-1)
    expect(migrationLoop).toBeGreaterThan(-1)
    expect(bootstrapRead).toBeLessThan(migrationLoop)
  })

  it('outputs schema verification JSON without writing secrets or evidence files', () => {
    const script = readScript()

    for (const expected of [
      "status: 'started'",
      'requiredPostMigrationTables',
      'requiredFunctions',
      'missingTables',
      'missingFunctions',
      'JSON.stringify(evidence, null, 2)',
      'check_public_intake_rate_limit',
      'create_request_workflow_steps_from_active_template',
      'current_staff_parish_ids',
      'is_authorized_for_parish',
    ]) {
      expect(script).toContain(expected)
    }

    expect(script).not.toContain('writeFileSync')
    expect(script).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(script).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  })
})
