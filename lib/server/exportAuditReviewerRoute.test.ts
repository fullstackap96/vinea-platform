import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

import { GET, exportAuditReviewerRouteTestInternals } from '@/app/api/export-audit-reviewer/route'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type ActiveParishContextSuccess = Extract<
  Awaited<ReturnType<typeof resolveActiveStaffParishContext>>,
  { ok: true }
>
type StaffSessionSuccess = Extract<Awaited<ReturnType<typeof requireStaffFromRequest>>, { ok: true }>

const requireStaffFromRequestMock = vi.mocked(requireStaffFromRequest)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const createSupabaseServiceRoleClientMock = vi.mocked(createSupabaseServiceRoleClient)
const routePath = join(process.cwd(), 'app', 'api', 'export-audit-reviewer', 'route.ts')
const originalEnv = { ...process.env }

function enableReviewerPrototypeForTest() {
  process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE = 'ENABLED'
  process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK = 'APPROVED_EXPORT_AUDIT_REVIEWER_QA'
  process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV = 'NON_PRODUCTION'
  process.env.VERCEL_ENV = 'preview'
  Object.assign(process.env, { NODE_ENV: 'test' })
}

function clearReviewerPrototypeForTest() {
  delete process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE
  delete process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ACK
  delete process.env.VINEA_EXPORT_AUDIT_REVIEWER_PROTOTYPE_ENV
  process.env.VERCEL_ENV = 'preview'
  Object.assign(process.env, { NODE_ENV: 'test' })
}

function request(url = 'https://vinea.test/api/export-audit-reviewer', cookieValue?: string) {
  const headers = new Headers()
  if (cookieValue) headers.set('cookie', `vinea_active_parish_id=${cookieValue}`)
  return new NextRequest(url, { headers })
}

function staffSession(supabase: unknown = { rpc: vi.fn(), from: vi.fn() }) {
  return {
    ok: true as const,
    supabase,
    user: { id: 'staff-user-1' },
    staff: { email: 'admin@example.com', role: 'admin' as const, source: 'database' as const },
  } as unknown as StaffSessionSuccess
}

function activeParishContext(overrides: Partial<ActiveParishContextSuccess> = {}) {
  return {
    ok: true as const,
    source: 'membership' as const,
    parishIds: ['parish-a', 'parish-b'],
    primaryParishId: 'parish-a',
    activeParishId: 'parish-a',
    activeParish: { id: 'parish-a', name: 'QA Parish A' },
    parishes: [
      { id: 'parish-a', name: 'QA Parish A' },
      { id: 'parish-b', name: 'QA Parish B' },
    ],
    requestedParishId: null,
    ...overrides,
  } satisfies ActiveParishContextSuccess
}

function auditEventRows() {
  return [
    {
      id: 'audit-downloaded-1',
      created_at: '2026-07-01T14:15:00.000Z',
      action: 'export.request_list_basic.downloaded',
      actor_email: 'qa-staff@example.com',
      parish_id: 'parish-a',
      target_type: 'export',
      target_id: 'request_list_basic',
      metadata: {
        routeId: 'app/api/exports/requests/basic',
        runtimeGateState: 'enabled_non_production',
        export_preset_id: 'request_list_basic',
        target_object_type: 'requests',
        active_parish_id: 'parish-a',
        active_parish_name: 'QA Parish A',
        parish_ids_included: ['parish-a'],
        row_count_or_estimate: 12,
        destination: 'download',
        csv_header_approved: true,
        safeMetadataOnly: true,
      },
    },
    {
      id: 'audit-denied-1',
      created_at: '2026-07-01T14:20:00.000Z',
      action: 'export.request_document_manifest.denied',
      actor_email: 'qa-staff@example.com',
      parish_id: 'parish-a',
      target_type: 'export',
      target_id: 'request_document_manifest',
      metadata: {
        routeId: 'app/api/exports/requests/documents/manifest',
        runtimeGateState: 'enabled_non_production',
        export_preset_id: 'request_document_manifest',
        target_object_type: 'request_documents',
        active_parish_id: 'parish-a',
        active_parish_name: 'QA Parish A',
        parish_ids_included: ['parish-a'],
        decision: 'denied',
        deniedReasonCode: 'blocked_or_disallowed_fields',
        httpStatus: 403,
        rawRequestedFields: ['access_token', 'storage_path'],
        unsafeDocumentMaterial: 'https://files.example.invalid/signed-url',
        unsafeConnectionString: 'postgresql://postgres:secret@example.invalid/postgres',
        safeMetadataOnly: true,
      },
    },
  ]
}

