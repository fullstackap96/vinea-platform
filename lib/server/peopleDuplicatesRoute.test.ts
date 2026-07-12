import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/auditLog', () => ({
  writeAuditEvent: vi.fn(),
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: vi.fn(),
}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

vi.mock('@/lib/server/staffWriteParishContext', () => ({
  resolveStaffWriteParishContext: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { GET, POST, peopleDuplicatesRouteTestInternals } from '@/app/api/people/duplicates/route'

const requireStaffFromRequestMock = vi.mocked(requireStaffFromRequest)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const resolveStaffWriteParishContextMock = vi.mocked(resolveStaffWriteParishContext)
const createSupabaseServiceRoleClientMock = vi.mocked(createSupabaseServiceRoleClient)
const writeAuditEventMock = vi.mocked(writeAuditEvent)

type QueryCall = {
  table: string
  method: string
  args: unknown[]
}

const peopleRows = [
  {
    id: 'person-1',
    parish_id: 'parish-2',
    parishioner_id: null,
    first_name: 'Maria',
    middle_name: null,
    last_name: 'Santos',
    email: 'maria@example.com',
    phone: '555-0100',
    date_of_birth: '1990-01-01',
    notes: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'person-2',
    parish_id: 'parish-2',
    parishioner_id: null,
    first_name: 'Maria',
    middle_name: null,
    last_name: 'Santos',
    email: 'maria@example.com',
    phone: '555-0100',
    date_of_birth: '1990-01-01',
    notes: null,
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  },
]

function createPeopleDuplicatesAdminMock() {
  const calls: QueryCall[] = []

  function dataFor(table: string) {
    if (table === 'people') return peopleRows
    if (table === 'requests') return [{ person_id: 'person-1' }]
    if (table === 'sacramental_records') return [{ person_id: 'person-2' }]
    if (table === 'household_members') return [{ person_id: 'person-1' }, { person_id: 'person-2' }]
    return []
  }

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
      in: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'in', args })
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
      then: (resolve: (value: { data: unknown[]; error: null }) => void) =>
        Promise.resolve({ data: dataFor(table), error: null }).then(resolve),
    }

    return builder
  }

  const admin = {
    from: vi.fn((table: string) => builderFor(table)),
  }

  return { admin, calls }
}

