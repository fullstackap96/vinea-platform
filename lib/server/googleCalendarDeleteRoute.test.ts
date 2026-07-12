import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: vi.fn(),
}))

import { googleCalendarDeleteRouteTestInternals } from '@/app/api/google/calendar-event/delete/route'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const routePath = join(process.cwd(), 'app', 'api', 'google', 'calendar-event', 'delete', 'route.ts')

function expectBefore(source: string, earlier: string, later: string) {
  const earlierIndex = source.indexOf(earlier)
  const laterIndex = source.indexOf(later)
  expect(earlierIndex).toBeGreaterThanOrEqual(0)
  expect(laterIndex).toBeGreaterThanOrEqual(0)
  expect(earlierIndex).toBeLessThan(laterIndex)
}

describe('Google Calendar delete route parish context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses resolved primary parish context when no active parish cookie exists', async () => {
    const supabase = { rpc: vi.fn(), from: vi.fn() }
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: null,
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result =
      await googleCalendarDeleteRouteTestInternals.resolveGoogleCalendarDeleteParishContext(
        supabase as never,
        null
      )

    expect(result).toMatchObject({
      ok: true,
      source: 'primary_parish_fallback',
      activeParishId: 'parish-1',
    })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
    })
  })

  it('honors an active parish cookie only when membership validates the exact parish', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1', 'parish-2'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-2',
      activeParish: { id: 'parish-2', name: 'Beta Parish' },
      parishes: [
        { id: 'parish-1', name: 'Alpha Parish' },
        { id: 'parish-2', name: 'Beta Parish' },
      ],
      requestedParishId: 'parish-2',
    })

    const result =
      await googleCalendarDeleteRouteTestInternals.resolveGoogleCalendarDeleteParishContext(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-2'
      )

    expect(result).toMatchObject({
      ok: true,
      source: 'membership',
      activeParishId: 'parish-2',
      requestedParishId: 'parish-2',
    })
  })

  it('fails closed when an active parish cookie is unauthorized', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-2',
      ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
    })

    const result =
      await googleCalendarDeleteRouteTestInternals.resolveGoogleCalendarDeleteParishContext(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-2'
      )

    expect(result).toEqual({
      ok: false,
      source: 'membership',
      error: 'You are not authorized to remove Google Calendar events for this parish.',
      technicalDetail: 'Requested parish is not authorized for this staff session.',
      requestedParishId: 'parish-2',
    })
  })

  it('requires membership-backed authorization when an active parish cookie exists', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-1',
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result =
      await googleCalendarDeleteRouteTestInternals.resolveGoogleCalendarDeleteParishContext(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-1'
      )

    expect(result).toEqual({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'You are not authorized to remove Google Calendar events for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId: 'parish-1',
    })
  })

  it('checks request parish ownership through the parishioner row', () => {
    expect(
      googleCalendarDeleteRouteTestInternals.parishionerMatchesParish(
        { parish_id: 'parish-2' },
        'parish-2'
      )
    ).toBe(true)
    expect(
      googleCalendarDeleteRouteTestInternals.parishionerMatchesParish(
        { parish_id: 'parish-1' },
        'parish-2'
      )
    ).toBe(false)
  })

  it('allows only blank or selected-parish calendar ids on linked requests', () => {
    expect(
      googleCalendarDeleteRouteTestInternals.requestCalendarMatchesSelectedIntegration(
        { google_calendar_id: 'calendar-2' },
        'calendar-2'
      )
    ).toBe(true)
    expect(
      googleCalendarDeleteRouteTestInternals.requestCalendarMatchesSelectedIntegration(
        { google_calendar_id: null },
        'calendar-2'
      )
    ).toBe(true)
    expect(
      googleCalendarDeleteRouteTestInternals.requestCalendarMatchesSelectedIntegration(
        { google_calendar_id: 'calendar-1' },
        'calendar-2'
      )
    ).toBe(false)
  })

  it('preserves existing Google not-found tolerance', () => {
    expect(googleCalendarDeleteRouteTestInternals.isNotFoundGoogleError({ code: 404 })).toBe(true)
    expect(
      googleCalendarDeleteRouteTestInternals.isNotFoundGoogleError({
        response: { status: 404 },
      })
    ).toBe(true)
    expect(googleCalendarDeleteRouteTestInternals.isNotFoundGoogleError({ code: 403 })).toBe(false)
  })

  it('keeps Google deletion and field clearing behind staff auth, active parish scope, request scope, and selected integration', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain('requireStaffFromRequest')
    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('parishionerMatchesParish')
    expect(source).toContain('requestCalendarMatchesSelectedIntegration')
    expect(source).toContain('loadParishGoogleCalendarIntegration(')
    expect(source).toContain('parishContext.activeParishId')
    expect(source).toContain('createGoogleCalendarProviderOptions')
    expect(source).not.toContain('createSupabaseRouteHandlerClient')

    expectBefore(source, 'const staff = await requireStaffFromRequest(request)', 'const parsedBody = await readBoundedJsonBody')
    expectBefore(source, 'const parishContext = await resolveGoogleCalendarDeleteParishContext', "const { data: reqRow")
    expectBefore(source, 'if (!parishionerMatchesParish', 'const integration = await loadParishGoogleCalendarIntegration')
    expectBefore(source, 'const integration = await loadParishGoogleCalendarIntegration', 'const calendarId = usable.calendarId')
    expectBefore(source, 'if (!requestCalendarMatchesSelectedIntegration', 'const calendarId = usable.calendarId')
    expectBefore(source, 'const calendar = getGoogleCalendarClient', 'await calendar.events.delete')
    expectBefore(source, 'await calendar.events.delete', '.update({')
  })

  it('logs unexpected delete failures through the shared safe logger', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('function logGoogleCalendarDeleteEventError')
    expect(source).toContain("logServerError('[google-calendar-delete-event] unexpected failure', error")
    expect(source).toContain("route: '/api/google/calendar-event/delete'")
    expect(source).toContain('hasParishId: Boolean(parishId)')
    expect(source).not.toContain('console.error')
    expect(source).not.toContain('GOOGLE CALENDAR DELETE EVENT ERROR (technical):')
    expect(source).not.toContain('serializeGoogleCalendarErrorForLogs')
  })
})
