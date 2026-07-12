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

import { GET, POST, householdDuplicatesRouteTestInternals } from '@/app/api/households/duplicates/route'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { writeAuditEvent } from '@/lib/server/auditLog'

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

const householdRows = [
  {
    id: 'household-1',
    parish_id: 'parish-2',
    name: 'Santos Family',
    address: '123 Main St.',
    city: 'Kansas City',
    state: 'MO',
    postal_code: '64101',
    notes: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'household-2',
    parish_id: 'parish-2',
    name: 'The Santos Household',
    address: '123 Main St',
    city: 'Kansas City',
    state: 'MO',
    postal_code: '64101',
    notes: null,
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  },
]

function createHouseholdDuplicatesAdminMock() {
  const calls: QueryCall[] = []

  function dataFor(table: string) {
    if (table === 'households') return householdRows
    if (table === 'household_members') {
      return [
        { household_id: 'household-1', is_primary_contact: true },
        { household_id: 'household-2', is_primary_contact: false },
      ]
    }
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

function createHouseholdMergeAdminMock(
  options: {
    canonicalUpdatePresent?: boolean
    finalDeletePresent?: boolean
    duplicateMemberPresent?: boolean
    insertedMemberPresent?: boolean
  } = {}
) {
  const calls: QueryCall[] = []
  const canonicalUpdatePresent = options.canonicalUpdatePresent ?? true
  const finalDeletePresent = options.finalDeletePresent ?? true
  const duplicateMemberPresent = options.duplicateMemberPresent ?? false
  const insertedMemberPresent = options.insertedMemberPresent ?? true
  let householdMemberSelectCount = 0

  function dataFor(table: string, householdMemberSelectIndex?: number) {
    if (table === 'households') return householdRows
    if (
      table === 'household_members' &&
      duplicateMemberPresent &&
      householdMemberSelectIndex === 0
    ) {
      return [
        {
          id: 'member-2',
          person_id: 'person-2',
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
    const builder = {
      select: vi.fn((...args: unknown[]) => {
        if (operation === null) operation = 'select'
        calls.push({ table, method: 'select', args })
        return builder
      }),
      update: vi.fn((...args: unknown[]) => {
        operation = 'update'
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
            operation === 'update' && table === 'households' && canonicalUpdatePresent
              ? { id: 'household-1' }
              : operation === 'delete' && table === 'households' && finalDeletePresent
              ? { id: 'household-2' }
              : operation === 'delete' && table === 'household_members'
                ? { id: 'member-1' }
                : operation === 'insert' && table === 'household_members' && insertedMemberPresent
                  ? { id: 'member-new' }
                : null,
          error: null,
        })
      ),
      then: (
        resolve: (value: { data?: unknown[] | null; error: null }) => void,
        reject?: (reason?: unknown) => void
      ) => {
        const householdMemberSelectIndex =
          operation === 'select' && table === 'household_members'
            ? householdMemberSelectCount++
            : undefined
        const value = operation === 'select'
          ? { data: dataFor(table, householdMemberSelectIndex), error: null }
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
  return new NextRequest('http://localhost/api/households/duplicates', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify({
      canonicalHouseholdId: 'household-1',
      duplicateHouseholdId: 'household-2',
      selectedFields: {},
    }),
  })
}

describe('household duplicates parish context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses active staff parish context for the duplicate-detection household parish filter', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createHouseholdDuplicatesAdminMock()
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

    const request = new Request('http://localhost/api/households/duplicates', {
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
        { table: 'households', method: 'eq', args: ['parish_id', 'parish-2'] },
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

    const result = await householdDuplicatesRouteTestInternals.duplicateReadParishId(
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

    const result = await householdDuplicatesRouteTestInternals.duplicateReadParishId(
      { rpc: vi.fn(), from: vi.fn() } as never,
      'parish-2'
    )

    expect(result).toEqual({
      ok: false,
      error: 'You are not authorized to review duplicate households for this parish.',
      requestedParishId: 'parish-2',
    })
  })

  it('returns a context error before querying households when parish context fails', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin } = createHouseholdDuplicatesAdminMock()
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

    const response = await GET(new Request('http://localhost/api/households/duplicates') as never)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body).toEqual({ ok: false, error: 'Could not resolve parish context.' })
    expect(admin.from).not.toHaveBeenCalled()
  })

  it('documents active parish wiring for duplicate reads and writes', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'api', 'households', 'duplicates', 'route.ts'),
      'utf8'
    )

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('function activeParishCookie(request: NextRequest): string | null')
    expect(source).toContain("request.headers.get('cookie')")
    expect(source).toContain('duplicateReadParishId(staff.supabase, activeParishCookie(request))')
    expect(source).toContain('duplicateWriteParishId(staff.supabase, activeParishCookie(request))')
    expect(source).toContain('.select(HOUSEHOLD_DUPLICATE_SELECT)')
    expect(source).not.toContain(".select('*')")
  })

  it('keeps household duplicate load and merge failures behind safe route messages', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'api', 'households', 'duplicates', 'route.ts'),
      'utf8'
    )

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('function householdDuplicateErrorResponse(')
    expect(source).toContain('Could not load household review.')
    expect(source).toContain('Could not merge these households.')

    for (const action of [
      'merge_households_lookup',
      'merge_update_canonical_household',
      'merge_load_duplicate_members',
      'merge_load_canonical_members',
      'merge_insert_canonical_member',
      'merge_delete_duplicate_member',
      'merge_delete_duplicate_household',
    ]) {
      expect(source).toContain(action)
    }

    for (const rawPattern of [
      'error: householdsError.message',
      'error: updateCanonicalError.message',
      'error: duplicateMembersError.message',
      'error: canonicalMembersError.message',
      'error: insertError.message',
      'error: deleteMemberError.message',
      'error: deleteHouseholdError.message',
    ]) {
      expect(source).not.toContain(rawPattern)
    }
  })

  it('uses active staff parish context for household duplicate merge writes when the active parish cookie is present', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createHouseholdMergeAdminMock()
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
      mergedIntoHouseholdId: 'household-1',
      deletedHouseholdId: 'household-2',
    })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(staffSupabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason:
        'Household duplicate merge used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'households', method: 'eq', args: ['parish_id', 'parish-2'] },
        { table: 'household_members', method: 'eq', args: ['parish_id', 'parish-2'] },
      ])
    )
  })

  it('preserves primary parish fallback for household duplicate merge writes only when no active parish cookie is present', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createHouseholdMergeAdminMock()
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(staffSupabase))
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason:
        'Household duplicate merge used legacy parish context because active parish selection was not available.',
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
        'Household duplicate merge used legacy parish context because active parish selection was not available.',
    })
    expect(calls).toEqual(
      expect.arrayContaining([
        { table: 'households', method: 'eq', args: ['parish_id', 'parish-1'] },
      ])
    )
  })

  it('does not report or audit a completed household merge when the final scoped delete matches no row', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin } = createHouseholdMergeAdminMock({ finalDeletePresent: false })
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
      error: 'Could not merge these households.',
    })
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('stops before member movement when the canonical household update matches no row', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createHouseholdMergeAdminMock({ canonicalUpdatePresent: false })
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
      error: 'Could not merge these households.',
    })
    expect(calls.some((call) => call.method === 'insert' || call.method === 'delete')).toBe(false)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('keeps the duplicate household member when its canonical replacement insert matches no row', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createHouseholdMergeAdminMock({
      duplicateMemberPresent: true,
      insertedMemberPresent: false,
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
      error: 'Could not merge these households.',
    })
    expect(calls.some((call) => call.method === 'insert')).toBe(true)
    expect(calls.some((call) => call.method === 'delete')).toBe(false)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('confirms a canonical household member before deleting the duplicate member', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin, calls } = createHouseholdMergeAdminMock({ duplicateMemberPresent: true })
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

  it('fails before merging when the active parish cookie is not authorized for household duplicate merge writes', async () => {
    const staffSupabase = { rpc: vi.fn(), from: vi.fn() }
    const { admin } = createHouseholdMergeAdminMock()
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
        'Household duplicate merge used legacy parish context because active parish selection was not available.',
    })
    expect(admin.from).not.toHaveBeenCalled()
  })

  it('documents that household duplicate merge writes no longer call the legacy primary parish helper directly', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'api', 'households', 'duplicates', 'route.ts'),
      'utf8'
    )

    expect(source).toContain('resolveStaffWriteParishContext')
    expect(source).toContain('duplicateWriteParishId(staff.supabase, activeParishCookie(request))')
    expect(source).toContain('allowPrimaryParishFallback: !requestedParishId')
    expect(source).not.toContain('fetchPrimaryParishId')
    expect(source).not.toContain('const parishId = await primaryParishId(admin)')
    expect(source).toContain(".delete()\n    .eq('id', duplicateHouseholdId)")
    expect(source).toContain(".select('id')\n    .maybeSingle()")
    expect(source.indexOf('!updatedCanonical?.id')).toBeLessThan(
      source.indexOf("const { data: duplicateMembers")
    )
    expect(source.indexOf('!deletedHousehold?.id')).toBeLessThan(
      source.indexOf("action: 'household.merge_completed'")
    )
  })
})
