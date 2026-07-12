import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/auditLog', () => ({
  writeAuditEvent: vi.fn(),
}))

vi.mock('@/lib/server/requestDetailAccess', () => ({
  loadStaffScopedRequestDetailAccess: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

import { createPersonFromRequestParishioner } from '@/app/dashboard/requests/actions'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { cookies } from 'next/headers'

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const createSupabaseServiceRoleClientMock = vi.mocked(createSupabaseServiceRoleClient)
const loadStaffScopedRequestDetailAccessMock = vi.mocked(loadStaffScopedRequestDetailAccess)
const writeAuditEventMock = vi.mocked(writeAuditEvent)
const cookiesMock = vi.mocked(cookies)

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

function createRequestPersonSupabaseMock() {
  const calls: QueryCall[] = []

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
      insert: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'insert', args })
        return builder
      }),
      update: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'update', args })
        return builder
      }),
      single: vi.fn(() => {
        if (table === 'requests') {
          return Promise.resolve({
            data: { person_id: null, parishioner_id: 'parishioner-1' },
            error: null,
          })
        }
        if (table === 'parishioners') {
          return Promise.resolve({
            data: {
              full_name: 'Maria Elena Santos',
              email: 'maria@example.com',
              phone: '555-0100',
            },
            error: null,
          })
        }
        if (table === 'people') {
          return Promise.resolve({
            data: { id: 'person-1' },
            error: null,
          })
        }
        return Promise.resolve({ data: null, error: null })
      }),
      maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      then: (resolve: (value: { data: unknown[]; error: null }) => void) =>
        Promise.resolve({ data: [{ id: 'request-1' }], error: null }).then(resolve),
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

function createRequestAuditAdminMock(parishId: string) {
  function builderFor(table: string) {
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      maybeSingle: vi.fn(() => {
        if (table === 'requests') {
          return Promise.resolve({
            data: { id: 'request-1', parishioner_id: 'parishioner-1' },
            error: null,
          })
        }
        if (table === 'parishioners') {
          return Promise.resolve({
            data: { parish_id: parishId },
            error: null,
          })
        }
        return Promise.resolve({ data: null, error: null })
      }),
    }

    return builder
  }

  return {
    from: vi.fn((table: string) => builderFor(table)),
  }
}

describe('createPersonFromRequestParishioner active parish request scope', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
    createSupabaseServiceRoleClientMock.mockReturnValue(
      createRequestAuditAdminMock('parish-1') as never
    )
    writeAuditEventMock.mockResolvedValue(undefined as never)
  })

  it('authorizes request-derived person creation through the active parish request scope', async () => {
    const { supabase, calls } = createRequestPersonSupabaseMock()
    const admin = createRequestAuditAdminMock('parish-2')
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    createSupabaseServiceRoleClientMock.mockReturnValue(admin as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce({
      requestId: 'request-1',
      parishId: 'parish-2',
    })

    const result = await createPersonFromRequestParishioner('request-1')

    expect(result).toEqual({ ok: true, personId: 'person-1' })
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenCalledWith(admin, 'request-1', {
      staffSupabase: supabase,
      activeParishId: 'parish-2',
      allowPrimaryParishFallback: false,
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'parishioners', method: 'eq', args: ['parish_id', 'parish-2'] },
        {
          table: 'people',
          method: 'insert',
          args: [
            {
              parish_id: 'parish-2',
              parishioner_id: 'parishioner-1',
              first_name: 'Maria',
              middle_name: 'Elena',
              last_name: 'Santos',
              email: 'maria@example.com',
              phone: '555-0100',
            },
          ],
        },
        { table: 'requests', method: 'update', args: [{ person_id: 'person-1' }] },
      ])
    )
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parishId: 'parish-2',
        action: 'request.person.linked',
        targetId: 'request-1',
        metadata: { personId: 'person-1', mode: 'created' },
      })
    )
  })

  it('preserves legacy parish fallback when no active parish cookie is present', async () => {
    const { supabase, calls } = createRequestPersonSupabaseMock()
    const admin = createRequestAuditAdminMock('parish-1')
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    createSupabaseServiceRoleClientMock.mockReturnValue(admin as never)
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce({
      requestId: 'request-1',
      parishId: 'parish-1',
    })

    const result = await createPersonFromRequestParishioner('request-1')

    expect(result).toEqual({ ok: true, personId: 'person-1' })
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenCalledWith(admin, 'request-1', {
      staffSupabase: supabase,
      activeParishId: null,
      allowPrimaryParishFallback: true,
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
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parishId: 'parish-1',
        action: 'request.person.linked',
        targetId: 'request-1',
      })
    )
  })

  it('fails before loading or inserting a person when request scope cannot be resolved', async () => {
    const { supabase, calls } = createRequestPersonSupabaseMock()
    createSupabaseServerClientMock.mockResolvedValueOnce(supabase as never)
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce(null)

    const result = await createPersonFromRequestParishioner('request-1')

    expect(result).toEqual({ ok: false, error: 'Request not found.' })
    expect(calls).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ table: 'requests', method: 'select' })])
    )
    expect(calls).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ table: 'people', method: 'insert' })])
    )
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })
})
