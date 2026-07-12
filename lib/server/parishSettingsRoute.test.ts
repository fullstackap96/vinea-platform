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

vi.mock('@/lib/server/requiredEnv', () => ({
  assertParishSettingsEnv: vi.fn(),
}))

import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { parishSettingsRouteTestInternals } from '@/app/api/parish/settings/route'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const routePath = join(process.cwd(), 'app', 'api', 'parish', 'settings', 'route.ts')

function parishSettingsBuilder() {
  const integrationBuilder = {
    select: vi.fn(() => integrationBuilder),
    eq: vi.fn(() => integrationBuilder),
    maybeSingle: vi.fn(() =>
      Promise.resolve({
        data: {
          status: 'connected',
          last_error: null,
          google_account_email: 'calendar@example.com',
        },
        error: null,
      })
    ),
  }
  const parishBuilder = {
    select: vi.fn(() => parishBuilder),
    eq: vi.fn(() => parishBuilder),
    maybeSingle: vi.fn(() =>
      Promise.resolve({
        data: {
          id: 'parish-2',
          name: 'Beta Parish',
          default_notification_email: 'office@example.com',
          staff_directory: [],
          priest_directory: [],
          daily_ops_brief_enabled: false,
          daily_ops_brief_email: null,
          daily_ops_brief_last_sent_on: null,
          daily_ops_brief_last_error: null,
          onboarding_completed_at: null,
          workflow_sla_rules: null,
          created_at: '2026-01-01T00:00:00.000Z',
        },
        error: null,
      })
    ),
  }

  return { parishBuilder, integrationBuilder }
}

describe('parish settings route parish context', () => {
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

    const result = await parishSettingsRouteTestInternals.resolveParishSettingsReadParishId(
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

    const result = await parishSettingsRouteTestInternals.resolveParishSettingsReadParishId(
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

    const result = await parishSettingsRouteTestInternals.resolveParishSettingsReadParishId(
      { rpc: vi.fn(), from: vi.fn() } as never,
      'parish-2'
    )

    expect(result).toEqual({
      ok: false,
      source: 'membership',
      error: 'You are not authorized to read parish settings for this parish.',
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

    const result = await parishSettingsRouteTestInternals.resolveParishSettingsReadParishId(
      { rpc: vi.fn(), from: vi.fn() } as never,
      'parish-1'
    )

    expect(result).toEqual({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'You are not authorized to read parish settings for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId: 'parish-1',
    })
  })

  it('loads settings and Google integration for the selected parish id', async () => {
    const { parishBuilder, integrationBuilder } = parishSettingsBuilder()
    const admin = {
      from: vi.fn((table: string) =>
        table === 'parishes' ? parishBuilder : integrationBuilder
      ),
    }

    const result = await parishSettingsRouteTestInternals.loadParishSettingsWithGoogle(
      admin as never,
      'parish-2'
    )

    expect(result.parish?.id).toBe('parish-2')
    expect(result.google?.status).toBe('connected')
    expect(admin.from).toHaveBeenCalledWith('parishes')
    expect(parishBuilder.eq).toHaveBeenCalledWith('id', 'parish-2')
    expect(admin.from).toHaveBeenCalledWith('parish_google_integrations')
    expect(integrationBuilder.eq).toHaveBeenCalledWith('parish_id', 'parish-2')
  })

  it('wires GET and PATCH through active parish and write-safety helpers', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('resolveStaffWriteParishContext')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('resolveParishSettingsReadParishId')
    expect(source).toContain('loadParishSettingsWithGoogle')
    expect(source).toContain('allowPrimaryParishFallback: !requestedParishId')
    expect(source).toContain('Parish settings API legacy compatibility path.')
    expect(source).toContain(".eq('id', parishId)")
    expect(source).toContain('data: updatedParish')
    expect(source).toContain(".select('id')")
    expect(source).toContain('!updatedParish?.id')
    expect(source.indexOf('!updatedParish?.id')).toBeLessThan(
      source.indexOf('await writeAuditEvent'),
    )
    expect(source).not.toContain(".order('created_at', { ascending: true })")
  })

  it('logs unexpected failures and avoids returning raw database or exception messages', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('function parishSettingsErrorResponse')
    expect(source).toContain("logServerError(`[parish-settings] ${action} failed`, error)")
    expect(source).toContain("logServerError('[parish-settings] load parish row failed', parishErr)")
    expect(source).toContain('Could not load parish settings.')
    expect(source).toContain('Could not update parish settings.')
    expect(source).toContain("error: 'Parish not found.'")

    expect(source).not.toContain('function messageFromError')
    expect(source).not.toContain('parishErr?.message')
    expect(source).not.toContain('error: updateErr.message')
    expect(source).not.toContain('{ ok: false, error: messageFromError(e) }')
  })
})
