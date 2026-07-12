import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const getTokenMock = vi.hoisted(() => vi.fn())
const requireStaffMock = vi.hoisted(() => vi.fn())
const resolveParishMock = vi.hoisted(() => vi.fn())
const createAdminMock = vi.hoisted(() => vi.fn())
const logServerErrorMock = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('googleapis', () => ({
  google: { auth: { OAuth2: vi.fn(() => ({ getToken: getTokenMock })) } },
}))
vi.mock('@/lib/appOrigin', () => ({ resolveAppOrigin: vi.fn(() => 'http://localhost') }))
vi.mock('@/lib/googleOAuthStateCookie', () => ({
  GCAL_OAUTH_STATE_COOKIE: 'gcal_state',
  timingSafeStateEquals: vi.fn(() => true),
  verifySignedOAuthStateCookieWithMetadata: vi.fn(() => ({
    state: 'safe-state',
    metadata: { parishId: 'parish-a' },
  })),
}))
vi.mock('@/lib/server/requireStaff', () => ({ requireStaffFromRequest: requireStaffMock }))
vi.mock('@/lib/server/activeStaffParishContext', () => ({
  resolveActiveStaffParishContext: resolveParishMock,
}))
vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: createAdminMock,
}))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: logServerErrorMock }))

import { GET } from '@/app/api/google/oauth/callback/route'

function callbackRequest() {
  return new NextRequest('http://localhost/api/google/oauth/callback?code=safe-code&state=safe-state', {
    headers: { Cookie: 'gcal_state=signed-value' },
  })
}

function adminFor(savedParishId: string | null) {
  const upsert = vi.fn(() => ({
    select: vi.fn(() => ({
      maybeSingle: vi.fn(async () => ({
        data: savedParishId ? { parish_id: savedParishId } : null,
        error: null,
      })),
    })),
  }))
  return { admin: { from: vi.fn(() => ({ upsert })) }, upsert }
}

describe('Google OAuth callback integration persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GOOGLE_CLIENT_ID', 'safe-client-label')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'safe-secret-label')
    getTokenMock.mockResolvedValue({ tokens: { refresh_token: 'synthetic-refresh-token' } })
    requireStaffMock.mockResolvedValue({ ok: true, supabase: {} })
    resolveParishMock.mockResolvedValue({
      ok: true,
      source: 'membership',
      activeParishId: 'parish-a',
    })
  })

  it('redirects to connected only after the selected parish integration is confirmed', async () => {
    const { admin, upsert } = adminFor('parish-a')
    createAdminMock.mockReturnValue(admin)

    const response = await GET(callbackRequest())

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/dashboard/settings?gcal=connected')
    expect(upsert).toHaveBeenCalledTimes(1)
    expect(logServerErrorMock).not.toHaveBeenCalled()
  })

  it.each([
    ['zero-row response', null],
    ['mismatched selected parish response', 'parish-b'],
  ])('fails closed after an accepted %s', async (_label, savedParishId) => {
    const { admin, upsert } = adminFor(savedParishId)
    createAdminMock.mockReturnValue(admin)

    const response = await GET(callbackRequest())

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/dashboard/settings?gcal=error')
    expect(upsert).toHaveBeenCalledTimes(1)
    expect(logServerErrorMock).toHaveBeenCalledWith(
      '[google-oauth-callback] integration-upsert failed',
      expect.any(Error),
      expect.objectContaining({
        route: '/api/google/oauth/callback',
        hasParishId: true,
      }),
    )
  })

  it('documents exact-parish persistence, synthetic verification, and locked production boundaries', () => {
    const doc = readFileSync(
      join(
        process.cwd(),
        'docs/GOOGLE_OAUTH_SELECTED_PARISH_PERSISTENCE_BOUNDARY_20260711.md',
      ),
      'utf8',
    )

    for (const phrase of [
      'selects only `parish_id`',
      'accepted zero-row responses',
      'mismatched parish responses',
      'synthetic tokens',
      'No production or shared-QA access',
      'No migration or operational RLS change',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
