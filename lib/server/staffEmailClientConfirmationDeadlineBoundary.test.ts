import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  STAFF_EMAIL_LOG_CONFIRMATION_TIMEOUT_MS,
  STAFF_EMAIL_SEND_CONFIRMATION_TIMEOUT_MS,
} from '../staffEmailClientConfirmation'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

function block(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker, start)
  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return source.slice(start, end)
}

const requestDetail = read('app/dashboard/requests/[id]/page.tsx')
const workHub = read('app/dashboard/DashboardPageCore.tsx')
const sendSection = read(
  'app/dashboard/requests/[id]/_components/SendEmailSection.tsx',
)

describe('staff email client confirmation deadline boundary', () => {
  it('keeps the browser deadline longer than the provider deadline', () => {
    expect(STAFF_EMAIL_SEND_CONFIRMATION_TIMEOUT_MS).toBe(20_000)
    expect(STAFF_EMAIL_LOG_CONFIRMATION_TIMEOUT_MS).toBe(60_000)
  })

  it('bounds Request Detail delivery and post-send logging', () => {
    const handler = block(
      requestDetail,
      'async function sendEmail()',
      'async function createGoogleCalendarEvent()',
    )

    expect(handler).toContain(
      'if (emailSendInFlightRef.current || workflowMutationRequiresRefresh) return',
    )
    expect(handler).toContain(
      'signal: AbortSignal.timeout(STAFF_EMAIL_SEND_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(handler).toContain(
      'signal: AbortSignal.timeout(STAFF_EMAIL_LOG_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(handler.match(/setWorkflowMutationRequiresRefresh\(true\)/g)).toHaveLength(2)
    expect(handler.indexOf('payload?.ok !== true')).toBeLessThan(
      handler.indexOf('STAFF_EMAIL_LOG_CONFIRMATION_TIMEOUT_MS'),
    )
  })

  it('bounds Daily Work Hub delivery and freezes after uncertain logging', () => {
    const handler = block(
      workHub,
      'async function sendFollowUpEmail',
      'async function markFollowUpAsContacted',
    )

    expect(handler).toContain(
      'signal: AbortSignal.timeout(STAFF_EMAIL_SEND_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(handler).toContain(
      'signal: AbortSignal.timeout(STAFF_EMAIL_LOG_CONFIRMATION_TIMEOUT_MS)',
    )
    expect(handler.match(/setWorkHubMutationRequiresRefresh\(true\)/g)).toHaveLength(2)
    expect(handler.indexOf('payload?.ok !== true')).toBeLessThan(
      handler.indexOf('STAFF_EMAIL_LOG_CONFIRMATION_TIMEOUT_MS'),
    )
  })

  it('freezes Request Detail email controls without mislabeling them as sending', () => {
    expect(requestDetail).toContain(
      'mutationDisabled={workflowMutationRequiresRefresh}',
    )
    expect(sendSection).toContain(
      'const controlsDisabled = sending || applying || mutationDisabled',
    )
    expect(sendSection).toContain('disabled={controlsDisabled}')
    expect(sendSection).toContain("{sending ? 'Sending...' : 'Send email'}")
  })

  it('does not replay delivery or logging automatically', () => {
    for (const source of [requestDetail, workHub]) {
      expect(source).not.toContain('while (true)')
    }
  })
})
