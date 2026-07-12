import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const dashboard = read('app/dashboard/DashboardPageCore.tsx')

function loadRequestsBlock() {
  const start = dashboard.indexOf('async function loadRequests(silent = false)')
  const end = dashboard.indexOf('useEffect(() => {', start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return dashboard.slice(start, end)
}

describe('Daily Work Hub latest-response boundary', () => {
  it('assigns every refresh a monotonically increasing sequence', () => {
    const block = loadRequestsBlock()

    expect(dashboard).toContain('const requestsLoadSequenceRef = useRef(0)')
    expect(block).toContain('const loadSequence = ++requestsLoadSequenceRef.current')
    expect(block).toContain(
      'const isLatestLoad = () => loadSequence === requestsLoadSequenceRef.current',
    )
  })

  it('rejects stale successful responses before any response-owned state update', () => {
    const block = loadRequestsBlock()
    const parsedIndex = block.indexOf(
      'const parsedRequests = parseDashboardWorkHubRequests(payload?.requests)',
    )
    const latestGuardIndex = block.indexOf('if (!isLatestLoad()) return', parsedIndex)

    expect(parsedIndex).toBeGreaterThanOrEqual(0)
    expect(latestGuardIndex).toBeGreaterThan(parsedIndex)
    for (const marker of [
      'setRequestsFetchFailed(payload?.fetchFailed !== false)',
      'setDailyOperatingSignals(serverSignals)',
      'setRequests(parsedRequests)',
      'setSuggestedActions(serverSuggestedActions)',
    ]) {
      expect(block.indexOf(marker)).toBeGreaterThan(latestGuardIndex)
    }
  })

  it('rejects stale failures and prevents them from clearing a newer loading state', () => {
    const block = loadRequestsBlock()
    const catchIndex = block.indexOf('} catch (unexpected) {')
    const finallyIndex = block.indexOf('} finally {', catchIndex)

    expect(block.indexOf('if (!isLatestLoad()) return', catchIndex)).toBeLessThan(
      block.indexOf("logDashboardQueryError('dashboard work hub endpoint'", catchIndex),
    )
    expect(finallyIndex).toBeGreaterThan(catchIndex)
    expect(block.slice(finallyIndex)).toContain('if (isLatestLoad()) {')
    expect(block.slice(finallyIndex)).toContain('setSuggestedActionsLoading(false)')
    expect(block.slice(finallyIndex)).toContain('setLoading(false)')
    expect(block.slice(finallyIndex)).not.toContain('if (!silent) setLoading(false)')
  })

  it('preserves the single aggregate endpoint and active-parish hint', () => {
    const block = loadRequestsBlock()

    expect(block).toContain("fetch('/api/dashboard/work-hub'")
    expect(block).toContain("'X-Vinea-Active-Parish-Id': activeParishId")
    expect(block).toContain("cache: 'no-store'")
    expect(block).not.toContain('AbortController')
  })

  it('bounds the aggregate load and preserves confirmed data after silent refresh failure', () => {
    const block = loadRequestsBlock()
    const catchIndex = block.indexOf('} catch (unexpected) {')
    const catchBlock = block.slice(catchIndex, block.indexOf('} finally {', catchIndex))

    expect(dashboard).toContain('const DAILY_WORK_HUB_LOAD_TIMEOUT_MS = 15_000')
    expect(block).toContain('AbortSignal.timeout(DAILY_WORK_HUB_LOAD_TIMEOUT_MS)')
    expect(block).toContain('signal: timeoutSignal')
    expect(catchBlock).toContain('if (!timeoutSignal.aborted)')
    expect(catchBlock).toContain('The Daily Work Hub took too long to load. Try again.')
    expect(catchBlock).toContain('if (!silent) {')
    for (const destructiveUpdate of [
      'setRequestsFetchFailed(true)',
      'setRequests([])',
      'setSuggestedActions([])',
      'setDailyOperatingSignals(emptyDailyOperatingSystemSignals())',
    ]) {
      expect(catchBlock.indexOf(destructiveUpdate)).toBeGreaterThan(
        catchBlock.indexOf('if (!silent) {'),
      )
    }
  })

  it('documents the stale-response and safety boundary', () => {
    const doc = read('docs/DAILY_WORK_HUB_LATEST_RESPONSE_BOUNDARY_20260711.md')
    for (const phrase of [
      'DAILY_WORK_HUB_LATEST_RESPONSE_BOUNDARY_IMPLEMENTED_20260711',
      'last-request-wins',
      'stale response',
      'same-parish',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
