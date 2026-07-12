import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createSignedOAuthStateValue,
  googleOAuthStateCookieTestInternals,
  timingSafeStateEquals,
  verifySignedOAuthStateCookie,
  verifySignedOAuthStateCookieWithMetadata,
} from '@/lib/googleOAuthStateCookie'

const originalStateSecret = process.env.GOOGLE_OAUTH_STATE_SECRET
const originalClientSecret = process.env.GOOGLE_CLIENT_SECRET

describe('Google OAuth state cookie', () => {
  beforeEach(() => {
    process.env.GOOGLE_OAUTH_STATE_SECRET = 'test-google-oauth-state-secret'
    delete process.env.GOOGLE_CLIENT_SECRET
  })

  afterEach(() => {
    if (originalStateSecret === undefined) {
      delete process.env.GOOGLE_OAUTH_STATE_SECRET
    } else {
      process.env.GOOGLE_OAUTH_STATE_SECRET = originalStateSecret
    }

    if (originalClientSecret === undefined) {
      delete process.env.GOOGLE_CLIENT_SECRET
    } else {
      process.env.GOOGLE_CLIENT_SECRET = originalClientSecret
    }
  })

  it('signs and verifies selected parish metadata while preserving legacy state verification', () => {
    const { plainState, cookieValue } = createSignedOAuthStateValue({
      parishId: ' parish-123 ',
    })

    expect(verifySignedOAuthStateCookie(cookieValue)).toBe(plainState)
    expect(verifySignedOAuthStateCookieWithMetadata(cookieValue)).toEqual({
      state: plainState,
      metadata: { parishId: 'parish-123' },
    })
    expect(timingSafeStateEquals(plainState, plainState)).toBe(true)
  })

  it('keeps parish metadata optional for older cookies and rejects tampering', () => {
    const { plainState, cookieValue } = createSignedOAuthStateValue()

    expect(verifySignedOAuthStateCookieWithMetadata(cookieValue)).toEqual({
      state: plainState,
      metadata: { parishId: null },
    })
    expect(verifySignedOAuthStateCookieWithMetadata(`${cookieValue}tampered`)).toBeNull()
  })

  it('normalizes blank parish metadata to null', () => {
    expect(googleOAuthStateCookieTestInternals.normalizeParishId(' parish-a ')).toBe('parish-a')
    expect(googleOAuthStateCookieTestInternals.normalizeParishId('   ')).toBeNull()
    expect(googleOAuthStateCookieTestInternals.normalizeParishId(null)).toBeNull()
  })
})
