import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

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
import { loadGlobalSearch } from './loadGlobalSearch'

const cookiesMock = vi.mocked(cookies)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

function createSearchSupabaseMock(
  options: {
    parishionerRows?: unknown[]
    requestRows?: unknown[]
    funeralDetailRows?: unknown[]
    weddingDetailRows?: unknown[]
    tableResults?: Record<string, { data: unknown[]; error: { message?: string; code?: string } | null }[]>
  } = {}
) {
  const calls: QueryCall[] = []

  function builderFor(table: string) {
    const builder = {
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'select', args })
        return builder
      }),
      or: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'or', args })
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
      ilike: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'ilike', args })
        return builder
      }),
      in: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'in', args })
        return builder
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'eq', args })
        return builder
      }),
      then: (resolve: (value: { data: unknown[]; error: { message?: string; code?: string } | null }) => void) => {
        const queuedResult = options.tableResults?.[table]?.shift()
        if (queuedResult) {
          return Promise.resolve(queuedResult).then(resolve)
        }

        const rowsByTable: Record<string, unknown[]> = {
          parishioners: options.parishionerRows ?? [],
          requests: options.requestRows ?? [],
          funeral_request_details: options.funeralDetailRows ?? [],
          wedding_request_details: options.weddingDetailRows ?? [],
        }

        return Promise.resolve({ data: rowsByTable[table] ?? [], error: null }).then(resolve)
      },
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

describe('loadGlobalSearch active parish context', () => {
  it('uses the validated active parish context for explicit parish filters', async () => {
    const { supabase, calls } = createSearchSupabaseMock({
      parishionerRows: [{ id: 'parishioner-2' }],
    })
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-2', 'parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-2',
      activeParish: { id: 'parish-2', name: 'Beta Parish' },
      parishes: [
        { id: 'parish-1', name: 'Alpha Parish' },
        { id: 'parish-2', name: 'Beta Parish' },
      ],
      requestedParishId: 'parish-2',
    })

    const result = await loadGlobalSearch(supabase as never, 'Maria')

    expect(result.errorMessage).toBe('')
    expect(result.warningMessage).toBe('')
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
    })

    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'households', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'sacramental_records', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'parishioners', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'requests', method: 'in', args: ['parishioner_id', ['parishioner-2']] },
      ])
    )
  })

  it('falls back to the resolver active parish when a stale cookie is ignored', async () => {
    const { supabase, calls } = createSearchSupabaseMock({
      parishionerRows: [{ id: 'parishioner-1' }],
    })
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

    const result = await loadGlobalSearch(supabase as never, 'Maria')

    expect(result.errorMessage).toBe('')
    expect(result.warningMessage).toBe('')
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-1'] },
        { table: 'households', method: 'eq', args: ['parish_id', 'parish-1'] },
        { table: 'sacramental_records', method: 'eq', args: ['parish_id', 'parish-1'] },
        { table: 'parishioners', method: 'eq', args: ['parish_id', 'parish-1'] },
        { table: 'requests', method: 'in', args: ['parishioner_id', ['parishioner-1']] },
      ])
    )
  })

  it('applies active parishioner scope to request result lookup and enrichment', async () => {
    const { supabase, calls } = createSearchSupabaseMock({
      parishionerRows: [
        { id: 'parishioner-1', full_name: 'Maria Garcia', email: 'maria@example.com' },
        { id: 'parishioner-2', full_name: 'Luis Garcia', email: 'luis@example.com' },
      ],
      requestRows: [
        {
          id: 'request-1',
          request_type: 'baptism',
          status: 'new',
          child_name: 'Maria Garcia',
          created_at: '2026-07-05T12:00:00.000Z',
          parishioner_id: 'parishioner-1',
        },
      ],
    })
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
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

    const result = await loadGlobalSearch(supabase as never, 'Maria')

    expect(result.errorMessage).toBe('')
    expect(result.warningMessage).toBe('')
    expect(result.raw.requests).toHaveLength(1)
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'parishioners', method: 'eq', args: ['parish_id', 'parish-2'] },
        {
          table: 'requests',
          method: 'in',
          args: ['parishioner_id', ['parishioner-1', 'parishioner-2']],
        },
        { table: 'requests', method: 'in', args: ['id', ['request-1']] },
        {
          table: 'parishioners',
          method: 'in',
          args: ['id', ['parishioner-1']],
        },
      ])
    )
  })

  it('does not run request queries when active parish has no scoped parishioners', async () => {
    const { supabase, calls } = createSearchSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
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

    const result = await loadGlobalSearch(supabase as never, 'Maria')

    expect(result.raw.requests).toEqual([])
    expect(result.warningMessage).toBe('')
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'parishioners', method: 'eq', args: ['parish_id', 'parish-2'] },
      ])
    )
    expect(calls.some((call) => call.table === 'requests')).toBe(false)
  })

  it('returns a context error before running search queries when active parish context fails', async () => {
    const { supabase } = createSearchSupabaseMock()
    cookiesMock.mockResolvedValueOnce(cookieStore(null) as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'Could not resolve parish context.',
      technicalDetail: 'primary_parish_id failed',
      requestedParishId: null,
    })

    const result = await loadGlobalSearch(supabase as never, 'Maria')

    expect(result).toMatchObject({
      errorMessage: 'Could not resolve parish context.',
      warningMessage: '',
      totalCount: 0,
      raw: { requests: [], people: [], households: [], records: [] },
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('returns a safe partial-results warning when one search category fails', async () => {
    const { supabase } = createSearchSupabaseMock({
      tableResults: {
        parishioners: [{ data: [], error: null }],
        people: [
          {
            data: [],
            error: {
              message:
                'people search failed at postgresql://postgres:secret@db.example.supabase.co:5432/postgres with token abc.def.ghi',
              code: '08006',
            },
          },
        ],
      },
    })
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
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

    const result = await loadGlobalSearch(supabase as never, 'Maria')

    expect(result.errorMessage).toBe('')
    expect(result.warningMessage).toBe(
      'Some search results may be missing. Please try again if you do not see what you expected.'
    )
    expect(result.warningMessage).not.toContain('postgresql://')
    expect(result.warningMessage).not.toContain('secret')
    expect(result.warningMessage).not.toContain('abc.def.ghi')
    expect(result.raw).toEqual({ requests: [], people: [], households: [], records: [] })
  })
})
