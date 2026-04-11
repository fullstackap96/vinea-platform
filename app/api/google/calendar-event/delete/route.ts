import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { google } from 'googleapis'

function getSupabaseServerClient(request: NextRequest, response: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })
}

function isNotFoundGoogleError(error: any) {
  const status = error?.response?.status ?? error?.code
  return status === 404
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: false })
  try {
    const supabase = getSupabaseServerClient(request, response)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const requestId = String(body?.requestId || '').trim()
    if (!requestId) {
      return NextResponse.json({ ok: false, error: 'Missing requestId' }, { status: 400 })
    }

    const envCalendarId = process.env.GOOGLE_CALENDAR_ID
    if (!envCalendarId) {
      return NextResponse.json(
        { ok: false, error: 'Server missing GOOGLE_CALENDAR_ID' },
        { status: 500 }
      )
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json(
        { ok: false, error: 'Server missing Google OAuth configuration' },
        { status: 500 }
      )
    }

    const { data: reqRow, error: reqErr } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (reqErr || !reqRow) {
      return NextResponse.json({ ok: false, error: 'Request not found' }, { status: 404 })
    }

    const eventId = reqRow.google_calendar_event_id
    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: 'No Google Calendar event is linked to this request' },
        { status: 400 }
      )
    }

    const calendarId = String(reqRow.google_calendar_id || envCalendarId)

    const oauth2 = new google.auth.OAuth2(clientId, clientSecret)
    oauth2.setCredentials({ refresh_token: refreshToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2 })
    try {
      await calendar.events.delete({
        calendarId,
        eventId,
      })
    } catch (gErr: any) {
      if (!isNotFoundGoogleError(gErr)) {
        throw gErr
      }
    }

    const { error: updateErr } = await supabase
      .from('requests')
      .update({
        google_calendar_event_id: null,
        google_calendar_id: null,
        google_calendar_event_html_link: null,
      })
      .eq('id', requestId)

    if (updateErr) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Removed event from Google (or it was already gone), but failed clearing fields in database',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('GOOGLE CALENDAR DELETE EVENT ERROR:', error)
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
