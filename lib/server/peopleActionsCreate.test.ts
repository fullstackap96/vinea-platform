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

import { createPerson, updatePerson } from '@/app/dashboard/people/actions'
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

function createPeopleWriteSupabaseMock() {
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
          data: { id: 'person-1' },
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

function createPeopleUpdateSupabaseMock(updatedRow: Record<string, unknown> | null = { id: 'person-1' }) {
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
          data: updatedRow,
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

const validPersonInput = {
  firstName: 'Maria',
  middleName: '',
  lastName: 'Santos',
  email: 'maria@example.com',
  phone: '555-0100',
  dateOfBirth: '1990-01-01',
  notes: 'Safe test person',
}

function cookieStore(value: string | null) {
  return {
    get: vi.fn((name: string) =>
      name === ACTIVE_STAFF_PARISH_COOKIE && value ? { name, value } : undefined
    ),
  }
}

describe('createPerson parish write context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
  })

  it('passes the active parish cookie into the staff write parish context', async () => {
    const { supabase, calls } = createPeopleWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await createPerson(validPersonInput)

    expect(result).toEqual({ ok: true, personId: 'person-1' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'People creation used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          table: 'people',
          method: 'insert',
          args: [
            {
              parish_id: 'parish-2',
              parishioner_id: null,
              first_name: 'Maria',
              middle_name: null,
              last_name: 'Santos',
              email: 'maria@example.com',
              phone: '555-0100',
              date_of_birth: '1990-01-01',
              notes: 'Safe test person',
            },
          ],
        },
      ])
    )
  })

  it('preserves legacy parish fallback when no active parish cookie is present', async () => {
    const { supabase, calls } = createPeopleWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason:
        'People creation used legacy parish context because active parish selection was not available.',
    })

    const result = await createPerson(validPersonInput)

    expect(result).toEqual({ ok: true, personId: 'person-1' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
      allowPrimaryParishFallback: true,
      fallbackReason:
        'People creation used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'people',
          method: 'insert',
          args: [expect.objectContaining({ parish_id: 'parish-1' })],
        }),
      ])
    )
  })

  it('fails before inserting when staff write parish context cannot be resolved', async () => {
    const { supabase } = createPeopleWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
      technicalDetail: 'No active parish membership was found.',
      source: 'membership',
      requestedParishId: null,
    })

    const result = await createPerson(validPersonInput)

    expect(result).toEqual({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })
})

describe('updatePerson parish write context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
  })

  it('passes the active parish cookie into the staff write parish context and scopes the update', async () => {
    const { supabase, calls } = createPeopleUpdateSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await updatePerson('person-1', validPersonInput)

    expect(result).toEqual({ ok: true })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'People update used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['id', 'person-1'] },
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'people', method: 'select', args: ['id'] },
      ])
    )
  })

  it('preserves legacy parish fallback when no active parish cookie is present', async () => {
    const { supabase, calls } = createPeopleUpdateSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason:
        'People update used legacy parish context because active parish selection was not available.',
    })

    const result = await updatePerson('person-1', validPersonInput)

    expect(result).toEqual({ ok: true })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['id', 'person-1'] },
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-1'] },
      ])
    )
  })

  it('fails before updating when staff write parish context cannot be resolved', async () => {
    const { supabase } = createPeopleUpdateSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
      technicalDetail: 'No active parish membership was found.',
      source: 'membership',
      requestedParishId: null,
    })

    const result = await updatePerson('person-1', validPersonInput)

    expect(result).toEqual({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('returns a safe selected-parish not-found message when no row is updated', async () => {
    const { supabase } = createPeopleUpdateSupabaseMock(null)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await updatePerson('person-1', validPersonInput)

    expect(result).toEqual({ ok: false, error: 'Person not found for the selected parish.' })
  })
})
