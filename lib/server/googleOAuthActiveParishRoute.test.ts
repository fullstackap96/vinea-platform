import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const startRoutePath = join(process.cwd(), 'app', 'api', 'google', 'oauth', 'start', 'route.ts')
const callbackRoutePath = join(process.cwd(), 'app', 'api', 'google', 'oauth', 'callback', 'route.ts')
const parishSettingsRoutePath = join(process.cwd(), 'app', 'api', 'parish', 'settings', 'route.ts')
const evidencePath = join(process.cwd(), 'docs', 'GOOGLE_OAUTH_SAFE_ERROR_LOGGING_20260706.md')

function expectBefore(source: string, earlier: string, later: string) {
  const earlierIndex = source.indexOf(earlier)
  const laterIndex = source.indexOf(later)

  expect(earlierIndex, `Expected to find ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Expected to find ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

describe('Google OAuth active parish route wiring', () => {
  it('keeps OAuth start staff-authorized and signs the selected parish into OAuth state', () => {
    const source = readFileSync(startRoutePath, 'utf8')

    expect(source).toContain('requireStaffFromRequest')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('resolveGoogleOAuthStartParishContext')
    expect(source).toContain('activeParishCookie(request)')
    expect(source).toContain('parishContext.activeParishId')
    expect(source).toContain('createSignedOAuthStateValue({')
    expect(source).toContain('parishId: parishContext.activeParishId')
    expect(source).toContain('Active parish cookie requires membership-backed parish authorization.')
    expect(source).not.toContain('createSupabaseRouteHandlerClient')

    expectBefore(source, 'const staff = await requireStaffFromRequest(request)', 'const clientId = process.env.GOOGLE_CLIENT_ID')
    expectBefore(source, 'const parishContext = await resolveGoogleOAuthStartParishContext', 'createSignedOAuthStateValue({')
    expectBefore(source, 'createSignedOAuthStateValue({', 'const authUrl = `https://accounts.google.com')
    expectBefore(source, 'redirect.cookies.set(GCAL_OAUTH_STATE_COOKIE', 'return redirect')
  })

  it('keeps OAuth callback bound to signed parish metadata and avoids oldest-parish lookup', () => {
    const source = readFileSync(callbackRoutePath, 'utf8')

    expect(source).toContain('requireStaffFromRequest')
    expect(source).toContain('verifySignedOAuthStateCookieWithMetadata')
    expect(source).toContain('timingSafeStateEquals(expectedState.state, stateParam)')
    expect(source).toContain('expectedState.metadata.parishId')
    expect(source).toContain('resolveGoogleOAuthCallbackParishContext')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('const parishId = parishContext.activeParishId')
    expect(source).toContain('parish_id: parishId')
    expect(source).toContain(".select('parish_id')")
    expect(source).toContain('.maybeSingle()')
    expect(source).toContain('savedIntegration?.parish_id !== parishId')
    expect(source).toContain('Google OAuth callback requires membership-backed parish authorization.')
    expect(source).not.toContain("order('created_at'")
    expect(source).not.toContain(".from('parishes')")
    expect(source).not.toContain('createSupabaseRouteHandlerReadOnlyClient')

    expectBefore(source, 'const staff = await requireStaffFromRequest(request)', 'const cookieRaw = request.cookies.get')
    expectBefore(
      source,
      'verifySignedOAuthStateCookieWithMetadata(cookieRaw)',
      'const parishContext = await resolveGoogleOAuthCallbackParishContext'
    )
    expectBefore(source, 'const parishContext = await resolveGoogleOAuthCallbackParishContext', 'oauth2Client.getToken(code)')
    expectBefore(source, 'const parishId = parishContext.activeParishId', ".from('parish_google_integrations').upsert")
    expectBefore(source, 'parish_id: parishId', 'refresh_token: refreshToken')
    expectBefore(source, 'savedIntegration?.parish_id !== parishId', "settingsRedirect(request, 'connected')")
  })

  it('keeps parish settings Google status selected-parish scoped', () => {
    const source = readFileSync(parishSettingsRoutePath, 'utf8')

    expect(source).toContain('resolveParishSettingsReadParishId')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('loadParishSettingsWithGoogle')
    expect(source).toContain('.from(\'parish_google_integrations\')')
    expect(source).toContain('.eq(\'parish_id\', parish.id)')

    expectBefore(
      source,
      'const parishContext = await resolveParishSettingsReadParishId',
      'const { parish, google, error } = await loadParishSettingsWithGoogle'
    )
    expectBefore(
      source,
      'const { parish, google, error } = await loadParishSettingsWithGoogle',
      'googleCalendar: google'
    )
  })

  it('logs OAuth start and callback failures safely without raw provider/config messages', () => {
    const startSource = readFileSync(startRoutePath, 'utf8')
    const callbackSource = readFileSync(callbackRoutePath, 'utf8')

    expect(startSource).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(startSource).toContain('logServerError(`[google-oauth-start] ${action} failed`, error')
    expect(startSource).toContain("logGoogleOAuthStartError('config'")
    expect(startSource).toContain("logGoogleOAuthStartError('state-signing'")
    expect(startSource).toContain("error: 'Google Calendar connection is not configured.'")
    expect(startSource).toContain("error: 'Google Calendar connection could not start.'")
    expect(startSource).not.toContain('Server missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET')
    expect(startSource).not.toContain(
      'Server missing GOOGLE_OAUTH_STATE_SECRET or GOOGLE_CLIENT_SECRET for OAuth state'
    )

    expect(callbackSource).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(callbackSource).toContain(
      'logServerError(`[google-oauth-callback] ${action} failed`, error'
    )
    expect(callbackSource).toContain("'oauth-error-param'")
    expect(callbackSource).toContain("'state-validation'")
    expect(callbackSource).toContain("'parish-authorization'")
    expect(callbackSource).toContain("logGoogleOAuthCallbackError('config'")
    expect(callbackSource).toContain("'token-response'")
    expect(callbackSource).toContain("logGoogleOAuthCallbackError('userinfo-fetch'")
    expect(callbackSource).toMatch(/logGoogleOAuthCallbackError\(\s*'integration-upsert'/)
    expect(callbackSource).toContain("logGoogleOAuthCallbackError('callback-exception'")
    expect(callbackSource).toContain('hasParishId: Boolean(parishId)')
    expect(callbackSource).not.toContain('logGoogleOAuthCallbackError(\'userinfo-fetch\', error, {\r\n          parishId,')
    expect(callbackSource).not.toContain('logGoogleOAuthCallbackError(\'integration-upsert\', upsertErr, {\r\n        parishId,')
    expect(callbackSource).not.toContain('console.error')
    expect(callbackSource).not.toContain('console.warn')
    expect(callbackSource).not.toContain('Google OAuth callback error param:')
    expect(callbackSource).not.toContain('Google OAuth callback exception:')
    expect(callbackSource).not.toContain('Google OAuth: upsert parish_google_integrations failed')
  })

  it('documents the Google OAuth safe error logging boundary', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('# Google OAuth Safe Error Logging - 2026-07-06')
    expect(evidence).toContain('Google Calendar connection is not configured.')
    expect(evidence).toContain('Google Calendar connection could not start.')
    expect(evidence).toContain('/dashboard/settings?gcal=error')
    expect(evidence).toContain('No production access')
    expect(evidence).toContain('No operational RLS changes')
    expect(evidence).toContain('No raw OAuth provider error params, tokens, refresh tokens')
  })
})
