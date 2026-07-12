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
import { workflowTemplateSettingsRouteTestInternals } from '@/app/api/parish/workflow-templates/route'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)

const routePath = join(process.cwd(), 'app', 'api', 'parish', 'workflow-templates', 'route.ts')
const evidencePath = join(
  process.cwd(),
  'docs',
  'WORKFLOW_TEMPLATES_SAFE_ERROR_LOGGING_20260706.md',
)

describe('workflow template settings route parish context', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the active read context primary parish when no active parish cookie exists', async () => {
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

    const result =
      await workflowTemplateSettingsRouteTestInternals.resolveWorkflowTemplateReadParishId(
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
    const supabase = { rpc: vi.fn(), from: vi.fn() }
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

    const result =
      await workflowTemplateSettingsRouteTestInternals.resolveWorkflowTemplateReadParishId(
        supabase as never,
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

    const result =
      await workflowTemplateSettingsRouteTestInternals.resolveWorkflowTemplateReadParishId(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-2'
      )

    expect(result).toEqual({
      ok: false,
      source: 'membership',
      error: 'You are not authorized to read workflow templates for this parish.',
      technicalDetail: 'Requested parish is not authorized for this staff session.',
      requestedParishId: 'parish-2',
    })
  })

  it('does not use primary-parish fallback when an active parish cookie exists', async () => {
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

    const result =
      await workflowTemplateSettingsRouteTestInternals.resolveWorkflowTemplateReadParishId(
        { rpc: vi.fn(), from: vi.fn() } as never,
        'parish-1'
      )

    expect(result).toEqual({
      ok: false,
      source: 'primary_parish_fallback',
      error: 'You are not authorized to read workflow templates for this parish.',
      technicalDetail: 'Active parish cookie requires membership-backed parish authorization.',
      requestedParishId: 'parish-1',
    })
  })

  it('wires GET and PATCH through active parish and write-safety helpers', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('resolveStaffWriteParishContext')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('allowPrimaryParishFallback: !requestedParishId')
    expect(source).not.toContain('function primaryParishId')
    expect(source).not.toContain(".from('parishes')")
  })

  it('returns generic errors and logs sanitized context for unexpected workflow template failures', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('logServerError(`[workflow-templates] ${action} failed`')
    expect(source).toContain("logWorkflowTemplateError('load', error")
    expect(source).toContain("logWorkflowTemplateError('read-current-step', currentError")
    expect(source).toContain("logWorkflowTemplateError('read-template', templateError")
    expect(source).toContain("logWorkflowTemplateError('update-step', updateError")
    expect(source).toContain("error: 'Could not load workflow templates.'")
    expect(source).toContain("error: 'Could not update workflow step.'")
    expect(source).toContain('hasActiveParishCookie')
    expect(source).toContain('hasStepId')
    expect(source).not.toMatch(/error:\s*(?:currentError|templateError|updateError)\.message/)
    expect(source).not.toMatch(/const message = error instanceof Error \? error\.message/)
  })

  it('documents the workflow template safe error logging boundary', () => {
    const doc = readFileSync(evidencePath, 'utf8')

    expect(doc).toContain('Workflow Templates Safe Error Logging')
    expect(doc).toContain('Could not load workflow templates.')
    expect(doc).toContain('Could not update workflow step.')
    expect(doc).toContain('No operational RLS policies were changed.')
    expect(doc).toContain('No workflow template editing semantics were changed.')
  })
})
