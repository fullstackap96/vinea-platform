import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveAppOrigin } from '@/lib/appOrigin'
import {
  createSignedOAuthStateValue,
  GCAL_OAUTH_STATE_COOKIE,
} from '@/lib/googleOAuthStateCookie'
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/routeHandlerClient'

const GCAL_OAUTH_STATE_MAX_AGE_SEC = 600

export async function GET(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createSupabaseRouteHandlerClient(request, response)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const login = new URL('/login', resolveAppOrigin(request))
    login.searchParams.set('next', '/api/google/oauth/start')
    return NextResponse.redirect(login)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Server missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET' },
      { status: 500 }
    )
  }

  let plainState: string
  let cookieValue: string
  try {
    ;({ plainState, cookieValue } = createSignedOAuthStateValue())
  } catch {
    return NextResponse.json(
      { error: 'Server missing GOOGLE_OAUTH_STATE_SECRET or GOOGLE_CLIENT_SECRET for OAuth state' },
      { status: 500 }
    )
  }

  const origin = resolveAppOrigin(request)
  const redirectUri = `${origin}/api/google/oauth/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope:
      'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email',
    state: plainState,
    access_type: 'offline',
    prompt: 'consent',
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  const redirect = NextResponse.redirect(authUrl)

  redirect.cookies.set(GCAL_OAUTH_STATE_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: GCAL_OAUTH_STATE_MAX_AGE_SEC,
  })

  return redirect
}
