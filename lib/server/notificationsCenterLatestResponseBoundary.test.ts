import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/_components/DashboardNotificationsCenter.tsx'),
  'utf8',
)

describe('Notifications Center latest-response boundary', () => {
  it('aborts the older load and permits only the newest response to settle', () => {
    expect(source).toContain('const loadSequenceRef = useRef(0)')
    expect(source).toContain('const loadAbortRef = useRef<AbortController | null>(null)')
    expect(source).toContain('const loadSequence = ++loadSequenceRef.current')
    expect(source).toContain('loadAbortRef.current?.abort()')
    expect(source).toContain('signal: controller.signal')
    expect(source).toContain('const isLatestLoad = () => loadSequence === loadSequenceRef.current')
    expect(source.match(/if \(!isLatestLoad\(\)\) return/g)?.length).toBeGreaterThanOrEqual(2)
    expect(source).toContain('if (isLatestLoad()) setLoading(false)')
  })

  it('cancels owned work on selected-parish shell remount', () => {
    expect(source).toContain('loadSequenceRef.current += 1')
    expect(source).toContain('loadAbortRef.current?.abort()')
    expect(source).toContain('loadAbortRef.current = null')
    expect(source).toContain("error instanceof DOMException && error.name === 'AbortError'")
  })

  it('validates safe read-model fields and dashboard-internal hrefs before rendering', () => {
    expect(source).toContain('function parseNotificationsResponse')
    expect(source).toContain("import { safeDashboardHref } from '@/lib/safeDashboardHref'")
    expect(source).toContain('const href = safeDashboardHref')
    expect(source).toContain('!NOTIFICATION_GROUPS.has(String(item.group))')
    expect(source).toContain("errorMessage: 'Could not load items needing attention.'")
    expect(source).toContain('aria-busy={loading}')
  })

  it('documents read-only scope and unchanged production boundaries', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/NOTIFICATIONS_CENTER_LATEST_RESPONSE_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'NOTIFICATIONS_CENTER_LATEST_RESPONSE_IMPLEMENTED_20260711',
      'latest-request-wins',
      'dashboard-internal',
      'No notification or record mutation',
      'No production or shared-QA access',
      'No migration or operational RLS change',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
