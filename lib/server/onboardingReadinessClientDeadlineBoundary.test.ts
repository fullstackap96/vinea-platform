import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const card = read('app/dashboard/DashboardOnboardingCard.tsx')
const page = read('app/dashboard/onboarding/ParishOnboardingPage.tsx')

describe('onboarding readiness client deadline boundary', () => {
  it.each([
    ['dashboard card', card],
    ['onboarding page', page],
  ])('bounds the %s readiness load and clears its timer', (_label, source) => {
    expect(source).toContain('const ONBOARDING_READINESS_LOAD_TIMEOUT_MS = 15_000')
    expect(source).toContain('let loadTimedOut = false')
    expect(source).toContain('loadTimedOut = true')
    expect(source).toContain('controller.abort()')
    expect(source).toContain('}, ONBOARDING_READINESS_LOAD_TIMEOUT_MS)')
    expect(source).toContain('window.clearTimeout(timeoutId)')
  })

  it.each([
    ['dashboard card', card, 'setLoadFailed(true)'],
    ['onboarding page', page, 'setError(onboardingLoadErrorMessage(err))'],
  ])(
    'keeps superseded %s loads quiet but sends a genuine timeout to the safe failure state',
    (_label, source, failureState) => {
      const catchStart = source.indexOf('} catch (')
      const finallyStart = source.indexOf('} finally {', catchStart)
      const catchBlock = source.slice(catchStart, finallyStart)

      expect(catchBlock).toContain('if (!isLatestLoad()) return')
      expect(catchBlock).toContain("name === 'AbortError' && !loadTimedOut")
      expect(catchBlock).toContain(failureState)
      expect(catchBlock.indexOf('if (!isLatestLoad()) return')).toBeLessThan(
        catchBlock.indexOf(failureState),
      )
    },
  )

  it.each([
    ['dashboard card', card],
    ['onboarding page', page],
  ])('keeps both %s reads on the same scoped abort signal', (_label, source) => {
    expect(source.match(/signal: controller\.signal/g)).toHaveLength(2)
    expect(source).toContain("fetch('/api/parish/settings'")
    expect(source).toContain("fetch('/api/parish/staff-users'")
  })
})
