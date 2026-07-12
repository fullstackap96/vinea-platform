import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(() => ({ from: vi.fn() })),
}))

vi.mock('@/lib/server/staffWriteParishContext', () => ({
  resolveStaffWriteParishContext: vi.fn(),
}))

vi.mock('@/lib/server/sacramentalRecordCreateRelationships', () => ({
  validateSacramentalRecordCreateRelationships: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

import {
  createSacramentalRecord,
  updateSacramentalRecord,
  updateSacramentalRecordPersonLink,
} from '@/app/dashboard/records/actions'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { validateSacramentalRecordCreateRelationships } from '@/lib/server/sacramentalRecordCreateRelationships'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const resolveStaffWriteParishContextMock = vi.mocked(resolveStaffWriteParishContext)
const validateSacramentalRecordCreateRelationshipsMock = vi.mocked(
  validateSacramentalRecordCreateRelationships
)
const cookiesMock = vi.mocked(cookies)

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

function createSacramentalRecordWriteSupabaseMock() {
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
          data: { id: 'record-1' },
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

function createSacramentalRecordUpdateSupabaseMock(
  updatedRow: Record<string, unknown> | null = { id: 'record-1' }
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

function createSacramentalRecordPersonLinkSupabaseMock() {
  const calls: QueryCall[] = []

  function responseFor(table: string) {
    if (table === 'people') return { data: { id: 'person-1' }, error: null }
    if (table === 'sacramental_records') return { data: { id: 'record-1' }, error: null }
    return { data: null, error: null }
  }

  function builderFor(table: string) {
    const builder = {
      update: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'update', args })
        return builder
      }),
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'select', args })
        return builder
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'eq', args })
        return builder
      }),
      maybeSingle: vi.fn(() => Promise.resolve(responseFor(table))),
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

const validSacramentalRecordInput = {
  recordType: 'baptism',
  personName: 'Maria Santos',
  sacramentDate: '2026-07-01',
  place: 'St. Isidore Parish',
  minister: 'Fr. Thomas',
  book: 'B-2026',
  page: '42',
  line: '7',
  notes: 'Safe test record',
  requestId: 'request-1',
  personId: 'person-1',
}

function cookieStore(value: string | null) {
  return {
    get: vi.fn((name: string) =>
      name === ACTIVE_STAFF_PARISH_COOKIE && value ? { name, value } : undefined
    ),
  }
}

describe('createSacramentalRecord parish write context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
    validateSacramentalRecordCreateRelationshipsMock.mockResolvedValue({ ok: true })
  })

  it('passes the active parish cookie into the staff write parish context', async () => {
    const { supabase, calls } = createSacramentalRecordWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await createSacramentalRecord(validSacramentalRecordInput)

    expect(result).toEqual({ ok: true, recordId: 'record-1' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'Sacramental Record creation used legacy parish context because active parish selection was not available.',
    })
    expect(validateSacramentalRecordCreateRelationshipsMock).toHaveBeenCalledWith(
      expect.anything(),
      {
        parishId: 'parish-2',
        requestId: 'request-1',
        personId: 'person-1',
      }
    )
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          table: 'sacramental_records',
          method: 'insert',
          args: [
            {
              parish_id: 'parish-2',
              record_type: 'baptism',
              person_name: 'Maria Santos',
              sacrament_date: '2026-07-01',
              place: 'St. Isidore Parish',
              minister: 'Fr. Thomas',
              book: 'B-2026',
              page: '42',
              line: '7',
              notes: 'Safe test record',
              request_id: 'request-1',
              person_id: 'person-1',
            },
          ],
        },
      ])
    )
  })

  it('preserves legacy parish fallback when no active parish cookie is present', async () => {
    const { supabase, calls } = createSacramentalRecordWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason:
        'Sacramental Record creation used legacy parish context because active parish selection was not available.',
    })

    const result = await createSacramentalRecord(validSacramentalRecordInput)

    expect(result).toEqual({ ok: true, recordId: 'record-1' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
      allowPrimaryParishFallback: true,
      fallbackReason:
        'Sacramental Record creation used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'sacramental_records',
          method: 'insert',
          args: [expect.objectContaining({ parish_id: 'parish-1' })],
        }),
      ])
    )
  })

  it('fails before inserting when staff write parish context cannot be resolved', async () => {
    const { supabase } = createSacramentalRecordWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
      technicalDetail: 'No active parish membership was found.',
      source: 'membership',
      requestedParishId: null,
    })

    const result = await createSacramentalRecord(validSacramentalRecordInput)

    expect(result).toEqual({
      ok: false,
      error: 'Parish membership is required before writing parish data.',
    })
    expect(supabase.from).not.toHaveBeenCalled()
    expect(validateSacramentalRecordCreateRelationshipsMock).not.toHaveBeenCalled()
  })

  it.each([
    ['request_not_found', 'Request not found for the selected parish.'],
    ['request_already_linked', 'A sacramental record already exists for this request.'],
    ['person_not_found', 'Person not found for the selected parish.'],
  ] as const)('blocks %s relationships before inserting', async (reason, error) => {
    const { supabase } = createSacramentalRecordWriteSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    validateSacramentalRecordCreateRelationshipsMock.mockResolvedValueOnce({ ok: false, reason })

    const result = await createSacramentalRecord(validSacramentalRecordInput)

    expect(result).toEqual({ ok: false, error })
    expect(supabase.from).not.toHaveBeenCalled()
  })
})

describe('updateSacramentalRecord parish write context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
  })

  it('passes the active parish cookie into the staff write parish context and scopes the update', async () => {
    const { supabase, calls } = createSacramentalRecordUpdateSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await updateSacramentalRecord('record-1', validSacramentalRecordInput)

    expect(result).toEqual({ ok: true })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'Sacramental Record update used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'sacramental_records', method: 'eq', args: ['id', 'record-1'] },
        { table: 'sacramental_records', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'sacramental_records', method: 'select', args: ['id'] },
      ])
    )
  })

  it('returns a safe selected-parish not-found message when no row is updated', async () => {
    const { supabase } = createSacramentalRecordUpdateSupabaseMock(null)
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await updateSacramentalRecord('record-1', validSacramentalRecordInput)

    expect(result).toEqual({
      ok: false,
      error: 'Record not found for the selected parish.',
    })
  })
})

describe('updateSacramentalRecordPersonLink parish write context', () => {
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

  it('checks linked person ownership and scopes the record update to the selected parish', async () => {
    const { supabase, calls } = createSacramentalRecordPersonLinkSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)

    const result = await updateSacramentalRecordPersonLink('record-1', 'person-1')

    expect(result).toEqual({ ok: true })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'Sacramental Record person link update used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['id', 'person-1'] },
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'sacramental_records', method: 'eq', args: ['id', 'record-1'] },
        { table: 'sacramental_records', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'sacramental_records', method: 'select', args: ['id'] },
      ])
    )
  })
})
