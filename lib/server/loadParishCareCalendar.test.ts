import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

vi.mock('@/lib/dashboard/loadDashboardRequests', () => ({
  loadDashboardRequests: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/server/activeStaffParishContext', async () => {
  const actual = await vi.importActual<typeof import('@/lib/server/activeStaffParishContext')>(
    '@/lib/server/activeStaffParishContext'
  )
  return {
    ...actual,
    resolveActiveStaffParishContext: vi.fn(),
  }
})

import { cookies } from 'next/headers'

import { loadDashboardRequests } from '@/lib/dashboard/loadDashboardRequests'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  PARISH_CARE_CALENDAR_INTENTION_SELECT,
  loadParishCareCalendar,
} from './loadParishCareCalendar'

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const loadDashboardRequestsMock = vi.mocked(loadDashboardRequests)
const cookiesMock = vi.mocked(cookies)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)

beforeEach(() => {
  vi.clearAllMocks()
})

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

function createParishCareCalendarSupabaseMock() {
  const calls: QueryCall[] = []

  function builderFor(table: string) {
    const builder = {
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'select', args })
        return builder
      }),
      order: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'order', args })
        return builder
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'eq', args })
        return builder
      }),
      then: (resolve: (value: { data: never[]; error: null }) => void) =>
        Promise.resolve({ data: [], error: null }).then(resolve),
    }

    return builder
  }

  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'staff@example.com' } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => builderFor(table)),
  }

  return { supabase, calls }
}

function cookieStore(value: string | null) {
  return {
    get: vi.fn((name: string) =>
      name === ACTIVE_STAFF_PARISH_COOKIE && value ? { name, value } : undefined
    ),
  }
}

describe('loadParishCareCalendar active parish context', () => {
  it('passes the validated active parish id to dashboard request loading and mass intentions filtering', async () => {
    const { supabase, calls } = createParishCareCalendarSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    loadDashboardRequestsMock.mockResolvedValueOnce({
      ok: true,
      requests: [],
      softWarnings: [],
    })
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

    const result = await loadParishCareCalendar()

    expect(result).toEqual({
      items: [],
      errorMessage: '',
      softWarnings: [],
      activeParishName: 'Beta Parish',
    })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
    })
    expect(loadDashboardRequestsMock).toHaveBeenCalledWith(supabase, {
      activeParishId: 'parish-2',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          table: 'mass_intentions',
          method: 'select',
          args: [PARISH_CARE_CALENDAR_INTENTION_SELECT],
        },
        { table: 'mass_intentions', method: 'eq', args: ['parish_id', 'parish-2'] },
      ])
    )
    expect(PARISH_CARE_CALENDAR_INTENTION_SELECT).not.toContain('notes')
    expect(PARISH_CARE_CALENDAR_INTENTION_SELECT).not.toContain('stipend_received')
    expect(PARISH_CARE_CALENDAR_INTENTION_SELECT).not.toContain('created_at')
    expect(PARISH_CARE_CALENDAR_INTENTION_SELECT).not.toContain('*')
  })

  it('uses the resolver fallback parish when a stale cookie is ignored', async () => {
    const { supabase, calls } = createParishCareCalendarSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-999') as never)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-999',
      ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
    })
    loadDashboardRequestsMock.mockResolvedValueOnce({
      ok: true,
      requests: [],
      softWarnings: [],
    })

    const result = await loadParishCareCalendar()

    expect(result).toEqual({
      items: [],
      errorMessage: '',
      softWarnings: [],
      activeParishName: 'Alpha Parish',
    })
    expect(loadDashboardRequestsMock).toHaveBeenCalledWith(supabase, {
      activeParishId: 'parish-1',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'mass_intentions', method: 'eq', args: ['parish_id', 'parish-1'] },
      ])
    )
  })

  it('returns a context error before loading dashboard requests when active parish context fails', async () => {
    const { supabase } = createParishCareCalendarSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore(null) as never)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'Could not resolve parish context.',
      technicalDetail: 'primary_parish_id failed',
      requestedParishId: null,
    })

    const result = await loadParishCareCalendar()

    expect(result).toEqual({
      items: [],
      errorMessage: 'Could not resolve parish context.',
      softWarnings: [],
      activeParishName: null,
    })
    expect(loadDashboardRequestsMock).not.toHaveBeenCalled()
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
