import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = join(process.cwd(), 'docs', 'REQUEST_ACTION_SAFE_ERRORS_20260707.md')
const testPath = join(process.cwd(), 'lib', 'server', 'requestActionSafeErrors.test.ts')

describe('request action safe errors doc', () => {
  it('documents the request-action safe-error boundary', () => {
    const doc = readFileSync(docPath, 'utf8')

    expect(doc).toContain('Request dashboard Server Actions')
    expect(doc).toContain('stable staff-safe messages instead of raw Supabase/database `.message` text')
    expect(doc).toContain('Existing workflow-completion requirements remain unchanged')
    expect(doc).toContain('Existing audit event writes remain unchanged')
    expect(doc).toContain('does not access production, apply migrations, change operational RLS')
  })

  it('keeps source-level regression coverage in place', () => {
    const source = readFileSync(testPath, 'utf8')

    expect(source).toContain('request action safe errors')
    expect(source).toContain('Could not update request status.')
    expect(source).toContain('not.toMatch')
    expect(source).toContain('insertErr.message')
  })
})
