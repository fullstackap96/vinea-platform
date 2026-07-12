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
  SACRAMENTAL_RECORD_ACTIVITY_SELECT,
  SACRAMENTAL_RECORD_DETAIL_SELECT,
  loadSacramentalRecordDetail,
} from '@/lib/server/loadSacramentalRecordDetail'
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

function createRecordDetailSupabaseMock(recordRow: Record<string, unknown> | null) {
  const calls: QueryCall[] = []

  function maybeSingleResponseFor(table: string) {
    if (table === 'sacramental_records') return { data: recordRow, error: null }
    if (table === 'people') {
      return {
        data: recordRow
          ? {
              id: 'person-1',
              parish_id: 'parish-a',
              first_name: 'Maria',
              middle_name: null,
              last_name: 'Santos',
            }
          : null,
        error: null,
      }
    }
    return { data: null, error: null }
  }

  function queryResponseFor(table: string) {
    if (table === 'sacramental_record_events') {
      return {
        data: recordRow
          ? [
              {
                id: 'event-1',
                parish_id: 'parish-a',
                sacramental_record_id: 'record-1',
                action: 'certificate_generated',
                actor_id: 'staff-1',
                actor_email: 'staff@example.com',
                metadata: {},
                created_at: '2026-07-01T00:00:00Z',
              },
            ]
          : [],
        error: null,
      }
    }
    if (table === 'people') {
      return {
        data: recordRow
          ? [
              {
                id: 'person-1',
                parish_id: 'parish-a',
                first_name: 'Maria',
                middle_name: null,
                last_name: 'Santos',
              },
            ]
          : [],
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
      order: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'order', args })
        return builder
      }),
      limit: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'limit', args })
        return builder
      }),
      maybeSingle: vi.fn(() => Promise.resolve(maybeSingleResponseFor(table))),
      then: vi.fn((resolve: (value: unknown) => void) => resolve(queryResponseFor(table))),
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

const safeRecordRow = {
  id: 'record-1',
  parish_id: 'parish-a',
  request_id: 'request-1',
  person_id: 'person-1',
  record_type: 'baptism',
  person_name: 'Maria Santos',
  sacrament_date: '2026-07-01',
  place: 'St. Isidore Parish',
  minister: 'Fr. Thomas',
  book: 'B-2026',
  page: '42',
  line: '7',
  notes: 'Safe test record',
  created_by: 'staff-1',
  updated_by: 'staff-1',
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
}

describe('loadSacramentalRecordDetail active parish scope', () => {
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

  it('loads a sacramental record and supporting data only inside the selected active parish', async () => {
    const { supabase, calls } = createRecordDetailSupabaseMock(safeRecordRow)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadSacramentalRecordDetail('record-1')

    expect(result.errorMessage).toBe('')
    expect(result.activeParishName).toBe('Safe Parish A')
    expect(result.record?.id).toBe('record-1')
    expect(result.hasCertificateEvent).toBe(true)
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-a',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          table: 'sacramental_records',
          method: 'select',
          args: [SACRAMENTAL_RECORD_DETAIL_SELECT],
        },
        { table: 'sacramental_records', method: 'eq', args: ['id', 'record-1'] },
        { table: 'sacramental_records', method: 'eq', args: ['parish_id', 'parish-a'] },
        { table: 'people', method: 'eq', args: ['id', 'person-1'] },
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-a'] },
        {
          table: 'sacramental_record_events',
          method: 'select',
          args: [SACRAMENTAL_RECORD_ACTIVITY_SELECT],
        },
        {
          table: 'sacramental_record_events',
          method: 'eq',
          args: ['sacramental_record_id', 'record-1'],
        },
        { table: 'sacramental_record_events', method: 'eq', args: ['parish_id', 'parish-a'] },
      ])
    )
    expect(SACRAMENTAL_RECORD_DETAIL_SELECT).toContain('notes')
    expect(SACRAMENTAL_RECORD_ACTIVITY_SELECT).toBe('id, action, actor_email, created_at')
    expect(SACRAMENTAL_RECORD_ACTIVITY_SELECT).not.toContain('metadata')
    expect(SACRAMENTAL_RECORD_ACTIVITY_SELECT).not.toContain('actor_id')
    expect(result.events[0]).toEqual({
      id: 'event-1',
      action: 'certificate_generated',
      actor_email: 'staff@example.com',
      created_at: '2026-07-01T00:00:00Z',
    })
  })

  it('returns a safe not-found message when the selected parish has no matching row', async () => {
    const { supabase } = createRecordDetailSupabaseMock(null)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadSacramentalRecordDetail('cross-parish-record')

    expect(result.record).toBeNull()
    expect(result.errorMessage).toBe('Record not found.')
    expect(result.activeParishName).toBe('Safe Parish A')
  })

  it('fails before querying when staff is not authenticated', async () => {
    const { supabase } = createRecordDetailSupabaseMock(safeRecordRow)
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await loadSacramentalRecordDetail('record-1')

    expect(result.errorMessage).toBe('Unauthorized')
    expect(result.record).toBeNull()
    expect(supabase.from).not.toHaveBeenCalled()
  })
})
