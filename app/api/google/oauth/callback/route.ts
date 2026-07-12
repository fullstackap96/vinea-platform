import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { google } from 'googleapis'
import { resolveAppOrigin } from '@/lib/appOrigin'
import {
  GCAL_OAUTH_STATE_COOKIE,
  timingSafeStateEquals,
  verifySignedOAuthStateCookieWithMetadata,
} from '@/lib/googleOAuthStateCookie'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { logServerError } from '@/lib/server/safeErrorLogging'

type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]
type GoogleOAuthCallbackErrorAction =
  | 'oauth-error-param'
  | 'state-validation'
  | 'parish-authorization'
  | 'config'
  | 'token-response'
  | 'userinfo-fetch'
  | 'integration-upsert'
  | 'callback-exception'

function logGoogleOAuthCallbackError(
  action: GoogleOAuthCallbackErrorAction,
  error: unknown,
  extra: Record<string, string | number | boolean | null | undefined> = {}
) {
  logServerError(`[google-oauth-callback] ${action} failed`, error, {
    route: '/api/google/oauth/callback',
    ...extra,
  })
}

function settingsRedirect(request: NextRequest, gcal: 'connected' | 'error') {
  const dest = new URL('/dashboard/settings', resolveAppOrigin(request))
  dest.searchParams.set('gcal', gcal)
  return NextResponse.redirect(dest)
}

function clearGcalOAuthStateCookie(res: NextResponse) {
  res.cookies.set(GCAL_OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

async function resolveGoogleOAuthCallbackParishContext(
  supabase: StaffSupabaseClient,
  signedParishId: string | null
) {
  if (!signedParishId) {
    return {
      ok: false as const,
      source: 'none' as const,
      error: 'Google Calendar connection is missing parish context.',
      technicalDetail: 'Signed OAuth state did not include a parish id.',
      requestedParishId: null,
    }
  }

  const context = await resolveActiveStaffParishContext(supabase, {
    requestedParishId: signedParishId,
  })

  if (!context.ok) return context
  if (context.activeParishId !== signedParishId) {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to connect Google Calendar for this parish.',
      technicalDetail:
        context.ignoredRequestedParishReason ??
        'Signed parish id did not resolve to the active staff parish.',
      requestedParishId: signedParishId,
    }
  }
  if (context.source !== 'membership') {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to connect Google Calendar for this parish.',
      technicalDetail: 'Google OAuth callback requires membership-backed parish authorization.',
      requestedParishId: signedParishId,
    }
  }

  return context
}

export async function GET(request: NextRequest) {
  const fail = () => {
    const res = settingsRedirect(request, 'error')
    clearGcalOAuthStateCookie(res)
    return res
  }

  const search = request.nextUrl.searchParams
  const oauthError = search.get('error')
  if (oauthError) {
    logGoogleOAuthCallbackError(
      'oauth-error-param',
      new Error('Google OAuth provider returned an error parameter'),
      { hasOAuthError: true }
    )
    return fail()
  }

  const code = search.get('code')
  const stateParam = search.get('state')
  if (!code || !stateParam) {
    return fail()
  }

  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) {
    return fail()
  }

  const cookieRaw = request.cookies.get(GCAL_OAUTH_STATE_COOKIE)?.value
  const expectedState = verifySignedOAuthStateCookieWithMetadata(cookieRaw)
  if (!expectedState || !timingSafeStateEquals(expectedState.state, stateParam)) {
    logGoogleOAuthCallbackError(
      'state-validation',
      new Error('Google OAuth state mismatch or invalid cookie'),
      {
        hasStateParam: Boolean(stateParam),
        hasStateCookie: Boolean(cookieRaw),
      }
    )
    return fail()
  }

  const parishContext = await resolveGoogleOAuthCallbackParishContext(
    staff.supabase,
    expectedState.metadata.parishId
  )
  if (!parishContext.ok) {
    logGoogleOAuthCallbackError(
      'parish-authorization',
      new Error('Google OAuth parish authorization failed'),
      {
        hasSignedParishId: Boolean(expectedState.metadata.parishId),
        source: parishContext.source,
      }
    )
    return fail()
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    logGoogleOAuthCallbackError('config', new Error('Google OAuth client config missing'), {
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
    })
    return fail()
  }

  const origin = resolveAppOrigin(request)
  const redirectUri = `${origin}/api/google/oauth/callback`

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
    const { tokens } = await oauth2Client.getToken(code)
    const refreshToken = tokens.refresh_token
    if (!refreshToken) {
      logGoogleOAuthCallbackError(
        'token-response',
        new Error('Google OAuth token response did not include refresh token'),
        { hasRefreshToken: false }
      )
      return fail()
    }

    const admin = createSupabaseServiceRoleClient()
    const parishId = parishContext.activeParishId

    let googleAccountEmail: string | null = null
    const accessToken = tokens.access_token
    if (accessToken) {
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (profileRes.ok) {
          const profile = (await profileRes.json()) as { email?: string }
          const em = typeof profile.email === 'string' ? profile.email.trim() : ''
          googleAccountEmail = em || null
        }
      } catch (error: unknown) {
        logGoogleOAuthCallbackError('userinfo-fetch', error, {
          hasParishId: Boolean(parishId),
          hasAccessToken: true,
        })
      }
    }

    const nowIso = new Date().toISOString()
    const { data: savedIntegration, error: upsertErr } = await admin.from('parish_google_integrations').upsert(
        {
          parish_id: parishId,
          refresh_token: refreshToken,
          calendar_id: 'primary',
          google_account_email: googleAccountEmail,
          status: 'connected',
          last_error: null,
          updated_at: nowIso,
        },
        { onConflict: 'parish_id' }
      )
      .select('parish_id')
      .maybeSingle()

    if (upsertErr || savedIntegration?.parish_id !== parishId) {
      logGoogleOAuthCallbackError(
        'integration-upsert',
        upsertErr ?? new Error('Google Calendar integration was not persisted.'),
        {
          hasParishId: Boolean(parishId),
          hasGoogleAccountEmail: Boolean(googleAccountEmail),
        }
      )
      return fail()
    }

    const ok = settingsRedirect(request, 'connected')
    clearGcalOAuthStateCookie(ok)
    return ok
  } catch (error: unknown) {
    logGoogleOAuthCallbackError('callback-exception', error, {
      hasCode: Boolean(code),
    })
    return fail()
  }
}

export const googleOAuthCallbackRouteTestInternals = {
  clearGcalOAuthStateCookie,
  resolveGoogleOAuthCallbackParishContext,
  settingsRedirect,
}
