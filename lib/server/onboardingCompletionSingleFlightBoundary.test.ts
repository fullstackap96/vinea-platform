import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const onboarding = read('app/dashboard/onboarding/ParishOnboardingPage.tsx')

describe('onboarding completion single-flight boundary', () => {
  it('locks synchronously before the selected-parish Settings PATCH', () => {
    const start = onboarding.indexOf('async function markComplete()')
    const end = onboarding.indexOf('function preventNavigationWhileSaving', start)
    const handler = onboarding.slice(start, end)

    expect(start).toBeGreaterThanOrEqual(0)
    expect(end).toBeGreaterThan(start)
    expect(onboarding).toContain('const completionInFlightRef = useRef(false)')
    expect(handler).toContain('if (completionInFlightRef.current ||')
    expect(handler.indexOf('completionInFlightRef.current = true')).toBeLessThan(
      handler.indexOf("fetch('/api/parish/settings'"),
    )
    expect(handler.indexOf('finally {')).toBeLessThan(
      handler.indexOf('completionInFlightRef.current = false'),
    )
  })

  it('preserves readiness prerequisites before completion', () => {
    const handlerStart = onboarding.indexOf('async function markComplete()')
    const handler = onboarding.slice(
      handlerStart,
      onboarding.indexOf('function preventNavigationWhileSaving', handlerStart),
    )
    expect(handler).toContain('!parish || !readiness.readyToComplete')
    expect(onboarding).toContain(
      'disabled={!readiness.readyToComplete || readiness.onboardingComplete || saving}',
    )
  })

  it('holds same-screen navigation while the completion result settles', () => {
    expect(onboarding).toContain('aria-busy={saving}')
    expect(onboarding).toContain('function preventNavigationWhileSaving')
    expect(onboarding).toContain('if (saving) event.preventDefault()')
    expect(onboarding.match(/aria-disabled=\{saving\}/g)).toHaveLength(2)
    expect(onboarding.match(/onClick=\{preventNavigationWhileSaving\}/g)).toHaveLength(2)
    expect(onboarding.match(/tabIndex=\{saving \? -1 : undefined\}/g)).toHaveLength(2)
  })

  it('preserves selected-parish payload and safe result guidance', () => {
    expect(onboarding).toContain('onboarding_complete: true')
    expect(onboarding).toContain("setMessage('Parish onboarding marked complete.')")
    expect(onboarding).toContain('onboardingSaveErrorMessage(data?.error)')
    expect(onboarding).toContain('onboardingSaveErrorMessage(err)')
  })

  it('documents immediate exclusion without changing go-live claims', () => {
    const evidence = read('docs/ONBOARDING_COMPLETION_SINGLE_FLIGHT_BOUNDARY_20260711.md')
    for (const phrase of [
      'Onboarding Completion Single-Flight Boundary',
      'selected-parish',
      'readiness prerequisites',
      'supervised pilot',
      'not durable server idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
