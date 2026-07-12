import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveAppOrigin } from '@/lib/appOrigin'
import {
  createSignedOAuthStateValue,
  GCAL_OAUTH_STATE_COOKIE,
} from '@/lib/googleOAuthStateCookie'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { logServerError } from '@/lib/server/safeErrorLogging'

const GCAL_OAUTH_STATE_MAX_AGE_SEC = 600
type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]
type GoogleOAuthStartErrorAction = 'config' | 'state-signing'

function logGoogleOAuthStartError(
  action: GoogleOAuthStartErrorAction,
  error: unknown,
  extra: Record<string, string | number | boolean | null | undefined> = {}
) {
  logServerError(`[google-oauth-start] ${action} failed`, error, {
    route: '/api/google/oauth/start',
    ...extra,
  })
}

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

async function resolveGoogleOAuthStartParishContext(
  supabase: StaffSupabaseClient,
  requestedParishId: string | null
) {
  const context = await resolveActiveStaffParishContext(supabase, {
    requestedParishId,
  })

  if (!context.ok) return context
  if (requestedParishId && context.activeParishId !== requestedParishId) {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to connect Google Calendar for this parish.',
      technicalDetail:
        context.ignoredRequestedParishReason ??
        'Requested parish did not resolve to the active staff parish.',
      requestedParishId,
    }
  }
  if (requestedParishId && context.source !== 'membership') {
    return {
      ok: false as const,
      source: context.source,
      error: 'You are not authorized to connect Google Calendar for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId,
    }
  }

  return context
}

export async function GET(request: NextRequest) {
  const staff = await requireStaffFromRequest(request)
  if (!staff.ok) {
    const login = new URL('/login', resolveAppOrigin(request))
    login.searchParams.set('next', '/api/google/oauth/start')
    return NextResponse.redirect(login)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    logGoogleOAuthStartError('config', new Error('Google OAuth client config missing'), {
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
    })
    return NextResponse.json(
      { error: 'Google Calendar connection is not configured.' },
      { status: 500 }
    )
  }

  const requestedParishId = activeParishCookie(request)
  const parishContext = await resolveGoogleOAuthStartParishContext(
    staff.supabase,
    requestedParishId
  )
  if (!parishContext.ok) {
    return NextResponse.json(
      { ok: false, error: parishContext.error },
      { status: 403 }
    )
  }

  let plainState: string
  let cookieValue: string
  try {
    ;({ plainState, cookieValue } = createSignedOAuthStateValue({
      parishId: parishContext.activeParishId,
    }))
  } catch (error: unknown) {
    logGoogleOAuthStartError('state-signing', error, {
      hasActiveParishCookie: Boolean(requestedParishId),
    })
    return NextResponse.json(
      { error: 'Google Calendar connection could not start.' },
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

export const googleOAuthStartRouteTestInternals = {
  activeParishCookie,
  resolveGoogleOAuthStartParishContext,
}
