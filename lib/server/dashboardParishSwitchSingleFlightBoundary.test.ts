import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const shellPath = join(process.cwd(), 'app', 'dashboard', 'DashboardLayoutClient.tsx')

describe('dashboard parish switch single-flight boundary', () => {
  it('guards the Server Action synchronously and always releases the lock', () => {
    const source = readFileSync(shellPath, 'utf8')
    const handlerStart = source.indexOf('function handleParishChange(nextParishId: string)')
    const handlerEnd = source.indexOf('\n  return (', handlerStart)
    const handler = source.slice(handlerStart, handlerEnd)

    expect(handlerStart).toBeGreaterThan(-1)
    expect(source).toContain('const parishSwitchInFlightRef = useRef(false)')
    expect(handler).toContain('parishSwitchInFlightRef.current ||')
    expect(handler).toContain('parishSwitchInFlightRef.current = true')
    expect(handler).toContain('setPendingParishId(nextParishId)')
    expect(handler).toContain('await setActiveStaffParish(nextParishId)')
    expect(handler).toContain('finally {')
    expect(handler).toContain('parishSwitchInFlightRef.current = false')
  })

  it('keeps both responsive selectors visibly pending until confirmation', () => {
    const source = readFileSync(shellPath, 'utf8')

    expect(source.match(/aria-busy=\{parishContextPending\}/g)).toHaveLength(2)
    expect(source).toContain(
      'isSwitchingParish || isSigningOut || parishOptions.length === 1',
    )
    expect(source.match(/disabled=\{parishSwitchUnavailable\}/g)).toHaveLength(2)
    expect(source).toContain('const selectedParishId = pendingParishId ?? activeParishId')
    expect(source).toContain('Updating parish workspace')
  })

  it('documents unchanged membership, cookie, and rollback boundaries', () => {
    const evidence = readFileSync(
      join(process.cwd(), 'docs', 'DASHBOARD_PARISH_SWITCH_SINGLE_FLIGHT_BOUNDARY_20260711.md'),
      'utf8',
    )

    for (const phrase of [
      'Dashboard Parish Switch Single-Flight Boundary',
      'one active-parish Server Action',
      'membership validation',
      'HTTP-only cookie',
      'previously confirmed parish',
      'No production access',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
