import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(
    process.cwd(),
    'app/dashboard/admin/export-audit-reviewer/ExportAuditReviewerDashboardPrototype.tsx',
  ),
  'utf8',
)

function loadSource() {
  const start = source.indexOf('const load = useCallback(async () => {')
  const end = source.indexOf('  function selectFilter', start)

  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

function filterAndEffectSource() {
  const start = source.indexOf('  function selectFilter')
  const end = source.indexOf('  const rows = useMemo', start)

  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('Export Audit Reviewer dashboard client read deadline boundary', () => {
  it('gives the protected API read a finite abortable deadline', () => {
    const load = loadSource()

    expect(source).toContain('const EXPORT_AUDIT_REVIEWER_READ_TIMEOUT_MS = 15_000')
    expect(source).toContain('const loadAbortRef = useRef<AbortController | null>(null)')
    expect(load).toContain('const controller = new AbortController()')
    expect(load).toContain(
      '() => controller.abort(),\n      EXPORT_AUDIT_REVIEWER_READ_TIMEOUT_MS,',
    )
    expect(load).toContain('signal: controller.signal')
    expect(load).toContain('controller.signal.throwIfAborted()')
    expect(load).toContain('window.clearTimeout(timeoutId)')
  })

  it('aborts replacement, filter-change, and unmount work', () => {
    const load = loadSource()
    const filterAndEffect = filterAndEffectSource()

    expect(load).toContain('loadAbortRef.current?.abort()')
    expect(load).toContain('loadAbortRef.current = controller')
    expect(load).toContain(
      'if (loadAbortRef.current === controller) loadAbortRef.current = null',
    )
    expect(filterAndEffect.match(/loadSequenceRef\.current \+= 1/g)).toHaveLength(2)
    expect(filterAndEffect.match(/loadAbortRef\.current\?\.abort\(\)/g)).toHaveLength(2)
    expect(filterAndEffect.match(/loadAbortRef\.current = null/g)).toHaveLength(2)
  })

  it('preserves latest-response ownership and the generic staff-safe failure state', () => {
    const load = loadSource()

    expect(load).toContain('const loadSequence = ++loadSequenceRef.current')
    expect(load).toContain('const isLatestLoad = () => loadSequence === loadSequenceRef.current')
    expect(load.match(/if \(!isLatestLoad\(\)\) return/g)).toHaveLength(2)
    expect(load).toContain("setError('Export audit reviewer is unavailable for this staff session.')")
    expect(load).not.toContain('error.message')
  })

  it('keeps the bounded path API-only, credentialed, and read-only', () => {
    const load = loadSource()

    expect(load).toContain('fetch(`/api/export-audit-reviewer?${params.toString()}`')
    expect(load).toContain("credentials: 'include'")
    expect(load).toContain("cache: 'no-store'")
    expect(load).not.toMatch(/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
    expect(load).not.toContain('@supabase')
    expect(load).not.toContain('.from(')
    expect(load).not.toContain('createSignedUrl')
    expect(load).not.toContain('/api/exports/')
  })
})
