import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const resendSendMock = vi.hoisted(() => vi.fn())
const resendConstructorMock = vi.hoisted(() => vi.fn())
const authorizeStaffUserMock = vi.hoisted(() => vi.fn())
const getUserMock = vi.hoisted(() => vi.fn())
const createServerClientMock = vi.hoisted(() => vi.fn())
const createSupabaseServiceRoleClientMock = vi.hoisted(() => vi.fn())
const loadStaffScopedRequestDetailAccessMock = vi.hoisted(() => vi.fn())
const loadStoredRequestEmailRecipientMock = vi.hoisted(() => vi.fn())
const writeAuditEventMock = vi.hoisted(() => vi.fn())
const adminMock = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('server-only', () => ({}))

vi.mock('resend', () => ({
  Resend: resendConstructorMock,
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}))

vi.mock('@/lib/server/requireStaff', () => ({
  authorizeStaffUser: authorizeStaffUserMock,
}))

vi.mock('@/lib/server/requestDetailAccess', () => ({
  loadStaffScopedRequestDetailAccess: loadStaffScopedRequestDetailAccessMock,
}))

vi.mock('@/lib/server/requestEmailRecipient', () => ({
  loadStoredRequestEmailRecipient: loadStoredRequestEmailRecipientMock,
}))

vi.mock('@/lib/server/auditLog', () => ({
  writeAuditEvent: writeAuditEventMock,
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}))

import { POST } from '@/app/api/email/send/route'

const originalEnv = { ...process.env }
const routePath = join(process.cwd(), 'app', 'api', 'email', 'send', 'route.ts')

function emailRequest(body: Record<string, unknown>, origin = 'https://vinea.test') {
  return new NextRequest('https://vinea.test/api/email/send', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      origin,
      'sec-fetch-site': 'same-origin',
    },
  })
}

