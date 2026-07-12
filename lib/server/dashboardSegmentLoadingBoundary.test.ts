import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

describe('dashboard segment loading boundary', () => {
  const source = read('app/dashboard/loading.tsx')
  const evidence = read('docs/DASHBOARD_SEGMENT_LOADING_BOUNDARY_20260710.md')

  it('is a parameter-free accessible Server Component', () => {
    expect(source).not.toContain("'use client'")
    expect(source).toContain('export default function DashboardLoading()')
    expect(source).toContain('aria-busy="true"')
    expect(source).toContain('role="status"')
    expect(source).toContain('Loading the selected parish view')
  })

  it('stays static and free of data or runtime access', () => {
    for (const forbidden of [
      'fetch(',
      'supabase',
      'cookies(',
      'headers(',
      'useEffect',
      'useState',
      'usePathname',
      'animate-',
      'activeParish',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })

  it('documents layout timing and locked production boundaries', () => {
    expect(evidence).toContain('DASHBOARD_SEGMENT_LOADING_IMPLEMENTED_20260710')
    expect(evidence).toContain('app/dashboard/loading.tsx')
    expect(evidence).toContain("does not make the dashboard layout's own runtime parish lookup stream earlier")
    expect(evidence).toContain('Production-sensitive features approved by this boundary: `NO`.')
    expect(evidence).toContain('Public trust claims approved by this boundary: `NO`.')
  })
})
