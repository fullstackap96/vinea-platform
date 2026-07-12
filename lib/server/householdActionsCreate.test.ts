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

import {
  addHouseholdMember,
  createHousehold,
  updateHousehold,
  updateHouseholdMember,
} from '@/app/dashboard/households/actions'
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

function createHouseholdWriteSupabaseMock() {
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
          data: { id: 'household-1' },
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

function createHouseholdUpdateSupabaseMock(
  updatedRow: Record<string, unknown> | null = { id: 'household-1' }
) {
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

function createHouseholdMemberSupabaseMock(
  options: {
    memberExists?: boolean
    clearPrimaryError?: unknown
    clearedPrimaryIds?: string[]
    memberWriteError?: unknown
    memberWritePresent?: boolean
    restoreError?: unknown
    restorePresent?: boolean
  } = {}
) {
  const calls: QueryCall[] = []

  function responseFor(table: string) {
    if (table === 'households') return { data: { id: 'household-1' }, error: null }
    if (table === 'people') return { data: { id: 'person-1' }, error: null }
    if (table === 'household_members') {
      return {
        data: options.memberExists === false ? null : { id: 'member-1' },
        error: null,
      }
    }
    return { data: null, error: null }
  }

  function builderFor(table: string) {
    let operation: 'select' | 'insert' | 'update' | null = null
    let updatePayload: Record<string, unknown> | null = null
    const filters = new Map<string, unknown>()
    const builder = {
      insert: vi.fn((...args: unknown[]) => {
        operation = 'insert'
        calls.push({ table, method: 'insert', args })
        return builder
      }),
      update: vi.fn((...args: unknown[]) => {
        operation = 'update'
        updatePayload = (args[0] as Record<string, unknown>) ?? null
        calls.push({ table, method: 'update', args })
        return builder
      }),
      select: vi.fn((...args: unknown[]) => {
        if (operation === null) operation = 'select'
        calls.push({ table, method: 'select', args })
        return builder
      }),
      eq: vi.fn((...args: unknown[]) => {
        filters.set(String(args[0]), args[1])
        calls.push({ table, method: 'eq', args })
        return builder
      }),
      neq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'neq', args })
        return builder
      }),
      maybeSingle: vi.fn(() => {
        if (table !== 'household_members' || operation === 'select') {
          return Promise.resolve(responseFor(table))
        }
        if (operation === 'insert') {
          return Promise.resolve({
            data: options.memberWritePresent === false ? null : { id: 'member-new' },
            error: options.memberWriteError ?? null,
          })
        }

        const isRestore =
          updatePayload?.is_primary_contact === true && filters.get('id') === 'old-primary'
        if (isRestore) {
          return Promise.resolve({
            data: options.restorePresent === false ? null : { id: 'old-primary' },
            error: options.restoreError ?? null,
          })
        }
        return Promise.resolve({
          data: options.memberWritePresent === false ? null : { id: 'member-1' },
          error: options.memberWriteError ?? null,
        })
      }),
      then: vi.fn((resolve: (value: unknown) => void) => {
        if (
          table === 'household_members' &&
          operation === 'update' &&
          updatePayload?.is_primary_contact === false
        ) {
          return resolve({
            data: (options.clearedPrimaryIds ?? ['old-primary']).map((id) => ({ id })),
            error: options.clearPrimaryError ?? null,
          })
        }
        return resolve({ error: null })
      }),
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

const validHouseholdInput = {
  name: 'Santos Household',
  address: '123 Main St',
  city: 'Kansas City',
  state: 'MO',
  postalCode: '64108',
  notes: 'Safe test household',
}

function cookieStore(value: string | null) {
  return {
    get: vi.fn((name: string) =>
      name === ACTIVE_STAFF_PARISH_COOKIE && value ? { name, value } : undefined
    ),
  }
}

describe('createHousehold parish write context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
  })

  it('passes the active parish cookie into the staff write parish context', async () => {
    const { supabase, calls } = createHouseholdWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await createHousehold(validHouseholdInput)

    expect(result).toEqual({ ok: true, householdId: 'household-1' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'Household creation used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          table: 'households',
          method: 'insert',
          args: [
            {
              parish_id: 'parish-2',
              name: 'Santos Household',
              address: '123 Main St',
              city: 'Kansas City',
              state: 'MO',
              postal_code: '64108',
              notes: 'Safe test household',
            },
          ],
        },
      ])
    )
  })

  it('preserves legacy parish fallback when no active parish cookie is present', async () => {
    const { supabase, calls } = createHouseholdWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason:
        'Household creation used legacy parish context because active parish selection was not available.',
    })

    const result = await createHousehold(validHouseholdInput)

    expect(result).toEqual({ ok: true, householdId: 'household-1' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
      allowPrimaryParishFallback: true,
      fallbackReason:
        'Household creation used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'households',
          method: 'insert',
          args: [expect.objectContaining({ parish_id: 'parish-1' })],
        }),
      ])
    )
  })

  it('fails before inserting when staff write parish context cannot be resolved', async () => {
    const { supabase } = createHouseholdWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
      technicalDetail: 'No active parish membership was found.',
      source: 'membership',
      requestedParishId: null,
    })

    const result = await createHousehold(validHouseholdInput)

    expect(result).toEqual({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
    })
    expect(supabase.from).not.toHaveBeenCalled()
  })
})

