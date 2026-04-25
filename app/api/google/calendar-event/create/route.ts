import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { buildCalendarEventFromRequest } from '@/lib/calendarEventFromRequest'
import {
  googleCalendarNotConnectedUserMessage,
  serializeGoogleCalendarErrorForLogs,
  userFacingGoogleCalendarErrorMessage,
} from '@/lib/googleCalendarUserErrors'
import {
  getGoogleCalendarClient,
  handleGoogleCalendarOAuthFailureIfNeeded,
  listParishGoogleCalendarConflicts,
  loadParishGoogleCalendarIntegration,
  requireGoogleOAuthClientEnv,
  resolveUsableParishGoogleCalendar,
} from '@/lib/parishGoogleCalendarServer'
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/routeHandlerClient'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: false })
  let parishId: string | null = null

  try {
    const supabase = createSupabaseRouteHandlerClient(request, response)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const requestId = String(body?.requestId || '').trim()
    const forceCreate = Boolean(body?.forceCreate)
    if (!requestId) {
      return NextResponse.json({ ok: false, error: 'Missing requestId' }, { status: 400 })
    }

    const oauthEnv = requireGoogleOAuthClientEnv()
    if (!oauthEnv.ok) {
      return NextResponse.json(
        { ok: false, error: 'Google Calendar is not configured on this server.' },
        { status: 500 }
      )
    }

    const integration = await loadParishGoogleCalendarIntegration()
    const usable = resolveUsableParishGoogleCalendar(integration)
    if (!usable.ok) {
      return NextResponse.json(
        { ok: false, error: googleCalendarNotConnectedUserMessage() },
        { status: 503 }
      )
    }
    parishId = usable.parishId

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

    const built = await buildCalendarEventFromRequest(supabase, reqRow, parishionerRow)
    if (!built.ok) {
      return NextResponse.json({ ok: false, error: built.error }, { status: 400 })
    }

    const { start, end, summary, description } = built

    const calendar = getGoogleCalendarClient(
      usable.refreshToken,
      oauthEnv.clientId,
      oauthEnv.clientSecret
    )

    if (!forceCreate) {
      const conflicts = await listParishGoogleCalendarConflicts({
        calendar,
        calendarId: usable.calendarId,
        start,
        end,
        ignoreEventId: null,
      })

      if (conflicts.length) {
        return NextResponse.json(
          {
            error: 'CALENDAR_CONFLICT',
            message: 'There is already something scheduled at this time.',
            conflicts,
          },
          { status: 409 }
        )
      }
    }

    const insertRes = await calendar.events.insert({
      calendarId: usable.calendarId,
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
        google_calendar_id: usable.calendarId,
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
  } catch (error: unknown) {
    console.error(
      'GOOGLE CALENDAR CREATE EVENT ERROR (technical):',
      serializeGoogleCalendarErrorForLogs(error),
      error
    )
    await handleGoogleCalendarOAuthFailureIfNeeded(parishId, error)
    return NextResponse.json(
      { ok: false, error: userFacingGoogleCalendarErrorMessage(error) },
      { status: 500 }
    )
  }
}
