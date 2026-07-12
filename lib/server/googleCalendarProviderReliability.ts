import 'server-only'

import { createHash } from 'node:crypto'

export const GOOGLE_CALENDAR_PROVIDER_TIMEOUT_MS = 15_000

type GoogleCalendarEventIdentity = {
  id?: string | null
  summary?: string | null
  start?: { dateTime?: string | null } | null
  end?: { dateTime?: string | null } | null
}

type ExpectedGoogleCalendarEvent = {
  eventId: string
  summary: string
  start: Date
  end: Date
}

export function createGoogleCalendarProviderOptions(
  timeoutMs = GOOGLE_CALENDAR_PROVIDER_TIMEOUT_MS
) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError('Google Calendar provider timeout must be a positive finite number.')
  }

  return {
    signal: AbortSignal.timeout(timeoutMs),
  }
}

export function buildDeterministicGoogleCalendarEventId(args: {
  parishId: string
  requestId: string
}): string {
  const parishId = args.parishId.trim()
  const requestId = args.requestId.trim()
  if (!parishId || !requestId) {
    throw new TypeError('Google Calendar event identity requires parish and request ids.')
  }

  const digest = createHash('sha256')
    .update(`vinea-google-calendar-event\u0000${parishId}\u0000${requestId}`, 'utf8')
    .digest('hex')

  // Google accepts caller-supplied event ids containing lowercase base32hex characters.
  // The fixed prefix and hex digest are opaque, stable, and valid within that alphabet.
  return `vinea${digest}`
}

export function isGoogleCalendarAlreadyExistsError(error: unknown): boolean {
  const candidate = error as { response?: { status?: number }; code?: number | string }
  const status = candidate?.response?.status ?? Number(candidate?.code)
  return status === 409
}

function sameInstant(actual: string | null | undefined, expected: Date): boolean {
  if (!actual) return false
  const parsed = new Date(actual)
  return !Number.isNaN(parsed.getTime()) && parsed.getTime() === expected.getTime()
}

export function recoveredGoogleCalendarEventMatches(
  event: GoogleCalendarEventIdentity | null | undefined,
  expected: ExpectedGoogleCalendarEvent
): boolean {
  return (
    event?.id === expected.eventId &&
    event.summary === expected.summary &&
    sameInstant(event.start?.dateTime, expected.start) &&
    sameInstant(event.end?.dateTime, expected.end)
  )
}
