import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const docPath = 'docs/GLOBAL_SEARCH_PARTIAL_RESULTS_WARNING_20260707.md'
const readmePath = 'README.md'

describe('Global Search partial results warning documentation', () => {
  it('documents the selected-parish partial-results warning boundary', () => {
    const doc = readFileSync(join(process.cwd(), docPath), 'utf8')

    expect(doc).toContain('# Global Search Partial Results Warning - 2026-07-07')
    expect(doc).toContain('selected-parish search')
    expect(doc).toContain('warningMessage')
    expect(doc).toContain(
      'Some search results may be missing. Please try again if you do not see what you expected.'
    )

    for (const boundary of [
      'alter selected active parish scope',
      'apply migrations',
      'change operational RLS',
      'enable production flags',
      'send communications',
      'call AI',
      'run exports',
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

    expect(readme).toContain('docs/GLOBAL_SEARCH_PARTIAL_RESULTS_WARNING_20260707.md')
    expect(readme).toContain('Global Search partial-results warning boundary')
  })
})
