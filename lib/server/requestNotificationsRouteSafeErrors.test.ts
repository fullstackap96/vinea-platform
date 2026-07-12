import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const resendSendMock = vi.hoisted(() => vi.fn())
const resendConstructorMock = vi.hoisted(() => vi.fn())
const verifyRequestNotificationPayloadMock = vi.hoisted(() => vi.fn())
const createSupabaseServiceRoleClientMock = vi.hoisted(() => vi.fn())
const durableRateLimitMock = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))

vi.mock('resend', () => ({
  Resend: resendConstructorMock,
}))

vi.mock('@/lib/server/verifyRequestNotification', () => ({
  verifyRequestNotificationPayload: verifyRequestNotificationPayloadMock,
}))

vi.mock('@/lib/server/durableRateLimit', () => ({
  checkDurableRateLimit: durableRateLimitMock,
}))

vi.mock('@/lib/server/simpleRateLimit', () => ({
  durableRateLimitKeyFromRequest: vi
    .fn()
    .mockReturnValue('request-notifications:v1:opaque-fixture-key'),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}))

import { POST } from '@/app/api/request-notifications/route'

const originalEnv = { ...process.env }
const routePath = join(process.cwd(), 'app', 'api', 'request-notifications', 'route.ts')

function notificationRequest(body: Record<string, unknown>) {
  return new NextRequest('https://vinea.test/api/request-notifications', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      origin: 'https://vinea.test',
      'sec-fetch-site': 'same-origin',
      'x-forwarded-for': '203.0.113.44',
    },
  })
}

const validBody = {
  requestId: 'request-1',
  requestType: 'baptism',
  contactName: 'Safe Contact',
  contactEmail: 'contact@example.test',
  contactPhone: '555-0100',
}

