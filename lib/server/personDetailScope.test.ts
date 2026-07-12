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
import { PERSON_DETAIL_SELECT, loadPersonDetail } from '@/lib/server/loadPersonDetail'
import { SACRAMENTAL_RECORD_SUMMARY_SELECT } from '@/lib/server/sacramentalRecordReadProjections'
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

function createPersonDetailSupabaseMock(personRow: Record<string, unknown> | null) {
  const calls: { table: string; method: string; args: unknown[] }[] = []

  function builderFor(table: string) {
    const builder = {
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'select', args })
        return builder
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'eq', args })
        return builder
      }),
      order: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'order', args })
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
      maybeSingle: vi.fn(() => Promise.resolve({ data: personRow, error: null })),
    }

    return builder
  }

  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'staff-1' } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => builderFor(table)),
  }

  return { supabase, calls }
}

const safePersonRow = {
  id: 'person-1',
  parish_id: 'parish-a',
  parishioner_id: 'parishioner-1',
  first_name: 'Maria',
  middle_name: null,
  last_name: 'Santos',
  email: 'maria@example.com',
  phone: '555-0100',
  date_of_birth: '1990-01-01',
  notes: 'Safe test person',
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
}

describe('loadPersonDetail active parish scope', () => {
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

  it('loads a person only inside the selected active parish', async () => {
    const { supabase, calls } = createPersonDetailSupabaseMock(safePersonRow)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadPersonDetail('person-1')

    expect(result.errorMessage).toBe('')
    expect(result.activeParishName).toBe('Safe Parish A')
    expect(result.person?.id).toBe('person-1')
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-a',
    })
    expect(supabase.from).toHaveBeenCalledWith('people')
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'select', args: [PERSON_DETAIL_SELECT] },
        {
          table: 'sacramental_records',
          method: 'select',
          args: [SACRAMENTAL_RECORD_SUMMARY_SELECT],
        },
        { table: 'people', method: 'eq', args: ['id', 'person-1'] },
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-a'] },
        { table: 'sacramental_records', method: 'eq', args: ['parish_id', 'parish-a'] },
        { table: 'requests', method: 'eq', args: ['parish_id', 'parish-a'] },
      ])
    )
    expect(PERSON_DETAIL_SELECT).not.toContain('*')
    expect(SACRAMENTAL_RECORD_SUMMARY_SELECT).not.toContain('notes')
    expect(SACRAMENTAL_RECORD_SUMMARY_SELECT).not.toContain('created_by')
  })

  it('returns a safe not-found message when the selected parish has no matching row', async () => {
    const { supabase } = createPersonDetailSupabaseMock(null)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadPersonDetail('cross-parish-person')

    expect(result.person).toBeNull()
    expect(result.errorMessage).toBe('Person not found.')
    expect(result.activeParishName).toBe('Safe Parish A')
  })

  it('fails before querying when staff is not authenticated', async () => {
    const { supabase } = createPersonDetailSupabaseMock(safePersonRow)
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadPersonDetail('person-1')

    expect(result.errorMessage).toBe('Unauthorized')
    expect(result.person).toBeNull()
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
