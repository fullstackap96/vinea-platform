import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const route = read('app/api/request-notifications/route.ts')
const helper = read('lib/server/requestNotificationDelivery.ts')

describe('request notification provider deadline boundary', () => {
  it('keeps durable rate limiting and verified request ownership before provider options', () => {
    const limiter = route.indexOf('const rateLimit = await checkDurableRateLimit')
    const verification = route.indexOf(
      'const verification = await verifyRequestNotificationPayload',
    )
    const options = route.indexOf('createRequestNotificationProviderOptions({')
    const send = route.indexOf('providerResult = await resend.emails.send(')

    expect(limiter).toBeGreaterThanOrEqual(0)
    expect(verification).toBeGreaterThan(limiter)
    expect(options).toBeGreaterThan(verification)
    expect(send).toBeGreaterThan(options)
  })

  it('uses only verified parish/request scope for opaque idempotency', () => {
    expect(route).toContain('parishId: verification.parishId')
    expect(route).toContain('requestId,')
    expect(helper).toContain("update(`${input.parishId}\\0${input.requestId}`)")
    expect(helper).toContain('idempotencyKey: `vinea-request-notification-${digest}`')
    expect(helper).not.toContain('contactEmail')
    expect(helper).not.toContain('contactName')
  })

  it('settles timeout generically before provider-id success', () => {
    const send = route.indexOf('providerResult = await resend.emails.send(')
    const timeout = route.indexOf('providerOptions.signal.aborted', send)
    const providerId = route.indexOf('const providerMessageId', send)
    const success = route.indexOf(
      'return NextResponse.json({ ok: true, id: providerMessageId })',
      providerId,
    )

    expect(timeout).toBeGreaterThan(send)
    expect(providerId).toBeGreaterThan(send)
    expect(success).toBeGreaterThan(providerId)
    expect(route).toContain('{ status: 504 }')
    expect(route).not.toContain('uncertain: true')
  })

  it('documents saved-intake and no-send boundaries', () => {
    const doc = read('docs/REQUEST_NOTIFICATION_PROVIDER_DEADLINE_BOUNDARY_20260712.md')
    for (const phrase of [
      'REQUEST_NOTIFICATION_PROVIDER_DEADLINE_BOUNDARY_IMPLEMENTED_20260712',
      '12-second',
      'verified parish and request',
      'saved intake remains successful',
      'No real email was sent',
      'No production access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
