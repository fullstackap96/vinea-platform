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

vi.mock('@/lib/server/auditLog', () => ({
  writeAuditEvent: vi.fn(),
}))

vi.mock('@/lib/server/staffParishRole', () => ({
  loadAuthenticatedStaffRoleForParish: vi.fn(),
}))

import {
  GET,
  requestDocumentManifestExportRouteTestInternals,
} from '@/app/api/exports/requests/documents/manifest/route'
import { writeAuditEvent } from '@/lib/server/auditLog'
import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { requireStaffFromRequest } from '@/lib/server/requireStaff'
import { loadAuthenticatedStaffRoleForParish } from '@/lib/server/staffParishRole'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import {
  EXPORT_RUNTIME_ACK_FLAG,
  EXPORT_RUNTIME_ACK_VALUE,
  EXPORT_RUNTIME_ENABLED_VALUE,
  EXPORT_RUNTIME_ENV_FLAG,
  EXPORT_RUNTIME_FLAG,
  EXPORT_RUNTIME_NON_PRODUCTION_VALUE,
} from '@/lib/server/exportRuntimeGate'
import { validateFutureExportRouteRuntimeWiringSource } from '@/lib/server/exportRouteRuntimeWiringPreflight'

type ActiveParishContextSuccess = Extract<
  Awaited<ReturnType<typeof resolveActiveStaffParishContext>>,
  { ok: true }
>
type StaffSessionSuccess = Extract<Awaited<ReturnType<typeof requireStaffFromRequest>>, { ok: true }>

const requireStaffFromRequestMock = vi.mocked(requireStaffFromRequest)
const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const createSupabaseServiceRoleClientMock = vi.mocked(createSupabaseServiceRoleClient)
const writeAuditEventMock = vi.mocked(writeAuditEvent)
const loadAuthenticatedStaffRoleForParishMock = vi.mocked(loadAuthenticatedStaffRoleForParish)
const routePath = join(
  process.cwd(),
  'app',
  'api',
  'exports',
  'requests',
  'documents',
  'manifest',
  'route.ts'
)

const originalEnv = { ...process.env }

function enableExportRuntimeForTest() {
  process.env[EXPORT_RUNTIME_FLAG] = EXPORT_RUNTIME_ENABLED_VALUE
  process.env[EXPORT_RUNTIME_ACK_FLAG] = EXPORT_RUNTIME_ACK_VALUE
  process.env[EXPORT_RUNTIME_ENV_FLAG] = EXPORT_RUNTIME_NON_PRODUCTION_VALUE
  process.env.VERCEL_ENV = 'preview'
}

function clearExportRuntimeForTest() {
  delete process.env[EXPORT_RUNTIME_FLAG]
  delete process.env[EXPORT_RUNTIME_ACK_FLAG]
  delete process.env[EXPORT_RUNTIME_ENV_FLAG]
  process.env.VERCEL_ENV = 'preview'
}

function request(
  url = 'https://vinea.test/api/exports/requests/documents/manifest',
  cookieValue?: string
) {
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
    activeParish: { id: 'parish-a', name: 'Parish A' },
    parishes: [
      { id: 'parish-a', name: 'Parish A' },
      { id: 'parish-b', name: 'Parish B' },
    ],
    requestedParishId: null,
    ...overrides,
  } satisfies ActiveParishContextSuccess
}