describe('updateHousehold parish write context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
  })

  it('passes the active parish cookie into the staff write parish context and scopes the update', async () => {
    const { supabase, calls } = createHouseholdUpdateSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await updateHousehold('household-1', validHouseholdInput)

    expect(result).toEqual({ ok: true })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'Household update used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'households', method: 'eq', args: ['id', 'household-1'] },
        { table: 'households', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'households', method: 'select', args: ['id'] },
      ])
    )
  })

  it('returns a safe selected-parish not-found message when no row is updated', async () => {
    const { supabase } = createHouseholdUpdateSupabaseMock(null)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await updateHousehold('household-1', validHouseholdInput)

    expect(result).toEqual({
      ok: false,
      error: 'Household not found for the selected parish.',
    })
  })
})

describe('Household member parish write context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore('parish-2') as never)
    resolveStaffWriteParishContextMock.mockResolvedValue({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
  })

  it('checks household/person ownership and inserts a member in the selected parish', async () => {
    const { supabase, calls } = createHouseholdMemberSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await addHouseholdMember('household-1', {
      personId: 'person-1',
      relationship: 'spouse',
      isPrimaryContact: true,
    })

    expect(result).toEqual({ ok: true })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'households', method: 'eq', args: ['id', 'household-1'] },
        { table: 'households', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'people', method: 'eq', args: ['id', 'person-1'] },
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'household_members', method: 'eq', args: ['household_id', 'household-1'] },
        { table: 'household_members', method: 'eq', args: ['parish_id', 'parish-2'] },
        {
          table: 'household_members',
          method: 'insert',
          args: [
            {
              parish_id: 'parish-2',
              household_id: 'household-1',
              person_id: 'person-1',
              relationship: 'spouse',
              is_primary_contact: true,
            },
          ],
        },
      ])
    )
  })

  it('scopes member updates and primary-contact clearing to the selected parish', async () => {
    const { supabase, calls } = createHouseholdMemberSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await updateHouseholdMember('member-1', 'household-1', {
      relationship: 'child',
      isPrimaryContact: true,
    })

    expect(result).toEqual({ ok: true })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'household_members', method: 'select', args: ['id'] },
        { table: 'household_members', method: 'eq', args: ['id', 'member-1'] },
        { table: 'household_members', method: 'eq', args: ['household_id', 'household-1'] },
        { table: 'household_members', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'household_members', method: 'neq', args: ['id', 'member-1'] },
        { table: 'household_members', method: 'eq', args: ['id', 'member-1'] },
        { table: 'household_members', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'household_members', method: 'select', args: ['id'] },
      ])
    )

    const ownershipSelectIndex = calls.findIndex(
      (call) => call.table === 'household_members' && call.method === 'select',
    )
    const firstUpdateIndex = calls.findIndex(
      (call) => call.table === 'household_members' && call.method === 'update',
    )
    expect(ownershipSelectIndex).toBeGreaterThan(-1)
    expect(firstUpdateIndex).toBeGreaterThan(ownershipSelectIndex)
  })

  it('does not clear the current primary contact for a forged or cross-parish member id', async () => {
    const { supabase, calls } = createHouseholdMemberSupabaseMock({ memberExists: false })
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await updateHouseholdMember('forged-member', 'household-1', {
      relationship: 'child',
      isPrimaryContact: true,
    })

    expect(result).toEqual({
      ok: false,
      error: 'Household member not found for the selected parish.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'household_members', method: 'eq', args: ['id', 'forged-member'] },
        { table: 'household_members', method: 'eq', args: ['household_id', 'household-1'] },
        { table: 'household_members', method: 'eq', args: ['parish_id', 'parish-2'] },
      ]),
    )
    expect(calls.some((call) => call.method === 'update')).toBe(false)
    expect(calls.some((call) => call.method === 'neq')).toBe(false)
  })

  it('restores the prior primary contact when adding the replacement member fails', async () => {
    const writeError = { code: '23505', message: 'synthetic member insert failure' }
    const { supabase, calls } = createHouseholdMemberSupabaseMock({
      memberWriteError: writeError,
    })
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await addHouseholdMember('household-1', {
      personId: 'person-1',
      relationship: 'spouse',
      isPrimaryContact: true,
    })

    expect(result).toEqual({ ok: false, error: 'Could not add household member.' })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'household_members', method: 'update', args: [{ is_primary_contact: false }] },
        { table: 'household_members', method: 'eq', args: ['id', 'old-primary'] },
        { table: 'household_members', method: 'update', args: [{ is_primary_contact: true }] },
      ])
    )
  })

  it('returns explicit recovery guidance when member update and primary restoration both fail', async () => {
    const { supabase } = createHouseholdMemberSupabaseMock({
      memberWritePresent: false,
      restorePresent: false,
    })
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await updateHouseholdMember('member-1', 'household-1', {
      relationship: 'child',
      isPrimaryContact: true,
    })

    expect(result).toEqual({
      ok: false,
      error:
        'The member was not updated, and the previous primary contact could not be restored. Refresh before trying again.',
    })
  })

  it('stops before member insertion when clearing the prior primary contact fails', async () => {
    const { supabase, calls } = createHouseholdMemberSupabaseMock({
      clearPrimaryError: { code: '42501', message: 'synthetic clear failure' },
    })
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await addHouseholdMember('household-1', {
      personId: 'person-1',
      relationship: 'spouse',
      isPrimaryContact: true,
    })

    expect(result).toEqual({
      ok: false,
      error: 'Could not change the household primary contact.',
    })
    expect(calls.some((call) => call.method === 'insert')).toBe(false)
  })
})
