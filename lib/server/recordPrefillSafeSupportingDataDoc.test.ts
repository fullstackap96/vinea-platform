import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = 'docs/RECORD_PREFILL_SAFE_SUPPORTING_DATA_20260707.md'
const readmePath = 'README.md'

describe('record prefill supporting-data safety documentation', () => {
  it('documents the fail-closed prefill safety boundary', () => {
    const doc = readFileSync(join(process.cwd(), docPath), 'utf8')

    expect(doc).toContain('# Record Prefill Supporting-Data Safety - 2026-07-07')
    expect(doc).toContain('Could not safely prepare this request for record prefill.')
    expect(doc).toContain('whether a sacramental record already exists for the request')
    expect(doc).toContain('request-to-record continuity')
    expect(doc).toContain('selected active parish cookie')
    expect(doc).toContain('loadStaffScopedRequestDetailAccess')
    expect(doc).toContain('The browser page no longer reads `requests`')

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
      'make canonical or sacramental eligibility decisions',
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

    expect(readme).toContain('docs/RECORD_PREFILL_SAFE_SUPPORTING_DATA_20260707.md')
    expect(readme).toContain('Record prefill supporting-data safety boundary')
  })
})
