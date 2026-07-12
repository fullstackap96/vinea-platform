import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/activeStaffParishContext', () => ({
  ACTIVE_STAFF_PARISH_COOKIE: 'vinea_active_parish_id',
  resolveActiveStaffParishContext: vi.fn(),
}))

vi.mock('@/lib/server/staffWriteParishContext', () => ({
  resolveStaffWriteParishContext: vi.fn(),
}))

vi.mock('@/lib/server/requireStaff', () => ({
  requireStaffFromRequest: vi.fn(),
}))

vi.mock('@/lib/server/auditLog', () => ({
  writeAuditEvent: vi.fn(),
}))

vi.mock('@/lib/supabaseServiceServer', () => ({
  createSupabaseServiceRoleClient: vi.fn(),
}))

import { resolveActiveStaffParishContext } from '@/lib/server/activeStaffParishContext'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { importsRouteTestInternals } from '@/app/api/imports/route'

const resolveActiveStaffParishContextMock = vi.mocked(resolveActiveStaffParishContext)
const resolveStaffWriteParishContextMock = vi.mocked(resolveStaffWriteParishContext)
const routePath = join(process.cwd(), 'app', 'api', 'imports', 'route.ts')
const evidencePath = join(process.cwd(), 'docs', 'IMPORTS_SAFE_ERROR_LOGGING_20260706.md')

describe('imports route parish context', () => {
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

    const result = await importsRouteTestInternals.resolveImportReadParishId(
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

    const result = await importsRouteTestInternals.resolveImportReadParishId(
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

  it('fails closed when an active parish cookie is unauthorized for read previews/history', async () => {
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

    const result = await importsRouteTestInternals.resolveImportReadParishId(
      { rpc: vi.fn(), from: vi.fn() } as never,
      'parish-2'
    )

    expect(result).toEqual({
      ok: false,
      source: 'membership',
      error: 'You are not authorized to read imports for this parish.',
      technicalDetail: 'Requested parish is not authorized for this staff session.',
      requestedParishId: 'parish-2',
    })
  })

  it('uses the write-safety helper for committed imports', async () => {
    const supabase = { rpc: vi.fn() }
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-2',
      source: 'membership',
      requestedParishId: 'parish-2',
    })

    const result = await importsRouteTestInternals.resolveImportWriteParishId(
      supabase as never,
      'parish-2'
    )

    expect(result).toEqual({ ok: true, parishId: 'parish-2' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: 'parish-2',
      allowPrimaryParishFallback: false,
      fallbackReason: 'Data imports API legacy compatibility path.',
    })
  })

  it('preserves write fallback only when no active parish cookie exists', async () => {
    const supabase = { rpc: vi.fn() }
    resolveStaffWriteParishContextMock.mockResolvedValueOnce({
      ok: true,
      parishId: 'parish-1',
      source: 'primary_parish_fallback',
      requestedParishId: null,
      fallbackReason: 'Data imports API legacy compatibility path.',
    })

    const result = await importsRouteTestInternals.resolveImportWriteParishId(
      supabase as never,
      null
    )

    expect(result).toEqual({ ok: true, parishId: 'parish-1' })
    expect(resolveStaffWriteParishContextMock).toHaveBeenCalledWith(supabase, {
      requestedParishId: null,
      allowPrimaryParishFallback: true,
      fallbackReason: 'Data imports API legacy compatibility path.',
    })
  })

  it('wires GET and POST through active parish and write-safety helpers', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain('ACTIVE_STAFF_PARISH_COOKIE')
    expect(source).toContain('resolveActiveStaffParishContext')
    expect(source).toContain('resolveStaffWriteParishContext')
    expect(source).toContain('request.cookies.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null')
    expect(source).toContain('if (commit)')
    expect(source).toContain('resolveImportWriteParishId(staff.supabase, requestedParishId)')
    expect(source).toContain('resolveImportReadParishId(staff.supabase, requestedParishId)')
    expect(source).not.toContain('function primaryParishId')
    expect(source).not.toContain(".from('parishes')")
  })

  it('logs unexpected import failures safely without returning raw provider messages', () => {
    const source = readFileSync(routePath, 'utf8')

    expect(source).toContain("import { logServerError } from '@/lib/server/safeErrorLogging'")
    expect(source).toContain('logServerError(`[imports] ${action} failed`, error')
    expect(source).toContain("logImportsError('history', error")
    expect(source).toContain("logImportsError('load-existing', error")
    expect(source).toContain("logImportsError('commit-insert', insertFailure")
    expect(source).toMatch(/logImportsError\(\s*'record-failed-batch'/)
    expect(source).toMatch(/logImportsError\(\s*'record-completed-batch'/)
    expect(source).toContain("logImportsError('preview-or-commit', error")

    expect(source).toContain("error: 'Could not load imports.'")
    expect(source).toContain("error: 'Could not import rows.'")
    expect(source).toContain("error: 'Could not record import batch.'")
    expect(source).toContain("error: 'Could not process import.'")
    expect(source).toContain("summary: { error: 'Import row insert failed.' }")

    expect(source).not.toMatch(/error:\s*(?:error|batchError)\.message/)
    expect(source).not.toContain('summary: { error: error.message }')
    expect(source).not.toMatch(/const message = error instanceof Error \? error\.message/)
  })

  it('documents the imports safe error logging boundary', () => {
    const evidence = readFileSync(evidencePath, 'utf8')

    expect(evidence).toContain('# Imports Safe Error Logging - 2026-07-06')
    expect(evidence).toContain('Could not load imports.')
    expect(evidence).toContain('Could not import rows.')
    expect(evidence).toContain('Could not record import batch.')
    expect(evidence).toContain('Could not process import.')
    expect(evidence).toContain('Import row insert failed.')
    expect(evidence).toContain('No production access')
    expect(evidence).toContain('No operational RLS changes')
    expect(evidence).toContain('No raw provider or database error messages are returned')
  })
})
