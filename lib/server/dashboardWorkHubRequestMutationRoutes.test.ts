import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireStaffFromRequestMock = vi.hoisted(() => vi.fn())
const loadStaffScopedRequestDetailAccessMock = vi.hoisted(() => vi.fn())
const createSupabaseServiceRoleClientMock = vi.hoisted(() => vi.fn())
const writeAuditEventMock = vi.hoisted(() => vi.fn())
const logServerErrorMock = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: requireStaffFromRequestMock,
}))

vi.mock('@/lib/server/requestDetailAccess', () => ({
  loadStaffScopedRequestDetailAccess: loadStaffScopedRequestDetailAccessMock,
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: createSupabaseServiceRoleClientMock,
}))

vi.mock('@/lib/server/auditLog', () => ({
  writeAuditEvent: writeAuditEventMock,
}))

vi.mock('@/lib/server/safeErrorLogging', () => ({
  logServerError: logServerErrorMock,
}))

import { POST as markContacted } from '@/app/api/requests/[id]/mark-contacted/route'
import { POST as saveCareTouchpoint } from '@/app/api/requests/[id]/care-touchpoint/route'

type AdminOptions = {
  requestType?: string
  communicationError?: Error | null
  funeralError?: Error | null
  funeralUpdateMissing?: boolean
  requestUpdateError?: Error | null
  requestUpdateMissing?: boolean
}

function routeContext(id = 'request-a') {
  return { params: Promise.resolve({ id }) }
}

function postRequest(
  path: string,
  body?: Record<string, unknown>,
  parishId: string | null = 'parish-a',
  parishHeader?: string,
  origin = 'https://vinea.test',
) {
  const request = new NextRequest(`https://vinea.test${path}`, {
    method: 'POST',
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(parishHeader ? { 'x-vinea-active-parish-id': parishHeader } : {}),
      origin,
      'sec-fetch-site': 'same-origin',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (parishId) request.cookies.set('vinea_active_parish_id', parishId)
  return request
}

function buildAdmin(options: AdminOptions = {}) {
  const writes: Array<{ table: string; operation: 'insert' | 'update'; payload: unknown }> = []
  const requestType = options.requestType ?? 'funeral'

  const admin = {
    from: vi.fn((table: string) => {
      if (table === 'request_communications') {
        return {
          insert: vi.fn(async (payload: unknown) => {
            writes.push({ table, operation: 'insert', payload })
            return { error: options.communicationError ?? null }
          }),
        }
      }

      if (table === 'funeral_request_details') {
        return {
          update: vi.fn((payload: unknown) => ({
            eq: vi.fn(() => {
              writes.push({ table, operation: 'update', payload })
              return {
                select: vi.fn(() => ({
                  maybeSingle: vi.fn(async () => ({
                    data: options.funeralUpdateMissing ? null : { request_id: 'request-a' },
                    error: options.funeralError ?? null,
                  })),
                })),
              }
            }),
          })),
        }
      }

      if (table === 'requests') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({
                data: { id: 'request-a', request_type: requestType },
                error: null,
              })),
            })),
          })),
          update: vi.fn((payload: unknown) => ({
            eq: vi.fn(() => {
              writes.push({ table, operation: 'update', payload })
              return {
                select: vi.fn(() => ({
                  maybeSingle: vi.fn(async () => ({
                    data: options.requestUpdateMissing ? null : { id: 'request-a' },
                    error: options.requestUpdateError ?? null,
                  })),
                })),
              }
            }),
          })),
        }
      }

      throw new Error(`Unexpected table: ${table}`)
    }),
  }

  return { admin, writes }
}

function careBody(overrides: Record<string, unknown> = {}) {
  return {
    method: 'phone',
    notes: 'Care plan touchpoint: Safe family label\nStaff-reviewed call completed.',
    nextFollowUpDate: '2026-07-17',
    careCycleComplete: false,
    ...overrides,
  }
}

