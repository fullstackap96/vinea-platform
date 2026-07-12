import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

vi.mock('@/lib/server/requestAuditParish', () => ({
  resolveRequestAuditParishId: vi.fn(),
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

vi.mock('@/lib/server/auditLog', () => ({
  writeAuditEvent: vi.fn(),
}))

vi.mock('@/lib/server/staffParishRole', () => ({
  staffIsAdminForParish: vi.fn(),
}))

import { GET, POST, auditEventsRouteTestInternals } from '@/app/api/audit-events/route'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { resolveRequestAuditParishId } from '@/lib/server/requestAuditParish'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { staffIsAdminForParish } from '@/lib/server/staffParishRole'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const resolveRequestAuditParishIdMock = vi.mocked(resolveRequestAuditParishId)
const requireStaffFromRequestMock = vi.mocked(requireStaffFromRequest)
const staffIsAdminForParishMock = vi.mocked(staffIsAdminForParish)
const createSupabaseServiceRoleClientMock = vi.mocked(createSupabaseServiceRoleClient)
const writeAuditEventMock = vi.mocked(writeAuditEvent)
const routePath = join(process.cwd(), 'app', 'api', 'audit-events', 'route.ts')
const docPath = join(process.cwd(), 'docs', 'AUDIT_EVENTS_SAFE_ERROR_LOGGING_20260706.md')

function queryResultThenable(result: unknown) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    like: vi.fn(() => query),
    then: vi.fn((resolve: (value: unknown) => unknown) => Promise.resolve(resolve(result))),
  }

  return query
}

describe('audit events route parish context', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    staffIsAdminForParishMock.mockResolvedValue(true)
  })

  it('denies full audit-log reads when staff is not an admin in the selected parish', async () => {
    const admin = { from: vi.fn() }
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: true,
      staff: { email: 'multi-parish@example.com', role: 'admin' },
      supabase: { rpc: vi.fn(), from: vi.fn() },
    } as never)
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-a', 'parish-b'],
      primaryParishId: 'parish-a',
      activeParishId: 'parish-b',
      activeParish: { id: 'parish-b', name: 'Beta Parish' },
      parishes: [
        { id: 'parish-a', name: 'Alpha Parish' },
        { id: 'parish-b', name: 'Beta Parish' },
      ],
      requestedParishId: 'parish-b',
    })
    staffIsAdminForParishMock.mockResolvedValueOnce(false)

    const response = await GET({
      url: 'https://vinea.test/api/audit-events?limit=5',
      cookies: { get: vi.fn(() => ({ value: 'parish-b' })) },
    } as never)

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Only parish admins can view the full audit log.',
    })
    expect(staffIsAdminForParishMock).toHaveBeenCalledWith(admin, {
      parishId: 'parish-b',
      email: 'multi-parish@example.com',
    })
    expect(admin.from).not.toHaveBeenCalled()
  })

  it('denies non-request audit writes without admin status in the selected parish', async () => {
    const admin = { from: vi.fn() }
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: true,
      staff: { email: 'multi-parish@example.com', role: 'admin' },
      supabase: { rpc: vi.fn(), from: vi.fn() },
    } as never)
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-a', 'parish-b'],
      primaryParishId: 'parish-a',
      activeParishId: 'parish-b',
      activeParish: { id: 'parish-b', name: 'Beta Parish' },
      parishes: [
        { id: 'parish-a', name: 'Alpha Parish' },
        { id: 'parish-b', name: 'Beta Parish' },
      ],
      requestedParishId: 'parish-b',
    })
    staffIsAdminForParishMock.mockResolvedValueOnce(false)

    const request = new NextRequest('https://vinea.test/api/audit-events', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://vinea.test',
        'sec-fetch-site': 'same-origin',
      },
      body: JSON.stringify({
        action: 'parish.reviewed',
        targetType: 'parish',
        targetId: 'parish-b',
      }),
    })
    request.cookies.set('vinea_active_parish_id', 'parish-b')

    const response = await POST(request)

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Only parish admins can write non-request audit events.',
    })
    expect(staffIsAdminForParishMock).toHaveBeenCalledWith(admin, {
      parishId: 'parish-b',
      email: 'multi-parish@example.com',
    })
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('uses active read context primary parish when no active parish cookie exists', async () => {
    const supabase = { rpc: vi.fn(), from: vi.fn() }
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

    const result = await auditEventsRouteTestInternals.resolveAuditEventsReadParishId(
      supabase as never,
      null
    )

    expect(result).toMatchObject({
      ok: true,
      source: 'primary_parish_fallback',
      activeParishId: 'parish-1',
    })
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
    })
  })

  it('honors an active parish cookie only when membership validates the exact parish', async () => {
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

    const result = await auditEventsRouteTestInternals.resolveAuditEventsReadParishId(
      { rpc: vi.fn(), from: vi.fn() } as never,
      'parish-2'
    )

    expect(result).toMatchObject({
      ok: true,
      source: 'membership',
      activeParishId: 'parish-2',
      requestedParishId: 'parish-2',
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

    const result = await auditEventsRouteTestInternals.resolveAuditEventsReadParishId(
      { rpc: vi.fn(), from: vi.fn() } as never,
      'parish-2'
    )

    expect(result).toEqual({
      ok: false,
      source: 'membership',
      error: 'You are not authorized to read audit events for this parish.',
      technicalDetail: 'Requested parish is not authorized for this staff session.',
      requestedParishId: 'parish-2',
    })
  })

  it('requires membership-backed authorization when an active parish cookie exists', async () => {
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'primary_parish_fallback',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-1',
      fallbackReason: 'Membership foundation is not deployed.',
    })

    const result = await auditEventsRouteTestInternals.resolveAuditEventsReadParishId(
      { rpc: vi.fn(), from: vi.fn() } as never,
      'parish-1'
    )

    expect(result).toEqual({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'You are not authorized to read audit events for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId: 'parish-1',
    })
  })

  it('uses selected active parish for non-request admin audit writes', async () => {
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

    const result = await auditEventsRouteTestInternals.resolveAuditEventsWriteParishId({
      admin: { from: vi.fn() } as never,
      supabase: { rpc: vi.fn(), from: vi.fn() } as never,
      requestedParishId: 'parish-2',
      targetType: 'parish',
      targetId: 'parish-2',
    })

    expect(result).toEqual({ ok: true, parishId: 'parish-2' })
    expect(resolveRequestAuditParishIdMock).not.toHaveBeenCalled()
  })

  it('derives request-target audit writes from the request parish and requires selected parish match', async () => {
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
    resolveRequestAuditParishIdMock.mockResolvedValueOnce({ ok: true, parishId: 'parish-2' })

    const result = await auditEventsRouteTestInternals.resolveAuditEventsWriteParishId({
      admin: { from: vi.fn() } as never,
      supabase: { rpc: vi.fn(), from: vi.fn() } as never,
      requestedParishId: 'parish-2',
      targetType: 'request',
      targetId: 'request-2',
    })

    expect(result).toEqual({ ok: true, parishId: 'parish-2' })
    expect(resolveRequestAuditParishIdMock).toHaveBeenCalledWith(expect.anything(), 'request-2')
  })

  it('rejects request-target audit writes when request parish differs from selected parish', async () => {
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
    resolveRequestAuditParishIdMock.mockResolvedValueOnce({ ok: true, parishId: 'parish-1' })

    const result = await auditEventsRouteTestInternals.resolveAuditEventsWriteParishId({
      admin: { from: vi.fn() } as never,
      supabase: { rpc: vi.fn(), from: vi.fn() } as never,
      requestedParishId: 'parish-2',
      targetType: 'request',
      targetId: 'request-1',
    })

    expect(result).toEqual({
      ok: false,
      error: 'You are not authorized to write audit events for this request.',
      technicalDetail: 'Request parish does not match the active staff parish context.',
      requestedParishId: 'parish-2',
    })
  })

  it('returns a generic audit-event read error and logs only redacted details', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const query = queryResultThenable({
      data: null,
      error: {
        code: 'PGRST999',
        message:
          'select failed for staff@example.com with Bearer secret-token-value and postgresql://postgres:password@db.example.supabase.co:5432/postgres',
      },
    })

    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: true,
      staff: { email: 'staff@example.com', role: 'admin' },
      supabase: { rpc: vi.fn(), from: vi.fn() },
    } as never)
    createSupabaseServiceRoleClientMock.mockReturnValueOnce({
      from: vi.fn(() => query),
    } as never)
    resolveActiveStaffParishContextMock.mockResolvedValueOnce({
      ok: true,
      source: 'membership',
      parishIds: ['parish-1'],
      primaryParishId: 'parish-1',
      activeParishId: 'parish-1',
      activeParish: { id: 'parish-1', name: 'Alpha Parish' },
      parishes: [{ id: 'parish-1', name: 'Alpha Parish' }],
      requestedParishId: 'parish-1',
    })

    const response = await GET({
      url: 'https://vinea.test/api/audit-events?limit=5',
      cookies: { get: vi.fn(() => ({ value: 'parish-1' })) },
    } as never)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toEqual({ ok: false, error: 'Could not load audit events.' })
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[audit-events] read failed',
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.not.stringContaining('staff@example.com'),
        }),
        route: '/api/audit-events',
      })
    )
    const loggedPayload = JSON.stringify(consoleErrorSpy.mock.calls[0]?.[1])
    expect(loggedPayload).not.toContain('staff@example.com')
    expect(loggedPayload).not.toContain('secret-token-value')
    expect(loggedPayload).not.toContain('postgres:password')

    consoleErrorSpy.mockRestore()
  })

  it('wires GET and POST through active parish context and request parish attribution', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('resolveRequestAuditParishId')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('resolveAuditEventsReadParishId(staff.supabase, requestedParishId)')
    expect(source).toContain('resolveAuditEventsWriteParishId')
    expect(source).toContain("logServerError('[audit-events] read failed'")
    expect(source).toContain("logServerError('[audit-events] write failed'")
    expect(source).toContain("error: 'Could not load audit events.'")
    expect(source).toContain("error: 'Could not save audit event.'")
    expect(source).not.toContain('error: error.message')
    expect(source).not.toContain('function primaryParishId')
    expect(source).not.toContain(".from('parishes')")
  })

  it('documents the audit-events safe error logging boundary', () => {
    const doc = readFileSync(docPath, 'utf8')

    expect(doc).toContain('Audit Events Safe Error Logging - 2026-07-06')
    expect(doc).toContain('logServerError')
    expect(doc).toContain('raw database error text is not returned')
    expect(doc).toContain('active-parish scope')
    expect(doc).toContain('does not change audit-event authorization')
    expect(doc).toContain('full-suite verification')
  })
})
