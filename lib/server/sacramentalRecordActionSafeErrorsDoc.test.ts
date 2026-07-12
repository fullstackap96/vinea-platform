import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = join(process.cwd(), 'docs', 'SACRAMENTAL_RECORD_ACTION_SAFE_ERRORS_20260707.md')
const testPath = join(process.cwd(), 'lib', 'server', 'sacramentalRecordActionSafeErrors.test.ts')

describe('sacramental record action safe errors doc', () => {
  it('documents the record-action safe-error boundary', () => {
    const doc = readFileSync(docPath, 'utf8')

    expect(doc).toContain('Sacramental Records dashboard Server Actions')
    expect(doc).toContain('stable staff-safe messages instead of raw Supabase/database `.message` text')
    expect(doc).toContain('Existing active-parish write context for record creation is unchanged')
    expect(doc).toContain('does not access production, apply migrations, change operational RLS')
    expect(doc).toContain('make canonical or sacramental eligibility decisions')
  })

  it('keeps source-level regression coverage in place', () => {
    const source = readFileSync(testPath, 'utf8')

    expect(source).toContain('sacramental record action safe errors')
    expect(source).toContain('logServerError')
    expect(source).toContain('Could not verify selected person.')
    expect(source).toContain("not.toContain('error: personErr.message')")
  })
})
