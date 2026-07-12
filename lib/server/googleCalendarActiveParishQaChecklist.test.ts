import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const checklistPath = join(
  process.cwd(),
  'docs',
  'GOOGLE_CALENDAR_ACTIVE_PARISH_QA_CHECKLIST_20260627.md'
)

const routePaths = {
  create: join(process.cwd(), 'app', 'api', 'google', 'calendar-event', 'create', 'route.ts'),
  update: join(process.cwd(), 'app', 'api', 'google', 'calendar-event', 'update', 'route.ts'),
  delete: join(process.cwd(), 'app', 'api', 'google', 'calendar-event', 'delete', 'route.ts'),
} as const

function expectBefore(source: string, earlier: string, later: string) {
  const earlierIndex = source.indexOf(earlier)
  const laterIndex = source.indexOf(later)

  expect(earlierIndex, `Expected to find ${earlier}`).toBeGreaterThanOrEqual(0)
  expect(laterIndex, `Expected to find ${later}`).toBeGreaterThanOrEqual(0)
  expect(earlierIndex, `Expected ${earlier} before ${later}`).toBeLessThan(laterIndex)
}

function routeSource(routeName: keyof typeof routePaths) {
  return readFileSync(routePaths[routeName], 'utf8')
}

describe('Google Calendar active-parish QA checklist and route guards', () => {
  it('documents the approved manual QA cases and safety boundaries', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      'Status: Manual QA checklist and source-level guard plan only.',
      'Do not access production',
      'Do not apply migrations',
      'Do not change operational RLS',
      'Use only safe QA or local test credentials.',
      'Use only a non-production Google Calendar',
      'Do not leave stale Google Calendar test events after the run.',
      'QA staff account',
      'Active parish A',
      'Active parish B',
      'Same-parish request',
      'Cross-parish request',
      'Mismatched calendar request',
      'Create Event With Selected Parish',
      'Update Event With Selected Parish',
      'Delete Event With Selected Parish',
      'Cross-Parish Request Denial',
      'Stale Or Forged Active Parish Cookie',
      'No Active Parish Cookie Legacy Fallback',
      'Mismatched Stored Calendar Id',
      'Conflict Checks Stay Parish-Scoped',
      'Delete Google 404 Tolerance',
      'Not Connected Parish Behavior',
      'No stale Google Calendar QA event remains.',
    ]) {
      expect(checklist).toContain(required)
    }
  })

  it('requires the source-level guard criteria for create, update, and delete routes', () => {
    const checklist = readFileSync(checklistPath, 'utf8')

    for (const required of [
      'require `requireStaffFromRequest` before body parsing',
      'read `ACTIVE_STAFF_PARISH_COOKIE`',
      'call `resolveActiveStaffParishContext`',
      'load the request only after active parish context is resolved',
      'check `parishionerMatchesParish` before loading the Google Calendar integration',
      'call `loadParishGoogleCalendarIntegration(parishContext.activeParishId)`',
      'require `usable.parishId === parishContext.activeParishId`',
      'create the Google Calendar client only after selected-parish integration and request ownership checks pass',
      'avoid `createSupabaseRouteHandlerClient`',
      'avoid changing operational RLS',
    ]) {
      expect(checklist).toContain(required)
    }
  })

  it('keeps all Google Calendar event mutation routes behind staff auth and active parish context', () => {
    for (const routeName of Object.keys(routePaths) as Array<keyof typeof routePaths>) {
      const source = routeSource(routeName)

      expect(source).toContain('requireStaffFromRequest')
      expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
      expect(source).toContain('resolveActiveStaffParishContext')
      expect(source).toContain('activeParishCookie(request)')
      expect(source).toContain('parishContext.activeParishId')
      expect(source).toContain('parishionerMatchesParish')
      expect(source).toContain('loadParishGoogleCalendarIntegration(')
      expect(source).toContain('resolveUsableParishGoogleCalendar')
      expect(source).toContain('usable.parishId !== parishContext.activeParishId')
      expect(source).toContain('getGoogleCalendarClient')
      expect(source).not.toContain('createSupabaseRouteHandlerClient')

      expectBefore(
        source,
        'const staff = await requireStaffFromRequest(request)',
        'const parsedBody = await readBoundedJsonBody'
      )
      expectBefore(
        source,
        `const parishContext = await resolveGoogleCalendar${routeName[0].toUpperCase()}${routeName.slice(
          1
        )}ParishContext`,
        "const { data: reqRow"
      )
      expectBefore(
        source,
        'if (!parishionerMatchesParish',
        'const integration = await loadParishGoogleCalendarIntegration'
      )
      expectBefore(
        source,
        'const integration = await loadParishGoogleCalendarIntegration',
        'const calendar = getGoogleCalendarClient'
      )
    }
  })

  it('keeps create-specific Google mutations parish-scoped and after conflict checks', () => {
    const source = routeSource('create')

    expect(source).toContain('calendarId: usable.calendarId')
    expect(source).toContain('listParishGoogleCalendarConflicts')
    expect(source).toContain('await calendar.events.insert')
    expect(source).toContain('google_calendar_id: usable.calendarId')

    expectBefore(source, 'const integration = await loadParishGoogleCalendarIntegration', 'const built = await buildCalendarEventFromRequest')
    expectBefore(source, 'const calendar = getGoogleCalendarClient', 'const conflicts = await listParishGoogleCalendarConflicts')
    expectBefore(source, 'const conflicts = await listParishGoogleCalendarConflicts', 'const insertRes = await calendar.events.insert')
    expectBefore(source, 'const insertRes = await calendar.events.insert', 'google_calendar_id: usable.calendarId')
  })

  it('keeps update-specific Google mutations selected-calendar scoped', () => {
    const source = routeSource('update')

    expect(source).toContain('requestCalendarMatchesSelectedIntegration')
    expect(source).toContain('const calendarId = usable.calendarId')
    expect(source).toContain('calendarId,')
    expect(source).toContain('await calendar.events.patch')
    expect(source).toContain('google_calendar_id: calendarId')

    expectBefore(source, 'if (!requestCalendarMatchesSelectedIntegration', 'const calendarId = usable.calendarId')
    expectBefore(source, 'const calendar = getGoogleCalendarClient', 'const conflicts = await listParishGoogleCalendarConflicts')
    expectBefore(source, 'const conflicts = await listParishGoogleCalendarConflicts', 'const patchRes = await calendar.events.patch')
    expectBefore(source, 'const patchRes = await calendar.events.patch', 'google_calendar_id: calendarId')
  })

  it('keeps delete-specific Google mutation and cleanup selected-calendar scoped', () => {
    const source = routeSource('delete')

    expect(source).toContain('requestCalendarMatchesSelectedIntegration')
    expect(source).toContain('const calendarId = usable.calendarId')
    expect(source).toContain('await calendar.events.delete')
    expect(source).toContain('isNotFoundGoogleError')
    expect(source).toContain('google_calendar_event_id: null')
    expect(source).toContain('google_calendar_id: null')
    expect(source).toContain('google_calendar_event_html_link: null')

    expectBefore(source, 'if (!requestCalendarMatchesSelectedIntegration', 'const calendarId = usable.calendarId')
    expectBefore(source, 'const calendar = getGoogleCalendarClient', 'await calendar.events.delete')
    expectBefore(source, 'await calendar.events.delete', '.update({')
  })
})
