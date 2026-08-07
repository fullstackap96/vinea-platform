import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', '_components', 'DashboardNotificationsCenter.tsx'),
  'utf8',
)

describe('Notifications Center client read deadline boundary', () => {
  it('owns one abortable finite read at a time', () => {
    expect(source).toContain('const NOTIFICATIONS_LOAD_TIMEOUT_MS = 15_000')
    expect(source).toContain('const loadAbortRef = useRef<AbortController | null>(null)')
    expect(source).toContain('loadAbortRef.current?.abort()')
    expect(source).toContain('const controller = new AbortController()')
    expect(source).toContain(
      'const timeoutId = window.setTimeout(\n      () => controller.abort(),\n      NOTIFICATIONS_LOAD_TIMEOUT_MS,\n    )',
    )
    expect(source).toContain('signal: controller.signal')
    expect(source).toContain('window.clearTimeout(timeoutId)')
  })

  it('keeps replacement and timeout settlement behind latest-load ownership', () => {
    const timeout = source.indexOf('const timeoutId = window.setTimeout(')
    const request = source.indexOf("fetch('/api/dashboard/notifications'", timeout)
    const catchBlock = source.indexOf('} catch {', request)
    const latestGuard = source.indexOf('if (!isLatestLoad()) return', catchBlock)
    const safeError = source.indexOf(
      "errorMessage: 'Could not load items needing attention.'",
      latestGuard,
    )

    expect(request).toBeGreaterThan(timeout)
    expect(catchBlock).toBeGreaterThan(request)
    expect(latestGuard).toBeGreaterThan(catchBlock)
    expect(safeError).toBeGreaterThan(latestGuard)
    expect(source).toContain('if (isLatestLoad()) setLoading(false)')
    expect(source).toContain('if (loadAbortRef.current === controller) loadAbortRef.current = null')
  })

  it('remains a read-only dashboard API surface', () => {
    expect(source).toContain("fetch('/api/dashboard/notifications'")
    expect(source).not.toMatch(/method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/)
    expect(source).not.toContain('createSignedUrl')
    expect(source).not.toContain('supabase.storage')
    expect(source).not.toContain('download')
  })
})
