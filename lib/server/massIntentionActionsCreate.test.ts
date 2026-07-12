import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

vi.mock('@/lib/server/staffWriteParishContext', () => ({
  resolveStaffWriteParishContext: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

import { createMassIntention, updateMassIntention } from '@/app/dashboard/intentions/actions'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const resolveStaffWriteParishContextMock = vi.mocked(resolveStaffWriteParishContext)
const cookiesMock = vi.mocked(cookies)

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

function createMassIntentionWriteSupabaseMock() {
  const calls: QueryCall[] = []

  function builderFor(table: string) {
    const builder = {
      insert: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'insert', args })
        return builder
      }),
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'select', args })
        return builder
      }),
      single: vi.fn(() =>
        Promise.resolve({
          data: { id: 'intention-1' },
          error: null,
        })
      ),
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

function createMassIntentionUpdateSupabaseMock(options: { updatedId?: string | null } = {}) {
  const calls: QueryCall[] = []

  function builderFor(table: string) {
    const builder = {
      update: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'update', args })
        return builder
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'eq', args })
        return builder
      }),
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'select', args })
        return builder
      }),
      maybeSingle: vi.fn(() =>
        Promise.resolve({
          data: options.updatedId === null ? null : { id: options.updatedId ?? 'intention-1' },
          error: null,
        })
      ),
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

const validMassIntentionInput = {
  requesterName: 'Maria Santos',
  intentionText: 'For the repose of John Santos',
  requestedDate: '2026-07-01',
  assignedMassDate: '2026-07-15',
  assignedPriestName: 'Fr. Thomas',
  stipendReceived: true,
  isFulfilled: false,
  notes: 'Safe test intention',
}

function cookieStore(value: string | null) {
  return {
    get: vi.fn((name: string) =>
      name === ACTIVE_STAFF_PARISH_COOKIE && value ? { name, value } : undefined
    ),
  }
}

describe('createMassIntention parish write context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
  })

  it('passes the active parish cookie into the staff write parish context', async () => {
    const { supabase, calls } = createMassIntentionWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await createMassIntention(validMassIntentionInput)

    expect(result).toEqual({ ok: true, intentionId: 'intention-1' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'Mass Intention creation used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          table: 'mass_intentions',
          method: 'insert',
          args: [
            {
              parish_id: 'parish-2',
              requester_name: 'Maria Santos',
              intention_text: 'For the repose of John Santos',
              requested_date: '2026-07-01',
              assigned_mass_date: '2026-07-15',
              assigned_priest_name: 'Fr. Thomas',
              stipend_received: true,
              is_fulfilled: false,
              notes: 'Safe test intention',
            },
          ],
        },
      ])
    )
  })

  it('preserves legacy parish fallback when no active parish cookie is present', async () => {
    const { supabase, calls } = createMassIntentionWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason:
        'Mass Intention creation used legacy parish context because active parish selection was not available.',
    })

    const result = await createMassIntention(validMassIntentionInput)

    expect(result).toEqual({ ok: true, intentionId: 'intention-1' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
      allowPrimaryParishFallback: true,
      fallbackReason:
        'Mass Intention creation used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'mass_intentions',
          method: 'insert',
          args: [expect.objectContaining({ parish_id: 'parish-1' })],
        }),
      ])
    )
  })

  it('fails before inserting when staff write parish context cannot be resolved', async () => {
    const { supabase } = createMassIntentionWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
      technicalDetail: 'No active parish membership was found.',
      source: 'membership',
      requestedParishId: null,
    })

    const result = await createMassIntention(validMassIntentionInput)

    expect(result).toEqual({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })
})

describe('updateMassIntention parish write context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
  })

  it('updates only when the Mass intention belongs to the selected write parish', async () => {
    const { supabase, calls } = createMassIntentionUpdateSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await updateMassIntention('intention-1', validMassIntentionInput)

    expect(result).toEqual({ ok: true })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'Mass Intention update used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          table: 'mass_intentions',
          method: 'update',
          args: [
            {
              requester_name: 'Maria Santos',
              intention_text: 'For the repose of John Santos',
              requested_date: '2026-07-01',
              assigned_mass_date: '2026-07-15',
              assigned_priest_name: 'Fr. Thomas',
              stipend_received: true,
              is_fulfilled: false,
              notes: 'Safe test intention',
            },
          ],
        },
        { table: 'mass_intentions', method: 'eq', args: ['id', 'intention-1'] },
        { table: 'mass_intentions', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'mass_intentions', method: 'select', args: ['id'] },
      ])
    )
  })

  it('preserves legacy parish fallback when no active parish cookie is present', async () => {
    const { supabase, calls } = createMassIntentionUpdateSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason:
        'Mass Intention update used legacy parish context because active parish selection was not available.',
    })

    const result = await updateMassIntention('intention-1', validMassIntentionInput)

    expect(result).toEqual({ ok: true })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
      allowPrimaryParishFallback: true,
      fallbackReason:
        'Mass Intention update used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'mass_intentions', method: 'eq', args: ['parish_id', 'parish-1'] },
      ])
    )
  })

  it('fails before updating when staff write parish context cannot be resolved', async () => {
    const { supabase } = createMassIntentionUpdateSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
      technicalDetail: 'No active parish membership was found.',
      source: 'membership',
      requestedParishId: null,
    })

    const result = await updateMassIntention('intention-1', validMassIntentionInput)

    expect(result).toEqual({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('returns a safe selected-parish not-found error when no row was updated', async () => {
    const { supabase } = createMassIntentionUpdateSupabaseMock({ updatedId: null })
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await updateMassIntention('cross-parish-intention', validMassIntentionInput)

    expect(result).toEqual({
      ok: false,
      error: 'Mass intention not found for the selected parish.',
    })
  })
})
