import { google } from 'googleapis'
import {
  isGoogleOAuthReconnectError,
  serializeGoogleCalendarErrorForLogs,
} from '@/lib/googleCalendarUserErrors'
import { createSupabaseServiceRoleClient } from '@/lib/supabase/serviceRoleClient'

export type GoogleCalendarConflict = {
  summary: string | null
  start: string | null
  end: string | null
  htmlLink: string | null
}

export type ParishGoogleCalendarIntegration = {
  parish_id: string
  refresh_token: string | null
  calendar_id: string | null
  status: string | null
}

export type UsableParishGoogleCalendar =
  | { ok: true; parishId: string; refreshToken: string; calendarId: string }
  | { ok: false }

export function requireGoogleOAuthClientEnv():
  | { ok: true; clientId: string; clientSecret: string }
  | { ok: false } {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) return { ok: false }
  return { ok: true, clientId, clientSecret }
}

export async function loadParishGoogleCalendarIntegration(): Promise<ParishGoogleCalendarIntegration | null> {
  const admin = createSupabaseServiceRoleClient()
  const { data: parish, error: parishErr } = await admin
    .from('parishes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (parishErr || !parish?.id) return null

  const { data: row, error: rowErr } = await admin
    .from('parish_google_integrations')
    .select('parish_id, refresh_token, calendar_id, status')
    .eq('parish_id', parish.id)
    .maybeSingle()

  if (rowErr || !row) return null

  return {
    parish_id: row.parish_id,
    refresh_token: row.refresh_token,
    calendar_id: row.calendar_id,
    status: row.status,
  }
}

export function resolveUsableParishGoogleCalendar(
  integration: ParishGoogleCalendarIntegration | null
): UsableParishGoogleCalendar {
  if (!integration) return { ok: false }
  const refreshToken = integration.refresh_token?.trim()
  const calendarId = integration.calendar_id?.trim()
  if (!refreshToken || !calendarId) return { ok: false }
  if (integration.status?.trim() !== 'connected') return { ok: false }
  return {
    ok: true,
    parishId: integration.parish_id,
    refreshToken,
    calendarId,
  }
}

export function getGoogleCalendarClient(
  refreshToken: string,
  clientId: string,
  clientSecret: string
) {
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret)
  oauth2.setCredentials({ refresh_token: refreshToken })
  return google.calendar({ version: 'v3', auth: oauth2 })
}

function eventDateTimeToDate(value: { dateTime?: string | null; date?: string | null } | null | undefined) {
  const raw = value?.dateTime ?? value?.date
  if (!raw) return null
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && aEnd.getTime() > bStart.getTime()
}

/**
 * Lists conflicts for a proposed event window on the parish calendar.
 * Uses events.list (timeMin/timeMax + singleEvents) then performs explicit overlap checks.
 */
export async function listParishGoogleCalendarConflicts(args: {
  calendar: ReturnType<typeof getGoogleCalendarClient>
  calendarId: string
  start: Date
  end: Date
  ignoreEventId?: string | null
}): Promise<GoogleCalendarConflict[]> {
  const { calendar, calendarId, start, end, ignoreEventId } = args

  const res = await calendar.events.list({
    calendarId,
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })

  const items = res.data.items ?? []
  const conflicts: GoogleCalendarConflict[] = []

  for (const ev of items) {
    if (!ev) continue
    if (ignoreEventId && ev.id === ignoreEventId) continue
    if (ev.status === 'cancelled') continue

    const evStart = eventDateTimeToDate(ev.start)
    const evEnd = eventDateTimeToDate(ev.end)
    if (!evStart || !evEnd) continue

    // For all-day events, Google returns {start:{date}, end:{date}} which already represents a day span.
    // We still only treat it as a conflict when it overlaps the requested date/time window.
    if (!overlaps(evStart, evEnd, start, end)) continue

    conflicts.push({
      summary: ev.summary ?? null,
      start: evStart.toISOString(),
      end: evEnd.toISOString(),
      htmlLink: ev.htmlLink ?? null,
    })
  }

  return conflicts
}

export async function markParishGoogleCalendarAuthError(parishId: string, error: unknown) {
  try {
    const admin = createSupabaseServiceRoleClient()
    const detail = serializeGoogleCalendarErrorForLogs(error)
    await admin
      .from('parish_google_integrations')
      .update({
        status: 'error',
        last_error: detail.slice(0, 4000),
        updated_at: new Date().toISOString(),
      })
      .eq('parish_id', parishId)
  } catch (e) {
    console.error('markParishGoogleCalendarAuthError failed', e)
  }
}

export async function handleGoogleCalendarOAuthFailureIfNeeded(
  parishId: string | null,
  error: unknown
) {
  if (parishId && isGoogleOAuthReconnectError(error)) {
    await markParishGoogleCalendarAuthError(parishId, error)
  }
}
