import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const source = read('app/dashboard/requests/[id]/page.tsx')

function loadBoundary() {
  const start = source.indexOf('async function loadRequest()')
  const end = source.indexOf('async function toggleChecklistItem', start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('Request Detail latest full-load boundary', () => {
  it('aborts an older load before installing the next controller', () => {
    const block = loadBoundary()

    expect(source).toContain('const requestLoadAbortRef = useRef<AbortController | null>(null)')
    expect(block.indexOf('requestLoadAbortRef.current?.abort()')).toBeLessThan(
      block.indexOf('const controller = new AbortController()'),
    )
    expect(block).toContain('requestLoadAbortRef.current = controller')
    expect(block).toContain('await loadRequestCore(controller.signal)')
  })

  it('propagates cancellation through every full request-detail read', () => {
    const block = loadBoundary()

    expect(block).toContain('async function loadRequestCore(signal: AbortSignal)')
    for (const route of [
      '/detail-access`',
      '/workflow-support`',
      '/communications`',
      '/notes`',
      '/type-support`',
    ]) {
      const routeIndex = block.indexOf(route)
      expect(routeIndex).toBeGreaterThanOrEqual(0)
      expect(block.slice(routeIndex, routeIndex + 220)).toContain('signal')
    }
    const activityStart = source.indexOf('async function loadActivityEvents')
    const activityEnd = source.indexOf('async function loadRequest()', activityStart)
    const activityLoader = source.slice(activityStart, activityEnd)
    expect(activityLoader).toContain('/api/audit-events?')
    expect(activityLoader).toContain('signal,')
    expect(block).toContain('loadActivityEvents(String(requestData.id), signal)')
    expect(block).toContain('signal.throwIfAborted()')
  })

  it('keeps aborted or stale loads from reporting errors or settling newer loading state', () => {
    const block = loadBoundary()
    const staleGuard = block.indexOf('controller.signal.aborted ||')
    const visibleError = block.indexOf(
      "setErrorMessage(requestDetailClientFailureMessage('verifyAccess'))",
    )
    const currentGuard = block.indexOf('if (requestLoadAbortRef.current === controller)')

    expect(staleGuard).toBeGreaterThanOrEqual(0)
    expect(staleGuard).toBeLessThan(visibleError)
    expect(block).toContain('requestLoadAbortRef.current !== controller')
    expect(currentGuard).toBeGreaterThan(visibleError)
    expect(block.slice(currentGuard)).toContain('requestLoadAbortRef.current = null')
    expect(block.slice(currentGuard)).toContain('setLoading(false)')
  })

  it('does not convert aborts into partial-data fallbacks', () => {
    const block = loadBoundary()

    const activityStart = source.indexOf('async function loadActivityEvents')
    const activityEnd = source.indexOf('async function loadRequest()', activityStart)
    expect(source.slice(activityStart, activityEnd)).toContain(
      'if (signal?.aborted || isRequestLoadAbort(error)) throw error',
    )
    expect(block.match(/if \(signal\.aborted \|\| isRequestLoadAbort\(error\)\) throw error/g))
      .toHaveLength(4)
  })

  it('cancels the active full load during route cleanup', () => {
    const effectStart = source.indexOf(
      '// Intentionally only re-fetch when the route id changes',
    )
    const effectEnd = source.indexOf('}, [routeId])', effectStart)
    const effect = source.slice(effectStart, effectEnd)

    expect(effect).toContain('requestLoadAbortRef.current?.abort()')
  })

  it('documents the reliability and safety boundary', () => {
    const doc = read('docs/REQUEST_DETAIL_LATEST_LOAD_BOUNDARY_20260711.md')

    for (const phrase of [
      'REQUEST_DETAIL_LATEST_LOAD_BOUNDARY_IMPLEMENTED_20260711',
      'latest full load wins',
      'authorization remains first',
      'does not display a false error',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