function successfulAdmin(events: string[] = []) {
  const parishionersBuilder = {
    select: vi.fn(() => parishionersBuilder),
    eq: vi.fn(() => {
      events.push('query:parishioners')
      return Promise.resolve({ data: [{ id: 'parishioner-1' }], error: null })
    }),
  }

  const requestsBuilder = {
    select: vi.fn(() => requestsBuilder),
    in: vi.fn(() => requestsBuilder),
    order: vi.fn(() => requestsBuilder),
    limit: vi.fn(() => {
      events.push('query:requests')
      return Promise.resolve({
        data: [
          {
            id: 'request-1',
            request_type: 'baptism',
            status: 'in_progress',
            created_at: '2026-06-30T12:00:00.000Z',
          },
          {
            id: 'request-2',
            request_type: 'sacramental_record',
            status: 'in_progress',
            created_at: '2026-06-30T11:00:00.000Z',
          },
        ],
        error: null,
      })
    }),
  }

  const workflowBuilder = {
    select: vi.fn(() => workflowBuilder),
    eq: vi.fn(() => workflowBuilder),
    in: vi.fn(() => workflowBuilder),
    order: vi.fn(() => {
      events.push('query:request_workflow_steps')
      return Promise.resolve({
        data: [
          {
            id: 'step-1',
            request_id: 'request-1',
            phase: 'Preparation',
            title: 'Birth certificate',
            required: true,
            sort_order: 1,
          },
          {
            id: 'step-2',
            request_id: 'request-1',
            phase: 'Preparation',
            title: 'Sponsor letter',
            required: false,
            sort_order: 2,
          },
          {
            id: 'step-3',
            request_id: 'request-2',
            phase: 'Canonical review',
            title: 'Sacramental register check',
            required: true,
            sort_order: 1,
          },
        ],
        error: null,
      })
    }),
  }

  const documentsBuilder = {
    select: vi.fn(() => documentsBuilder),
    eq: vi.fn(() => documentsBuilder),
    in: vi.fn(() => documentsBuilder),
    order: vi.fn(() => {
      events.push('query:request_documents')
      return Promise.resolve({
        data: [
          {
            id: 'document-1',
            request_id: 'request-1',
            workflow_step_id: 'step-1',
            document_type: 'Birth certificate',
            status: 'approved',
            reviewed_at: '2026-06-30T14:00:00.000Z',
            reviewed_by_email: 'reviewer@example.com',
            created_at: '2026-06-30T13:00:00.000Z',
            original_filename: 'should-not-be-selected.pdf',
            storage_path: 'should/not/be/selected.pdf',
          },
          {
            id: 'document-2',
            request_id: 'request-2',
            workflow_step_id: 'step-3',
            document_type: 'Canonical notation',
            status: 'pending',
            reviewed_at: null,
            reviewed_by_email: null,
            created_at: '2026-06-30T10:00:00.000Z',
          },
        ],
        error: null,
      })
    }),
  }

  return {
    from: vi.fn((table: string) => {
      if (table === 'parishioners') return parishionersBuilder
      if (table === 'requests') return requestsBuilder
      if (table === 'request_workflow_steps') return workflowBuilder
      if (table === 'request_documents') return documentsBuilder
      throw new Error(`Unexpected table ${table}`)
    }),
  }
}

