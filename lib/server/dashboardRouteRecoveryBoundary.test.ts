import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const dashboardErrorSource = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'error.tsx'),
  'utf8',
)
const appErrorSource = readFileSync(
  join(process.cwd(), 'app', 'error.tsx'),
  'utf8',
)
const dashboardLoadingSource = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'loading.tsx'),
  'utf8',
)

describe('application and dashboard route recovery boundaries', () => {
  it('keeps ordinary application page failures inside a generic recovery boundary', () => {
    expect(appErrorSource).toContain("'use client'")
    expect(appErrorSource).toContain('VineaErrorRecovery')
    expect(appErrorSource).toContain('scope="page"')
    expect(appErrorSource).toContain('unstable_retry={unstable_retry}')
    expect(appErrorSource).not.toContain('error.message')
    expect(appErrorSource).not.toContain('error.digest')
    expect(appErrorSource).not.toContain('console.')
  })

  it('uses the shared privacy-safe dashboard recovery surface', () => {
    expect(dashboardErrorSource).toContain("'use client'")
    expect(dashboardErrorSource).toContain('VineaErrorRecovery')
    expect(dashboardErrorSource).toContain('scope="dashboard"')
    expect(dashboardErrorSource).toContain('unstable_retry={unstable_retry}')
    expect(dashboardErrorSource).not.toContain('error.message')
    expect(dashboardErrorSource).not.toContain('error.digest')
    expect(dashboardErrorSource).not.toContain('console.')
  })

  it('provides an accessible, non-interactive workspace loading state', () => {
    expect(dashboardLoadingSource).toContain('aria-busy="true"')
    expect(dashboardLoadingSource).toContain('aria-label="Loading parish workspace"')
    expect(dashboardLoadingSource).toContain('role="status"')
    expect(dashboardLoadingSource).toContain('Loading the selected parish view.')
    expect(dashboardLoadingSource).not.toContain("'use client'")
    expect(dashboardLoadingSource).not.toContain('animate-')
    expect(dashboardLoadingSource).not.toContain('<button')
    expect(dashboardLoadingSource).not.toContain('<form')
  })
})
