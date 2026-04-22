/**
 * Staff-facing copy and detection for Google Calendar / OAuth failures.
 * Raw errors are logged on the server; callers should not expose tokens.
 */

export const GOOGLE_CALENDAR_AUTH_EXPIRED_MESSAGE =
  'Your Google Calendar connection has expired or needs to be reconnected.'

export const GOOGLE_CALENDAR_RECONNECT_NEXT_STEP =
  'Ask whoever manages this app’s Google integration to update the refresh token and related credentials in the server environment (same steps as the initial Google Calendar setup).'

function collectErrorText(error: unknown): string {
  if (error == null) return ''
  if (typeof error === 'string') return error
  if (error instanceof Error) return `${error.message} ${error.name}`
  const e = error as Record<string, unknown>
  const parts: string[] = []
  if (typeof e.message === 'string') parts.push(e.message)
  const resp = e.response as Record<string, unknown> | undefined
  const data = resp?.data as Record<string, unknown> | undefined
  if (typeof data?.error === 'string') parts.push(data.error)
  if (typeof data?.error_description === 'string') parts.push(data.error_description)
  return parts.join(' ') || String(error)
}

/** True when the failure is almost certainly an OAuth refresh / client credential issue. */
export function isGoogleOAuthReconnectError(error: unknown): boolean {
  const blob = collectErrorText(error).toLowerCase()
  return (
    blob.includes('invalid_grant') ||
    blob.includes('invalid_client') ||
    blob.includes('unauthorized_client') ||
    blob.includes('token has been expired or revoked') ||
    blob.includes('refresh token')
  )
}

/** Serialize for server logs (no secrets expected in these fields, but avoid logging full env). */
export function serializeGoogleCalendarErrorForLogs(error: unknown): string {
  try {
    const e = error as Record<string, unknown>
    const resp = e.response as Record<string, unknown> | undefined
    const data = resp?.data
    return JSON.stringify({
      message: e?.message,
      code: e?.code,
      status: resp?.status,
      data,
      cause: e?.cause,
    })
  } catch {
    return String(error)
  }
}

/** Message returned in API JSON and shown in the dashboard (defense in depth on client too). */
export function userFacingGoogleCalendarErrorMessage(error: unknown): string {
  if (isGoogleOAuthReconnectError(error)) {
    return `${GOOGLE_CALENDAR_AUTH_EXPIRED_MESSAGE} ${GOOGLE_CALENDAR_RECONNECT_NEXT_STEP}`
  }
  if (typeof error === 'string' && error.trim()) return error
  if (error instanceof Error && error.message.trim()) return error.message
  return 'Something went wrong with Google Calendar.'
}
