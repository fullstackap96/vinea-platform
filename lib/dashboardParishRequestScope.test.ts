import { describe, expect, it, vi } from 'vitest'
import {
  fetchDashboardRequestParishionerScope,
  fetchStaffScopedPrimaryParishId,
} from '@/lib/dashboardParishRequestScope'

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

function createScopeSupabaseMock(options: {
  membershipParishId?: string | null
  membershipError?: { message: string; code?: string } | null
  fallbackParishId?: string | null
  fallbackError?: { message: string; code?: string } | null
  parishionerRows?: unknown[]
  parishionerError?: { message: string; code?: string } | null
}) {
  const calls: QueryCall[] = []
  const rpc = vi.fn((name: string) => {
    if (name === 'current_staff_primary_parish_id') {
      return Promise.resolve({
        data: options.membershipParishId ?? null,
        error: options.membershipError ?? null,
      })
    }
    if (name === 'primary_parish_id') {
      return Promise.resolve({
        data: options.fallbackParishId ?? null,
        error: options.fallbackError ?? null,
      })
    }
    return Promise.resolve({ data: null, error: null })
  })

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
      then: (resolve: (value: { data: unknown[] | null; error: unknown }) => void) =>
        Promise.resolve({
          data: options.parishionerRows ?? [],
          error: options.parishionerError ?? null,
        }).then(resolve),
    }

    return builder
  }

  const supabase = {
    rpc,
    from: vi.fn((table: string) => builderFor(table)),
  }

  return { supabase, calls, rpc }
}

describe('dashboard request parish scope', () => {
  it('uses a server-validated active parish id for dashboard request scoping', async () => {
    const { supabase, calls, rpc } = createScopeSupabaseMock({
      membershipParishId: 'parish-1',
      fallbackParishId: 'parish-1',
      parishionerRows: [{ id: 'parishioner-2' }],
    })

    const result = await fetchDashboardRequestParishionerScope(supabase as never, {
      activeParishId: ' parish-2 ',
    })

    expect(result).toEqual({
      ok: true,
      parishionerIds: ['parishioner-2'],
    })
    expect(rpc).not.toHaveBeenCalled()
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'parishioners', method: 'eq', args: ['parish_id', 'parish-2'] },
      ])
    )
  })

  it('prefers the staff membership primary parish id for dashboard request scoping', async () => {
    const { supabase, calls, rpc } = createScopeSupabaseMock({
      membershipParishId: 'parish-2',
      fallbackParishId: 'parish-1',
      parishionerRows: [{ id: 'parishioner-1' }, { id: 'parishioner-2' }],
    })

    const result = await fetchDashboardRequestParishionerScope(supabase as never)

    expect(result).toEqual({
      ok: true,
      parishionerIds: ['parishioner-1', 'parishioner-2'],
    })
    expect(rpc).toHaveBeenCalledWith('current_staff_primary_parish_id')
    expect(rpc).not.toHaveBeenCalledWith('primary_parish_id')
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'parishioners', method: 'eq', args: ['parish_id', 'parish-2'] },
      ])
    )
  })

  it('falls back to primary_parish_id when membership scope is unavailable', async () => {
    const { supabase, calls, rpc } = createScopeSupabaseMock({
      membershipParishId: null,
      membershipError: { message: 'Could not find the function current_staff_primary_parish_id' },
      fallbackParishId: 'parish-1',
      parishionerRows: [{ id: 'parishioner-1' }],
    })

    const result = await fetchDashboardRequestParishionerScope(supabase as never)

    expect(result).toEqual({
      ok: true,
      parishionerIds: ['parishioner-1'],
    })
    expect(rpc).toHaveBeenCalledWith('current_staff_primary_parish_id')
    expect(rpc).toHaveBeenCalledWith('primary_parish_id')
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'parishioners', method: 'eq', args: ['parish_id', 'parish-1'] },
      ])
    )
  })

  it('returns the fallback lookup error before querying parishioners when parish scope fails', async () => {
    const { supabase } = createScopeSupabaseMock({
      membershipParishId: null,
      fallbackParishId: null,
      fallbackError: { message: 'primary parish failed' },
    })

    const result = await fetchDashboardRequestParishionerScope(supabase as never)

    expect(result).toEqual({
      ok: false,
      userMessage: 'Could not load parish directory. Please try again or contact support if this continues.',
      technicalDetail: 'primary parish failed',
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('reports the source when resolving staff-scoped primary parish ids directly', async () => {
    const { supabase } = createScopeSupabaseMock({
      membershipParishId: 'parish-2',
      fallbackParishId: 'parish-1',
    })

    const result = await fetchStaffScopedPrimaryParishId(supabase as never)

    expect(result).toEqual({
      parishId: 'parish-2',
      error: null,
      source: 'membership',
    })
  })
})
