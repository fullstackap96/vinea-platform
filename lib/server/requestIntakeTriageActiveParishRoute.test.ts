import { existsSync, readFileSync } from 'node:fs'
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

import { POST } from '@/app/api/requests/[id]/intake-triage/route'

type AdminOptions = {
  communicationError?: Error | null
  updateError?: Error | null
  updatedRowFound?: boolean
}

function context(id = 'request-a') {
  return { params: Promise.resolve({ id }) }
}

function request(
  body: Record<string, unknown>,
  parishId = 'parish-a',
  origin = 'https://vinea.test',
) {
  const value = new NextRequest('https://vinea.test/api/requests/request-a/intake-triage', {
    method: 'POST',
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

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    assignedStaffName: 'Parish Secretary',
    nextFollowUpDate: '2026-07-18',
    contactMethod: 'phone',
    contactNotes: 'Staff-reviewed call note.',
    markFirstContact: true,
    doneForNow: true,
    ...overrides,
  }
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
            return {
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  maybeSingle: vi.fn(async () => ({
                    data: options.updatedRowFound === false ? null : { id: 'request-a' },
                    error: options.updateError ?? null,
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

describe('request Intake Queue active-parish triage route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      supabase: { rpc: vi.fn() },
      user: { id: 'staff-a' },
      staff: { email: 'staff@example.test', role: 'staff', source: 'database' },
    })
    loadStaffScopedRequestDetailAccessMock.mockResolvedValue({
      requestId: 'request-a',
      parishId: 'parish-a',
    })
    writeAuditEventMock.mockResolvedValue(undefined)
  })

  it('saves same-parish first contact and triage with note-free safe audit metadata', async () => {
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await POST(request(validBody()), context())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
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
        notes: 'Staff-reviewed call note.',
      },
    })
    expect(writes[1]).toMatchObject({
      table: 'requests',
      payload: {
        assigned_staff_name: 'Parish Secretary',
        next_follow_up_date: '2026-07-18',
        last_contact_method: 'phone',
        communication_notes: 'Staff-reviewed call note.',
        status: 'in_progress',
      },
    })
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parishId: 'parish-a',
        action: 'request.intake_triage.updated',
        targetId: 'request-a',
        metadata: {
          source: 'intake_queue',
          outcome: 'completed',
          ownerAssigned: true,
          followUpDateSet: true,
          firstContactLogged: true,
          statusAdvanced: true,
          requestUpdated: true,
        },
      }),
    )
    expect(JSON.stringify(writeAuditEventMock.mock.calls)).not.toContain(
      'Staff-reviewed call note.',
    )
    expect(JSON.stringify(writeAuditEventMock.mock.calls)).not.toContain('2026-07-18')
  })

  it('denies forged or cross-parish request scope before any write', async () => {
    loadStaffScopedRequestDetailAccessMock.mockResolvedValueOnce(null)
    const { admin, writes } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await POST(request(validBody(), 'parish-b'), context())

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Request not found.' })
    expect(writes).toEqual([])
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('returns explicit partial guidance when contact logs before the request update fails', async () => {
    const { admin, writes } = buildAdmin({ updateError: new Error('update failed') })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await POST(request(validBody()), context())
    const payload = await response.json()

    expect(response.status).toBe(500)
    expect(payload).toMatchObject({
      ok: false,
      partial: true,
      completed: { firstContactLogged: true, requestUpdated: false },
    })
    expect(payload.error).toContain('First contact was logged')
    expect(writes).toHaveLength(2)
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ outcome: 'partial' }) }),
    )
  })

  it('validates follow-up dates before privileged access or writes', async () => {
    const response = await POST(
      request(validBody({ nextFollowUpDate: 'not-a-date' })),
      context(),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Invalid follow-up date.',
    })
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(loadStaffScopedRequestDetailAccessMock).not.toHaveBeenCalled()
  })

  it('requires staff authentication before body or database work', async () => {
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await POST(request(validBody()), context())

    expect(response.status).toBe(401)
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(loadStaffScopedRequestDetailAccessMock).not.toHaveBeenCalled()
  })

  it('keeps the Intake Queue browser on API-only mutation paths', () => {
    const repoRoot = process.cwd()
    const client = readFileSync(
      join(repoRoot, 'app/dashboard/intake/DashboardIntakePageClient.tsx'),
      'utf8',
    )

    expect(existsSync(join(repoRoot, 'app/dashboard/intake/actions.ts'))).toBe(false)
    expect(client).not.toContain("from './actions'")
    expect(client).toContain("credentials: 'include'")
    expect(client).toContain('/api/requests/${encodeURIComponent(item.sourceId)}/intake-triage')
    expect(client).toContain(
      '/api/mass-intentions/${encodeURIComponent(item.sourceId)}/intake-triage',
    )
    expect(client).not.toContain(".from('requests')")
    expect(client).not.toContain(".from('mass_intentions')")
  })
})
