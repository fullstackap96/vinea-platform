import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'admin', 'audit-log', 'AuditLogPage.tsx'),
  'utf8',
)

describe('Audit Log client read deadline boundary', () => {
  it('owns one abortable finite read at a time', () => {
    expect(source).toContain('const AUDIT_LOG_LOAD_TIMEOUT_MS = 15_000')
    expect(source).toContain('const loadAbortRef = useRef<AbortController | null>(null)')
    expect(source).toContain('loadAbortRef.current?.abort()')
    expect(source).toContain('const controller = new AbortController()')
    expect(source).toContain(
      'const timeoutId = window.setTimeout(() => controller.abort(), AUDIT_LOG_LOAD_TIMEOUT_MS)',
    )
    expect(source).toContain('signal: controller.signal')
    expect(source).toContain('window.clearTimeout(timeoutId)')
  })

  it('invalidates and cancels replaced or unmounted reads without changing the API', () => {
    const selectFilter = source.indexOf('function selectFilter(nextFilter: string)')
    const invalidate = source.indexOf('loadSequenceRef.current += 1', selectFilter)
    const abort = source.indexOf('loadAbortRef.current?.abort()', invalidate)
    const setFilter = source.indexOf('setFilter(nextFilter)', abort)

    expect(invalidate).toBeGreaterThan(selectFilter)
    expect(abort).toBeGreaterThan(invalidate)
    expect(setFilter).toBeGreaterThan(abort)
    expect(source).toContain("fetch(`/api/audit-events?${params.toString()}`")
    expect(source).toContain('if (!isLatestLoad()) return')
    expect(source).toContain('if (loadAbortRef.current === controller) loadAbortRef.current = null')
  })

  it('remains read-only and exposes no export or storage control', () => {
    expect(source).not.toMatch(/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
    expect(source).not.toContain('createSignedUrl')
    expect(source).not.toContain('download')
    expect(source).not.toContain('supabase.storage')
  })
})
