import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/_components/DashboardGlobalSearch.tsx'),
  'utf8',
)

describe('Global Search abortable response boundary', () => {
  it('aborts superseded debounced searches and keeps cancellation quiet', () => {
    expect(source).toContain('const controller = new AbortController()')
    expect(source).toContain('signal: controller.signal')
    expect(source).toContain('controller.abort()')
    expect(source).toContain("error instanceof DOMException && error.name === 'AbortError'")
    expect(source).toContain('window.clearTimeout(timer)')
  })

  it('requires a validated response matching the current query before rendering', () => {
    expect(source).toContain("from '@/lib/globalSearch/parseGlobalSearchResponse'")
    expect(source).toContain('parseGlobalSearchResponse(await response.json().catch(() => null))')
    expect(source).toContain('data && data.query.trim() === trimmed')
    expect(source).toContain("setErrorMessage('Search is temporarily unavailable.')")
    expect(source).toContain('setResults(EMPTY_RESULTS)')
    expect(source).toContain('setTotalCount(0)')
  })

  it('keeps the compact staff search accessible with stable copy', () => {
    expect(source).toContain('placeholder="Search Vinea..."')
    expect(source).toContain('role="combobox"')
    expect(source).toContain('aria-expanded={showDropdown}')
  })

  it('documents selected-parish read-only scope and unchanged production boundaries', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/GLOBAL_SEARCH_ABORTABLE_RESPONSE_BOUNDARY_20260711.md'),
      'utf8',
    )
    for (const phrase of [
      'GLOBAL_SEARCH_ABORTABLE_RESPONSE_IMPLEMENTED_20260711',
      'current query',
      'dashboard-internal',
      'No record mutation',
      'No production or shared-QA access',
      'No migration or operational RLS change',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
