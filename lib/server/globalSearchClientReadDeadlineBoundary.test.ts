import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/_components/DashboardGlobalSearch.tsx'),
  'utf8',
)

describe('Global Search client read deadline boundary', () => {
  it('keeps the debounce and network deadline as separate timers', () => {
    expect(source).toContain('const GLOBAL_SEARCH_READ_TIMEOUT_MS = 15_000')
    expect(source).toContain('let readTimeoutId: number | undefined')
    expect(source).toContain(
      'readTimeoutId = window.setTimeout(\n        () => controller.abort(),\n        GLOBAL_SEARCH_READ_TIMEOUT_MS,\n      )',
    )
    expect(source).toContain('}, 300)')
    expect(source).toContain('signal: controller.signal')
  })

  it('clears the read deadline after settlement and during replacement cleanup', () => {
    expect(
      source.match(
        /if \(readTimeoutId !== undefined\) window\.clearTimeout\(readTimeoutId\)/g,
      ),
    ).toHaveLength(2)
    expect(source).toContain('window.clearTimeout(timer)')
    expect(source).toContain('controller.abort()')
  })

  it('keeps superseded cancellation quiet but settles a current timeout safely', () => {
    expect(source).toContain(
      "if (cancelled && error instanceof DOMException && error.name === 'AbortError') return",
    )
    expect(source).toContain("setErrorMessage('Search is temporarily unavailable.')")
    expect(source).toContain("setWarningMessage('')")
    expect(source).toContain('setResults(EMPTY_RESULTS)')
    expect(source).toContain('setTotalCount(0)')
    expect(source).toContain('setLoading(false)')
  })

  it('remains a credentialed read-only dashboard search', () => {
    expect(source).toContain('fetch(`/api/dashboard/search?q=${encodeURIComponent(trimmed)}`')
    expect(source).toContain("credentials: 'include'")
    expect(source).not.toMatch(/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
    expect(source).not.toContain('createSignedUrl')
    expect(source).not.toContain('supabase.storage')
  })
})
