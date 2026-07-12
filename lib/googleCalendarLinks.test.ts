import { describe, expect, it } from 'vitest'
import { safeGoogleCalendarEventHref } from './googleCalendarLinks'

describe('safeGoogleCalendarEventHref', () => {
  it('accepts HTTPS Google Calendar event links from supported hosts', () => {
    expect(
      safeGoogleCalendarEventHref('https://www.google.com/calendar/event?eid=safe-event'),
    ).toBe('https://www.google.com/calendar/event?eid=safe-event')
    expect(
      safeGoogleCalendarEventHref(
        'https://calendar.google.com/calendar/u/0/r/eventedit/safe-event',
      ),
    ).toBe('https://calendar.google.com/calendar/u/0/r/eventedit/safe-event')
  })

  it('rejects non-HTTPS, non-Google, credential-bearing, and malformed links', () => {
    for (const value of [
      'http://calendar.google.com/calendar/event?eid=unsafe',
      'javascript:alert(1)',
      'data:text/html,unsafe',
      'https://calendar.google.com.evil.example/calendar/event',
      'https://calendar.google.com@evil.example/calendar/event',
      'https://user:password@calendar.google.com/calendar/event',
      'https://calendar.google.com:8443/calendar/event',
      '//calendar.google.com/calendar/event',
      'not a url',
      null,
      { href: 'https://calendar.google.com/calendar/event' },
    ]) {
      expect(safeGoogleCalendarEventHref(value)).toBeNull()
    }
  })
})
