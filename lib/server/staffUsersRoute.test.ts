import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: vi.fn(),
}))

vi.mock('@/lib/server/staffWriteParishContext', () => ({
  resolveStaffWriteParishContext: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

vi.mock('@/lib/server/auditLog', () => ({
  writeAuditEvent: vi.fn(),
}))

import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { staffUsersRouteTestInternals } from '@/app/api/parish/staff-users/route'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const routePath = join(process.cwd(), 'app', 'api', 'parish', 'staff-users', 'route.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'STAFF_USERS_SAFE_ERROR_LOGGING_20260706.md',
)

function staffUsersAdminBuilder(options: {
  adminId?: string | null
  error?: { message: string } | null
}) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(() =>
      Promise.resolve({
        data: options.adminId ? { id: options.adminId, email: 'admin@example.com' } : null,
        error: options.error ?? null,
      })
    ),
  }

  return builder
}

describe('staff users route parish context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

    const result = await staffUsersRouteTestInternals.resolveStaffManagementReadParishId(
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

    const result = await staffUsersRouteTestInternals.resolveStaffManagementReadParishId(
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

    const result = await staffUsersRouteTestInternals.resolveStaffManagementReadParishId(
      { rpc: vi.fn(), from: vi.fn() } as never,
      'parish-2'
    )

    expect(result).toEqual({
      ok: false,
      source: 'membership',
      error: 'You are not authorized to read staff access for this parish.',
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

    const result = await staffUsersRouteTestInternals.resolveStaffManagementReadParishId(
      { rpc: vi.fn(), from: vi.fn() } as never,
      'parish-1'
    )

    expect(result).toEqual({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'You are not authorized to read staff access for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId: 'parish-1',
    })
  })

  it('checks admin permission inside the selected parish', async () => {
    const builder = staffUsersAdminBuilder({ adminId: 'staff-admin-1' })
    const admin = { from: vi.fn(() => builder) }

    const result = await staffUsersRouteTestInternals.staffIsAdminForParish(admin as never, {
      parishId: 'parish-2',
      email: 'Admin@Example.com',
    })

    expect(result).toBe(true)
    expect(admin.from).toHaveBeenCalledWith('staff_users')
    expect(builder.eq).toHaveBeenCalledWith('parish_id', 'parish-2')
    expect(builder.eq).toHaveBeenCalledWith('role', 'admin')
    expect(builder.eq).toHaveBeenCalledWith('active', true)
    expect(builder.ilike).toHaveBeenCalledWith('email', 'admin@example.com')
  })

  it('wires GET, POST, and PATCH through active parish and write-safety helpers', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('resolveStaffWriteParishContext')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('allowPrimaryParishFallback: !requestedParishId')
    expect(source).toContain('staffIsAdminForParish')
    expect(source).not.toContain('function primaryParishId')
    expect(source).not.toContain(".from('parishes')")
  })

  it('returns generic errors and logs sanitized context for unexpected staff access failures', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('logServerError(`[staff-users] ${action} failed`')
    expect(source).toContain("logStaffUsersError('list', error")
    expect(source).toContain("logStaffUsersError('create', error")
    expect(source).toContain("logStaffUsersError('read-current', currentError")
    expect(source).toContain("logStaffUsersError('update', error")
    expect(source).toContain("error: 'Could not load staff access.'")
    expect(source).toContain("error: 'Could not add staff access.'")
    expect(source).toContain("error: 'Could not update staff access.'")
    expect(source).toContain('hasActiveParishCookie')
    expect(source).toContain('hasStaffUserId')
    expect(source).not.toMatch(/error:\s*(?:error|currentError)\.message/)
    expect(source).not.toMatch(/const message = error instanceof Error \? error\.message/)
  })

  it('documents the staff access safe error logging boundary', () => {
    const doc = readFileSync(evidencePath, 'utf8')

    expect(doc).toContain('Staff Users Safe Error Logging')
    expect(doc).toContain('Could not load staff access.')
    expect(doc).toContain('Could not add staff access.')
    expect(doc).toContain('Could not update staff access.')
    expect(doc).toContain('No operational RLS policies were changed.')
    expect(doc).toContain('No staff access permissions were weakened or expanded.')
  })
})
