import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  buildCalendarEventFromRequest,
  CALENDAR_EVENT_PARISHIONER_SELECT,
  CALENDAR_EVENT_REQUEST_SELECT,
} from '@/lib/calendarEventFromRequest'
import {
  googleCalendarNotConnectedUserMessage,
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
import { readBoundedJsonBody } from '@/lib/server/boundedJsonBody'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { createGoogleCalendarProviderOptions } from '@/lib/server/googleCalendarProviderReliability'
import { rejectCrossOriginMutation } from '@/lib/server/sameOriginMutation'

type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]
const MAX_BODY_BYTES = 16 * 1024

function logGoogleCalendarUpdateEventError(error: unknown, parishId: string | null) {
  logServerError('[google-calendar-update-event] unexpected failure', error, {
    route: '/api/google/calendar-event/update',
    hasParishId: Boolean(parishId),
  })
}

function activeParishCookie(request: NextRequest): string | null {
  return request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
}

async function resolveGoogleCalendarUpdateParishContext(
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
      error: 'You are not authorized to update Google Calendar events for this parish.',
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
      error: 'You are not authorized to update Google Calendar events for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId,
    }
  }

  return context
}

function parishionerMatchesParish(
  parishionerRow: { parish_id?: unknown } | null | undefined,
  parishId: string
): boolean {
  return String(parishionerRow?.parish_id ?? '').trim() === parishId
}

function requestCalendarMatchesSelectedIntegration(
  requestRow: { google_calendar_id?: unknown } | null | undefined,
  selectedCalendarId: string
): boolean {
  const storedCalendarId = String(requestRow?.google_calendar_id ?? '').trim()
  return !storedCalendarId || storedCalendarId === selectedCalendarId
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginMutation(request)
  if (originRejection) return originRejection

  let parishId: string | null = null

  try {
    const staff = await requireStaffFromRequest(request)
    if (!staff.ok) return staff.response
    const supabase = staff.supabase

    const parsedBody = await readBoundedJsonBody(request, MAX_BODY_BYTES)
    if (!parsedBody.ok) {
      return NextResponse.json(
        { ok: false, error: 'Invalid Google Calendar request.' },
        { status: parsedBody.reason === 'too_large' ? 413 : 400 },
      )
    }
    const body =
      parsedBody.value && typeof parsedBody.value === 'object'
        ? (parsedBody.value as Record<string, unknown>)
        : {}
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

    const requestedParishId = activeParishCookie(request)
    const parishContext = await resolveGoogleCalendarUpdateParishContext(
      supabase,
      requestedParishId
    )
    if (!parishContext.ok) {
      return NextResponse.json(
        { ok: false, error: parishContext.error },
        { status: 403 }
      )
    }
    parishId = parishContext.activeParishId

    const { data: reqRow, error: reqErr } = await supabase
      .from('requests')
      .select(CALENDAR_EVENT_REQUEST_SELECT)
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

    const { data: parishionerRow } = await supabase
      .from('parishioners')
      .select(CALENDAR_EVENT_PARISHIONER_SELECT)
      .eq('id', reqRow.parishioner_id)
      .single()

    if (!parishionerMatchesParish(parishionerRow, parishContext.activeParishId)) {
      return NextResponse.json({ ok: false, error: 'Request not found' }, { status: 404 })
    }

    const integration = await loadParishGoogleCalendarIntegration(
      parishContext.activeParishId
    )
    const usable = resolveUsableParishGoogleCalendar(integration)
    if (!usable.ok || usable.parishId !== parishContext.activeParishId) {
      return NextResponse.json(
        { ok: false, error: googleCalendarNotConnectedUserMessage() },
        { status: 503 }
      )
    }

    if (!requestCalendarMatchesSelectedIntegration(reqRow, usable.calendarId)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'This request is linked to a different parish calendar. Recreate the Google Calendar event for the selected parish.',
        },
        { status: 409 }
      )
    }

    const calendarId = usable.calendarId

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

    const patchRes = await calendar.events.patch(
      {
        calendarId,
        eventId,
        requestBody: {
          summary,
          description,
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
        },
      },
      createGoogleCalendarProviderOptions()
    )

    const htmlLink = patchRes.data.htmlLink || null

    const { data: updatedRequest, error: updateErr } = await supabase
      .from('requests')
      .update({
        google_calendar_id: calendarId,
        google_calendar_event_html_link: htmlLink ?? reqRow.google_calendar_event_html_link,
      })
      .eq('id', requestId)
      .select('id')
      .maybeSingle()

    if (updateErr || !updatedRequest?.id) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Event updated in Google Calendar, but failed saving link to request',
        },
        { status: 500 }
      )
    }

    await writeAuditEvent({
      parishId: parishContext.activeParishId,
      actorEmail: staff.staff.email,
      action: 'request.schedule.updated',
      targetType: 'request',
      targetId: requestId,
      metadata: {
        source: 'staff_request_detail',
        scheduleKind: 'google_calendar_event',
        operation: 'updated',
      },
    })

    return NextResponse.json({ ok: true, eventId, htmlLink })
  } catch (error: unknown) {
    logGoogleCalendarUpdateEventError(error, parishId)
    await handleGoogleCalendarOAuthFailureIfNeeded(parishId, error)
    return NextResponse.json(
      { ok: false, error: userFacingGoogleCalendarErrorMessage(error) },
      { status: 500 }
    )
  }
}

export const googleCalendarUpdateRouteTestInternals = {
  activeParishCookie,
  parishionerMatchesParish,
  requestCalendarMatchesSelectedIntegration,
  resolveGoogleCalendarUpdateParishContext,
}
