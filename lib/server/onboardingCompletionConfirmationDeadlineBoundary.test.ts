import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ONBOARDING_COMPLETION_CONFIRMATION_TIMEOUT_MS,
  ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE,
} from '../onboardingClientConfirmation'

function read(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const page = read('app/dashboard/onboarding/page.tsx')
const client = read('app/dashboard/onboarding/ParishOnboardingPage.tsx')

function completionHandler(): string {
  const start = client.indexOf('async function markComplete()')
  const end = client.indexOf('function preventNavigationWhileSaving', start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return client.slice(start, end)
}

describe('Onboarding completion confirmation deadline boundary', () => {
  it('keys the client workspace to the server-selected active parish', () => {
    expect(page).toContain('loadActiveStaffParishSwitcherContext')
    expect(page).toContain("key={activeParishId ?? 'legacy-parish-context'}")
    expect(page).toContain('activeParishId={activeParishId}')
    expect(client).toContain(
      'export function ParishOnboardingPage({ activeParishId = null }',
    )
    expect(client).toContain('if (activeParishId && nextParish.id !== activeParishId)')
  })

  it('bounds the completion PATCH and preserves explicit rejection guidance', () => {
    const handler = completionHandler()

    expect(ONBOARDING_COMPLETION_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
    expect(handler).toContain(
      'signal: AbortSignal.timeout(ONBOARDING_COMPLETION_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(handler).toContain('if (!res.ok)')
    expect(handler).toContain('setError(onboardingSaveErrorMessage(data?.error))')
  })

  it('requires acknowledgement plus authoritative same-parish completed state before success', () => {
    const handler = completionHandler()
    const acknowledgement = handler.indexOf('if (!data?.ok)')
    const reload = handler.indexOf('const refreshedParish = await load()')
    const parishMatch = handler.indexOf('refreshedParish.id !== completionParishId')
    const completed = handler.indexOf('!refreshedParish.onboarding_completed_at')
    const success = handler.indexOf("setMessage('Parish onboarding marked complete.')")

    expect(acknowledgement).toBeGreaterThanOrEqual(0)
    expect(reload).toBeGreaterThan(acknowledgement)
    expect(parishMatch).toBeGreaterThan(reload)
    expect(completed).toBeGreaterThan(reload)
    expect(success).toBeGreaterThan(parishMatch)
    expect(success).toBeGreaterThan(completed)
  })

  it('freezes retry after ambiguity without automatic replay', () => {
    const handler = completionHandler()

    expect(ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE).toContain('Refresh this page')
    expect(handler).toContain('completionRequiresRefresh ||')
    expect(handler).toContain('setCompletionRequiresRefresh(true)')
    expect(handler).toContain('setError(ONBOARDING_COMPLETION_REFRESH_REQUIRED_MESSAGE)')
    expect(client).toContain("? 'Refresh required'")
    expect(handler).not.toContain('setTimeout(() => markComplete')
  })
})
