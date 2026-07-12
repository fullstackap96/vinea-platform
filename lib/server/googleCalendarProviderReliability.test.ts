import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  buildDeterministicGoogleCalendarEventId,
  createGoogleCalendarProviderOptions,
  GOOGLE_CALENDAR_PROVIDER_TIMEOUT_MS,
  isGoogleCalendarAlreadyExistsError,
  recoveredGoogleCalendarEventMatches,
} from '@/lib/server/googleCalendarProviderReliability'

const createRoutePath = join(
  process.cwd(),
  'app',
  'api',
  'google',
  'calendar-event',
  'create',
  'route.ts'
)
const updateRoutePath = join(
  process.cwd(),
  'app',
  'api',
  'google',
  'calendar-event',
  'update',
  'route.ts'
)
const deleteRoutePath = join(
  process.cwd(),
  'app',
  'api',
  'google',
  'calendar-event',
  'delete',
  'route.ts'
)
const calendarServerPath = join(process.cwd(), 'lib', 'parishGoogleCalendarServer.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_PROVIDER_RELIABILITY_20260712.md'
)

function expectBefore(source: string, earlier: string, later: string) {
  const earlierIndex = source.indexOf(earlier)
  const laterIndex = source.indexOf(later)
  expect(earlierIndex).toBeGreaterThanOrEqual(0)
  expect(laterIndex).toBeGreaterThanOrEqual(0)
  expect(earlierIndex).toBeLessThan(laterIndex)
}

describe('Google Calendar provider reliability', () => {
  it('builds a stable opaque Google-compatible event id per parish and request', () => {
    const first = buildDeterministicGoogleCalendarEventId({
      parishId: 'parish-private-id',
      requestId: 'request-private-id',
    })
    const retry = buildDeterministicGoogleCalendarEventId({
      parishId: 'parish-private-id',
      requestId: 'request-private-id',
    })

    expect(first).toBe(retry)
    expect(first).toMatch(/^vinea[0-9a-f]{64}$/)
    expect(first).not.toContain('parish-private-id')
    expect(first).not.toContain('request-private-id')
    expect(
      buildDeterministicGoogleCalendarEventId({
        parishId: 'another-parish',
        requestId: 'request-private-id',
      })
    ).not.toBe(first)
    expect(
      buildDeterministicGoogleCalendarEventId({
        parishId: 'parish-private-id',
        requestId: 'another-request',
      })
    ).not.toBe(first)
  })

  it('rejects incomplete identity inputs', () => {
    expect(() =>
      buildDeterministicGoogleCalendarEventId({ parishId: ' ', requestId: 'request-1' })
    ).toThrow('requires parish and request ids')
    expect(() =>
      buildDeterministicGoogleCalendarEventId({ parishId: 'parish-1', requestId: '' })
    ).toThrow('requires parish and request ids')
  })

  it('creates a bounded provider signal and rejects invalid deadlines', () => {
    const options = createGoogleCalendarProviderOptions(25)

    expect(GOOGLE_CALENDAR_PROVIDER_TIMEOUT_MS).toBe(15_000)
    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(options.signal.aborted).toBe(false)
    expect(() => createGoogleCalendarProviderOptions(0)).toThrow('positive finite number')
    expect(() => createGoogleCalendarProviderOptions(Number.NaN)).toThrow(
      'positive finite number'
    )
  })

  it('recognizes only provider already-exists conflicts', () => {
    expect(isGoogleCalendarAlreadyExistsError({ response: { status: 409 } })).toBe(true)
    expect(isGoogleCalendarAlreadyExistsError({ code: 409 })).toBe(true)
    expect(isGoogleCalendarAlreadyExistsError({ code: '409' })).toBe(true)
    expect(isGoogleCalendarAlreadyExistsError({ response: { status: 403 } })).toBe(false)
  })

  it('accepts recovery only for the expected id, summary, and time window', () => {
    const expected = {
      eventId: 'vineaaabbcc',
      summary: 'Baptism preparation meeting',
      start: new Date('2026-07-12T15:00:00.000Z'),
      end: new Date('2026-07-12T16:00:00.000Z'),
    }
    const event = {
      id: expected.eventId,
      summary: expected.summary,
      start: { dateTime: '2026-07-12T10:00:00-05:00' },
      end: { dateTime: '2026-07-12T11:00:00-05:00' },
    }

    expect(recoveredGoogleCalendarEventMatches(event, expected)).toBe(true)
    expect(recoveredGoogleCalendarEventMatches({ ...event, id: 'different' }, expected)).toBe(
      false
    )
    expect(
      recoveredGoogleCalendarEventMatches({ ...event, summary: 'Different event' }, expected)
    ).toBe(false)
    expect(
      recoveredGoogleCalendarEventMatches(
        { ...event, start: { dateTime: '2026-07-12T15:01:00.000Z' } },
        expected
      )
    ).toBe(false)
  })

  it('keeps create retry recovery scoped and before request linkage persistence', () => {
    const source = readFileSync(createRoutePath, 'utf8')

    expect(source).toContain('const deterministicEventId = buildDeterministicGoogleCalendarEventId')
    expect(source).toContain('ignoreEventId: deterministicEventId')
    expect(source).toContain('id: deterministicEventId')
    expect(source).toContain('isGoogleCalendarAlreadyExistsError(error)')
    expect(source).toContain('const recovered = await calendar.events.get')
    expect(source).toContain('recoveredGoogleCalendarEventMatches(recovered.data')
    expect(source).toContain('createGoogleCalendarProviderOptions()')
    expectBefore(source, 'if (!parishionerMatchesParish', 'const deterministicEventId')
    expectBefore(source, 'id: deterministicEventId', 'const insertRes = await calendar.events.insert')
    expectBefore(source, 'recoveredGoogleCalendarEventMatches(recovered.data', '.update({')
    expectBefore(source, 'const eventId = calendarEvent.id || null', '.update({')
  })

  it('bounds every Calendar list, create, recovery, update, and delete provider call', () => {
    const createSource = readFileSync(createRoutePath, 'utf8')
    const updateSource = readFileSync(updateRoutePath, 'utf8')
    const deleteSource = readFileSync(deleteRoutePath, 'utf8')
    const serverSource = readFileSync(calendarServerPath, 'utf8')

    expect(createSource).toMatch(
      /calendar\.events\.insert\([\s\S]*?createGoogleCalendarProviderOptions\(\)[\s\S]*?\)/
    )
    expect(createSource).toMatch(
      /calendar\.events\.get\([\s\S]*?createGoogleCalendarProviderOptions\(\)[\s\S]*?\)/
    )
    expect(updateSource).toMatch(
      /calendar\.events\.patch\([\s\S]*?createGoogleCalendarProviderOptions\(\)[\s\S]*?\)/
    )
    expect(deleteSource).toMatch(
      /calendar\.events\.delete\([\s\S]*?createGoogleCalendarProviderOptions\(\)[\s\S]*?\)/
    )
    expect(serverSource).toMatch(
      /calendar\.events\.list\([\s\S]*?createGoogleCalendarProviderOptions\(\)[\s\S]*?\)/
    )
  })

  it('documents the constrained technical approval and live-provider limitation', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('# Google Calendar Provider Reliability - 2026-07-12')
    expect(evidence).toContain('**Approval decision:** `Approved with constraints`')
    expect(evidence).toContain('Live provider retry recovery remains')
    expect(evidence).toContain('no Google Calendar request or production access')
    expect(evidence).toContain('Production accessed: `NO`')
    expect(evidence).toContain('Google Calendar or OAuth called: `NO`')
  })
})
