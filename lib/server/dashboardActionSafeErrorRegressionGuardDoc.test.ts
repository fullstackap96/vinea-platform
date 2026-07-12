import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = join(process.cwd(), 'docs', 'DASHBOARD_ACTION_SAFE_ERROR_REGRESSION_GUARD_20260707.md')
const guardPath = join(process.cwd(), 'lib', 'server', 'dashboardActionSafeErrorRegressionGuard.test.ts')

describe('dashboard action safe-error regression guard doc', () => {
  it('documents the dashboard action regression boundary', () => {
    const doc = readFileSync(docPath, 'utf8')

    expect(doc).toContain('scans all `app/dashboard/**/actions.ts` files')
    expect(doc).toContain('raw database, provider, or exception `.message` text')
    expect(doc).toContain('Existing validation messages may remain plain and staff-friendly')
    expect(doc).toContain('does not change runtime action behavior')
    expect(doc).toContain('does not change runtime action behavior, access production')
  })

  it('keeps source-level regression coverage in place', () => {
    const source = readFileSync(guardPath, 'utf8')

    expect(source).toContain('dashboard action safe-error regression guard')
    expect(source).toContain("app', 'dashboard")
    expect(source).toContain('raw Error.message in failed action return')
    expect(source).toContain('messageFromError')
  })
})
