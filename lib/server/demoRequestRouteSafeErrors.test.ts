import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const resendSendMock = vi.hoisted(() => vi.fn())
const resendConstructorMock = vi.hoisted(() => vi.fn())
const durableRateLimitMock = vi.hoisted(() => vi.fn())
const supabaseAdminMock = vi.hoisted(() => ({ rpc: vi.fn() }))

vi.mock('server-only', () => ({}))

vi.mock('resend', () => ({
  Resend: resendConstructorMock,
}))

vi.mock('@/lib/server/durableRateLimit', () => ({
  checkDurableRateLimit: durableRateLimitMock,
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(() => supabaseAdminMock),
}))

import { POST } from '@/app/api/demo-request/route'

const originalEnv = { ...process.env }
const routePath = join(process.cwd(), 'app', 'api', 'demo-request', 'route.ts')

function demoRequest(body: Record<string, unknown>) {
  return new NextRequest('https://vinea.test/api/demo-request', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      origin: 'https://vinea.test',
      'sec-fetch-site': 'same-origin',
    },
  })
}

describe('demo request route safe error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resendConstructorMock.mockImplementation(() => ({
      emails: {
        send: resendSendMock,
      },
    }))
    durableRateLimitMock.mockResolvedValue({ ok: true })
    process.env = { ...originalEnv }
    process.env.DEMO_REQUEST_TO_EMAIL = 'sales@example.test'
    process.env.RESEND_API_KEY = 'sk-test_1234567890abcdef'
    process.env.RESEND_FROM_EMAIL = 'Vinea <hello@example.test>'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('returns a generic public error and logs a redacted provider failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    resendSendMock.mockResolvedValue({
      data: null,
      error: new Error(
        'Provider rejected owner@example.com with token sk-test_1234567890abcdef',
      ),
    })

    const response = await POST(
      demoRequest({
        name: 'Safe Contact',
        parishName: 'Safe Parish',
        email: 'owner@example.com',
        roleTitle: 'Parish secretary',
        message: 'Please contact me about Vinea.',
      }),
    )
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({
      ok: false,
      error:
        'Demo requests are temporarily unavailable. Please email us directly.',
    })
    expect(JSON.stringify(payload)).not.toContain('owner@example.com')
    expect(JSON.stringify(payload)).not.toContain('sk-test_1234567890abcdef')

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const logPayload = JSON.stringify(errorSpy.mock.calls[0])
    expect(logPayload).toContain('[demo-request] resend send failed')
    expect(logPayload).toContain('[redacted email]')
    expect(logPayload).toContain('[redacted token]')
    expect(logPayload).not.toContain('owner@example.com')
    expect(logPayload).not.toContain('sk-test_1234567890abcdef')
  })

  it('requires a provider message id before reporting demo delivery success', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    resendSendMock.mockResolvedValue({ data: null, error: null })

    const response = await POST(
      demoRequest({
        name: 'Safe Contact',
        parishName: 'Safe Parish',
        email: 'owner@example.com',
      }),
    )

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      ok: false,
      error:
        'Demo requests are temporarily unavailable. Please email us directly.',
    })
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(errorSpy.mock.calls)).toContain('missingProviderMessageId')
  })

  it('uses the safe logger instead of raw console error in source', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain(
      "import { logServerError, logServerWarning } from '@/lib/server/safeErrorLogging'",
    )
    expect(source).toContain("logServerWarning('[demo-request] configuration missing'")
    expect(source).toContain(
      "logServerWarning('[demo-request] email provider configuration missing'",
    )
    expect(source).toContain("logServerError('[demo-request] resend send failed'")
    expect(source).toContain("logServerError('[demo-request] rate limit check failed'")
    expect(source).toContain("logServerError('[demo-request] unexpected failure'")
    expect(source).not.toContain("console.error('[demo-request] ERROR:'")
    expect(source).not.toContain('console.warn(')
    expect(source).not.toContain('return NextResponse.json({ ok: false, error: error.message }')
    expect(source).toContain('readBoundedJsonBody(request, MAX_BODY_BYTES)')
    expect(source).not.toContain('request.json()')
  })

  it('returns 429 with Retry-After before email delivery when the durable limit is reached', async () => {
    durableRateLimitMock.mockResolvedValue({
      ok: false,
      retryAfterSeconds: 120,
    })

    const response = await POST(
      demoRequest({
        name: 'Safe Contact',
        parishName: 'Safe Parish',
        email: 'owner@example.com',
      }),
    )

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('120')
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Too many demo requests. Please try again later.',
    })
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  it('fails closed before email delivery when the durable limiter is unavailable', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    durableRateLimitMock.mockRejectedValue(
      new Error('database connection included owner@example.com'),
    )

    const response = await POST(
      demoRequest({
        name: 'Safe Contact',
        parishName: 'Safe Parish',
        email: 'owner@example.com',
      }),
    )

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({
      ok: false,
      error:
        'Demo requests are temporarily unavailable. Please email us directly.',
    })
    expect(resendSendMock).not.toHaveBeenCalled()
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('owner@example.com')
  })

  it('keeps durable abuse protection before request body parsing and provider calls', () => {
    const source = readFileSync(routePath, 'utf8')
    const rateLimitIndex = source.indexOf('const rateLimit = await checkDurableRateLimit')
    const bodyIndex = source.indexOf('const parsedBody = await readBoundedJsonBody')
    const sendIndex = source.indexOf('await resend.emails.send')

    expect(rateLimitIndex).toBeGreaterThan(-1)
    expect(bodyIndex).toBeGreaterThan(rateLimitIndex)
    expect(sendIndex).toBeGreaterThan(bodyIndex)
    expect(source).toContain(
      "key: durableRateLimitKeyFromRequest(request, 'demo-request')",
    )
  })

  it('rejects oversized JSON before validation or email delivery', async () => {
    const response = await POST(
      new NextRequest('https://vinea.test/api/demo-request', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://vinea.test',
          'sec-fetch-site': 'same-origin',
        },
        body: JSON.stringify({ message: 'x'.repeat(33 * 1024) }),
      }),
    )

    expect(response.status).toBe(413)
    expect(await response.json()).toEqual({ ok: false, error: 'Demo request is too large.' })
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  it('documents the public-route hardening without claiming broader monitoring readiness', () => {
    const doc = readFileSync(
      join(process.cwd(), 'docs', 'DEMO_REQUEST_SAFE_ERROR_LOGGING_20260706.md'),
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
      'DEMO_REQUEST_SAFE_ERROR_LOGGING_IMPLEMENTED_20260706',
      'IMPLEMENTED - PUBLIC ROUTE ERROR REDACTION',
      'does not enable production monitoring',
      'Other server routes still have raw `console.error` calls',
    ]) {
      expect(doc).toContain(expected)
    }

    expect(buildStatus).toContain('Demo Request Safe Error Logging Implemented')
    expect(roadmap).toContain('Demo Request Safe Error Logging')
    expect(sourceOfTruth).toContain('demo-request route with safe error logging')
  })
})
