import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

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

import { PATCH, POST } from '@/app/api/requests/[id]/communications/route'

type AdminOptions = {
  communicationError?: Error | null
  summaryError?: Error | null
  summaryRowFound?: boolean
  followUpRowFound?: boolean
}

function context(id = 'request-a') {
  return { params: Promise.resolve({ id }) }
}

function request(
  method: 'POST' | 'PATCH',
  body: Record<string, unknown>,
  parishId = 'parish-a',
  origin = 'https://vinea.test',
) {
  const value = new NextRequest(`https://vinea.test/api/requests/request-a/communications`, {
    method,
    headers: {
      'content-type': 'application/json',
      origin,
      'sec-fetch-site': 'same-origin',
    },
    body: JSON.stringify(body),
  })
  value.cookies.set('vinea_active_parish_id', parishId)
  return value
}

function buildAdmin(options: AdminOptions = {}) {
  const writes: Array<{ table: string; payload: Record<string, unknown> }> = []
  const admin = {
    from: vi.fn((table: string) => {
      if (table === 'request_communications') {
        return {
          insert: vi.fn(async (payload: Record<string, unknown>) => {
            writes.push({ table, payload })
            return { error: options.communicationError ?? null }
          }),
        }
      }

      if (table === 'requests') {
        return {
          update: vi.fn((payload: Record<string, unknown>) => {
            writes.push({ table, payload })
            const followUpOnly = Object.keys(payload).length === 1 && 'next_follow_up_date' in payload
            if (followUpOnly) {
              return {
                eq: vi.fn(() => ({
                  select: vi.fn(() => ({
                    maybeSingle: vi.fn(async () => ({
                      data: options.followUpRowFound === false ? null : { id: 'request-a' },
                      error: options.summaryError ?? null,
                    })),
                  })),
                })),
              }
            }

            return {
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  maybeSingle: vi.fn(async () => ({
                    data: options.summaryRowFound === false ? null : { id: 'request-a' },
                    error: options.summaryError ?? null,
                  })),
                })),
              })),
            }
          }),
        }
      }

      throw new Error(`Unexpected table ${table}`)
    }),
  }

  return { admin, writes }
}

