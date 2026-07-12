import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = 'docs/DASHBOARD_DETAIL_PARTIAL_DATA_WARNINGS_20260707.md'
const readmePath = 'README.md'

describe('dashboard detail partial-data warnings documentation', () => {
  it('documents the staff-safe partial-data warning boundary', () => {
    const doc = readFileSync(join(process.cwd(), docPath), 'utf8')

    expect(doc).toContain('# Dashboard Detail Partial-Data Warnings - 2026-07-07')
    expect(doc).toContain('Some linked person details may be missing.')
    expect(doc).toContain('Some linked household details may be missing.')
    expect(doc).toContain('Some linked record details may be missing.')
    expect(doc).toContain('certificate-event metadata actually loaded')

    for (const boundary of [
      'mutate records',
      'apply migrations',
      'change operational RLS',
      'access production',
      'send communications',
      'call AI',
      'run exports',
      'access storage',
      'create signed URLs',
      'generate certificates',
      'make public trust claims',
    ]) {
      expect(doc).toContain(boundary)
    }

    for (const forbidden of ['postgresql://', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']) {
      expect(doc).not.toContain(forbidden)
    }
  })

  it('links the evidence from the README production-readiness table', () => {
    const readme = readFileSync(join(process.cwd(), readmePath), 'utf8')

    expect(readme).toContain('docs/DASHBOARD_DETAIL_PARTIAL_DATA_WARNINGS_20260707.md')
    expect(readme).toContain('Dashboard detail partial-data warning boundary')
  })
})
