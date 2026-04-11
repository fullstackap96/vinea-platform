import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { google } from 'googleapis'
import { buildCalendarEventFromRequest } from '@/lib/calendarEventFromRequest'

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

    const calendarId = process.env.GOOGLE_CALENDAR_ID
    if (!calendarId) {
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

    if (reqRow.google_calendar_event_id) {
      return NextResponse.json(
        { ok: false, error: 'Calendar event already exists for this request' },
        { status: 400 }
      )
    }

    const { data: parishionerRow } = await supabase
      .from('parishioners')
      .select('*')
      .eq('id', reqRow.parishioner_id)
      .single()

    const built = await buildCalendarEventFromRequest(
      supabase,
      reqRow,
      parishionerRow
    )
    if (!built.ok) {
      return NextResponse.json({ ok: false, error: built.error }, { status: 400 })
    }

    const { start, end, summary, description } = built

    const oauth2 = new google.auth.OAuth2(clientId, clientSecret)
    oauth2.setCredentials({ refresh_token: refreshToken })

    const calendar = google.calendar({ version: 'v3', auth: oauth2 })
    const insertRes = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary,
        description,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      },
    })

    const eventId = insertRes.data.id || null
    const htmlLink = insertRes.data.htmlLink || null

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: 'Google Calendar did not return an event id' },
        { status: 500 }
      )
    }

    const { error: updateErr } = await supabase
      .from('requests')
      .update({
        google_calendar_event_id: eventId,
        google_calendar_id: calendarId,
        google_calendar_event_html_link: htmlLink,
      })
      .eq('id', requestId)

    if (updateErr) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Event created in Google Calendar, but failed saving event info to request',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, eventId, htmlLink })
  } catch (error: any) {
    console.error('GOOGLE CALENDAR CREATE EVENT ERROR:', error)
    return NextResponse.json(
      { ok: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

