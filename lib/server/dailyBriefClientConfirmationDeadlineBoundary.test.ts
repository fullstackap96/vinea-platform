import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DAILY_BRIEF_CLIENT_CONFIRMATION_TIMEOUT_MS,
  DAILY_BRIEF_DELIVERY_UNCONFIRMED_MESSAGE,
} from '../dailyBriefClientConfirmation'

const source = readFileSync(
  join(process.cwd(), 'app', 'dashboard', 'settings', 'ParishSettingsPage.tsx'),
  'utf8',
)

function dailyBriefHandler(): string {
  const start = source.indexOf('async function sendDailyBriefNow()')
  const end = source.indexOf('async function savePublicIntakeRouting', start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

describe('Daily Brief client confirmation deadline boundary', () => {
  it('uses a finite browser deadline with inbox-first uncertainty guidance', () => {
    expect(DAILY_BRIEF_CLIENT_CONFIRMATION_TIMEOUT_MS).toBe(30_000)
    expect(DAILY_BRIEF_DELIVERY_UNCONFIRMED_MESSAGE).toContain('could not confirm')
    expect(DAILY_BRIEF_DELIVERY_UNCONFIRMED_MESSAGE).toContain('Check the parish inbox')
    expect(DAILY_BRIEF_DELIVERY_UNCONFIRMED_MESSAGE).toContain('reuse this delivery attempt')

    const handler = dailyBriefHandler()
    expect(handler).toContain(
      'signal: AbortSignal.timeout(DAILY_BRIEF_CLIENT_CONFIRMATION_TIMEOUT_MS)',
    )
  })

  it('keys the attempt to the selected parish and suppresses stale settlement', () => {
    const handler = dailyBriefHandler()
    const capture = handler.indexOf('const sendParishId = activeParishIdRef.current')
    const attempt = handler.indexOf(
      'dailyBriefDeliveryAttemptRef.current?.parishId !== sendParishId',
    )
    const fetch = handler.indexOf("fetch('/api/parish/daily-brief'")
    const staleCheck = handler.indexOf(
      'if (activeParishIdRef.current !== sendParishId) return',
      fetch,
    )

    expect(capture).toBeGreaterThanOrEqual(0)
    expect(attempt).toBeGreaterThan(capture)
    expect(fetch).toBeGreaterThan(attempt)
    expect(staleCheck).toBeGreaterThan(fetch)
    expect(handler).toContain('parishId: sendParishId')
  })

  it('reports success only after an explicit positive provider confirmation', () => {
    const handler = dailyBriefHandler()
    const responseFailure = handler.indexOf('if (!res.ok)')
    const providerId = handler.indexOf("const providerMessageId = String(data?.id ?? '').trim()")
    const malformedSuccess = handler.indexOf('if (!data?.ok || !providerMessageId)')
    const clearAttempt = handler.indexOf('dailyBriefDeliveryAttemptRef.current = null')
    const success = handler.indexOf('setDailyBriefMessage(`Daily brief sent to ${recipient}.`)')

    expect(responseFailure).toBeGreaterThanOrEqual(0)
    expect(providerId).toBeGreaterThan(responseFailure)
    expect(malformedSuccess).toBeGreaterThan(providerId)
    expect(clearAttempt).toBeGreaterThan(malformedSuccess)
    expect(success).toBeGreaterThan(clearAttempt)
    expect(handler).toContain('setDailyBriefMessage(DAILY_BRIEF_DELIVERY_UNCONFIRMED_MESSAGE)')
  })

  it('does not auto-retry an uncertain delivery', () => {
    const handler = dailyBriefHandler()

    expect(handler).not.toContain('setTimeout(() => sendDailyBriefNow')
    expect(handler).not.toContain('sendDailyBriefNow()\n')
  })
})
