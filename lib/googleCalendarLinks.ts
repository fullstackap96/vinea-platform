const GOOGLE_CALENDAR_EVENT_HOSTS = new Set([
  'calendar.google.com',
  'www.google.com',
])

export function safeGoogleCalendarEventHref(value: unknown): string | null {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return null

  try {
    const url = new URL(raw)
    const hostname = url.hostname.toLowerCase().replace(/\.$/, '')

    if (url.protocol !== 'https:') return null
    if (url.username || url.password || url.port) return null
    if (!GOOGLE_CALENDAR_EVENT_HOSTS.has(hostname)) return null

    return url.toString()
  } catch {
    return null
  }
}
