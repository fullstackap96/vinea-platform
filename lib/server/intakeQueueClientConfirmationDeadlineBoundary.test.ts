import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/intake/DashboardIntakePageClient.tsx'),
  'utf8',
)

function handler(startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('Intake Queue client confirmation deadline boundary', () => {
  it('bounds each quick-triage confirmation and passes cancellation to fetch', () => {
    expect(source).toContain('const INTAKE_TRIAGE_CONFIRMATION_TIMEOUT_MS = 60_000')
    expect(source).toContain('signal: AbortSignal')
    expect(source).toContain('signal,')

    for (const [start, end] of [
      ['async function saveRequestTriage', 'async function saveMassIntentionTriage'],
      ['async function saveMassIntentionTriage', '\n  return ('],
    ] as const) {
      const block = handler(start, end)
      expect(block).toContain('const controller = new AbortController()')
      expect(block).toContain('() => controller.abort()')
      expect(block).toContain('INTAKE_TRIAGE_CONFIRMATION_TIMEOUT_MS')
      expect(block).toContain('controller.signal')
      expect(block).toContain('window.clearTimeout(timeoutId)')
    }
  })

  it('cancels obsolete work on unmount without settling stale UI state', () => {
    expect(source).toContain('const mutationAbortRef = useRef<AbortController | null>(null)')
    expect(source).toContain('const mountedRef = useRef(true)')
    expect(source).toContain('mountedRef.current = false')
    expect(source).toContain('mutationAbortRef.current?.abort()')
    expect(source.match(/if \(!mountedRef\.current\) return/g)?.length).toBe(4)
  })

  it('freezes all triage controls after an unconfirmed result until refresh', () => {
    expect(source).toContain(
      "'Could not confirm whether quick triage saved. Refresh this page and review the item before trying again.'",
    )
    expect(source).toContain(
      'const mutationBusy = savingItemId !== null || mutationRequiresRefresh',
    )
    expect(source.match(/setMutationRequiresRefresh\(true\)/g)?.length).toBe(2)
    expect(source.match(/disabled=\{mutationBusy\}/g)?.length ?? 0).toBeGreaterThanOrEqual(6)
    expect(source).not.toContain('retryIntakeTriage')
  })

  it('preserves ordinary safe errors, success refresh, and authenticated API routes', () => {
    expect(source).toContain(
      "dashboardQueueClientErrorMessage('intakeRequestTriage', result.error)",
    )
    expect(source).toContain(
      "dashboardQueueClientErrorMessage('intakeMassIntentionTriage', result.error)",
    )
    expect(source.match(/router\.refresh\(\)/g)?.length).toBe(2)
    expect(source).toContain("credentials: 'include'")
    expect(source).toContain('/api/requests/${encodeURIComponent(item.sourceId)}/intake-triage')
    expect(source).toContain(
      '/api/mass-intentions/${encodeURIComponent(item.sourceId)}/intake-triage',
    )
  })
})
