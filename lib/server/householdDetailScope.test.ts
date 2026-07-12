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
  HOUSEHOLD_DETAIL_SELECT,
  loadHouseholdDetail,
} from '@/lib/server/loadHouseholdDetail'
import { SACRAMENTAL_RECORD_SUMMARY_SELECT } from '@/lib/server/sacramentalRecordReadProjections'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const cookiesMock = vi.mocked(cookies)

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

function cookieStore(value: string | null) {
  return {
    get: vi.fn((name: string) =>
      name === ACTIVE_STAFF_PARISH_COOKIE && value ? { name, value } : undefined
    ),
  }
}

function createHouseholdDetailSupabaseMock(householdRow: Record<string, unknown> | null) {
  const calls: QueryCall[] = []

  function responseFor(table: string) {
    if (table === 'households') return { data: householdRow, error: null }
    if (table === 'household_members') {
      return {
        data: householdRow
          ? [
              {
                id: 'member-1',
                parish_id: 'parish-a',
                household_id: 'household-1',
                person_id: 'person-1',
                relationship: 'head',
                is_primary_contact: true,
                created_at: '2026-07-01T00:00:00Z',
                people: {
                  id: 'person-1',
                  parish_id: 'parish-a',
                  parishioner_id: 'parishioner-1',
                  first_name: 'Maria',
                  middle_name: null,
                  last_name: 'Santos',
                  email: 'maria@example.com',
                  phone: '555-0100',
                },
              },
            ]
          : [],
        error: null,
      }
    }
    if (table === 'people') {
      return {
        data: [
          {
            id: 'person-1',
            parish_id: 'parish-a',
            parishioner_id: 'parishioner-1',
            first_name: 'Maria',
            middle_name: null,
            last_name: 'Santos',
            email: 'maria@example.com',
            phone: '555-0100',
          },
        ],
        error: null,
      }
    }
    return { data: [], error: null }
  }

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
      in: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'in', args })
        return builder
      }),
      order: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'order', args })
        return builder
      }),
      maybeSingle: vi.fn(() => Promise.resolve(responseFor(table))),
      then: vi.fn((resolve: (value: unknown) => void) => resolve(responseFor(table))),
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

const safeHouseholdRow = {
  id: 'household-1',
  parish_id: 'parish-a',
  name: 'Santos Household',
  address: '123 Main St',
  city: 'Kansas City',
  state: 'MO',
  postal_code: '64108',
  notes: 'Safe test household',
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
}

describe('loadHouseholdDetail active parish scope', () => {
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

  it('loads a household and linked data only inside the selected active parish', async () => {
    const { supabase, calls } = createHouseholdDetailSupabaseMock(safeHouseholdRow)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadHouseholdDetail('household-1')

    expect(result.errorMessage).toBe('')
    expect(result.activeParishName).toBe('Safe Parish A')
    expect(result.household?.id).toBe('household-1')
    expect(result.members).toHaveLength(1)
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-a',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'households', method: 'select', args: [HOUSEHOLD_DETAIL_SELECT] },
        {
          table: 'sacramental_records',
          method: 'select',
          args: [SACRAMENTAL_RECORD_SUMMARY_SELECT],
        },
        { table: 'households', method: 'eq', args: ['id', 'household-1'] },
        { table: 'households', method: 'eq', args: ['parish_id', 'parish-a'] },
        { table: 'household_members', method: 'eq', args: ['parish_id', 'parish-a'] },
        { table: 'household_members', method: 'eq', args: ['people.parish_id', 'parish-a'] },
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-a'] },
        { table: 'requests', method: 'eq', args: ['parish_id', 'parish-a'] },
        { table: 'sacramental_records', method: 'eq', args: ['parish_id', 'parish-a'] },
      ])
    )
    expect(HOUSEHOLD_DETAIL_SELECT).not.toContain('*')
    expect(SACRAMENTAL_RECORD_SUMMARY_SELECT).not.toContain('notes')
    expect(SACRAMENTAL_RECORD_SUMMARY_SELECT).not.toContain('updated_at')
  })

  it('returns a safe not-found message when the selected parish has no matching row', async () => {
    const { supabase } = createHouseholdDetailSupabaseMock(null)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadHouseholdDetail('cross-parish-household')

    expect(result.household).toBeNull()
    expect(result.errorMessage).toBe('Household not found.')
    expect(result.activeParishName).toBe('Safe Parish A')
  })

  it('fails before querying when staff is not authenticated', async () => {
    const { supabase } = createHouseholdDetailSupabaseMock(safeHouseholdRow)
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadHouseholdDetail('household-1')

    expect(result.errorMessage).toBe('Unauthorized')
    expect(result.household).toBeNull()
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