describe('Communications Center active-parish request mutation route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      supabase: { auth: { getUser: vi.fn() } },
      user: { id: 'staff-a' },
      staff: { email: 'staff@example.test', role: 'staff', source: 'database' },
    })
    loadStaffScopedRequestDetailAccessMock.mockResolvedValue({
      requestId: 'request-a',
      parishId: 'parish-a',
    })
    writeAuditEventMock.mockResolvedValue(undefined)
  })

  it('rejects cross-origin writes before authentication and service access', async () => {
    const response = await POST(
      request(
        'POST',
        { method: 'phone', notes: 'Called.', source: 'communications_center' },
        'parish-a',
        'https://attacker.test',
      ),
      context(),
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Invalid request.' })
    expect(requireStaffFromRequestMock).not.toHaveBeenCalled()
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })

  it('logs a same-parish touchpoint with a server timestamp and note-free audit metadata', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await POST(
      request('POST', {
        method: 'phone',
        notes: 'Staff-reviewed call completed.',
        nextFollowUpDate: '2026-07-17',
        source: 'communications_center',
      }),
      context(),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      ok: true,
      completed: { communicationLogged: true, requestSummaryUpdated: true },
    })
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
      payload: {
        request_id: 'request-a',
        method: 'phone',
        notes: 'Staff-reviewed call completed.',
      },
    })
    expect(writes[0].payload.contacted_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(writes[1]).toMatchObject({
      table: 'requests',
      payload: {
        last_contact_method: 'phone',
        communication_notes: 'Staff-reviewed call completed.',
        next_follow_up_date: '2026-07-17',
      },
    })
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parishId: 'parish-a',
        actorEmail: 'staff@example.test',
        action: 'request.communication.logged',
        targetId: 'request-a',
        metadata: expect.objectContaining({
          source: 'communications_center',
          label: 'phone',
          outcome: 'completed',
          communicationLogged: true,
          requestSummaryUpdated: true,
          followUpDateChanged: true,
          followUpDateSet: true,
        }),
      }),
    )
    expect(JSON.stringify(writeAuditEventMock.mock.calls)).not.toContain(
      'Staff-reviewed call completed.',
    )
  })

  it('preserves Communications Center note validation before access or writes', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await POST(
      request('POST', {
        method: 'phone',
        notes: '   ',
        nextFollowUpDate: '2026-07-17',
        source: 'communications_center',
      }),
      context(),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Add a short communication note.',
    })
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(loadStaffScopedRequestDetailAccessMock).not.toHaveBeenCalled()
    expect(writes).toEqual([])
  })

  it('denies forged or cross-parish request scope generically before mutation', async () => {
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce(null)
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await POST(
      request('POST', {
        method: 'phone',
        notes: 'Safe note.',
        nextFollowUpDate: null,
        source: 'communications_center',
      }, 'parish-b'),
      context('request-a'),
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ ok: false, error: 'Request not found.' })
    expect(writes).toEqual([])
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('returns staff guidance and a partial audit when the communication log succeeds first', async () => {
    const { admin, writes } = buildAdmin({ summaryError: new Error('summary failed') })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await POST(
      request('POST', {
        method: 'voicemail',
        notes: 'Voicemail left.',
        nextFollowUpDate: '',
        source: 'communications_center',
      }),
      context(),
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

  it('reports a partial save when the authorized request disappears before summary update', async () => {
    const { admin, writes } = buildAdmin({ summaryRowFound: false })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await POST(
      request('POST', {
        method: 'email',
        notes: 'Email sent: Staff-reviewed follow-up',
        source: 'daily_work_hub_email',
      }),
      context(),
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
        metadata: expect.objectContaining({
          source: 'daily_work_hub_email',
          outcome: 'partial',
          communicationLogged: true,
          requestSummaryUpdated: false,
        }),
      }),
    )
  })

  it('updates only the same-parish follow-up date through PATCH and audits safe booleans', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await PATCH(
      request('PATCH', {
        nextFollowUpDate: '2026-07-18',
        source: 'communications_center',
      }),
      context(),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(writes).toEqual([
      { table: 'requests', payload: { next_follow_up_date: '2026-07-18' } },
    ])
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'request.follow_up.updated',
        parishId: 'parish-a',
        targetId: 'request-a',
        metadata: expect.objectContaining({
          source: 'communications_center',
          communicationLogged: false,
          requestSummaryUpdated: true,
          followUpDateChanged: true,
          followUpDateSet: true,
        }),
      }),
    )
  })

  it('rejects unauthenticated follow-up updates before creating a privileged client', async () => {
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await PATCH(
      request('PATCH', { nextFollowUpDate: null, source: 'communications_center' }),
      context(),
    )

    expect(response.status).toBe(401)
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(loadStaffScopedRequestDetailAccessMock).not.toHaveBeenCalled()
  })
})

describe('Communications Center client mutation boundary', () => {
  it('uses only the active-parish request API and removes the obsolete Server Action writes', () => {
    const root = process.cwd()
    const client = readFileSync(
      join(root, 'app', 'dashboard', 'communications', 'DashboardCommunicationsPageClient.tsx'),
      'utf8',
    )

    expect(client).toContain('/communications`')
    expect(client).toContain("method: 'POST' | 'PATCH'")
    expect(client).toContain("credentials: 'include'")
    expect(client).toContain("source: 'communications_center'")
    expect(client).not.toContain("from './actions'")
    expect(client).not.toContain("from('request_communications')")
    expect(client).not.toContain("from('requests')")
    expect(existsSync(join(root, 'app', 'dashboard', 'communications', 'actions.ts'))).toBe(false)
  })
})
