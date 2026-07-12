import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_EVIDENCE_20260625_REUSABLE_FAILED.md'
)

describe('disposable base schema bootstrap reusable failed evidence', () => {
  it('records the approved reusable target and failed migration replay without secrets', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Failed during repo migration replay against the approved reusable disposable project.',
      'Supabase project ref: `kikqtorplsswepqitjys`',
      'Reusable disposable override: `VINEA_ALLOW_REUSED_DISPOSABLE_PROJECT=ALLOW_KIKQ_REUSE`',
      'Approved reusable disposable database modified: `Yes`',
      'Production touched: `No`',
      'Shared QA touched: `No`',
      'No database password or secret value is recorded in this evidence file.',
    ]) {
      expect(evidence).toContain(expected)
    }

    expect(evidence).not.toContain('postgresql://postgres:')
  })

  it('captures the non-blank database blocker and failed next migration', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'The run failed after `23` repo migration files had been applied.',
      '20260620100000_staff_users_authorization.sql',
      'column "active" does not exist',
      '`staff_users`',
      '`workflow_templates`',
      'This means the reusable project needs either a disposable cleanup/reset step or a stricter preflight',
      'Decision: `Do Not Promote`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
