import { describe, expect, it, vi } from 'vitest'
import {
  logServerError,
  logServerWarning,
  redactSensitiveLogText,
  toSafeLogError,
} from './safeErrorLogging'

describe('safe error logging', () => {
  it('redacts common secret, token, URL, identifier, bearer, and email shapes', () => {
    const text = redactSensitiveLogText(
      [
        'postgresql://postgres:password@example.supabase.co:5432/postgres',
        'https://storage.example.test/private/request/path?signature=abc123',
        '123e4567-e89b-42d3-a456-426614174000',
        'sk-test_1234567890abcdef',
        'sbp_1234567890abcdef',
        'Bearer abc.def.ghi',
        'owner@example.com',
        'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.signature',
      ].join(' '),
    )

    expect(text).not.toContain('postgres:password')
    expect(text).not.toContain('storage.example.test')
    expect(text).not.toContain('123e4567-e89b-42d3-a456-426614174000')
    expect(text).not.toContain('sk-test_1234567890abcdef')
    expect(text).not.toContain('sbp_1234567890abcdef')
    expect(text).not.toContain('abc.def.ghi')
    expect(text).not.toContain('owner@example.com')
    expect(text).not.toContain('eyJhbGciOiJIUzI1NiJ9')
    expect(text).toContain('[redacted database url]')
    expect(text).toContain('[redacted url]')
    expect(text).toContain('[redacted id]')
    expect(text).toContain('[redacted token]')
    expect(text).toContain('Bearer [redacted token]')
    expect(text).toContain('[redacted email]')
    expect(text).toContain('[redacted jwt]')
  })

  it('redacts sensitive key-value payloads inside free-form error text', () => {
    const text = redactSensitiveLogText(
      [
        '/dashboard/requests?access_token=oauth-token&ok=true',
        'callback?returnTo=%2Fdashboard%3Ftoken%3Dfamily-token',
        'signedUrl=https://storage.example.test/private.pdf?X-Amz-Signature=abc123',
        'storagePath=request-documents/private/file.pdf',
        'originalFilename=baptism-certificate.pdf',
        'rawPrompt=private-prompt-text',
        'providerPayload=openai-response-body',
        '{"rawPrompt":"private prompt with spaces","token":"family portal token"}',
      ].join(' '),
    )

    for (const forbidden of [
      'access_token',
      'token%3D',
      'signedUrl',
      'storagePath',
      'originalFilename',
      'rawPrompt',
      'providerPayload',
      'oauth-token',
      'family-token',
      'abc123',
      'request-documents/private/file.pdf',
      'baptism-certificate.pdf',
      'private-prompt-text',
      'openai-response-body',
      'private prompt with spaces',
      'family portal token',
    ]) {
      expect(text).not.toContain(forbidden)
    }

    expect(text).toContain('[redacted key]=[redacted]')
    expect(text).toContain('[redacted key]%3D[redacted]')
    expect(text).toContain('"[redacted key]":"[redacted]"')
  })

  it('keeps error shape small instead of serializing arbitrary provider payloads', () => {
    const providerError = {
      message: 'raw provider body',
      html: '<p>private family details</p>',
      token: 'sk-test_1234567890abcdef',
    }

    expect(toSafeLogError(providerError)).toEqual({
      name: 'UnknownError',
      message: 'An unexpected error occurred.',
    })
  })

  it('logs only redacted error and label-safe extras', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logServerError(
      '[demo-request] resend send failed for owner@example.com',
      new Error('Send failed for owner@example.com using sk-test_1234567890abcdef'),
      {
        route: '/api/demo-request',
        requestEmail: 'safe staff fixture label',
        serviceRoleKey: 'service-role-label',
        signedUrl: 'not-a-url-but-still-sensitive-by-key',
      },
    )

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const payload = JSON.stringify(errorSpy.mock.calls[0])
    expect(payload).toContain('[demo-request] resend send failed')
    expect(payload).toContain('/api/demo-request')
    expect(payload).toContain('[redacted email]')
    expect(payload).toContain('[redacted token]')
    expect(payload).toContain('[redacted by key]')
    expect(payload).not.toContain('safe staff fixture label')
    expect(payload).not.toContain('service-role-label')
    expect(payload).not.toContain('not-a-url-but-still-sensitive-by-key')
    expect(payload).not.toContain('owner@example.com')
    expect(payload).not.toContain('sk-test_1234567890abcdef')

    errorSpy.mockRestore()
  })

  it('logs warnings through the same redaction path', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    logServerWarning('[request-notifications] app URL configuration missing', {
      route: '/api/request-notifications',
      configuredBy: 'owner@example.com',
      portalTokenLabel: 'safe-family-token-label',
      tokenPreview: 'sk-test_1234567890abcdef',
    })

    expect(warnSpy).toHaveBeenCalledTimes(1)
    const payload = JSON.stringify(warnSpy.mock.calls[0])
    expect(payload).toContain('[request-notifications] app URL configuration missing')
    expect(payload).toContain('/api/request-notifications')
    expect(payload).toContain('[redacted email]')
    expect(payload).toContain('[redacted by key]')
    expect(payload).not.toContain('safe-family-token-label')
    expect(payload).not.toContain('owner@example.com')
    expect(payload).not.toContain('sk-test_1234567890abcdef')

    warnSpy.mockRestore()
  })

  it('redacts sensitive extra values by key even when the value does not match a secret pattern', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logServerError('[documents] upload review failed', 'Unexpected upload issue', {
      documentContent: 'plain words that should still be hidden',
      originalFilename: 'safe-looking-name.pdf',
      storagePath: 'safe-looking/path',
      rawPayload: 'ordinary label',
      retryCount: 2,
      okToLog: true,
    })

    const payload = JSON.stringify(errorSpy.mock.calls[0])
    expect(payload).toContain('[redacted by key]')
    expect(payload).toContain('"retryCount":2')
    expect(payload).toContain('"okToLog":true')
    expect(payload).not.toContain('plain words that should still be hidden')
    expect(payload).not.toContain('safe-looking-name.pdf')
    expect(payload).not.toContain('safe-looking/path')
    expect(payload).not.toContain('ordinary label')

    errorSpy.mockRestore()
  })

  it('preserves boolean and numeric evidence flags even when their keys mention sensitive concepts', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logServerError('[audit] write failed', new Error('Insert failed for owner@example.com'), {
      hasActorEmail: true,
      tokenCount: 0,
      requestEmail: 'safe staff fixture label',
    })

    const payload = JSON.stringify(errorSpy.mock.calls[0])
    expect(payload).toContain('"hasActorEmail":true')
    expect(payload).toContain('"tokenCount":0')
    expect(payload).toContain('"requestEmail":"[redacted by key]"')
    expect(payload).not.toContain('safe staff fixture label')
    expect(payload).not.toContain('owner@example.com')

    errorSpy.mockRestore()
  })
})
