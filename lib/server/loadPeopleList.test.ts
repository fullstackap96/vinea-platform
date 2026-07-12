import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
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

import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PEOPLE_LIST_SELECT, loadPeopleList } from './loadPeopleList'

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const cookiesMock = vi.mocked(cookies)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

function createPeopleSupabaseMock() {
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
      or: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'or', args })
        return builder
      }),
      in: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'in', args })
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

describe('loadPeopleList active parish context', () => {
  it('uses the validated active parish context for the people parish filter', async () => {
    const { supabase, calls } = createPeopleSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
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

    const result = await loadPeopleList({ q: 'Maria' })

    expect(result).toEqual({
      people: [],
      errorMessage: '',
      searchQuery: 'Maria',
      activeParishName: 'Beta Parish',
    })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'select', args: [PEOPLE_LIST_SELECT] },
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-2'] },
        {
          table: 'people',
          method: 'or',
          args: [
            [
              'first_name.ilike.%Maria%',
              'last_name.ilike.%Maria%',
              'email.ilike.%Maria%',
              'phone.ilike.%Maria%',
            ].join(','),
          ],
        },
      ])
    )
    expect(PEOPLE_LIST_SELECT).not.toContain('date_of_birth')
    expect(PEOPLE_LIST_SELECT).not.toContain('notes')
    expect(PEOPLE_LIST_SELECT).not.toContain('parishioner_id')
    expect(PEOPLE_LIST_SELECT).not.toContain('*')
  })

  it('falls back to the resolver active parish when a stale cookie is ignored', async () => {
    const { supabase, calls } = createPeopleSupabaseMock()
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

    const result = await loadPeopleList({})

    expect(result).toEqual({
      people: [],
      errorMessage: '',
      searchQuery: '',
      activeParishName: 'Alpha Parish',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-1'] },
      ])
    )
  })

  it('returns a context error before querying people when active parish context fails', async () => {
    const { supabase } = createPeopleSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore(null) as never)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'Could not resolve parish context.',
      technicalDetail: 'primary_parish_id failed',
      requestedParishId: null,
    })

    const result = await loadPeopleList({ q: 'Maria' })

    expect(result).toEqual({
      people: [],
      errorMessage: 'Could not resolve parish context.',
      searchQuery: 'Maria',
      activeParishName: null,
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
