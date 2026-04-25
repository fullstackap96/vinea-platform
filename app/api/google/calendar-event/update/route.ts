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

    const eventId = reqRow.google_calendar_event_id
    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: 'No Google Calendar event is linked to this request' },
        { status: 400 }
      )
    }

    const calendarId = String(reqRow.google_calendar_id || usable.calendarId)

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

    const conflicts = await listParishGoogleCalendarConflicts({
      calendar,
      calendarId,
      start,
      end,
      ignoreEventId: String(eventId),
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

    const patchRes = await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: {
        summary,
        description,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      },
    })

    const htmlLink = patchRes.data.htmlLink || null

    const { error: updateErr } = await supabase
      .from('requests')
      .update({
        google_calendar_id: calendarId,
        google_calendar_event_html_link: htmlLink ?? reqRow.google_calendar_event_html_link,
      })
      .eq('id', requestId)

    if (updateErr) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Event updated in Google Calendar, but failed saving link to request',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, eventId, htmlLink })
  } catch (error: unknown) {
    console.error(
      'GOOGLE CALENDAR UPDATE EVENT ERROR (technical):',
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
