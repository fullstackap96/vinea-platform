import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  googleCalendarNotConnectedUserMessage,
  serializeGoogleCalendarErrorForLogs,
  userFacingGoogleCalendarErrorMessage,
} from '@/lib/googleCalendarUserErrors'
import {
  getGoogleCalendarClient,
  handleGoogleCalendarOAuthFailureIfNeeded,
  loadParishGoogleCalendarIntegration,
  requireGoogleOAuthClientEnv,
  resolveUsableParishGoogleCalendar,
} from '@/lib/parishGoogleCalendarServer'
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/routeHandlerClient'

function isNotFoundGoogleError(error: unknown): boolean {
  const e = error as { response?: { status?: number }; code?: number }
  const status = e?.response?.status ?? e?.code
  return status === 404
}

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

    const calendar = getGoogleCalendarClient(
      usable.refreshToken,
      oauthEnv.clientId,
      oauthEnv.clientSecret
    )

    try {
      await calendar.events.delete({
        calendarId,
        eventId,
      })
    } catch (gErr: unknown) {
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
  } catch (error: unknown) {
    console.error(
      'GOOGLE CALENDAR DELETE EVENT ERROR (technical):',
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
