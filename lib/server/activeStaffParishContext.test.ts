import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  ACTIVE_STAFF_PARISH_COOKIE,
  activeStaffParishContextTestInternals,
  resolveActiveStaffParishContext,
} from './activeStaffParishContext'

type RpcResponse = {
  data: unknown
  error: { code?: string; message: string } | null
}

type SelectResponse = {
  data: unknown[] | null
  error: { code?: string; message: string } | null
}

function supabaseFor(input: {
  rpc: Record<string, RpcResponse>
  parishes?: Record<string, { id: string; name: string | null; created_at: string }>
  parishSelectError?: { code?: string; message: string } | null
}) {
  return {
    rpc: vi.fn((functionName: string) => Promise.resolve(input.rpc[functionName])),
    from: vi.fn((table: string) => {
      expect(table).toBe('parishes')
      return {
        select: vi.fn(() => ({
          in: vi.fn((_column: string, ids: string[]) => ({
            order: vi.fn(() => {
              const rows = ids
                .map((id) => input.parishes?.[id])
                .filter(Boolean) as SelectResponse['data']
              return Promise.resolve({
                data: rows,
                error: input.parishSelectError ?? null,
              })
            }),
          })),
        })),
      }
    }),
  }
}

describe('resolveActiveStaffParishContext', () => {
  it('uses the primary membership parish when no active parish is requested', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: ['parish-1', 'parish-2'], error: null },
      },
      parishes: {
        'parish-1': { id: 'parish-1', name: 'Alpha Parish', created_at: '2026-01-01' },
        'parish-2': { id: 'parish-2', name: 'Beta Parish', created_at: '2026-02-01' },
      },
    })

    const result = await resolveActiveStaffParishContext(supabase as never)

    expect(result).toEqual({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1', 'parish-2'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [
        { id: 'parish-1', name: 'Alpha Parish' },
        { id: 'parish-2', name: 'Beta Parish' },
      ],
      requestedParishId: null,
    })
  })

  it('honors an explicitly requested parish only when it belongs to the staff context', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: ['parish-1', 'parish-2'], error: null },
      },
      parishes: {
        'parish-1': { id: 'parish-1', name: 'Alpha Parish', created_at: '2026-01-01' },
        'parish-2': { id: 'parish-2', name: 'Beta Parish', created_at: '2026-02-01' },
      },
    })

    const result = await resolveActiveStaffParishContext(supabase as never, {
      requestedParishId: 'parish-2',
    })

    expect(result).toMatchObject({
      ok: true,
      source: 'membership',
      primaryParishId: 'parish-1',
      activeParishId: 'parish-2',
      activeParish: { id: 'parish-2', name: 'Beta Parish' },
      requestedParishId: 'parish-2',
    })
    if (result.ok) {
      expect(result.ignoredRequestedParishReason).toBeUndefined()
    }
  })

  it('ignores an unauthorized requested parish and falls back to the primary authorized parish', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: ['parish-1'], error: null },
      },
      parishes: {
        'parish-1': { id: 'parish-1', name: 'Alpha Parish', created_at: '2026-01-01' },
      },
    })

    const result = await resolveActiveStaffParishContext(supabase as never, {
      requestedParishId: 'parish-999',
    })

    expect(result).toMatchObject({
      ok: true,
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      requestedParishId: 'parish-999',
      ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
    })
  })

  it('preserves primary parish fallback behavior for undeployed membership foundation', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: {
          data: null,
          error: {
            code: 'PGRST202',
            message: 'Could not find the function public.current_staff_parish_ids()',
          },
        },
        primary_parish_id: { data: 'parish-1', error: null },
      },
      parishes: {
        'parish-1': { id: 'parish-1', name: 'Alpha Parish', created_at: '2026-01-01' },
      },
    })

    const result = await resolveActiveStaffParishContext(supabase as never, {
      requestedParishId: 'parish-1',
    })

    expect(result).toMatchObject({
      ok: true,
      source: 'primary_parish_fallback',
      activeParishId: 'parish-1',
      requestedParishId: 'parish-1',
      fallbackReason: 'Membership foundation is not deployed.',
    })
  })

  it('normalizes requested parish ids and exposes the cookie name for future UI wiring', () => {
    expect(ACTIVE_STAFF_PARISH_COOKIE).toBe('vinea_active_parish_id')
    expect(activeStaffParishContextTestInternals.normalizeId(' parish-1 ')).toBe('parish-1')
    expect(activeStaffParishContextTestInternals.normalizeId('   ')).toBeNull()
  })
})
