import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const planPath = join(process.cwd(), 'docs', 'DISPOSABLE_REUSABLE_PROJECT_CLEANUP_RESET_PLAN.md')
const scriptPath = join(process.cwd(), 'scripts', 'reset-reusable-disposable-schema.mjs')

function readPlan() {
  return readFileSync(planPath, 'utf8')
}

function readScript() {
  return readFileSync(scriptPath, 'utf8')
}

describe('disposable reusable project cleanup reset plan', () => {
  it('documents the approved target, safety confirmations, and non-goals', () => {
    const plan = readPlan()

    for (const expected of [
      'Approved reusable disposable Supabase project ref: `kikqtorplsswepqitjys`',
      'Do not run against shared QA `gnfomgsuottcuueasfvi`.',
      'Require `VINEA_DISPOSABLE_RESET_CONFIRM=RESET_KIKQ_DISPOSABLE_SCHEMA`.',
      'Require `VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE`.',
      'Default to dry-run unless `VINEA_DISPOSABLE_RESET_EXECUTE=EXECUTE_RESET` is set.',
      'Do not change runtime public intake wiring.',
      'Do not add or apply files under `supabase/migrations`.',
      'Do not write database passwords or connection strings to evidence files.',
    ]) {
      expect(plan).toContain(expected)
    }
  })

  it('limits cleanup to approved Vinea public schema objects', () => {
    const plan = readPlan()

    for (const expected of [
      '`staff_users`',
      '`parish_memberships`',
      '`workflow_templates`',
      '`request_documents`',
      '`request_portal_tokens`',
      '`rate_limit_buckets`',
      '`sacramental_record_type`',
      '`current_staff_parish_ids()`',
      '`check_public_intake_rate_limit(text, integer, integer)`',
    ]) {
      expect(plan).toContain(expected)
    }

    expect(plan).not.toContain('DROP SCHEMA public')
    expect(plan).not.toContain('auth.')
    expect(plan).not.toContain('storage.')
  })
})

describe('disposable reusable project cleanup reset script', () => {
  it('refuses unsafe targets and requires both confirmations', () => {
    const script = readScript()

    for (const expected of [
      'DISPOSABLE_SUPABASE_DB_URL is required.',
      'VINEA_DISPOSABLE_RESET_CONFIRM=',
      'RESET_KIKQ_DISPOSABLE_SCHEMA',
      'VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=',
      'ALLOW_KIKQ_REUSE',
      'gnfomgsuottcuueasfvi',
      'kikqtorplsswepqitjys',
      'Refusing to run against blocked project ref',
      'approved only for',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('defaults to dry-run and only executes with the extra execute confirmation', () => {
    const script = readScript()

    for (const expected of [
      "const executeConfirmationValue = 'EXECUTE_RESET'",
      "const executeReset = executeConfirmation === executeConfirmationValue",
      "status: executeReset ? 'started' : 'dry_run'",
      'if (executeReset) {',
      'await sql.unsafe(statement)',
    ]) {
      expect(script).toContain(expected)
    }
  })

  it('drops only the approved public objects and does not write secret evidence files', () => {
    const script = readScript()

    for (const expected of [
      "'staff_users'",
      "'parish_memberships'",
      "'workflow_templates'",
      "'request_documents'",
      "'request_portal_tokens'",
      "'rate_limit_buckets'",
      "'sacramental_record_type'",
      'DROP TABLE IF EXISTS',
      'DROP FUNCTION IF EXISTS',
      'DROP TYPE IF EXISTS',
      'CASCADE;',
      'JSON.stringify(evidence, null, 2)',
    ]) {
      expect(script).toContain(expected)
    }

    expect(script).not.toContain('DROP SCHEMA')
    expect(script).not.toContain('writeFileSync')
    expect(script).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(script).not.toContain('postgresql://postgres:')
  })
})