function createPeopleMergeAdminMock(
  options: {
    canonicalUpdatePresent?: boolean
    clearedParishionerLinkPresent?: boolean
    finalDeletePresent?: boolean
    duplicateMembershipPresent?: boolean
    insertedMembershipPresent?: boolean
    restoredParishionerLinkPresent?: boolean
    transferParishionerLink?: boolean
  } = {}
) {
  const calls: QueryCall[] = []
  const canonicalUpdatePresent = options.canonicalUpdatePresent ?? true
  const clearedParishionerLinkPresent = options.clearedParishionerLinkPresent ?? true
  const finalDeletePresent = options.finalDeletePresent ?? true
  const duplicateMembershipPresent = options.duplicateMembershipPresent ?? false
  const insertedMembershipPresent = options.insertedMembershipPresent ?? true
  const restoredParishionerLinkPresent = options.restoredParishionerLinkPresent ?? true
  const mergePeopleRows = options.transferParishionerLink
    ? [peopleRows[0], { ...peopleRows[1], parishioner_id: 'parishioner-2' }]
    : peopleRows

  function dataFor(table: string) {
    if (table === 'people') return mergePeopleRows
    if (table === 'household_members' && duplicateMembershipPresent) {
      return [
        {
          id: 'membership-2',
          household_id: 'household-1',
          relationship: 'adult',
          is_primary_contact: false,
        },
      ]
    }
    if (table === 'household_members') return []
    return []
  }

  function builderFor(table: string) {
    let operation: 'select' | 'update' | 'delete' | 'insert' | null = null
    let updatePayload: Record<string, unknown> | null = null
    const builder = {
      select: vi.fn((...args: unknown[]) => {
        if (operation === null) operation = 'select'
        calls.push({ table, method: 'select', args })
        return builder
      }),
      update: vi.fn((...args: unknown[]) => {
        operation = 'update'
        updatePayload = (args[0] as Record<string, unknown>) ?? null
        calls.push({ table, method: 'update', args })
        return builder
      }),
      delete: vi.fn((...args: unknown[]) => {
        operation = 'delete'
        calls.push({ table, method: 'delete', args })
        return builder
      }),
      insert: vi.fn((...args: unknown[]) => {
        operation = 'insert'
        calls.push({ table, method: 'insert', args })
        return builder
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'eq', args })
        return builder
      }),
      in: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: 'in', args })
        return builder
      }),
      maybeSingle: vi.fn(() =>
        Promise.resolve({
          data:
            operation === 'update' &&
            table === 'people' &&
            updatePayload != null &&
            Object.prototype.hasOwnProperty.call(updatePayload, 'first_name') &&
            canonicalUpdatePresent
              ? { id: 'person-1' }
              : operation === 'update' &&
                  table === 'people' &&
                  updatePayload != null &&
                  !Object.prototype.hasOwnProperty.call(updatePayload, 'first_name') &&
                  updatePayload?.parishioner_id === null &&
                  clearedParishionerLinkPresent
                ? { id: 'person-2' }
                : operation === 'update' &&
                    table === 'people' &&
                    updatePayload != null &&
                    !Object.prototype.hasOwnProperty.call(updatePayload, 'first_name') &&
                    updatePayload?.parishioner_id === 'parishioner-2' &&
                    restoredParishionerLinkPresent
                  ? { id: 'person-2' }
              : operation === 'delete' && table === 'people' && finalDeletePresent
              ? { id: 'person-2' }
              : operation === 'delete' && table === 'household_members'
                ? { id: 'membership-1' }
                : operation === 'insert' && table === 'household_members' && insertedMembershipPresent
                  ? { id: 'membership-new' }
                : null,
          error: null,
        })
      ),
      then: (
        resolve: (value: { data?: unknown[] | null; error: null }) => void,
        reject?: (reason?: unknown) => void
      ) => {
        const value =
          operation === 'select'
            ? { data: dataFor(table), error: null }
            : { data: null, error: null }
        return Promise.resolve(value).then(resolve, reject)
      },
    }

    return builder
  }

  const admin = {
    from: vi.fn((table: string) => builderFor(table)),
  }

  return { admin, calls }
}

function staffSession(staffSupabase: unknown) {
  return {
    ok: true,
    supabase: staffSupabase,
    user: { id: 'user-1', email: 'staff@example.com' },
    staff: { email: 'staff@example.com', role: 'admin', source: 'database' },
  } as never
}

function mergeRequest(cookie?: string) {
  return new NextRequest('http://localhost/api/people/duplicates', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify({
      canonicalPersonId: 'person-1',
      duplicatePersonId: 'person-2',
      selectedFields: {},
    }),
  })
}