describe('request notifications route safe error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    durableRateLimitMock.mockResolvedValue({ ok: true })
    process.env = { ...originalEnv }
    process.env.REQUEST_NOTIFICATION_TO_EMAIL = 'office@example.test'
    process.env.RESEND_API_KEY = 'sk-test_1234567890abcdef'
    process.env.RESEND_FROM_EMAIL = 'Vinea <hello@example.test>'
    process.env.NEXT_PUBLIC_APP_URL = 'https://vinea.test'
    resendConstructorMock.mockImplementation(() => ({
      emails: {
        send: resendSendMock,
      },
    }))
    verifyRequestNotificationPayloadMock.mockResolvedValue({ ok: true, parishId: 'parish-a' })
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns a generic public error and logs a redacted provider failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    resendSendMock.mockResolvedValue({
      data: null,
      error: new Error(
        'Provider rejected contact@example.test with token sk-test_1234567890abcdef',
      ),
    })

    const response = await POST(notificationRequest(validBody))
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({
      ok: false,
      error: 'Notification could not be sent. Please try again later.',
    })
    expect(JSON.stringify(payload)).not.toContain('contact@example.test')
    expect(JSON.stringify(payload)).not.toContain('sk-test_1234567890abcdef')

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const logPayload = JSON.stringify(errorSpy.mock.calls[0])
    expect(logPayload).toContain('[request-notifications] resend send failed')
    expect(logPayload).toContain('[redacted email]')
    expect(logPayload).toContain('[redacted token]')
    expect(logPayload).not.toContain('contact@example.test')
    expect(logPayload).not.toContain('sk-test_1234567890abcdef')
    errorSpy.mockRestore()
  })

  it('does not report notification success without a provider message id', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    resendSendMock.mockResolvedValue({ data: {}, error: null })

    const response = await POST(notificationRequest(validBody))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Notification could not be sent. Please try again later.',
    })
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('uses the shared safe logger instead of raw console/provider errors in source', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain(
      "import { logServerError, logServerWarning } from '@/lib/server/safeErrorLogging'",
    )
    expect(source).toContain(
      "logServerWarning('[request-notifications] notification inbox missing'",
    )
    expect(source).toContain(
      "logServerWarning('[request-notifications] email provider configuration missing'",
    )
    expect(source).toContain(
      "logServerWarning('[request-notifications] app URL configuration missing'",
    )
    expect(source).toContain("logServerError('[request-notifications] resend send failed'")
    expect(source).toContain(
      "logServerError('[request-notifications] rate limit check failed'",
    )
    expect(source).toContain("logServerError('[request-notifications] unexpected failure'")
    expect(source).toContain('readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(source).not.toContain('request.json()')
    expect(source).not.toContain("console.error('[request-notifications] ERROR:'")
    expect(source).not.toContain('console.warn(')
    expect(source).not.toContain('return NextResponse.json({ ok: false, error: error.message }')
  })

  it('returns 429 with Retry-After before verification or delivery when the durable limit is reached', async () => {
    durableRateLimitMock.mockResolvedValue({
      ok: false,
      retryAfterSeconds: 45,
    })

    const response = await POST(notificationRequest(validBody))

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('45')
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Too many requests. Please try again later.',
    })
    expect(verifyRequestNotificationPayloadMock).not.toHaveBeenCalled()
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  it('fails closed before verification or delivery when the durable limiter is unavailable', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    durableRateLimitMock.mockRejectedValue(
      new Error('database failure for contact@example.test'),
    )

    const response = await POST(notificationRequest(validBody))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Notification could not be sent. Please try again later.',
    })
    expect(verifyRequestNotificationPayloadMock).not.toHaveBeenCalled()
    expect(resendSendMock).not.toHaveBeenCalled()
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('contact@example.test')
  })

  it('keeps durable rate limiting before body parsing, payload verification, and email delivery', () => {
    const source = readFileSync(routePath, 'utf8')
    const rateLimitIndex = source.indexOf('const rateLimit = await checkDurableRateLimit')
    const bodyIndex = source.indexOf('const parsedBody = await readBoundedJsonBody')
    const verificationIndex = source.indexOf(
      'const verification = await verifyRequestNotificationPayload',
    )
    const sendIndex = source.indexOf('await resend.emails.send')

    expect(rateLimitIndex).toBeGreaterThan(-1)
    expect(bodyIndex).toBeGreaterThan(rateLimitIndex)
    expect(verificationIndex).toBeGreaterThan(bodyIndex)
    expect(sendIndex).toBeGreaterThan(verificationIndex)
  })

  it('rejects oversized JSON before request verification or email delivery', async () => {
    const response = await POST(
      new NextRequest('https://vinea.test/api/request-notifications', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://vinea.test',
          'sec-fetch-site': 'same-origin',
        },
        body: JSON.stringify({ ...validBody, notes: 'x'.repeat(33 * 1024) }),
      }),
    )

    expect(response.status).toBe(413)
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Notification request is too large.',
    })
    expect(verifyRequestNotificationPayloadMock).not.toHaveBeenCalled()
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  it('uses the verified request parish for the default notification email fallback', async () => {
    process.env.REQUEST_NOTIFICATION_TO_EMAIL = ''
    verifyRequestNotificationPayloadMock.mockResolvedValue({
      ok: true,
      parishId: 'parish-b',
    })
    resendSendMock.mockResolvedValue({ data: { id: 'email-1' }, error: null })

    const parishBuilder = {
      select: vi.fn(() => parishBuilder),
      eq: vi.fn(() => parishBuilder),
      maybeSingle: vi.fn(() =>
        Promise.resolve({
          data: { default_notification_email: 'parish-b-office@example.test' },
          error: null,
        }),
      ),
    }
    const admin = {
      from: vi.fn(() => parishBuilder),
    }
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin)

    const response = await POST(notificationRequest(validBody))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({ ok: true, id: 'email-1' })
    expect(admin.from).toHaveBeenCalledWith('parishes')
    expect(parishBuilder.eq).toHaveBeenCalledWith('id', 'parish-b')
    expect(parishBuilder.select).toHaveBeenCalledWith('default_notification_email')
    expect(parishBuilder).not.toHaveProperty('order')
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'parish-b-office@example.test',
      }),
    )
  })

  it('guards against first-parish notification fallback in source', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain(".eq('id', verification.parishId)")
    expect(source).not.toContain(".order('created_at', { ascending: true })")
    expect(source).not.toContain('.limit(1)')
  })

  it('documents the public notification route hardening without claiming broader monitoring readiness', () => {
    const doc = readFileSync(
      join(process.cwd(), 'docs', 'REQUEST_NOTIFICATIONS_SAFE_ERROR_LOGGING_20260706.md'),
      'utf8',
    )
    const buildStatus = readFileSync(
      join(process.cwd(), 'docs', 'VINEA_BUILD_STATUS.md'),
      'utf8',
    )
    const roadmap = readFileSync(join(process.cwd(), 'docs', 'VINEA_ROADMAP.md'), 'utf8')
    const sourceOfTruth = readFileSync(
      join(process.cwd(), 'docs', 'VINEA_SINGLE_SOURCE_OF_TRUTH.md'),
      'utf8',
    )

    for (const expected of [
      'REQUEST_NOTIFICATIONS_SAFE_ERROR_LOGGING_IMPLEMENTED_20260706',
      'IMPLEMENTED - PUBLIC NOTIFICATION ROUTE ERROR REDACTION',
      'Does not enable production monitoring',
      'Other server routes still have raw `console.error` calls',
    ]) {
      expect(doc).toContain(expected)
    }

    expect(buildStatus).toContain('Request Notifications Safe Error Logging Implemented')
    expect(roadmap).toContain('Request Notifications Safe Error Logging')
    expect(sourceOfTruth).toContain('request notification route with safe error logging')
  })
})
