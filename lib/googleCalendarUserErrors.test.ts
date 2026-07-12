import { describe, expect, it } from 'vitest'

import {
  googleCalendarConflictUserMessage,
  googleCalendarNotConnectedUserMessage,
  googleCalendarOAuthReconnectUserMessage,
  isGoogleOAuthReconnectError,
  serializeGoogleCalendarErrorForLogs,
  userFacingGoogleCalendarErrorMessage,
} from './googleCalendarUserErrors'

describe('googleCalendarUserErrors', () => {
  it('keeps OAuth reconnect detection while returning curated staff guidance', () => {
    const error = {
      message: 'invalid_grant: refresh token expired for owner@example.com',
      response: {
        data: {
          error: 'invalid_grant',
          error_description: 'Token has been expired or revoked.',
        },
      },
    }

    expect(isGoogleOAuthReconnectError(error)).toBe(true)
    expect(userFacingGoogleCalendarErrorMessage(error)).toBe(
      googleCalendarOAuthReconnectUserMessage(),
    )
  })

  it('does not echo unknown provider or exception text to staff-facing copy', () => {
    const generic = userFacingGoogleCalendarErrorMessage(
      new Error(
        'Provider failure for owner@example.com with sk-test_1234567890abcdef and postgresql://postgres:password@example.supabase.co:5432/postgres',
      ),
    )

    expect(generic).toBe(
      'Something went wrong with Google Calendar. If it keeps happening, go to Dashboard > Settings and try reconnecting Google Calendar.',
    )
    expect(generic).not.toContain('owner@example.com')
    expect(generic).not.toContain('sk-test_1234567890abcdef')
    expect(generic).not.toContain('postgres:password')
  })

  it('preserves explicitly curated safe staff messages', () => {
    expect(userFacingGoogleCalendarErrorMessage(googleCalendarNotConnectedUserMessage())).toBe(
      googleCalendarNotConnectedUserMessage(),
    )
    expect(userFacingGoogleCalendarErrorMessage(googleCalendarConflictUserMessage())).toBe(
      googleCalendarConflictUserMessage(),
    )
    expect(userFacingGoogleCalendarErrorMessage('Request not found')).toBe('Request not found')
  })

  it('serializes provider errors with recursive value and key redaction', () => {
    const serialized = serializeGoogleCalendarErrorForLogs({
      message:
        'Calendar provider failed for owner@example.com with postgresql://postgres:password@example.supabase.co:5432/postgres',
      code: 'calendar_error',
      response: {
        status: 401,
        data: {
          error: 'invalid_client',
          error_description: 'client secret sk-test_1234567890abcdef for owner@example.com',
          access_token: 'plain-looking-access-token-label',
          nested: {
            refreshToken: 'plain-looking-refresh-token-label',
            signedUrl: 'https://example.test/private-document',
          },
        },
      },
      cause: {
        email: 'owner@example.com',
        harmlessCount: 2,
      },
    })

    expect(serialized).toContain('[redacted email]')
    expect(serialized).toContain('[redacted database url]')
    expect(serialized).toContain('[redacted token]')
    expect(serialized).toContain('[redacted by key]')
    expect(serialized).toContain('"harmlessCount":2')
    expect(serialized).not.toContain('owner@example.com')
    expect(serialized).not.toContain('postgres:password')
    expect(serialized).not.toContain('sk-test_1234567890abcdef')
    expect(serialized).not.toContain('plain-looking-access-token-label')
    expect(serialized).not.toContain('plain-looking-refresh-token-label')
    expect(serialized).not.toContain('https://example.test/private-document')
  })
})
