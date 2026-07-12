import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { createSupabaseServiceRoleClientMock } = vi.hoisted(() => ({
  createSupabaseServiceRoleClientMock: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}))

import {
  resolveStaffParishContext,
  staffParishContextTestInternals,
} from './staffParishContext'

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
  parishes?: Record<
    string,
    { id: string; name: string | null; public_display_name?: string | null; created_at: string }
  >
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

describe('resolveStaffParishContext', () => {
  beforeEach(() => {
    createSupabaseServiceRoleClientMock.mockReset()
  })

  it('uses active parish memberships as the preferred parish context', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: ['parish-2', 'parish-1'], error: null },
      },
      parishes: {
        'parish-1': { id: 'parish-1', name: 'Alpha Parish', created_at: '2026-01-01' },
        'parish-2': { id: 'parish-2', name: 'Beta Parish', created_at: '2026-02-01' },
      },
    })

    const result = await resolveStaffParishContext(supabase as never)

    expect(result).toEqual({
      ok: true,
      source: 'membership',
      parishIds: ['parish-2', 'parish-1'],
      primaryParishId: 'parish-2',
      parishes: [
        { id: 'parish-2', name: 'Beta Parish' },
        { id: 'parish-1', name: 'Alpha Parish' },
      ],
    })
    expect(supabase.rpc).toHaveBeenCalledWith('current_staff_parish_ids')
    expect(supabase.rpc).not.toHaveBeenCalledWith('primary_parish_id')
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })

  it('uses public display names as a safe staff switcher fallback when parish name is blank', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: ['parish-1'], error: null },
      },
      parishes: {
        'parish-1': {
          id: 'parish-1',
          name: null,
          public_display_name: 'Vinea QA Google Calendar Parish A',
          created_at: '2026-01-01',
        },
      },
    })

    const result = await resolveStaffParishContext(supabase as never)

    expect(result).toMatchObject({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      parishes: [{ id: 'parish-1', name: 'Vinea QA Google Calendar Parish A' }],
    })
  })

  it('loads display names through the server-only fallback only for authorized membership parish ids', async () => {
    const staffScopedSupabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: ['parish-a', 'parish-b'], error: null },
      },
      parishes: {},
    })
    const serviceRoleSupabase = supabaseFor({
      rpc: {},
      parishes: {
        'parish-a': {
          id: 'parish-a',
          name: 'Vinea QA Google Calendar Parish A',
          created_at: '2026-01-01',
        },
        'parish-b': {
          id: 'parish-b',
          name: null,
          public_display_name: 'Vinea QA Google Calendar Parish B',
          created_at: '2026-01-02',
        },
        'parish-c': {
          id: 'parish-c',
          name: 'Not authorized',
          created_at: '2026-01-03',
        },
      },
    })
    createSupabaseServiceRoleClientMock.mockReturnValue(serviceRoleSupabase)

    const result = await resolveStaffParishContext(staffScopedSupabase as never)

    expect(createSupabaseServiceRoleClientMock).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      ok: true,
      source: 'membership',
      parishIds: ['parish-a', 'parish-b'],
      primaryParishId: 'parish-a',
      parishes: [
        { id: 'parish-a', name: 'Vinea QA Google Calendar Parish A' },
        { id: 'parish-b', name: 'Vinea QA Google Calendar Parish B' },
      ],
      fallbackReason: undefined,
    })
  })

  it('falls back to primary_parish_id when the membership foundation is missing', async () => {
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
        'parish-1': { id: 'parish-1', name: 'St Ann', created_at: '2026-01-01' },
      },
    })

    const result = await resolveStaffParishContext(supabase as never)

    expect(result).toMatchObject({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      parishes: [{ id: 'parish-1', name: 'St Ann' }],
      fallbackReason: 'Membership foundation is not deployed.',
    })
    expect(supabase.rpc).toHaveBeenCalledWith('primary_parish_id')
  })

  it('falls back when no active memberships are returned', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: [], error: null },
        primary_parish_id: { data: 'parish-1', error: null },
      },
      parishes: {
        'parish-1': { id: 'parish-1', name: 'St Ann', created_at: '2026-01-01' },
      },
    })

    const result = await resolveStaffParishContext(supabase as never)

    expect(result).toMatchObject({
      ok: true,
      source: 'primary_parish_fallback',
      fallbackReason: 'No active parish memberships found.',
    })
  })

  it('redacts sensitive membership lookup details before returning fallback reasons', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: {
          data: null,
          error: {
            code: '42501',
            message:
              'Lookup failed for owner@example.com using sk-test_1234567890abcdef against postgresql://postgres:password@example.supabase.co:5432/postgres',
          },
        },
        primary_parish_id: { data: 'parish-1', error: null },
      },
      parishes: {
        'parish-1': { id: 'parish-1', name: 'St Ann', created_at: '2026-01-01' },
      },
    })

    const result = await resolveStaffParishContext(supabase as never)

    expect(result).toMatchObject({
      ok: true,
      source: 'primary_parish_fallback',
      fallbackReason:
        'Lookup failed for [redacted email] using [redacted token] against [redacted database url]',
    })
    expect(JSON.stringify(result)).not.toContain('owner@example.com')
    expect(JSON.stringify(result)).not.toContain('sk-test_1234567890abcdef')
    expect(JSON.stringify(result)).not.toContain('postgres:password')
  })

  it('preserves membership scope when parish display rows are not visible', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: ['parish-2'], error: null },
      },
    })

    const result = await resolveStaffParishContext(supabase as never)

    expect(result).toEqual({
      ok: true,
      source: 'membership',
      parishIds: ['parish-2'],
      primaryParishId: 'parish-2',
      parishes: [{ id: 'parish-2', name: null }],
      fallbackReason: 'Parish display rows were not visible to the staff session.',
    })
    expect(supabase.rpc).not.toHaveBeenCalledWith('primary_parish_id')
  })

  it('redacts sensitive parish display loading details before returning fallback reasons', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: ['parish-2'], error: null },
      },
      parishSelectError: {
        code: '42501',
        message: 'permission denied for owner@example.com with Bearer abc.def.ghi',
      },
    })

    const result = await resolveStaffParishContext(supabase as never)

    expect(result).toEqual({
      ok: true,
      source: 'membership',
      parishIds: ['parish-2'],
      primaryParishId: 'parish-2',
      parishes: [{ id: 'parish-2', name: null }],
      fallbackReason:
        'Parish display rows were not loaded: permission denied for [redacted email] with Bearer [redacted token]',
    })
    expect(JSON.stringify(result)).not.toContain('owner@example.com')
    expect(JSON.stringify(result)).not.toContain('abc.def.ghi')
  })

  it('preserves all membership ids and fills display fallbacks for hidden parish rows', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: ['parish-2', 'parish-1'], error: null },
      },
      parishes: {
        'parish-1': { id: 'parish-1', name: 'St Ann', created_at: '2026-01-01' },
      },
    })

    const result = await resolveStaffParishContext(supabase as never)

    expect(result).toEqual({
      ok: true,
      source: 'membership',
      parishIds: ['parish-2', 'parish-1'],
      primaryParishId: 'parish-2',
      parishes: [
        { id: 'parish-2', name: null },
        { id: 'parish-1', name: 'St Ann' },
      ],
      fallbackReason: undefined,
    })
    expect(supabase.rpc).not.toHaveBeenCalledWith('primary_parish_id')
  })

  it('preserves membership scope when parish display loading errors', async () => {
    const supabase = supabaseFor({
      rpc: {
        current_staff_parish_ids: { data: ['parish-2'], error: null },
      },
      parishSelectError: { code: '42501', message: 'permission denied for table parishes' },
    })

    const result = await resolveStaffParishContext(supabase as never)

    expect(result).toEqual({
      ok: true,
      source: 'membership',
      parishIds: ['parish-2'],
      primaryParishId: 'parish-2',
      parishes: [{ id: 'parish-2', name: null }],
      fallbackReason: 'Parish display rows were not loaded: permission denied for table parishes',
    })
    expect(supabase.rpc).not.toHaveBeenCalledWith('primary_parish_id')
  })

  it('normalizes set-returning RPC shapes from Supabase/PostgREST', () => {
    expect(
      staffParishContextTestInternals.normalizeRpcParishIds([
        'parish-1',
        { current_staff_parish_ids: 'parish-2' },
        { parish_id: 'parish-3' },
        { id: 'parish-4' },
        { id: 'parish-4' },
        null,
      ])
    ).toEqual(['parish-1', 'parish-2', 'parish-3', 'parish-4'])
  })
})
