import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const evidencePaths = [
  join(
    process.cwd(),
    'docs',
    'DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_EVIDENCE_20260624_BLOCKED.md'
  ),
  join(
    process.cwd(),
    'docs',
    'DISPOSABLE_BASE_SCHEMA_BOOTSTRAP_EXECUTION_EVIDENCE_20260625_BLOCKED.md'
  ),
]

describe('disposable base schema bootstrap blocked execution evidence', () => {
  it('records that the runner was not executed without a real fresh disposable DB URL', () => {
    const evidence = evidencePaths.map((path) => readFileSync(path, 'utf8')).join('\n')

    for (const expected of [
      'Status: Blocked before script execution. No database was modified.',
      'Script executed: `No`',
      'Database modified: `No`',
      'Production touched: `No`',
      'Shared QA touched: `No`',
      'Prior/current disposable project `kikqtorplsswepqitjys` touched: `No`',
      '[PASTE FRESH DISPOSABLE_DB_URL]',
      'postgresql://postgres:[PASSWORD]@db.[FRESH_PROJECT_REF].supabase.co:5432/postgres',
      'postgresql://postgres:REAL_PASSWORD@db.REAL_FRESH_PROJECT_REF.supabase.co:5432/postgres',
      'postgresql://postgres:<redacted-password>@db.<actual fresh project ref>.supabase.co:5432/postgres',
      'postgresql://postgres:<actual database password>@db.kikqtorplsswepqitjys.supabase.co:5432/postgres',
      'postgresql://postgres:PASTE_THE_REAL_DATABASE_PASSWORD_HERE@db.kikqtorplsswepqitjys.supabase.co:5432/postgres',
      'Do not leave values such as `[PASSWORD]`, `[FRESH_PROJECT_REF]`, `REAL_PASSWORD`, `REAL_FRESH_PROJECT_REF`, `<actual fresh project ref>`, `<actual database password>`, or `PASTE_THE_REAL_DATABASE_PASSWORD_HERE` in the prompt.',
    ]) {
      expect(evidence).toContain(expected)
    }
  })

  it('keeps every downstream gate explicitly not run and blocks promotion', () => {
    const evidence = evidencePaths.map((path) => readFileSync(path, 'utf8')).join('\n')

    for (const expected of [
      'Base schema bootstrap candidate apply: `Not run`',
      'Repo migration replay: `Not run`',
      'Schema verification JSON capture: `Not run`',
      '/api/health` disposable app check: `Not run`',
      'Public intake regression: `Not run`',
      'Durable 429 regression: `Not run`',
      'Decision: `Do Not Promote`',
    ]) {
      expect(evidence).toContain(expected)
    }
  })
})
