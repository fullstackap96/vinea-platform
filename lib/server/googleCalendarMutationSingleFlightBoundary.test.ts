import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

const requestDetail = read('app/dashboard/requests/[id]/page.tsx')
const calendarSection = read(
  'app/dashboard/requests/[id]/_components/GoogleCalendarSection.tsx',
)

function handlerBetween(startMarker: string, endMarker: string) {
  const start = requestDetail.indexOf(startMarker)
  const end = requestDetail.indexOf(endMarker, start)

  expect(start).toBeGreaterThanOrEqual(0)
  expect(end).toBeGreaterThan(start)
  return requestDetail.slice(start, end)
}

describe('Google Calendar mutation single-flight boundary', () => {
  it('shares one synchronous lock across create, update, and delete', () => {
    expect(requestDetail).toContain(
      'const googleCalendarMutationInFlightRef = useRef(false)',
    )

    const handlers = [
      handlerBetween(
        'async function createGoogleCalendarEventInternal(forceCreate: boolean)',
        '\nasync function updateGoogleCalendarEvent()',
      ),
      handlerBetween(
        'async function updateGoogleCalendarEvent()',
        '\nasync function deleteGoogleCalendarEvent()',
      ),
      handlerBetween(
        'async function deleteGoogleCalendarEvent()',
        '\n  useEffect(() => {',
      ),
    ]

    for (const handler of handlers) {
      expect(handler).toContain('if (googleCalendarMutationInFlightRef.current) return')
      expect(handler).toContain('googleCalendarMutationInFlightRef.current = true')
      expect(handler).toContain('googleCalendarMutationInFlightRef.current = false')
    }
  })

  it('acquires before every Calendar route dispatch and releases in finally', () => {
    for (const [startMarker, endMarker, route] of [
      [
        'async function createGoogleCalendarEventInternal(forceCreate: boolean)',
        '\nasync function updateGoogleCalendarEvent()',
        "fetch('/api/google/calendar-event/create'",
      ],
      [
        'async function updateGoogleCalendarEvent()',
        '\nasync function deleteGoogleCalendarEvent()',
        "fetch('/api/google/calendar-event/update'",
      ],
      [
        'async function deleteGoogleCalendarEvent()',
        '\n  useEffect(() => {',
        "fetch('/api/google/calendar-event/delete'",
      ],
    ] as const) {
      const handler = handlerBetween(startMarker, endMarker)
      expect(handler.indexOf('googleCalendarMutationInFlightRef.current = true')).toBeLessThan(
        handler.indexOf(route),
      )
      expect(handler.indexOf('finally {')).toBeLessThan(
        handler.indexOf('googleCalendarMutationInFlightRef.current = false'),
      )
    }
  })

  it('keeps the existing request-bound payload and conflict override path', () => {
    expect(requestDetail).toContain(
      'return createGoogleCalendarEventInternal(true)',
    )
    expect(requestDetail).toContain(
      'JSON.stringify({ requestId: routeId, forceCreate })',
    )
    expect(requestDetail).toContain('JSON.stringify({ requestId: routeId })')
  })

  it('disables every visible mutation control while any operation is busy', () => {
    expect(calendarSection).toContain('const busy = creating || updating || deleting')
    expect(calendarSection).toContain('<div aria-busy={busy}>')
    expect(calendarSection).toContain('const createDisabled = busy')
    expect(calendarSection).toContain('const updateDisabled = busy')
    expect(calendarSection).toContain('const deleteDisabled = busy')
    expect(calendarSection).toContain('const forceCreateDisabled = busy')
  })

  it('documents immediate browser exclusion without claiming provider idempotency', () => {
    const evidence = read(
      'docs/GOOGLE_CALENDAR_MUTATION_SINGLE_FLIGHT_BOUNDARY_20260711.md',
    )

    for (const phrase of [
      'Google Calendar Mutation Single-Flight Boundary',
      'Create anyway',
      'selected active parish',
      'not provider-level idempotency',
      'No production',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
