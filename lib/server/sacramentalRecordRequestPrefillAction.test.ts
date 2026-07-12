import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

vi.mock('@/lib/server/requestDetailAccess', () => ({
  loadStaffScopedRequestDetailAccess: vi.fn(),
}))

vi.mock('@/lib/server/safeErrorLogging', () => ({
  logServerError: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

import {
  SACRAMENTAL_RECORD_REQUEST_PREFILL_SELECT,
  loadSacramentalRecordRequestPrefill,
} from '@/app/dashboard/records/actions'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { cookies } from 'next/headers'

const createSupabaseServerClientMock = vi.mocked(createSupabaseServerClient)
const createSupabaseServiceRoleClientMock = vi.mocked(createSupabaseServiceRoleClient)
const loadStaffScopedRequestDetailAccessMock = vi.mocked(loadStaffScopedRequestDetailAccess)
const cookiesMock = vi.mocked(cookies)

type QueryResponse = {
  data: unknown
  error: unknown
}

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

function cookieStore(value: string | null) {
  return {
    get: vi.fn((name: string) =>
      name === ACTIVE_STAFF_PARISH_COOKIE && value ? { name, value } : undefined
    ),
  }
}

function createStaffSupabaseMock() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'staff-1', email: 'staff@example.com' } },
        error: null,
      }),
    },
  }
}

function createReadSupabaseMock(responses: Record<string, QueryResponse[]>) {
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
      maybeSingle: vi.fn(() => Promise.resolve(responses[table]?.shift() ?? { data: null, error: null })),
    }

    return builder
  }

  return {
    calls,
    supabase: {
      from: vi.fn((table: string) => builderFor(table)),
    },
  }
}

describe('loadSacramentalRecordRequestPrefill', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookiesMock.mockResolvedValue(cookieStore(null) as never)
  })

  it('loads request prefill through active-parish-scoped staff authorization', async () => {
    const staffSupabase = createStaffSupabaseMock()
    const { supabase: admin, calls } = createReadSupabaseMock({
      requests: [
        {
          data: {
            id: 'request-1',
            request_type: 'baptism',
            status: 'complete',
            child_name: 'Lucia Santos',
            confirmed_baptism_date: '2026-07-04',
            parishioner_id: 'parishioner-1',
            person_id: 'person-1',
            assigned_priest_name: 'Fr. Thomas',
            notes: 'Safe request note',
          },
          error: null,
        },
      ],
      parishioners: [{ data: { full_name: 'Santos Family' }, error: null }],
      sacramental_records: [{ data: null, error: null }],
    })

    createSupabaseServerClientMock.mockResolvedValueOnce(staffSupabase as never)
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce({
      requestId: 'request-1',
      parishId: 'parish-2',
    })

    const result = await loadSacramentalRecordRequestPrefill('request-1')

    expect(result).toMatchObject({
      ok: true,
      requestId: 'request-1',
      personId: 'person-1',
      values: {
        recordType: 'baptism',
        personName: 'Lucia Santos',
        sacramentDate: '2026-07-04',
        minister: 'Fr. Thomas',
        notes: 'Safe request note',
      },
    })
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenCalledWith(admin, 'request-1', {
      staffSupabase,
      activeParishId: 'parish-2',
      allowPrimaryParishFallback: false,
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          table: 'requests',
          method: 'select',
          args: [SACRAMENTAL_RECORD_REQUEST_PREFILL_SELECT],
        },
        { table: 'requests', method: 'eq', args: ['id', 'request-1'] },
        { table: 'parishioners', method: 'eq', args: ['id', 'parishioner-1'] },
        { table: 'sacramental_records', method: 'eq', args: ['request_id', 'request-1'] },
      ])
    )
    expect(SACRAMENTAL_RECORD_REQUEST_PREFILL_SELECT).not.toContain('*')
    expect(SACRAMENTAL_RECORD_REQUEST_PREFILL_SELECT).not.toContain('reply_draft')
    expect(SACRAMENTAL_RECORD_REQUEST_PREFILL_SELECT).not.toContain('staff_notes')
  })

  it('denies prefill before loading request rows when scoped access fails', async () => {
    const staffSupabase = createStaffSupabaseMock()
    const { supabase: admin } = createReadSupabaseMock({})

    createSupabaseServerClientMock.mockResolvedValueOnce(staffSupabase as never)
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce(null)

    const result = await loadSacramentalRecordRequestPrefill('cross-parish-request')

    expect(result).toEqual({ ok: false, error: 'Request not found.' })
    expect(admin.from).not.toHaveBeenCalled()
  })

  it('preserves primary-parish fallback only when no active parish cookie exists', async () => {
    const staffSupabase = createStaffSupabaseMock()
    const { supabase: admin } = createReadSupabaseMock({
      requests: [
        {
          data: {
            id: 'request-legacy',
            request_type: 'baptism',
            status: 'complete',
            child_name: 'Legacy Parish Child',
            confirmed_baptism_date: '2026-07-06',
          },
          error: null,
        },
      ],
      sacramental_records: [{ data: null, error: null }],
    })

    createSupabaseServerClientMock.mockResolvedValueOnce(staffSupabase as never)
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)
    cookiesMock.mockResolvedValueOnce(cookieStore(null) as never)
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce({
      requestId: 'request-legacy',
      parishId: 'primary-parish',
    })

    const result = await loadSacramentalRecordRequestPrefill(' request-legacy ')

    expect(result).toMatchObject({
      ok: true,
      requestId: 'request-legacy',
      values: {
        recordType: 'baptism',
        personName: 'Legacy Parish Child',
        sacramentDate: '2026-07-06',
      },
    })
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenCalledWith(admin, 'request-legacy', {
      staffSupabase,
      activeParishId: null,
      allowPrimaryParishFallback: true,
    })
  })

  it('fails closed before duplicate checks when request-type supporting details cannot load', async () => {
    const staffSupabase = createStaffSupabaseMock()
    const { supabase: admin, calls } = createReadSupabaseMock({
      requests: [
        {
          data: {
            id: 'wedding-request',
            request_type: 'wedding',
            status: 'complete',
          },
          error: null,
        },
      ],
      wedding_request_details: [{ data: null, error: new Error('database detail failure') }],
    })

    createSupabaseServerClientMock.mockResolvedValueOnce(staffSupabase as never)
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)
    cookiesMock.mockResolvedValueOnce(cookieStore('parish-2') as never)
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce({
      requestId: 'wedding-request',
      parishId: 'parish-2',
    })

    const result = await loadSacramentalRecordRequestPrefill('wedding-request')

    expect(result).toEqual({
      ok: false,
      error: 'Could not safely prepare this request for record prefill. Please open the request and try again.',
    })
    expect(calls).not.toEqual(
      expect.arrayContaining([
        { table: 'sacramental_records', method: 'eq', args: ['request_id', 'wedding-request'] },
      ])
    )
  })
})
