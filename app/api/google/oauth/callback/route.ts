import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { google } from 'googleapis'
import { resolveAppOrigin } from '@/lib/appOrigin'
import {
  GCAL_OAUTH_STATE_COOKIE,
  timingSafeStateEquals,
  verifySignedOAuthStateCookie,
} from '@/lib/googleOAuthStateCookie'
import { createSupabaseRouteHandlerReadOnlyClient } from '@/lib/supabase/routeHandlerClient'
import { createSupabaseServiceRoleClient } from '@/lib/supabase/serviceRoleClient'

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

export async function GET(request: NextRequest) {
  const fail = () => {
    const res = settingsRedirect(request, 'error')
    clearGcalOAuthStateCookie(res)
    return res
  }

  const search = request.nextUrl.searchParams
  const oauthError = search.get('error')
  if (oauthError) {
    console.error('Google OAuth callback error param:', oauthError)
    return fail()
  }

  const code = search.get('code')
  const stateParam = search.get('state')
  if (!code || !stateParam) {
    return fail()
  }

  const supabase = createSupabaseRouteHandlerReadOnlyClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return fail()
  }

  const cookieRaw = request.cookies.get(GCAL_OAUTH_STATE_COOKIE)?.value
  const expectedState = verifySignedOAuthStateCookie(cookieRaw)
  if (!expectedState || !timingSafeStateEquals(expectedState, stateParam)) {
    console.error('Google OAuth state mismatch or invalid cookie')
    return fail()
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    console.error('Google OAuth callback: missing client id/secret')
    return fail()
  }

  const origin = resolveAppOrigin(request)
  const redirectUri = `${origin}/api/google/oauth/callback`

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
    const { tokens } = await oauth2Client.getToken(code)
    const refreshToken = tokens.refresh_token
    if (!refreshToken) {
      console.error('Google OAuth: no refresh_token in token response (prompt=consent required)')
      return fail()
    }

    const admin = createSupabaseServiceRoleClient()
    const { data: parish, error: parishErr } = await admin
      .from('parishes')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (parishErr || !parish?.id) {
      console.error('Google OAuth: parish lookup failed', parishErr)
      return fail()
    }

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
      } catch (e) {
        console.warn('Google OAuth: userinfo fetch skipped', e)
      }
    }

    const nowIso = new Date().toISOString()
    const { error: upsertErr } = await admin.from('parish_google_integrations').upsert(
      {
        parish_id: parish.id,
        refresh_token: refreshToken,
        calendar_id: 'primary',
        google_account_email: googleAccountEmail,
        status: 'connected',
        last_error: null,
        updated_at: nowIso,
      },
      { onConflict: 'parish_id' }
    )

    if (upsertErr) {
      console.error('Google OAuth: upsert parish_google_integrations failed', upsertErr)
      return fail()
    }

    const ok = settingsRedirect(request, 'connected')
    clearGcalOAuthStateCookie(ok)
    return ok
  } catch (e) {
    console.error('Google OAuth callback exception:', e)
    return fail()
  }
}