describe('people duplicates parish context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses active staff parish context for the duplicate-detection people parish filter', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createPeopleDuplicatesAdminMock()
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: true,
      supabase: staffSupabase,
      user: { id: 'user-1', email: 'staff@example.com' },
      staff: { email: 'staff@example.com', role: 'admin', source: 'database' },
    } as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1', 'parish-2'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-2',
      activeParish: { id: 'parish-2', name: 'Beta Parish' },
      parishes: [
        { id: 'parish-1', name: 'Alpha Parish' },
        { id: 'parish-2', name: 'Beta Parish' },
      ],
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const request = new Request('http://localhost/api/people/duplicates', {
      headers: { cookie: 'vinea_active_parish_id=parish-2' },
    })
    const response = await GET(request as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.candidates).toHaveLength(1)
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: 'parish-2',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-2'] },
      ])
    )
  })

  it('preserves primary parish fallback when no active parish cookie is present', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: null,
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result = await peopleDuplicatesRouteTestInternals.duplicateReadParishId(
      staffSupabase as never,
      null
    )

    expect(result).toEqual({ ok: true, parishId: 'parish-1' })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: null,
    })
  })

  it('fails closed when an active parish cookie is unauthorized', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-2',
      ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
    })

    const result = await peopleDuplicatesRouteTestInternals.duplicateReadParishId(
      { rpc: vi.fn(), from: vi.fn() } as never,
      'parish-2'
    )

    expect(result).toEqual({
      ok: false,
      error: 'You are not authorized to review duplicate people for this parish.',
      requestedParishId: 'parish-2',
    })
  })

  it('returns a context error before querying people when parish context fails', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin } = createPeopleDuplicatesAdminMock()
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: true,
      supabase: staffSupabase,
      user: { id: 'user-1', email: 'staff@example.com' },
      staff: { email: 'staff@example.com', role: 'admin', source: 'database' },
    } as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'Could not resolve parish context.',
      technicalDetail: 'primary_parish_id failed',
      requestedParishId: null,
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await GET(new Request('http://localhost/api/people/duplicates') as never)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({ ok: false, error: 'Could not resolve parish context.' })
    expect(admin.from).not.toHaveBeenCalled()
  })

  it('documents active parish wiring for duplicate reads and writes', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'api', 'people', 'duplicates', 'route.ts'),
      'utf8'
    )

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('function activeParishCookie(request: NextRequest): string | null')
    expect(source).toContain("request.headers.get('cookie')")
    expect(source).toContain('duplicateReadParishId(staff.supabase, activeParishCookie(request))')
    expect(source).toContain('duplicateReadParishId(staff.supabase, activeParishCookie(request))')
    expect(source).toContain('.select(PEOPLE_DUPLICATE_SELECT)')
    expect(source).not.toContain(".select('*')")
  })

  it('keeps people duplicate load and merge failures behind safe route messages', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'api', 'people', 'duplicates', 'route.ts'),
      'utf8'
    )

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('function peopleDuplicateErrorResponse(')
    expect(source).toContain('Could not load duplicate review.')
    expect(source).toContain('Could not merge these people.')

    for (const action of [
      'merge_people_lookup',
      'merge_clear_duplicate_parishioner_id',
      'merge_restore_duplicate_parishioner_id',
      'merge_update_canonical_person',
      'merge_repoint_requests',
      'merge_repoint_records',
      'merge_load_duplicate_households',
      'merge_delete_duplicate_household_membership',
      'merge_insert_canonical_household_membership',
      'merge_delete_duplicate_person',
    ]) {
      expect(source).toContain(action)
    }

    for (const rawPattern of [
      'error: peopleError.message',
      'error: error.message',
      'error: updateCanonicalError.message',
      'error: requestsUpdate.error.message',
      'error: recordsUpdate.error.message',
      'error: membershipsError.message',
      'error: deleteMembershipError.message',
      'error: insertMembershipError.message',
      'error: deletePersonError.message',
    ]) {
      expect(source).not.toContain(rawPattern)
    }
  })

  it('uses active staff parish context for people duplicate merge writes when the active parish cookie is present', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createPeopleMergeAdminMock()
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await POST(
      mergeRequest('vinea_active_parish_id=parish-2') as never
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({
      ok: true,
      mergedIntoPersonId: 'person-1',
      deletedPersonId: 'person-2',
    })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'People duplicate merge used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'requests', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'sacramental_records', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'household_members', method: 'eq', args: ['parish_id', 'parish-2'] },
      ])
    )
  })

  it('preserves primary parish fallback for people duplicate merge writes only when no active parish cookie is present', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createPeopleMergeAdminMock()
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason:
        'People duplicate merge used legacy parish context because active parish selection was not available.',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await POST(mergeRequest() as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: null,
      allowPrimaryParishFallback: true,
      fallbackReason:
        'People duplicate merge used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'people', method: 'eq', args: ['parish_id', 'parish-1'] },
      ])
    )
  })

  it('does not report or audit a completed people merge when the final scoped delete matches no row', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin } = createPeopleMergeAdminMock({ finalDeletePresent: false })
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await POST(
      mergeRequest('vinea_active_parish_id=parish-2') as never
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Could not merge these people.',
    })
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('stops before linked-row movement when the canonical people update matches no row', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createPeopleMergeAdminMock({ canonicalUpdatePresent: false })
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await POST(
      mergeRequest('vinea_active_parish_id=parish-2') as never
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Could not merge these people.',
    })
    expect(calls.some((call) => call.method === 'delete')).toBe(false)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('restores a transferred parishioner link when the canonical update matches no row', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createPeopleMergeAdminMock({
      canonicalUpdatePresent: false,
      transferParishionerLink: true,
    })
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await POST(mergeRequest('vinea_active_parish_id=parish-2') as never)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Could not merge these people.',
    })
    const peopleUpdates = calls.filter(
      (call) => call.table === 'people' && call.method === 'update'
    )
    expect(peopleUpdates.map((call) => call.args[0])).toEqual([
      { parishioner_id: null },
      expect.objectContaining({ parishioner_id: 'parishioner-2' }),
      { parishioner_id: 'parishioner-2' },
    ])
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('stops before the canonical update when the temporary parishioner unlink matches no row', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createPeopleMergeAdminMock({
      clearedParishionerLinkPresent: false,
      transferParishionerLink: true,
    })
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await POST(mergeRequest('vinea_active_parish_id=parish-2') as never)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Could not merge these people.',
    })
    expect(
      calls.filter((call) => call.table === 'people' && call.method === 'update')
    ).toHaveLength(1)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('gives explicit recovery guidance when a transferred parishioner link cannot be restored', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin } = createPeopleMergeAdminMock({
      canonicalUpdatePresent: false,
      restoredParishionerLinkPresent: false,
      transferParishionerLink: true,
    })
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await POST(mergeRequest('vinea_active_parish_id=parish-2') as never)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error:
        'Could not complete this merge. The parishioner link may need administrator review before retrying.',
    })
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('keeps the duplicate household relationship when its canonical replacement insert matches no row', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createPeopleMergeAdminMock({
      duplicateMembershipPresent: true,
      insertedMembershipPresent: false,
    })
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await POST(
      mergeRequest('vinea_active_parish_id=parish-2') as never
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Could not merge these people.',
    })
    expect(calls.some((call) => call.method === 'insert')).toBe(true)
    expect(calls.some((call) => call.method === 'delete')).toBe(false)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('confirms a canonical household relationship before deleting its duplicate relationship', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createPeopleMergeAdminMock({ duplicateMembershipPresent: true })
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await POST(
      mergeRequest('vinea_active_parish_id=parish-2') as never
    )

    expect(response.status).toBe(200)
    const insertIndex = calls.findIndex(
      (call) => call.table === 'household_members' && call.method === 'insert'
    )
    const deleteIndex = calls.findIndex(
      (call) => call.table === 'household_members' && call.method === 'delete'
    )
    expect(insertIndex).toBeGreaterThanOrEqual(0)
    expect(deleteIndex).toBeGreaterThan(insertIndex)
  })

  it('fails before merging when the active parish cookie is not authorized for people duplicate merge writes', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin } = createPeopleMergeAdminMock()
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: false,
      error: 'You are not authorized to write to this parish.',
      technicalDetail: 'No active parish membership matched the requested parish.',
      source: 'membership',
      requestedParishId: 'parish-2',
    })
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await POST(
      mergeRequest('vinea_active_parish_id=parish-2') as never
    )
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({ ok: false, error: 'You are not authorized to write to this parish.' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'People duplicate merge used legacy parish context because active parish selection was not available.',
    })
    expect(admin.from).not.toHaveBeenCalled()
  })

  it('documents that people duplicate merge writes no longer call the legacy primary parish helper directly', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'api', 'people', 'duplicates', 'route.ts'),
      'utf8'
    )

    expect(source).toContain('resolveStaffWriteParishContext')
    expect(source).toContain('duplicateWriteParishId(staff.supabase, activeParishCookie(request))')
    expect(source).toContain('allowPrimaryParishFallback: !requestedParishId')
    expect(source).not.toContain('fetchPrimaryParishId')
    expect(source).not.toContain('const parishId = await primaryParishId(admin)')
    expect(source).toContain(".delete()\n    .eq('id', duplicatePersonId)")
    expect(source).toContain(".select('id')\n    .maybeSingle()")
    const canonicalConfirmationIndex = source.indexOf('!updatedCanonical?.id')
    expect(canonicalConfirmationIndex).toBeLessThan(
      source.indexOf(".from('requests')", canonicalConfirmationIndex)
    )
    expect(source.indexOf('!deletedPerson?.id')).toBeLessThan(
      source.indexOf("action: 'person.merge_completed'")
    )
  })
})