describe('staff email send route safe error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://safe-project.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'safe-anon-key'
    process.env.RESEND_API_KEY = 'sk-test_1234567890abcdef'
    process.env.RESEND_FROM_EMAIL = 'Vinea <hello@example.test>'
    resendConstructorMock.mockImplementation(() => ({
      emails: {
        send: resendSendMock,
      },
    }))
    createServerClientMock.mockImplementation(() => ({
      auth: {
        getUser: getUserMock,
      },
    }))
    getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'staff@example.test' } },
      error: null,
    })
    authorizeStaffUserMock.mockResolvedValue({
      ok: true,
      email: 'staff@example.test',
      role: 'admin',
      source: 'env',
    })
    createSupabaseServiceRoleClientMock.mockReturnValue(adminMock)
    loadStaffScopedRequestDetailAccessMock.mockResolvedValue({
      requestId: 'request-1',
      parishId: 'parish-a',
    })
    loadStoredRequestEmailRecipientMock.mockResolvedValue({
      email: 'stored-recipient@example.test',
    })
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('rejects cross-origin sends before authentication, request lookup, or provider access', async () => {
    const response = await POST(
      emailRequest(
        { requestId: 'request-1', subject: 'Follow-up', text: 'Please call.' },
        'https://attacker.test',
      ),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Invalid request.' })
    expect(getUserMock).not.toHaveBeenCalled()
    expect(loadStaffScopedRequestDetailAccessMock).not.toHaveBeenCalled()
    expect(resendConstructorMock).not.toHaveBeenCalled()
  })

  it('returns a generic staff-facing error and logs a redacted provider failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    resendSendMock.mockResolvedValue({
      data: null,
      error: new Error(
        'Provider rejected recipient@example.com with token sk-test_1234567890abcdef',
      ),
    })

    const response = await POST(
      emailRequest({
        requestId: 'request-1',
        subject: 'Follow-up',
        text: 'Subject: Follow-up\n\nPlease call the office.',
      }),
    )
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({
      ok: false,
      error: 'Email could not be sent. Please try again later.',
    })
    expect(JSON.stringify(payload)).not.toContain('recipient@example.com')
    expect(JSON.stringify(payload)).not.toContain('sk-test_1234567890abcdef')

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const logPayload = JSON.stringify(errorSpy.mock.calls[0])
    expect(logPayload).toContain('[email/send] resend send failed')
    expect(logPayload).toContain('[redacted email]')
    expect(logPayload).toContain('[redacted token]')
    expect(logPayload).not.toContain('recipient@example.com')
    expect(logPayload).not.toContain('sk-test_1234567890abcdef')
  })

  it('does not report or audit email success without a provider message id', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    resendSendMock.mockResolvedValue({ data: {}, error: null })

    const response = await POST(
      emailRequest({
        requestId: 'request-1',
        subject: 'Follow-up',
        text: 'Please call the office.',
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Email could not be sent. Please try again later.',
    })
    expect(writeAuditEventMock).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('logs unexpected failures safely and keeps the public response generic', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    resendSendMock.mockRejectedValue(
      new Error('Network failed for staff@example.test with token sk-test_1234567890abcdef'),
    )

    const response = await POST(
      emailRequest({
        requestId: 'request-1',
        subject: 'Follow-up',
        text: 'Please call the office.',
      }),
    )
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toEqual({ ok: false, error: 'Could not send email.' })
    expect(JSON.stringify(payload)).not.toContain('staff@example.test')
    expect(JSON.stringify(payload)).not.toContain('sk-test_1234567890abcdef')

    const logPayload = JSON.stringify(errorSpy.mock.calls[0])
    expect(logPayload).toContain('[email/send] unexpected failure')
    expect(logPayload).toContain('[redacted email]')
    expect(logPayload).toContain('[redacted token]')
    expect(logPayload).not.toContain('staff@example.test')
    expect(logPayload).not.toContain('sk-test_1234567890abcdef')
  })

  it('uses the shared safe logger instead of raw console/provider errors in source', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain("logServerError('[email/send] resend send failed'")
    expect(source).toContain("logServerError('[email/send] unexpected failure'")
    expect(source).not.toContain("console.error('EMAIL SEND ERROR:'")
    expect(source).not.toContain('return NextResponse.json({ ok: false, error: error.message }')
  })

  it('keeps staff authorization before bounded body parsing and provider delivery', () => {
    const source = readFileSync(routePath, 'utf8')
    const authIndex = source.indexOf('const staff = await authorizeStaffUser(user)')
    const bodyIndex = source.indexOf('const parsedBody = await readBoundedJsonBody')
    const accessIndex = source.indexOf('const access = await loadStaffScopedRequestDetailAccess')
    const recipientIndex = source.indexOf('const recipient = await loadStoredRequestEmailRecipient')
    const providerIndex = source.indexOf('const resend = new Resend(apiKey)')

    expect(source).toContain('const MAX_BODY_BYTES = 128 * 1024')
    expect(source).not.toContain('request.json()')
    expect(authIndex).toBeGreaterThan(-1)
    expect(bodyIndex).toBeGreaterThan(authIndex)
    expect(accessIndex).toBeGreaterThan(bodyIndex)
    expect(recipientIndex).toBeGreaterThan(accessIndex)
    expect(providerIndex).toBeGreaterThan(recipientIndex)
  })

  it('rejects oversized email content before provider construction or delivery', async () => {
    const response = await POST(
      emailRequest({
        requestId: 'request-1',
        subject: 'Follow-up',
        text: 'x'.repeat(129 * 1024),
      }),
    )

    expect(response.status).toBe(413)
    expect(await response.json()).toEqual({
      ok: false,
      error: 'Email content is too large.',
    })
    expect(resendConstructorMock).not.toHaveBeenCalled()
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON safely before provider construction or delivery', async () => {
    const response = await POST(
      new NextRequest('https://vinea.test/api/email/send', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: 'https://vinea.test',
          'sec-fetch-site': 'same-origin',
        },
        body: '{broken',
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ ok: false, error: 'Invalid request.' })
    expect(resendConstructorMock).not.toHaveBeenCalled()
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  it('does not parse an oversized body before rejecting an unauthenticated request', async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null })

    const response = await POST(
      emailRequest({
        requestId: 'request-1',
        subject: 'Follow-up',
        text: 'x'.repeat(129 * 1024),
      }),
    )

    expect(response.status).toBe(401)
    expect(resendConstructorMock).not.toHaveBeenCalled()
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  it('uses the stored same-parish recipient and ignores a forged browser recipient', async () => {
    resendSendMock.mockResolvedValue({ data: { id: 'email-1' }, error: null })

    const response = await POST(
      emailRequest({
        requestId: 'request-1',
        to: 'forged-recipient@example.test',
        subject: 'Follow-up',
        text: 'Please call the office.',
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, id: 'email-1' })
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenCalledWith(
      adminMock,
      'request-1',
      expect.objectContaining({
        activeParishId: null,
        allowPrimaryParishFallback: true,
      }),
    )
    expect(loadStoredRequestEmailRecipientMock).toHaveBeenCalledWith(adminMock, {
      requestId: 'request-1',
      parishId: 'parish-a',
    })
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'stored-recipient@example.test' }),
    )
    expect(JSON.stringify(resendSendMock.mock.calls)).not.toContain(
      'forged-recipient@example.test',
    )
    expect(writeAuditEventMock).toHaveBeenCalledWith({
      parishId: 'parish-a',
      actorEmail: 'staff@example.test',
      action: 'request.email.sent',
      targetType: 'request',
      targetId: 'request-1',
      metadata: {
        source: 'staff_email_send',
        recipientSource: 'stored_request_parishioner',
        subjectLength: 'Follow-up'.length,
        bodyLength: 'Please call the office.'.length,
      },
    })
    expect(JSON.stringify(writeAuditEventMock.mock.calls)).not.toContain(
      'stored-recipient@example.test',
    )
    expect(JSON.stringify(writeAuditEventMock.mock.calls)).not.toContain(
      'forged-recipient@example.test',
    )
  })

  it('uses the selected active parish and rejects forged or cross-parish request access generically', async () => {
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce(null)
    const request = emailRequest({
      requestId: 'request-b',
      subject: 'Follow-up',
      text: 'Please call the office.',
    })
    request.cookies.set('vinea_active_parish_id', 'parish-a')

    const response = await POST(request)

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ ok: false, error: 'Request not found.' })
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenCalledWith(
      adminMock,
      'request-b',
      expect.objectContaining({
        activeParishId: 'parish-a',
        allowPrimaryParishFallback: false,
      }),
    )
    expect(loadStoredRequestEmailRecipientMock).not.toHaveBeenCalled()
    expect(resendConstructorMock).not.toHaveBeenCalled()
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  it('requires requestId and a valid stored recipient before provider construction', async () => {
    const missingRequestResponse = await POST(
      emailRequest({ subject: 'Follow-up', text: 'Please call the office.' }),
    )

    expect(missingRequestResponse.status).toBe(400)
    expect(await missingRequestResponse.json()).toEqual({
      ok: false,
      error: 'Missing requestId, subject, or text',
    })
    expect(loadStaffScopedRequestDetailAccessMock).not.toHaveBeenCalled()

    loadStoredRequestEmailRecipientMock.mockResolvedValueOnce(null)
    const missingRecipientResponse = await POST(
      emailRequest({
        requestId: 'request-1',
        subject: 'Follow-up',
        text: 'Please call the office.',
      }),
    )

    expect(missingRecipientResponse.status).toBe(400)
    expect(await missingRecipientResponse.json()).toEqual({
      ok: false,
      error: 'Recipient email is unavailable.',
    })
    expect(resendConstructorMock).not.toHaveBeenCalled()
    expect(resendSendMock).not.toHaveBeenCalled()
  })

  it('documents the staff email send route hardening without claiming broader monitoring readiness', () => {
    const doc = readFileSync(
      join(process.cwd(), 'docs', 'EMAIL_SEND_SAFE_ERROR_LOGGING_20260706.md'),
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
      'EMAIL_SEND_SAFE_ERROR_LOGGING_IMPLEMENTED_20260706',
      'IMPLEMENTED - STAFF ROUTE ERROR REDACTION',
      'Does not enable production monitoring',
      'Other server routes still have raw `console.error` calls',
    ]) {
      expect(doc).toContain(expected)
    }

    expect(buildStatus).toContain('Email Send Safe Error Logging Implemented')
    expect(roadmap).toContain('Email Send Safe Error Logging')
    expect(sourceOfTruth).toContain('staff email send route with safe error logging')
  })
})
