import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/reports/DashboardReportsPage.tsx'),
  'utf8',
)

describe('Reports client read deadline boundary', () => {
  it('owns one finite abortable selected-parish read', () => {
    expect(source).toContain('const REPORTS_READ_TIMEOUT_MS = 15_000')
    expect(source).toContain('let readTimeoutId: number | undefined')
    expect(source).toContain(
      'readTimeoutId = window.setTimeout(\n        () => controller.abort(),\n        REPORTS_READ_TIMEOUT_MS,\n      )',
    )
    expect(source).toContain('signal: controller.signal')
  })

  it('clears the deadline after settlement and selected-parish replacement', () => {
    expect(
      source.match(
        /if \(readTimeoutId !== undefined\) window\.clearTimeout\(readTimeoutId\)/g,
      ),
    ).toHaveLength(2)
    expect(source).toContain('controller.abort()')
    expect(source).toContain("'X-Vinea-Active-Parish-Id': activeParishId")
  })

  it('keeps replaced cancellation quiet and settles current timeout safely', () => {
    expect(source).toContain(
      "if (cancelled && error instanceof DOMException && error.name === 'AbortError') return",
    )
    expect(source).toContain('setSummary(EMPTY_REPORTS_SUMMARY)')
    expect(source).toContain('setFetchFailed(true)')
    expect(source).toContain('setLoadError(null)')
    expect(source).toContain('if (!cancelled) setLoading(false)')
  })

  it('remains a credentialed read-only dashboard report', () => {
    expect(source).toContain("fetch('/api/dashboard/reports-summary'")
    expect(source).toContain("method: 'GET'")
    expect(source).toContain("credentials: 'include'")
    expect(source).not.toMatch(/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
    expect(source).not.toContain('createSignedUrl')
    expect(source).not.toContain('supabase.storage')
  })
})
