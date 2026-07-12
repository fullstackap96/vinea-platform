import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/dashboard/loadDashboardRequests', () => ({
  loadDashboardRequests: vi.fn(),
}))

vi.mock('@/lib/relationshipIntelligence/loadDashboardIntelligence', () => ({
  loadDashboardSuggestedActions: vi.fn(),
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
import { loadDashboardSuggestedActions } from '@/lib/relationshipIntelligence/loadDashboardIntelligence'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { loadNotificationsCenter } from './loadNotificationsCenter'

const cookiesMock = vi.mocked(cookies)
const loadDashboardRequestsMock = vi.mocked(loadDashboardRequests)
const loadDashboardSuggestedActionsMock = vi.mocked(loadDashboardSuggestedActions)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)

beforeEach(() => {
  vi.clearAllMocks()
})

function cookieStore(value: string | null) {
  return {
    get: vi.fn((name: string) =>
      name === ACTIVE_STAFF_PARISH_COOKIE && value ? { name, value } : undefined
    ),
  }
}

function createSupabaseMock() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'staff@example.com' } },
        error: null,
      }),
    },
  }
}

describe('loadNotificationsCenter active parish context', () => {
  it('passes the validated active parish id to dashboard request loading', async () => {
    const supabase = createSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
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
    loadDashboardRequestsMock.mockResolvedValueOnce({
      ok: true,
      requests: [],
      softWarnings: [],
    })
    loadDashboardSuggestedActionsMock.mockResolvedValueOnce([])

    const result = await loadNotificationsCenter(supabase as never)

    expect(result.errorMessage).toBe('')
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
    })
    expect(loadDashboardRequestsMock).toHaveBeenCalledWith(supabase, {
      activeParishId: 'parish-2',
    })
  })

  it('uses the resolver fallback parish when a stale cookie is ignored', async () => {
    const supabase = createSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-999') as never)
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
    loadDashboardSuggestedActionsMock.mockResolvedValueOnce([])

    const result = await loadNotificationsCenter(supabase as never)

    expect(result.errorMessage).toBe('')
    expect(loadDashboardRequestsMock).toHaveBeenCalledWith(supabase, {
      activeParishId: 'parish-1',
    })
  })

  it('returns a context error before loading dashboard requests when active parish context fails', async () => {
    const supabase = createSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore(null) as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'Could not resolve parish context.',
      technicalDetail: 'primary_parish_id failed',
      requestedParishId: null,
    })

    const result = await loadNotificationsCenter(supabase as never)

    expect(result).toMatchObject({
      totalCount: 0,
      visible: [],
      errorMessage: 'Could not resolve parish context.',
    })
    expect(loadDashboardRequestsMock).not.toHaveBeenCalled()
  })
})
