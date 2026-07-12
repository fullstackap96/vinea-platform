import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/reports/DashboardReportsPage.tsx'),
  'utf8',
)

describe('Reports abortable response boundary', () => {
  it('aborts the outgoing selected-parish report load', () => {
    expect(source).toContain('const controller = new AbortController()')
    expect(source).toContain('signal: controller.signal')
    expect(source).toContain('controller.abort()')
    expect(source).toContain("error instanceof DOMException && error.name === 'AbortError'")
    expect(source).toContain('if (cancelled) return')
  })

  it('requires the shared validated response before rendering metrics', () => {
    expect(source).toContain("from '@/lib/dashboard/parseReportsSummaryResponse'")
    expect(source).toContain('parseReportsSummaryResponse(')
    expect(source).toContain('if (!response.ok || !payload || !payload.ok)')
    expect(source).toContain('setSummary(EMPTY_REPORTS_SUMMARY)')
    expect(source).toContain("payload.warnings.join(' | ') || null")
  })

  it('preserves the selected-parish request header and soft-scope guidance', () => {
    expect(source).toContain("'X-Vinea-Active-Parish-Id': activeParishId")
    expect(source).toContain('payload?.ok === false')
    expect(source).toContain('payload.fetchFailed === false')
    expect(source).toContain('Reports are scoped to')
  })

  it('documents read-only analytics scope and unchanged production boundaries', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/REPORTS_ABORTABLE_RESPONSE_BOUNDARY_20260711.md'),
      'utf8',
    )
    for (const phrase of [
      'REPORTS_ABORTABLE_RESPONSE_IMPLEMENTED_20260711',
      'arithmetic invariants',
      'selected-parish',
      'No record mutation',
      'No production or shared-QA access',
      'No migration or operational RLS change',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
