import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'app/dashboard/settings/ParishSettingsPage.tsx'),
  'utf8',
)

describe('Parish Settings latest-response boundary', () => {
  it('gives every settings read surface its own abortable generation', () => {
    for (const name of [
      'settingsLoadSequenceRef',
      'staffAccessLoadSequenceRef',
      'recentAuditLoadSequenceRef',
      'publicRoutingLoadSequenceRef',
    ]) {
      expect(source).toContain(`const ${name} = useRef(0)`)
      expect(source).toContain(`${name}.current`)
    }

    expect(source.match(/new AbortController\(\)/g)?.length).toBeGreaterThanOrEqual(4)
    expect(source.match(/signal: controller\.signal/g)?.length).toBeGreaterThanOrEqual(4)
    expect(source).toContain("error instanceof DOMException && error.name === 'AbortError'")
  })

  it('starts supporting selected-parish reads together and permits only current results to settle', () => {
    expect(source).toContain('const supportingLoads = Promise.all([')
    expect(source).toContain('loadStaffAccess(),')
    expect(source).toContain('loadRecentAuditEvents(),')
    expect(source).toContain('loadPublicIntakeRouting(),')
    expect(source.match(/const isLatestLoad = \(\) =>/g)?.length).toBeGreaterThanOrEqual(4)
    expect(source.match(/if \(!isLatestLoad\(\)\) return/g)?.length).toBeGreaterThanOrEqual(4)
    expect(source).toContain('if (isLatestLoad()) {')
  })

  it('invalidates every read on parish switch or unmount', () => {
    expect(source).toContain('settingsLoadAbortRef.current?.abort()')
    expect(source).toContain('staffAccessLoadAbortRef.current?.abort()')
    expect(source).toContain('recentAuditLoadAbortRef.current?.abort()')
    expect(source).toContain('publicRoutingLoadAbortRef.current?.abort()')
    expect(source).toContain('setLoadedParishName(\'\')')
  })

  it('prevents a stale routing read from overwriting a confirmed routing mutation', () => {
    const mutationStart = source.indexOf('function beginPublicRoutingMutation(): boolean')
    const mutationEnd = source.indexOf('function finishPublicRoutingMutation()', mutationStart)
    const mutationBoundary = source.slice(mutationStart, mutationEnd)

    expect(mutationBoundary).toContain('publicRoutingLoadSequenceRef.current += 1')
    expect(mutationBoundary).toContain('publicRoutingLoadAbortRef.current?.abort()')
    expect(mutationBoundary).toContain('publicRoutingMutationInFlightRef.current = true')
  })

  it('documents unchanged authorization and production boundaries', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs/PARISH_SETTINGS_LATEST_RESPONSE_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'PARISH_SETTINGS_LATEST_RESPONSE_IMPLEMENTED_20260711',
      'latest-generation-wins',
      'active parish',
      'No production or shared-QA access',
      'No migration or operational RLS change',
      'No communication or Google Calendar call',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
