import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const requireStaffFromRequestMock = vi.hoisted(() => vi.fn())
const resolveStaffWriteParishContextMock = vi.hoisted(() => vi.fn())
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
vi.mock('@/lib/server/staffWriteParishContext', () => ({
  resolveStaffWriteParishContext: resolveStaffWriteParishContextMock,
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

import { POST } from '@/app/api/mass-intentions/[id]/intake-triage/route'

function context(id = 'intention-a') {
  return { params: Promise.resolve({ id }) }
}

function request(body: Record<string, unknown>, parishId = 'parish-a') {
  const value = new NextRequest(
    'https://vinea.test/api/mass-intentions/intention-a/intake-triage',
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://vinea.test',
        'sec-fetch-site': 'same-origin',
      },
      body: JSON.stringify(body),
    },
  )
  value.cookies.set('vinea_active_parish_id', parishId)
  return value
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    assignedMassDate: '2026-07-19',
    assignedPriestName: 'Assigned celebrant',
    stipendReceived: true,
    doneForNow: true,
    ...overrides,
  }
}

function buildAdmin(options: { updateError?: Error | null; rowFound?: boolean } = {}) {
  const payloads: Record<string, unknown>[] = []
  const eqCalls: Array<[string, unknown]> = []
  const query = {
    eq: vi.fn((column: string, value: unknown) => {
      eqCalls.push([column, value])
      return query
    }),
    select: vi.fn(() => ({
      maybeSingle: vi.fn(async () => ({
        data: options.rowFound === false ? null : { id: 'intention-a' },
        error: options.updateError ?? null,
      })),
    })),
  }
  const admin = {
    from: vi.fn((table: string) => {
      if (table !== 'mass_intentions') throw new Error(`Unexpected table ${table}`)
      return {
        update: vi.fn((payload: Record<string, unknown>) => {
          payloads.push(payload)
          return query
        }),
      }
    }),
  }

  return { admin, payloads, eqCalls }
}

describe('Mass Intention Intake Queue active-parish triage route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireStaffFromRequestMock.mockResolvedValue({
      ok: true,
      supabase: { rpc: vi.fn() },
      user: { id: 'staff-a' },
      staff: { email: 'staff@example.test', role: 'staff', source: 'database' },
    })
    resolveStaffWriteParishContextMock.mockResolvedValue({
      ok: true,
      parishId: 'parish-a',
      source: 'membership',
      requestedParishId: 'parish-a',
    })
    writeAuditEventMock.mockResolvedValue(undefined)
  })

  it('updates only the selected parish intention and writes safe audit metadata', async () => {
    const { admin, payloads, eqCalls } = buildAdmin()
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await POST(request(validBody()), context())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        requestedParishId: 'parish-a',
        allowPrimaryParishFallback: false,
      }),
    )
    expect(eqCalls).toEqual([
      ['id', 'intention-a'],
      ['parish_id', 'parish-a'],
    ])
    expect(payloads).toEqual([
      {
        assigned_mass_date: '2026-07-19',
        assigned_priest_name: 'Assigned celebrant',
        stipend_received: true,
        is_fulfilled: true,
      },
    ])
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parishId: 'parish-a',
        action: 'mass_intention.intake_triage.updated',
        targetType: 'mass_intention',
        metadata: {
          source: 'intake_queue',
          massDateSet: true,
          priestAssigned: true,
          stipendReceived: true,
          markedFulfilled: true,
        },
      }),
    )
    expect(JSON.stringify(writeAuditEventMock.mock.calls)).not.toContain('Assigned celebrant')
    expect(JSON.stringify(writeAuditEventMock.mock.calls)).not.toContain('2026-07-19')
  })

  it('denies an unauthorized selected parish before service-role writes', async () => {
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: false,
      error: 'Not authorized',
      technicalDetail: null,
      source: 'membership',
      requestedParishId: 'parish-b',
    })

    const response = await POST(request(validBody(), 'parish-b'), context())

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Mass intention not found.',
    })
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('returns the same generic denial when the intention is not in the selected parish', async () => {
    const { admin, eqCalls } = buildAdmin({ rowFound: false })
    createSupabaseServiceRoleClientMock.mockReturnValue(admin)

    const response = await POST(request(validBody()), context())

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Mass intention not found.',
    })
    expect(eqCalls).toContainEqual(['parish_id', 'parish-a'])
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('validates Mass dates before parish resolution or writes', async () => {
    const response = await POST(
      request(validBody({ assignedMassDate: 'not-a-date' })),
      context(),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Invalid Mass date.',
    })
    expect(resolveStaffWriteParishContextMock).not.toHaveBeenCalled()
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })

  it('requires staff authentication before parish resolution or writes', async () => {
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: false,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await POST(request(validBody()), context())

    expect(response.status).toBe(401)
    expect(resolveStaffWriteParishContextMock).not.toHaveBeenCalled()
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })
})
