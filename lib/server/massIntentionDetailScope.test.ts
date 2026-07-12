import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
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

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import {
  MASS_INTENTION_DETAIL_SELECT,
  loadMassIntentionDetail,
} from '@/lib/server/loadMassIntentionDetail'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const cookiesMock = vi.mocked(cookies)

function cookieStore(value: string | null) {
  return {
    get: vi.fn((name: string) =>
      name === ACTIVE_STAFF_PARISH_COOKIE && value ? { name, value } : undefined
    ),
  }
}

function createDetailSupabaseMock(row: Record<string, unknown> | null) {
  const calls: { method: string; args: unknown[] }[] = []
  const builder = {
    select: vi.fn((...args: unknown[]) => {
      calls.push({ method: 'select', args })
      return builder
    }),
    eq: vi.fn((...args: unknown[]) => {
      calls.push({ method: 'eq', args })
      return builder
    }),
    maybeSingle: vi.fn(() => Promise.resolve({ data: row, error: null })),
  }
  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'staff-1' } },
        error: null,
      }),
    },
    from: vi.fn(() => builder),
  }

  return { supabase, calls }
}

const safeMassIntentionRow = {
  id: 'intention-1',
  parish_id: 'parish-a',
  requester_name: 'Maria Santos',
  intention_text: 'For the repose of John Santos',
  requested_date: '2026-07-01',
  assigned_mass_date: '2026-07-15',
  assigned_priest_name: 'Fr. Thomas',
  stipend_received: true,
  is_fulfilled: false,
  notes: 'Safe test intention',
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
}

describe('loadMassIntentionDetail active parish scope', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore('parish-a') as never)
    resolveActiveStaffParishContextMock.mockResolvedValue({
      ok: true,
      source: 'membership',
      parishIds: ['parish-a', 'parish-b'],
      primaryParishId: 'parish-a',
      activeParishId: 'parish-a',
      activeParish: { id: 'parish-a', name: 'Safe Parish A' },
      parishes: [
        { id: 'parish-a', name: 'Safe Parish A' },
        { id: 'parish-b', name: 'Safe Parish B' },
      ],
      requestedParishId: 'parish-a',
    })
  })

  it('loads a Mass intention only inside the selected active parish', async () => {
    const { supabase, calls } = createDetailSupabaseMock(safeMassIntentionRow)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadMassIntentionDetail('intention-1')

    expect(result.errorMessage).toBe('')
    expect(result.activeParishName).toBe('Safe Parish A')
    expect(result.intention?.id).toBe('intention-1')
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-a',
    })
    expect(supabase.from).toHaveBeenCalledWith('mass_intentions')
    expect(calls).toEqual(
      expect.arrayContaining([
        { method: 'select', args: [MASS_INTENTION_DETAIL_SELECT] },
        { method: 'eq', args: ['id', 'intention-1'] },
        { method: 'eq', args: ['parish_id', 'parish-a'] },
      ])
    )
    expect(MASS_INTENTION_DETAIL_SELECT).not.toContain('*')
    expect(MASS_INTENTION_DETAIL_SELECT).toContain('notes')
  })

  it('returns a safe not-found message when the selected parish has no matching row', async () => {
    const { supabase } = createDetailSupabaseMock(null)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadMassIntentionDetail('cross-parish-intention')

    expect(result).toEqual({
      intention: null,
      errorMessage: 'Intention not found.',
      activeParishName: 'Safe Parish A',
    })
  })

  it('fails before querying when staff is not authenticated', async () => {
    const { supabase } = createDetailSupabaseMock(safeMassIntentionRow)
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadMassIntentionDetail('intention-1')

    expect(result).toEqual({ intention: null, errorMessage: 'Unauthorized', activeParishName: null })
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
