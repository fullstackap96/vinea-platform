import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

describe('dashboard segment error recovery boundary', () => {
  const boundary = read('app/dashboard/error.tsx')
  const recovery = read('app/_components/VineaErrorRecovery.tsx')
  const evidence = read('docs/DASHBOARD_SEGMENT_ERROR_RECOVERY_BOUNDARY_20260710.md')

  it('uses the Next.js 16 client retry contract inside the dashboard segment', () => {
    expect(boundary).toContain("'use client'")
    expect(boundary).toContain('scope="dashboard"')
    expect(boundary).toContain('unstable_retry={unstable_retry}')
    expect(recovery).toContain("isDashboard ? '/dashboard' : '/'")
    expect(recovery).toContain("isDashboard ? 'Daily Work Hub' : 'Return to Vinea home'")
  })

  it('does not consume or expose supplied error details', () => {
    for (const source of [boundary, recovery]) {
      expect(source).not.toContain('error.message')
      expect(source).not.toContain('error.digest')
      expect(source).not.toContain('console.error')
      expect(source).not.toContain('JSON.stringify(error)')
    }

    expect(boundary).not.toContain('{ error, unstable_retry }')
  })

  it('documents the hierarchy and locked production boundaries', () => {
    expect(evidence).toContain('DASHBOARD_SEGMENT_ERROR_RECOVERY_IMPLEMENTED_20260710')
    expect(evidence).toContain('existing dashboard layout remains outside this boundary')
    expect(evidence).toContain('Dashboard layout errors still fall through')
    expect(evidence).toContain('Production-sensitive features approved by this boundary: `NO`.')
    expect(evidence).toContain('Public trust claims approved by this boundary: `NO`.')
  })
})
