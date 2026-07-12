import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const route = read('app/api/email/send/route.ts')
const requestDetail = read('app/dashboard/requests/[id]/page.tsx')
const workHub = read('app/dashboard/DashboardPageCore.tsx')
const providerHelper = read('lib/server/staffEmailDelivery.ts')

describe('staff email provider deadline boundary', () => {
  it('requires a valid delivery attempt before request scope or provider access', () => {
    const validation = route.indexOf('isValidStaffEmailDeliveryAttemptId(deliveryAttemptId)')
    const requestAccess = route.indexOf(
      'const access = await loadStaffScopedRequestDetailAccess',
    )
    const provider = route.indexOf('const resend = new Resend(apiKey)')

    expect(route).toContain("const deliveryAttemptId = String(body?.deliveryAttemptId")
    expect(validation).toBeGreaterThanOrEqual(0)
    expect(requestAccess).toBeGreaterThan(validation)
    expect(provider).toBeGreaterThan(requestAccess)
  })

  it('installs the opaque idempotency and timeout boundary before delivery and audit', () => {
    const options = route.indexOf('createStaffEmailProviderRequestOptions({')
    const send = route.indexOf('providerResult = await resend.emails.send(')
    const timeout = route.indexOf('providerRequestOptions.signal.aborted')
    const audit = route.indexOf('await writeAuditEvent({')

    expect(options).toBeGreaterThanOrEqual(0)
    expect(send).toBeGreaterThan(options)
    expect(timeout).toBeGreaterThan(send)
    expect(audit).toBeGreaterThan(timeout)
    expect(providerHelper).toContain('idempotencyKey: `vinea-request-email-${digest}`')
    expect(providerHelper).toContain('AbortSignal.timeout')
    expect(route).toContain('uncertain: true')
    expect(route).toContain('Check with the recipient before trying again.')
  })

  it('reuses an attempt only for exact Request Detail content and preserves uncertainty', () => {
    const start = requestDetail.indexOf('async function sendEmail()')
    const end = requestDetail.indexOf('async function createGoogleCalendarEvent', start)
    const block = requestDetail.slice(start, end)

    expect(block).toContain('existingDeliveryAttempt?.requestId === routeId')
    expect(block).toContain('existingDeliveryAttempt.subject === subject')
    expect(block).toContain('existingDeliveryAttempt.text === text')
    expect(block).toContain('crypto.randomUUID()')
    expect(block).toContain('deliveryAttemptId: deliveryAttempt.id')
    expect(block).toContain("requestDetailClientFailureMessage('confirmEmailSend')")
    expect(block).toContain('payload?.uncertain === true')
    expect(block).toContain('emailDeliveryAttemptRef.current = null')
  })

  it('reuses an attempt only for exact Work Hub content and preserves uncertainty', () => {
    const start = workHub.indexOf('async function sendFollowUpEmail')
    const end = workHub.indexOf('async function markFollowUpAsContacted', start)
    const block = workHub.slice(start, end)

    expect(block).toContain('existingAttempt?.subject === subject')
    expect(block).toContain('existingAttempt.text === text')
    expect(block).toContain('crypto.randomUUID()')
    expect(block).toContain('deliveryAttemptId: deliveryAttempt.id')
    expect(block).toContain("dashboardClientFailureMessage('confirmFollowUpEmailSend')")
    expect(block).toContain('payload?.uncertain === true')
    expect(block).toContain('followUpEmailAttemptRef.current.delete(id)')
  })

  it('documents the no-send verification and production boundary', () => {
    const doc = read('docs/STAFF_EMAIL_PROVIDER_DEADLINE_BOUNDARY_20260712.md')
    for (const phrase of [
      'STAFF_EMAIL_PROVIDER_DEADLINE_BOUNDARY_IMPLEMENTED_20260712',
      '12-second',
      'idempotency',
      'exact same staff-reviewed content',
      'delivery could not be confirmed',
      'No real email was sent',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
