import { google } from 'googleapis'
import {
  isGoogleOAuthReconnectError,
  serializeGoogleCalendarErrorForLogs,
} from '@/lib/googleCalendarUserErrors'
import { createSupabaseServiceRoleClient } from '@/lib/supabase/serviceRoleClient'

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