describe('request document manifest export route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    clearExportRuntimeForTest()
    loadAuthenticatedStaffRoleForParishMock.mockResolvedValue('admin')
    writeAuditEventMock.mockResolvedValue(true)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('stays disabled by default before staff auth or database work', async () => {
    const response = await GET(request())

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'export_unavailable' })
    expect(requireStaffFromRequestMock).not.toHaveBeenCalled()
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('audits and denies family-portal or unauthenticated requests before parish scope or query', async () => {
    enableExportRuntimeForTest()
    requireStaffFromRequestMock.mockResolvedValueOnce({
      ok: false as const,
      response: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await GET(request())

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ ok: false, error: 'Unauthorized' })
    expect(resolveActiveStaffParishContextMock).not.toHaveBeenCalled()
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parishId: null,
        actorEmail: null,
        action: 'export.request_document_manifest.denied',
        targetType: 'export',
        targetId: 'request_document_manifest',
        metadata: expect.objectContaining({
          routeId: 'app/api/exports/requests/documents/manifest',
          export_preset_id: 'request_document_manifest',
          target_object_type: 'request_documents',
          decision: 'denied',
          deniedReasonCode: 'unauthenticated_or_non_staff',
          httpStatus: 401,
          runtimeGateState: 'enabled_non_production',
          safeMetadataOnly: true,
        }),
      })
    )
  })

  it('exports same-parish document manifest CSV only after safe audit metadata is written', async () => {
    enableExportRuntimeForTest()
    const events: string[] = []
    const supabase = { rpc: vi.fn(), from: vi.fn() }
    const admin = successfulAdmin(events)
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(supabase))
    resolveActiveStaffParishContextMock.mockResolvedValueOnce(activeParishContext())
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(admin as never)
    writeAuditEventMock.mockImplementationOnce(async () => {
      events.push('audit')
      return true
    })

    const response = await GET(request())
    const csv = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/csv')
    expect(csv).toContain('request_reference,request_type,request_status')
    expect(csv).toContain('workflow_step_title,workflow_step_required,document_label')
    expect(csv).toContain(
      'request-1,baptism,in_progress,Preparation,Birth certificate,required,Birth certificate,approved,2026-06-30T13:00:00.000Z,2026-06-30T14:00:00.000Z,Staff reviewer,received'
    )
    expect(csv).toContain('request-1,baptism,in_progress,Preparation,Sponsor letter,optional,Sponsor letter,missing')
    expect(csv).not.toContain('should-not-be-selected.pdf')
    expect(csv).not.toContain('should/not/be/selected.pdf')
    expect(csv).not.toContain('signed_url')
    expect(csv).not.toContain('token')
    expect(csv).not.toContain('notes')
    expect(csv).not.toContain('communication')
    expect(csv).not.toContain('AI')
    expect(csv.toLowerCase()).not.toContain('sacramental')
    expect(csv.toLowerCase()).not.toContain('canonical')
    expect(events[0]).toBe('audit')
    expect(events.slice(1).sort()).toEqual([
      'query:parishioners',
      'query:request_documents',
      'query:request_workflow_steps',
      'query:requests',
    ])
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parishId: 'parish-a',
        actorEmail: 'admin@example.com',
        action: 'export.request_document_manifest.downloaded',
        targetType: 'export',
        targetId: 'request_document_manifest',
        metadata: expect.objectContaining({
          active_parish_id: 'parish-a',
          export_preset_id: 'request_document_manifest',
          safeMetadataOnly: true,
          runtimeGateState: 'enabled_non_production',
          permissionDecisionBeforeRuntimeGate: 'disabled_non_runtime',
          permissionBlockedReasonBeforeRuntimeGate: 'runtime_export_not_enabled',
        }),
      })
    )
    expect(resolveActiveStaffParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
    })
    expect(loadAuthenticatedStaffRoleForParishMock).toHaveBeenCalledWith(supabase, {
      parishId: 'parish-a',
      email: 'admin@example.com',
    })
  })

  it('fails closed before privileged manifest queries when required audit persistence fails', async () => {
    enableExportRuntimeForTest()
    const supabase = { rpc: vi.fn(), from: vi.fn() }
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(supabase))
    resolveActiveStaffParishContextMock.mockResolvedValueOnce(activeParishContext())
    writeAuditEventMock.mockResolvedValueOnce(false)

    const response = await GET(request())

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Export request cannot be completed.',
    })
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'export.request_document_manifest.downloaded' }),
    )
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
  })

  it('uses the selected-parish staff role instead of an admin role from another parish', async () => {
    enableExportRuntimeForTest()
    const supabase = { rpc: vi.fn(), from: vi.fn() }
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(supabase))
    resolveActiveStaffParishContextMock.mockResolvedValueOnce(
      activeParishContext({ activeParishId: 'parish-b', requestedParishId: 'parish-b' })
    )
    loadAuthenticatedStaffRoleForParishMock.mockResolvedValueOnce('staff')
    createSupabaseServiceRoleClientMock.mockReturnValueOnce(successfulAdmin() as never)

    const response = await GET(
      request('https://vinea.test/api/exports/requests/documents/manifest', 'parish-b')
    )

    expect(response.status).toBe(200)
    expect(loadAuthenticatedStaffRoleForParishMock).toHaveBeenCalledWith(supabase, {
      parishId: 'parish-b',
      email: 'admin@example.com',
    })
  })

  it('audits and fails closed when the selected parish has no supported staff role', async () => {
    enableExportRuntimeForTest()
    const supabase = { rpc: vi.fn(), from: vi.fn() }
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession(supabase))
    resolveActiveStaffParishContextMock.mockResolvedValueOnce(activeParishContext())
    loadAuthenticatedStaffRoleForParishMock.mockResolvedValueOnce(null)

    const response = await GET(request())

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: requestDocumentManifestExportRouteTestInternals.genericExportBlockedReason,
    })
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parishId: 'parish-a',
        actorEmail: 'admin@example.com',
        action: 'export.request_document_manifest.denied',
        targetId: 'request_document_manifest',
        metadata: expect.objectContaining({
          deniedReasonCode: 'selected_parish_role_denied',
          requestedFieldsCount:
            requestDocumentManifestExportRouteTestInternals.requestDocumentManifestExportFields
              .length,
          safeMetadataOnly: true,
        }),
      })
    )
  })

  it('audits and fails closed for an unauthorized active parish cookie before query', async () => {
    enableExportRuntimeForTest()
    requireStaffFromRequestMock.mockResolvedValueOnce(staffSession())
    resolveActiveStaffParishContextMock.mockResolvedValueOnce(
      activeParishContext({
        parishIds: ['parish-a'],
        activeParishId: 'parish-a',
        requestedParishId: 'parish-b',
        ignoredRequestedParishReason: 'Requested parish is not authorized for this staff session.',
      })
    )

    const response = await GET(
      request('https://vinea.test/api/exports/requests/documents/manifest', 'parish-b')
    )

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: requestDocumentManifestExportRouteTestInternals.genericExportBlockedReason,
    })
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        parishId: null,
        actorEmail: 'admin@example.com',
        action: 'export.request_document_manifest.denied',
        targetType: 'export',
        targetId: 'request_document_manifest',
        metadata: expect.objectContaining({
          routeId: 'app/api/exports/requests/documents/manifest',
          export_preset_id: 'request_document_manifest',
          target_object_type: 'request_documents',
          decision: 'denied',
          deniedReasonCode: 'active_parish_scope_denied',
          requestedActiveParishCookiePresent: true,
          httpStatus: 403,
          safeMetadataOnly: true,
        }),
      })
    )
  })

  it('audits and denies blocked or non-allowlisted field requests before query without storing field names', async () => {
    enableExportRuntimeForTest()
    requireStaffFromRequestMock.mockResolvedValue(staffSession())
    resolveActiveStaffParishContextMock.mockResolvedValue(activeParishContext())

    const blocked = await GET(
      request(
        'https://vinea.test/api/exports/requests/documents/manifest?fields=request_reference,signed_url'
      )
    )
    const disallowed = await GET(
      request(
        'https://vinea.test/api/exports/requests/documents/manifest?fields=request_reference,original_filename'
      )
    )

    expect(blocked.status).toBe(403)
    expect(disallowed.status).toBe(403)
    expect(createSupabaseServiceRoleClientMock).not.toHaveBeenCalled()
    expect(writeAuditEventMock).toHaveBeenCalledTimes(2)
    const callsText = JSON.stringify(writeAuditEventMock.mock.calls)
    expect(callsText).not.toContain('signed_url')
    expect(callsText).not.toContain('storage_path')
    expect(callsText).not.toContain('original_filename')
    expect(writeAuditEventMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        parishId: 'parish-a',
        actorEmail: 'admin@example.com',
        action: 'export.request_document_manifest.denied',
        targetId: 'request_document_manifest',
        metadata: expect.objectContaining({
          deniedReasonCode: 'export_permission_denied',
          requestedFieldsCount: 2,
          safeMetadataOnly: true,
        }),
      })
    )
    expect(writeAuditEventMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        parishId: 'parish-a',
        actorEmail: 'admin@example.com',
        action: 'export.request_document_manifest.denied',
        targetId: 'request_document_manifest',
        metadata: expect.objectContaining({
          deniedReasonCode: 'blocked_or_disallowed_fields',
          requestedFieldsCount: 2,
          disallowedFieldsCount: 1,
          safeMetadataOnly: true,
        }),
      })
    )
  })

  it('keeps sacramental/canonical markers out of manifest rows', () => {
    expect(
      requestDocumentManifestExportRouteTestInternals.containsSacramentalCanonicalExportMarker(
        'Sacramental register check'
      )
    ).toBe(true)
    expect(
      requestDocumentManifestExportRouteTestInternals.containsSacramentalCanonicalExportMarker(
        'canonical notation'
      )
    ).toBe(true)
    expect(
      requestDocumentManifestExportRouteTestInternals.isSafeManifestExportRow({
        request_reference: 'request-1',
        request_type: 'baptism',
        request_status: 'in_progress',
        workflow_phase: 'Preparation',
        workflow_step_title: 'Birth certificate',
        workflow_step_required: 'required',
        document_label: 'Birth certificate',
        document_status: 'approved',
        submitted_date: '2026-06-30T13:00:00.000Z',
        reviewed_date: '',
        reviewer_display: 'Staff reviewer',
        missing_received: 'received',
      })
    ).toBe(true)
    expect(
      requestDocumentManifestExportRouteTestInternals.isSafeManifestExportRow({
        request_reference: 'request-2',
        request_type: 'sacramental_record',
        request_status: 'in_progress',
        workflow_phase: 'Canonical review',
        workflow_step_title: 'Sacramental register check',
        workflow_step_required: 'required',
        document_label: 'Canonical notation',
        document_status: 'pending',
        submitted_date: '',
        reviewed_date: '',
        reviewer_display: '',
        missing_received: 'missing',
      })
    ).toBe(false)
  })

  it('parses only approved manifest fields and maps staff roles conservatively', () => {
    expect(requestDocumentManifestExportRouteTestInternals.parseRequestedExportFields(null)).toEqual({
      ok: true,
      requestedFields:
        requestDocumentManifestExportRouteTestInternals.requestDocumentManifestExportFields,
    })
    expect(
      requestDocumentManifestExportRouteTestInternals.parseRequestedExportFields(
        'Request Reference, document_status'
      )
    ).toEqual({
      ok: true,
      requestedFields: ['request_reference', 'document_status'],
    })
    expect(
      requestDocumentManifestExportRouteTestInternals.parseRequestedExportFields(
        'request_reference,storage_path'
      )
    ).toEqual({
      ok: false,
      requestedFields: ['request_reference', 'storage_path'],
      disallowedFields: ['storage_path'],
    })
    expect(requestDocumentManifestExportRouteTestInternals.staffExportRoles('admin')).toEqual([
      'parish_admin',
    ])
    expect(requestDocumentManifestExportRouteTestInternals.staffExportRoles('staff')).toEqual([
      'parish_secretary',
    ])
  })

  it('passes the export route source-level preflight gates and avoids storage/file delivery APIs', () => {
    const source = readFileSync(routePath, 'utf8')
    const result = validateFutureExportRouteRuntimeWiringSource(
      'app/api/exports/requests/documents/manifest/route.ts',
      source
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(source).toContain('getExportRuntimeGate(process.env)')
    expect(source).toContain('requireStaffFromRequest(request)')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('loadAuthenticatedStaffRoleForParish')
    expect(source).toContain('staffExportRoles(selectedParishRole)')
    expect(source).not.toContain('staffExportRoles(staff.staff.role)')
    expect(source).toContain("deniedReasonCode: 'selected_parish_role_denied'")
    expect(source).toContain('membershipParishIds')
    expect(source).toContain('buildExportPermissionEvaluationDto')
    expect(source).toContain('blockedFieldsRequested')
    expect(source).toContain('familyPortalSurface')
    expect(source).toContain('auditMetadataTemplate')
    expect(source).toContain('writeAuditEvent')
    expect(source).toContain('genericExportBlockedReason')
    expect(source).toContain('queryExportRows')
    expect(source).toContain('returnExportFile')
    expect(source).not.toContain('createSignedUrl')
    expect(source).not.toContain('storage.from')
    expect(source).not.toContain('download(')
  })
})
