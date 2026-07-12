import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = join(process.cwd(), 'docs', 'CORE_DASHBOARD_MUTATION_SAFE_ERRORS_20260707.md')
const testPath = join(process.cwd(), 'lib', 'server', 'coreDashboardMutationSafeErrors.test.ts')

describe('core dashboard mutation safe errors doc', () => {
  it('documents the scoped staff-safe mutation boundary', () => {
    const doc = readFileSync(docPath, 'utf8')

    expect(doc).toContain('People, Households, Household Members, and Mass Intentions')
    expect(doc).toContain('stable staff-safe messages instead of raw Supabase/database `.message` text')
    expect(doc).toContain('Existing active-parish write context for create actions is unchanged')
    expect(doc).toContain('This slice does not access production')
    expect(doc).toContain('does not access production, apply migrations, change operational RLS')
  })

  it('keeps source-level regression coverage in place', () => {
    const source = readFileSync(testPath, 'utf8')

    expect(source).toContain('core dashboard mutation safe errors')
    expect(source).toContain('logServerError')
    expect(source).toContain('not.toMatch')
    expect(source).toContain('error:\\s*error\\??\\.message')
  })
})
