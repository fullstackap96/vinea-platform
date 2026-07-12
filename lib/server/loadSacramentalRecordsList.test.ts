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
import { EMPTY_SACRAMENTAL_RECORDS_CONTINUITY_SUMMARY } from '@/lib/sacramentalRecordsContinuitySummary'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  SACRAMENTAL_RECORD_LIST_SELECT,
  loadSacramentalRecordsList,
} from './loadSacramentalRecordsList'

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const cookiesMock = vi.mocked(cookies)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

type QueryResult = {
  data: Record<string, unknown>[]
  error: { message?: string; code?: string } | null
}

function createRecordsSupabaseMock(resultsByTable: Record<string, QueryResult[]> = {}) {
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
      ilike: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'ilike', args })
        return builder
      }),
      then: (resolve: (value: QueryResult) => void) =>
        Promise.resolve(
          resultsByTable[table]?.shift() ?? {
            data: [],
            error: null,
          }
        ).then(resolve),
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

describe('loadSacramentalRecordsList active parish context', () => {
  it('uses the validated active parish context for the records parish filter', async () => {
    const { supabase, calls } = createRecordsSupabaseMock()
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

    const result = await loadSacramentalRecordsList({
      q: 'Maria%_',
      type: 'baptism',
      continuity: 'needs_review',
    })

    expect(result).toEqual({
      records: [],
      errorMessage: '',
      searchQuery: 'Maria%_',
      typeFilter: 'baptism',
      continuityFilter: 'needs_review',
      continuitySummary: EMPTY_SACRAMENTAL_RECORDS_CONTINUITY_SUMMARY,
      activeParishName: 'Beta Parish',
    })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          table: 'sacramental_records',
          method: 'select',
          args: [SACRAMENTAL_RECORD_LIST_SELECT],
        },
        { table: 'sacramental_records', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'sacramental_records', method: 'eq', args: ['record_type', 'baptism'] },
        { table: 'sacramental_records', method: 'ilike', args: ['person_name', '%Maria%'] },
        { table: 'sacramental_records', method: 'select', args: ['id, request_id'] },
        { table: 'sacramental_record_events', method: 'select', args: ['sacramental_record_id'] },
        {
          table: 'sacramental_record_events',
          method: 'eq',
          args: ['action', 'certificate_generated'],
        },
        { table: 'sacramental_record_events', method: 'eq', args: ['parish_id', 'parish-2'] },
      ])
    )
    expect(SACRAMENTAL_RECORD_LIST_SELECT).not.toContain('parish_id')
    expect(SACRAMENTAL_RECORD_LIST_SELECT).not.toContain('notes')
    expect(SACRAMENTAL_RECORD_LIST_SELECT).not.toContain('created_by')
    expect(SACRAMENTAL_RECORD_LIST_SELECT).not.toContain('updated_by')
  })

  it('falls back to the resolver active parish when a stale cookie is ignored', async () => {
    const { supabase, calls } = createRecordsSupabaseMock()
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

    const result = await loadSacramentalRecordsList({})

    expect(result).toEqual({
      records: [],
      errorMessage: '',
      searchQuery: '',
      typeFilter: '',
      continuityFilter: '',
      continuitySummary: EMPTY_SACRAMENTAL_RECORDS_CONTINUITY_SUMMARY,
      activeParishName: 'Alpha Parish',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'sacramental_records', method: 'eq', args: ['parish_id', 'parish-1'] },
      ])
    )
  })

  it('returns a context error before querying records when active parish context fails', async () => {
    const { supabase } = createRecordsSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore(null) as never)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'Could not resolve parish context.',
      technicalDetail: 'primary_parish_id failed',
      requestedParishId: null,
    })

    const result = await loadSacramentalRecordsList({ q: 'Maria', type: 'baptism' })

    expect(result).toEqual({
      records: [],
      errorMessage: 'Could not resolve parish context.',
      searchQuery: 'Maria',
      typeFilter: 'baptism',
      continuityFilter: '',
      continuitySummary: EMPTY_SACRAMENTAL_RECORDS_CONTINUITY_SUMMARY,
      activeParishName: null,
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('returns a stable staff-safe message when the main records query fails', async () => {
    const { supabase } = createRecordsSupabaseMock({
      sacramental_records: [
        {
          data: [],
          error: {
            message:
              'database unavailable at postgresql://postgres:secret@db.example.supabase.co:5432/postgres with bearer token abc.def.ghi',
            code: '08006',
          },
        },
      ],
    })
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-2'],
      primaryParishId: 'parish-2',
      activeParishId: 'parish-2',
      activeParish: { id: 'parish-2', name: 'Beta Parish' },
      parishes: [{ id: 'parish-2', name: 'Beta Parish' }],
      requestedParishId: 'parish-2',
    })

    const result = await loadSacramentalRecordsList({ q: 'Maria' })

    expect(result.errorMessage).toBe(
      'Could not load sacramental records. Please try again or contact support if this continues.'
    )
    expect(result.errorMessage).not.toContain('postgresql://')
    expect(result.errorMessage).not.toContain('secret')
    expect(result.errorMessage).not.toContain('abc.def.ghi')
    expect(result.activeParishName).toBe('Beta Parish')
    expect(supabase.from).toHaveBeenCalledTimes(1)
  })
})