function successfulAdmin(events: string[] = []) {
  const auditEventsBuilder = {
    select: vi.fn(() => auditEventsBuilder),
    eq: vi.fn((column: string, value: string) => {
      events.push(`eq:${column}:${value}`)
      return auditEventsBuilder
    }),
    in: vi.fn((column: string, values: readonly string[]) => {
      events.push(`in:${column}:${values.join('|')}`)
      return auditEventsBuilder
    }),
    order: vi.fn(() => auditEventsBuilder),
    limit: vi.fn((limit: number) => {
      events.push(`limit:${limit}`)
      return Promise.resolve({ data: auditEventRows(), error: null })
    }),
  }

  return {
    from: vi.fn((table: string) => {
      if (table === 'audit_events') return auditEventsBuilder
      throw new Error(`Unexpected table ${table}`)
    }),
  }
}

describe('export audit reviewer API prototype route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    clearReviewerPrototypeForTest()
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('stays disabled by default before staff auth or database work', async () => {
    const response = await GET(request())

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'export_audit_reviewer_unavailable',
    })
    expect(requireStaffFromRequestMock).not.toHaveBeenCalled()
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })

  it('blocks production environments even when prototype flags are present', async () => {
    enableReviewerPrototypeForTest()
    Object.assign(process.env, { NODE_ENV: 'production' })

    const response = await GET(request())

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'export_audit_reviewer_unavailable',
    })
    expect(exportAuditReviewerRouteTestInternals.getReviewerPrototypeGate(process.env)).toMatchObject({
      enabled: false,
      state: 'blocked_production_environment',
    })
    expect(requireStaffFromRequestMock).not.toHaveBeenCalled()
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })

  it('requires authenticated staff before parish scope or audit-event reads', async () => {
    enableReviewerPrototypeForTest()
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: false as const,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await GET(request())

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Unauthorized' })
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })

  it('returns same-parish reviewer rows and saved-filter metadata from audit_events only', async () => {
    enableReviewerPrototypeForTest()
    const events: string[] = []
    const supabase = { rpc: vi.fn(), from: vi.fn() }
    const admin = successfulAdmin(events)
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(supabase))
    resolveActiveStaffParishContextMock.mockResolvedValueOnce(activeParishContext())
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const response = await GET(
      request('https://vinea.test/api/export-audit-reviewer?filter=exports_denied_recent&limit=5')
    )
    const body = await response.json()
    const serialized = JSON.stringify(body)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(body).toMatchObject({
      ok: true,
      prototype: {
        state: 'enabled_non_production',
        environment: 'non_production',
        productionExports: 'NO_GO',
      },
      scope: {
        activeParishId: 'parish-a',
        activeParishName: 'QA Parish A',
        source: 'membership',
      },
      filters: {
        selected: 'exports_denied_recent',
        rowCount: 1,
      },
    })
    expect(body.filters.available).toContain('exports_blocked_field_attempts')
    expect(body.rows).toHaveLength(1)
    expect(body.rows[0]).toMatchObject({
      audit_event_id: 'audit-denied-1',
      decision: 'denied',
      export_preset_id: 'request_document_manifest',
      safe_metadata_only: true,
    })
    expect(events).toEqual([
      'eq:parish_id:parish-a',
      'in:action:export.request_list_basic.downloaded|export.request_list_basic.denied|export.request_document_manifest.downloaded|export.request_document_manifest.denied',
      'limit:5',
    ])
    expect(admin.from).toHaveBeenCalledTimes(1)
    expect(admin.from).toHaveBeenCalledWith('audit_events')
    expect(serialized).not.toContain('access_token')
    expect(serialized).not.toContain('storage_path')
    expect(serialized).not.toContain('signed-url')
    expect(serialized).not.toContain('postgresql://')
    expect(serialized).not.toContain('rawRequestedFields')
    expect(serialized).not.toContain('unsafeDocumentMaterial')
  })

  it('rolls back to unavailable before auth or database work when prototype flags are disabled', async () => {
    enableReviewerPrototypeForTest()
    const admin = successfulAdmin()
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession())
    resolveActiveStaffParishContextMock.mockResolvedValueOnce(activeParishContext())
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)

    const enabledResponse = await GET(request())
    expect(enabledResponse.status).toBe(200)

    vi.clearAllMocks()
    clearReviewerPrototypeForTest()

    const rolledBackResponse = await GET(request())

    expect(rolledBackResponse.status).toBe(404)
    await expect(rolledBackResponse.json()).resolves.toEqual({
      ok: false,
      error: 'export_audit_reviewer_unavailable',
    })
    expect(requireStaffFromRequestMock).not.toHaveBeenCalled()
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })

  it('denies forged active parish cookies before audit-event reads', async () => {
    enableReviewerPrototypeForTest()
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession())
    resolveActiveStaffParishContextMock.mockResolvedValueOnce(
      activeParishContext({
        parishIds: ['parish-a'],
        activeParishId: 'parish-a',
        requestedParishId: 'parish-b',
        ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
      })
    )

    const response = await GET(request('https://vinea.test/api/export-audit-reviewer', 'parish-b'))

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: exportAuditReviewerRouteTestInternals.genericReviewerBlockedReason,
    })
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })

  it('denies legacy primary-parish fallback because the prototype requires membership scope', async () => {
    enableReviewerPrototypeForTest()
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession())
    resolveActiveStaffParishContextMock.mockResolvedValueOnce(
      activeParishContext({
        source: 'primary_parish_fallback',
      })
    )

    const response = await GET(request())

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: exportAuditReviewerRouteTestInternals.genericReviewerBlockedReason,
    })
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })

  it('parses limits and saved filters defensively', () => {
    expect(exportAuditReviewerRouteTestInternals.parseLimit(null)).toBe(100)
    expect(exportAuditReviewerRouteTestInternals.parseLimit('0')).toBe(1)
    expect(exportAuditReviewerRouteTestInternals.parseLimit('5000')).toBe(200)
    expect(exportAuditReviewerRouteTestInternals.parseSavedFilter('exports_denied_recent')).toBe(
      'exports_denied_recent'
    )
    expect(exportAuditReviewerRouteTestInternals.parseSavedFilter('not-a-filter')).toBeNull()
  })

  it('passes source-level safety gates for API-only prototype boundaries', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain('export async function GET')
    expect(source).toContain('getReviewerPrototypeGate(process.env)')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain("activeParishContext.source !== 'membership'")
    expect(source).toContain(".from('audit_events')")
    expect(source).toContain("buildExportAuditReviewerReadModel(sourceEvents")
    expect(source).toContain("return NextResponse.json({ ok: false, error: 'export_audit_reviewer_unavailable' }")
    expect(source).toContain("productionExports: 'NO_GO'")
    for (const forbidden of [
      "from '@/lib/server/auditLog'",
      'writeAuditEvent',
      'writeDeniedExportAuditEvent',
      '.insert(',
      '.update(',
      '.delete(',
      '.upsert(',
      "from('requests')",
      "from('request_documents')",
      'storage',
      'createSignedUrl',
      'signedUrl',
      'googleapis',
      'openai',
      'Content-Disposition',
      'text/csv',
      'raw export',
    ]) {
      expect(source).not.toContain(forbidden)
    }
  })
})
