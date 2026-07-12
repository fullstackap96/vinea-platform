import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePath = join(
  process.cwd(),
  'docs',
  'MEMBERSHIP_AWARE_RLS_DISPOSABLE_VALIDATION_EVIDENCE_20260626_BLOCKED.md'
)

describe('membership-aware RLS disposable validation blocked evidence', () => {
  it('records that the guarded runner was not executed without an active disposable DB URL', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Status: Blocked before script execution. No database was modified.',
      'DISPOSABLE_SUPABASE_DB_URL environment variable: missing',
      'Local .env* files containing DISPOSABLE_SUPABASE_DB_URL: none found',
      '## Second Attempt',
      'The active Codex shell was checked again before execution.',
      'The guarded runner was not executed on the second attempt',
      'Script executed: `No`',
      'Database modified: `No`',
      'Production touched: `No`',
      'Shared QA touched: `No`',
      'Approved reusable disposable project `kikqtorplsswepqitjys` touched: `No`',
      'The database password was not copied from conversation history',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps every RLS validation gate explicitly not run and blocks promotion', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    for (const expected of [
      'Forward candidate apply: `Not run`',
      'Forward policy-shape verification: `Not run`',
      'Rollback draft apply: `Not run`',
      'Rollback policy-shape verification: `Not run`',
      'Sanitized JSON evidence capture: `Not run`',
      'Manual allow/deny workflow QA: `Not run`',
      'Evidence template completion: `Not run`',
      'Decision: `Do Not Promote`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