describe('Daily Work Hub active-parish request mutation APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      supabase: { auth: { getUser: vi.fn() } },
      user: { id: 'staff-user-a', email: 'staff@example.test' },
      staff: { email: 'staff@example.test', role: 'staff', source: 'database' },
    })
    loadStaffScopedRequestDetailAccessMock.mockResolvedValue({
      requestId: 'request-a',
      parishId: 'parish-a',
    })
    writeAuditEventMock.mockResolvedValue(undefined)
  })

  it('rejects cross-origin mutations before authentication or privileged writes', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await markContacted(
      postRequest(
        '/api/requests/request-a/mark-contacted',
        undefined,
        'parish-a',
        undefined,
        'https://attacker.test',
      ),
      routeContext(),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Invalid request.' })
    expect(requireStaffFromRequestMock).not.toHaveBeenCalled()
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(writes).toEqual([])
  })

  it('marks a same-parish request contacted and writes only safe audit metadata', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await markContacted(
      postRequest('/api/requests/request-a/mark-contacted'),
      routeContext(),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenCalledWith(
      admin,
      'request-a',
      expect.objectContaining({
        activeParishId: 'parish-a',
        allowPrimaryParishFallback: false,
      }),
    )
    expect(writes).toHaveLength(2)
    expect(writes[0]).toMatchObject({
      table: 'request_communications',
      operation: 'insert',
      payload: {
        request_id: 'request-a',
        method: 'email',
        notes: 'Marked as contacted from Follow-Up Queue',
      },
    })
    expect(writes[1]).toMatchObject({
      table: 'requests',
      operation: 'update',
      payload: {
        last_contact_method: 'email',
        communication_notes: 'Marked as contacted from Follow-Up Queue',
      },
    })
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parishId: 'parish-a',
        actorEmail: 'staff@example.test',
        action: 'request.communication.logged',
        targetId: 'request-a',
        metadata: expect.objectContaining({
          source: 'daily_work_hub_mark_contacted',
          outcome: 'completed',
          communicationLogged: true,
          requestSummaryUpdated: true,
        }),
      }),
    )
  })

  it('validates the server-selected parish hint when no active parish cookie exists', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await markContacted(
      postRequest(
        '/api/requests/request-a/mark-contacted',
        undefined,
        null,
        'parish-a',
      ),
      routeContext(),
    )

    expect(response.status).toBe(200)
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenCalledWith(
      admin,
      'request-a',
      expect.objectContaining({
        activeParishId: 'parish-a',
        allowPrimaryParishFallback: false,
      }),
    )
    expect(writes).toHaveLength(2)
  })

  it('fails closed generically when neither action has a selected parish scope', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)
    loadStaffScopedRequestDetailAccessMock.mockResolvedValue(null)

    const markResponse = await markContacted(
      postRequest('/api/requests/request-a/mark-contacted', undefined, null),
      routeContext(),
    )

    expect(markResponse.status).toBe(404)
    await expect(markResponse.json()).resolves.toEqual({
      ok: false,
      error: 'Request not found.',
    })
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenLastCalledWith(
      admin,
      'request-a',
      expect.objectContaining({
        activeParishId: null,
        allowPrimaryParishFallback: false,
      }),
    )

    const careResponse = await saveCareTouchpoint(
      postRequest('/api/requests/request-a/care-touchpoint', careBody(), null),
      routeContext(),
    )

    expect(careResponse.status).toBe(404)
    await expect(careResponse.json()).resolves.toEqual({
      ok: false,
      error: 'Request not found.',
    })
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenLastCalledWith(
      admin,
      'request-a',
      expect.objectContaining({
        activeParishId: null,
        allowPrimaryParishFallback: false,
      }),
    )
    expect(writes).toHaveLength(0)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('keeps the active parish cookie authoritative over a forged parish header', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await markContacted(
      postRequest(
        '/api/requests/request-a/mark-contacted',
        undefined,
        'parish-a',
        'parish-b',
      ),
      routeContext(),
    )

    expect(response.status).toBe(200)
    expect(loadStaffScopedRequestDetailAccessMock).toHaveBeenCalledWith(
      admin,
      'request-a',
      expect.objectContaining({
        activeParishId: 'parish-a',
        allowPrimaryParishFallback: false,
      }),
    )
    expect(writes).toHaveLength(2)
  })

  it('rejects unauthorized or cross-parish mark-contacted writes without mutation', async () => {
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    })
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const unauthorized = await markContacted(
      postRequest('/api/requests/request-a/mark-contacted'),
      routeContext(),
    )
    expect(unauthorized.status).toBe(401)
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(writes).toHaveLength(0)

    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce(null)
    const denied = await markContacted(
      postRequest('/api/requests/request-b/mark-contacted', undefined, 'parish-a'),
      routeContext('request-b'),
    )
    expect(denied.status).toBe(404)
    expect(await denied.json()).toEqual({ ok: false, error: 'Request not found.' })
    expect(writes).toHaveLength(0)
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('reports a partial mark-contacted save when history succeeded but summary failed', async () => {
    const { admin, writes } = buildAdmin({ requestUpdateError: new Error('summary failed') })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await markContacted(
      postRequest('/api/requests/request-a/mark-contacted'),
      routeContext(),
    )
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toMatchObject({
      ok: false,
      partial: true,
      completed: { communicationLogged: true, requestSummaryUpdated: false },
    })
    expect(writes).toHaveLength(2)
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ outcome: 'partial' }),
      }),
    )
  })

  it('reports partial mark-contacted completion when the authorized request disappears before update', async () => {
    const { admin, writes } = buildAdmin({ requestUpdateMissing: true })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await markContacted(
      postRequest('/api/requests/request-a/mark-contacted'),
      routeContext(),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      partial: true,
      completed: { communicationLogged: true, requestSummaryUpdated: false },
    })
    expect(writes.map((write) => write.table)).toEqual(['request_communications', 'requests'])
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ outcome: 'partial' }),
      }),
    )
  })

  it('saves a same-parish care touchpoint, funeral follow-up, and request summary in order', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await saveCareTouchpoint(
      postRequest('/api/requests/request-a/care-touchpoint', careBody()),
      routeContext(),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      ok: true,
      completed: {
        communicationLogged: true,
        funeralCareDateUpdated: true,
        requestSummaryUpdated: true,
      },
    })
    expect(writes.map((write) => write.table)).toEqual([
      'request_communications',
      'funeral_request_details',
      'requests',
    ])
    expect(writes[1]).toMatchObject({
      payload: { post_funeral_follow_up_date: '2026-07-17' },
    })
    expect(writes[2]).toMatchObject({
      payload: {
        last_contact_method: 'phone',
        next_follow_up_date: '2026-07-17',
      },
    })

    const auditCall = writeAuditEventMock.mock.calls.at(-1)?.[0]
    expect(auditCall).toMatchObject({
      parishId: 'parish-a',
      actorEmail: 'staff@example.test',
      metadata: {
        source: 'daily_work_hub_care_touchpoint',
        outcome: 'completed',
        careCycleComplete: false,
        nextFollowUpDate: '2026-07-17',
      },
    })
    expect(JSON.stringify(auditCall)).not.toContain('Staff-reviewed call completed.')
  })

  it('preserves the staff-reviewed care-cycle completion behavior', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await saveCareTouchpoint(
      postRequest(
        '/api/requests/request-a/care-touchpoint',
        careBody({ careCycleComplete: true, nextFollowUpDate: '' }),
      ),
      routeContext(),
    )

    expect(response.status).toBe(200)
    expect(writes[1]).toMatchObject({
      payload: { post_funeral_follow_up_date: null },
    })
    expect(writes[2]).toMatchObject({
      payload: {
        next_follow_up_date: null,
        status: 'complete',
      },
    })
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          careCycleComplete: true,
          nextFollowUpDate: null,
        }),
      }),
    )
  })

  it('preserves the staff-reviewed sent-card touchpoint option', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await saveCareTouchpoint(
      postRequest(
        '/api/requests/request-a/care-touchpoint',
        careBody({ method: 'card' }),
      ),
      routeContext(),
    )

    expect(response.status).toBe(200)
    expect(writes[0]).toMatchObject({
      table: 'request_communications',
      payload: { method: 'card' },
    })
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ label: 'card' }),
      }),
    )
  })

  it('rejects an unauthenticated care touchpoint before creating a service client', async () => {
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await saveCareTouchpoint(
      postRequest('/api/requests/request-a/care-touchpoint', careBody()),
      routeContext(),
    )

    expect(response.status).toBe(401)
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(loadStaffScopedRequestDetailAccessMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('fails closed before care writes for invalid input, forged scope, or non-funeral requests', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const invalid = await saveCareTouchpoint(
      postRequest(
        '/api/requests/request-a/care-touchpoint',
        careBody({ nextFollowUpDate: 'not-a-date' }),
      ),
      routeContext(),
    )
    expect(invalid.status).toBe(400)
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(writes).toHaveLength(0)

    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce(null)
    const denied = await saveCareTouchpoint(
      postRequest('/api/requests/request-b/care-touchpoint', careBody(), 'parish-a'),
      routeContext('request-b'),
    )
    expect(denied.status).toBe(404)
    expect(await denied.json()).toEqual({ ok: false, error: 'Request not found.' })
    expect(writes).toHaveLength(0)

    const nonFuneral = buildAdmin({ requestType: 'wedding' })
    createSupabaseServiceRoleClientMock.mockReturnValue(nonFuneral.admin)
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce({
      requestId: 'request-a',
      parishId: 'parish-a',
    })
    const wrongType = await saveCareTouchpoint(
      postRequest('/api/requests/request-a/care-touchpoint', careBody()),
      routeContext(),
    )
    expect(wrongType.status).toBe(404)
    expect(await wrongType.json()).toEqual({ ok: false, error: 'Request not found.' })
    expect(nonFuneral.writes).toHaveLength(0)
  })

  it('returns honest partial results and stops after the failed care stage', async () => {
    const funeralFailure = buildAdmin({ funeralError: new Error('funeral update failed') })
    createSupabaseServiceRoleClientMock.mockReturnValue(funeralFailure.admin)

    const funeralResponse = await saveCareTouchpoint(
      postRequest('/api/requests/request-a/care-touchpoint', careBody()),
      routeContext(),
    )
    expect(funeralResponse.status).toBe(500)
    expect(await funeralResponse.json()).toMatchObject({
      ok: false,
      partial: true,
      partialStep: 'funeral_care_date',
      completed: {
        communicationLogged: true,
        funeralCareDateUpdated: false,
        requestSummaryUpdated: false,
      },
    })
    expect(funeralFailure.writes.map((write) => write.table)).toEqual([
      'request_communications',
      'funeral_request_details',
    ])

    const requestFailure = buildAdmin({ requestUpdateError: new Error('request update failed') })
    createSupabaseServiceRoleClientMock.mockReturnValue(requestFailure.admin)

    const requestResponse = await saveCareTouchpoint(
      postRequest('/api/requests/request-a/care-touchpoint', careBody()),
      routeContext(),
    )
    expect(requestResponse.status).toBe(500)
    expect(await requestResponse.json()).toMatchObject({
      ok: false,
      partial: true,
      partialStep: 'request_summary',
      completed: {
        communicationLogged: true,
        funeralCareDateUpdated: true,
        requestSummaryUpdated: false,
      },
    })
    expect(requestFailure.writes.map((write) => write.table)).toEqual([
      'request_communications',
      'funeral_request_details',
      'requests',
    ])
  })

  it('treats zero-row funeral or request updates as partial care-touchpoint saves', async () => {
    const missingFuneral = buildAdmin({ funeralUpdateMissing: true })
    createSupabaseServiceRoleClientMock.mockReturnValue(missingFuneral.admin)

    const funeralResponse = await saveCareTouchpoint(
      postRequest('/api/requests/request-a/care-touchpoint', careBody()),
      routeContext(),
    )
    expect(funeralResponse.status).toBe(500)
    await expect(funeralResponse.json()).resolves.toMatchObject({
      ok: false,
      partial: true,
      partialStep: 'funeral_care_date',
    })
    expect(missingFuneral.writes.map((write) => write.table)).toEqual([
      'request_communications',
      'funeral_request_details',
    ])

    const missingRequest = buildAdmin({ requestUpdateMissing: true })
    createSupabaseServiceRoleClientMock.mockReturnValue(missingRequest.admin)

    const requestResponse = await saveCareTouchpoint(
      postRequest('/api/requests/request-a/care-touchpoint', careBody()),
      routeContext(),
    )
    expect(requestResponse.status).toBe(500)
    await expect(requestResponse.json()).resolves.toMatchObject({
      ok: false,
      partial: true,
      partialStep: 'request_summary',
    })
    expect(missingRequest.writes.map((write) => write.table)).toEqual([
      'request_communications',
      'funeral_request_details',
      'requests',
    ])
  })

  it('keeps dashboard callers off direct browser mutations for both actions', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'dashboard', 'DashboardPageCore.tsx'),
      'utf8',
    )
    const markBlock = source.slice(
      source.indexOf('async function runMarkFollowUpAsContactedCore'),
      source.indexOf('async function draftFollowUpEmail'),
    )
    const careBlock = source.slice(
      source.indexOf('async function completeCarePlanTouchpoint'),
      source.indexOf('function followUpQueueRow'),
    )

    expect(markBlock).toContain('/mark-contacted`')
    expect(markBlock).toContain("method: 'POST'")
    expect(markBlock).toContain("credentials: 'include'")
    expect(markBlock).toContain("'X-Vinea-Active-Parish-Id': activeParishId")
    expect(careBlock).toContain('/care-touchpoint`')
    expect(careBlock).toContain("method: 'POST'")
    expect(careBlock).toContain('partialStep')
    expect(careBlock).toContain("'X-Vinea-Active-Parish-Id': activeParishId")

    for (const block of [markBlock, careBlock]) {
      expect(block).not.toContain(".from('request_communications')")
      expect(block).not.toContain(".from('funeral_request_details')")
      expect(block).not.toContain(".from('requests')")
      expect(block).not.toContain('.insert(')
      expect(block).not.toContain('.update(')
    }

    const markRoute = readFileSync(
      join(
        process.cwd(),
        'app',
        'api',
        'requests',
        '[id]',
        'mark-contacted',
        'route.ts',
      ),
      'utf8',
    )
    const careRoute = readFileSync(
      join(
        process.cwd(),
        'app',
        'api',
        'requests',
        '[id]',
        'care-touchpoint',
        'route.ts',
      ),
      'utf8',
    )

    const markAuthIndex = markRoute.indexOf('const staff = await requireStaffFromRequest(request)')
    const markAccessIndex = markRoute.indexOf(
      'const access = await loadStaffScopedRequestDetailAccess',
    )
    const markWriteIndex = markRoute.indexOf(".from('request_communications').insert")
    expect(markAuthIndex).toBeGreaterThan(-1)
    expect(markAccessIndex).toBeGreaterThan(markAuthIndex)
    expect(markWriteIndex).toBeGreaterThan(markAccessIndex)
    expect(markRoute).toContain('allowPrimaryParishFallback: false')
    expect(markRoute).toContain(".select('id')")
    expect(markRoute).toContain('!updateRes.data?.id')

    const careAuthIndex = careRoute.indexOf('const staff = await requireStaffFromRequest(request)')
    const careBodyIndex = careRoute.indexOf('const parsedBody = await readBoundedJsonBody')
    const careAccessIndex = careRoute.indexOf(
      'const access = await loadStaffScopedRequestDetailAccess',
    )
    const careWriteIndex = careRoute.indexOf(".from('request_communications').insert")
    expect(careRoute).toContain('const MAX_BODY_BYTES = 64 * 1024')
    expect(careRoute).not.toContain('request.json()')
    expect(careAuthIndex).toBeGreaterThan(-1)
    expect(careBodyIndex).toBeGreaterThan(careAuthIndex)
    expect(careAccessIndex).toBeGreaterThan(careBodyIndex)
    expect(careWriteIndex).toBeGreaterThan(careAccessIndex)
    expect(careRoute).toContain('allowPrimaryParishFallback: false')
    expect(careRoute).toContain(".select('request_id')")
    expect(careRoute).toContain('!funeralUpdate.data?.request_id')
    expect(careRoute).toContain(".select('id')")
    expect(careRoute).toContain('!updateRes.data?.id')
  })

  it('documents authorization, partial success, audit redaction, and preserved gates', () => {
    const evidence = readFileSync(
      join(
        process.cwd(),
        'docs',
        'DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APIS_20260710.md',
      ),
      'utf8',
    )

    for (const phrase of [
      'DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APIS_IMPLEMENTED_20260710',
      '`POST /api/requests/[id]/mark-contacted`',
      '`POST /api/requests/[id]/care-touchpoint`',
      'Require an authenticated authorized staff session',
      'exact active-parish membership',
      'Confirm the target request belongs to the authorized parish',
      'structured partial-success result',
      'Sent card',
      'excludes the pastoral communication note body',
      'no direct Supabase mutations',
      'No production access',
      'No communication was sent during verification',
      'No migration or operational RLS change',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })

  it('records the approved production-readiness revalidation without changing runtime behavior', () => {
    const evidence = readFileSync(
      join(
        process.cwd(),
        'docs',
        'DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APPROVAL_REVALIDATION_20260711.md',
      ),
      'utf8',
    )

    for (const phrase of [
      'DAILY_WORK_HUB_ACTIVE_PARISH_REQUEST_MUTATION_APPROVAL_REVALIDATED_20260711',
      'selected active-parish scope is absent',
      'generic `Request not found.`',
      'no direct browser Supabase mutations',
      'partial-success guidance',
      'No production access',
      'No communication was sent',
    ]) {
      expect(evidence).toContain(phrase)
    }
  })
})
