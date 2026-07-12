import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const logServerErrorMock = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('@/lib/server/safeErrorLogging', () => ({ logServerError: logServerErrorMock }))

import { cleanupPartialPublicIntake } from './publicIntakePartialCleanup'

function adminFor(results: {
  request?: { data?: { id: string } | null; error: unknown } | Error
  parishioner?: { data?: { id: string } | null; error: unknown } | Error
}) {
  const calls: string[] = []
  const from = vi.fn((table: 'requests' | 'parishioners') => ({
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          maybeSingle: vi.fn(async () => {
            calls.push(table)
            const result = table === 'requests' ? results.request : results.parishioner
            if (result instanceof Error) throw result
            return result ?? { data: { id: `${table}-deleted` }, error: null }
          }),
        })),
      })),
    })),
  }))
  return { admin: { from } as never, calls, from }
}

describe('public intake partial cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a no-op success when no partial ids were created', async () => {
    const { admin, from } = adminFor({})

    await expect(cleanupPartialPublicIntake(admin, {})).resolves.toEqual({
      ok: true,
      requestCleanupAttempted: false,
      requestCleanupFailed: false,
      parishionerCleanupAttempted: false,
      parishionerCleanupFailed: false,
    })
    expect(from).not.toHaveBeenCalled()
    expect(logServerErrorMock).not.toHaveBeenCalled()
  })

  it('confirms both compensating deletes when Supabase accepts them', async () => {
    const { admin, calls } = adminFor({})

    await expect(
      cleanupPartialPublicIntake(admin, {
        requestId: 'request-private-id',
        parishionerId: 'parishioner-private-id',
      }),
    ).resolves.toMatchObject({ ok: true })
    expect(calls).toEqual(['requests', 'parishioners'])
    expect(logServerErrorMock).not.toHaveBeenCalled()
  })

  it('continues parishioner cleanup after a returned request-delete error', async () => {
    const returnedError = new Error('request delete failed for request-private-id')
    const { admin, calls } = adminFor({ request: { error: returnedError } })

    const result = await cleanupPartialPublicIntake(admin, {
      requestId: 'request-private-id',
      parishionerId: 'parishioner-private-id',
    })

    expect(result).toEqual({
      ok: false,
      requestCleanupAttempted: true,
      requestCleanupFailed: true,
      parishionerCleanupAttempted: true,
      parishionerCleanupFailed: false,
    })
    expect(calls).toEqual(['requests', 'parishioners'])
    expect(logServerErrorMock).toHaveBeenCalledWith(
      '[intake] partial cleanup failed',
      returnedError,
      result,
    )
    expect(JSON.stringify(logServerErrorMock.mock.calls)).not.toContain('request-private-id')
    expect(JSON.stringify(logServerErrorMock.mock.calls)).not.toContain('parishioner-private-id')
  })

  it('reports an accepted zero-row delete as an incomplete cleanup', async () => {
    const { admin, calls } = adminFor({ request: { data: null, error: null } })

    await expect(
      cleanupPartialPublicIntake(admin, {
        requestId: 'request-private-id',
        parishionerId: 'parishioner-private-id',
      }),
    ).resolves.toEqual({
      ok: false,
      requestCleanupAttempted: true,
      requestCleanupFailed: true,
      parishionerCleanupAttempted: true,
      parishionerCleanupFailed: false,
    })
    expect(calls).toEqual(['requests', 'parishioners'])
    expect(logServerErrorMock).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(logServerErrorMock.mock.calls)).not.toContain('request-private-id')
  })

  it('reports both failures after thrown request and returned parishioner errors', async () => {
    const { admin, calls } = adminFor({
      request: new Error('request cleanup failed'),
      parishioner: { error: new Error('parishioner cleanup failed') },
    })

    await expect(
      cleanupPartialPublicIntake(admin, {
        requestId: 'request-private-id',
        parishionerId: 'parishioner-private-id',
      }),
    ).resolves.toEqual({
      ok: false,
      requestCleanupAttempted: true,
      requestCleanupFailed: true,
      parishionerCleanupAttempted: true,
      parishionerCleanupFailed: true,
    })
    expect(calls).toEqual(['requests', 'parishioners'])
    expect(logServerErrorMock).toHaveBeenCalledTimes(1)
  })

  it('documents checked recovery, privacy-safe logging, and the non-transaction boundary', () => {
    const doc = readFileSync(
      join(
        process.cwd(),
        'docs/PUBLIC_INTAKE_PARTIAL_CLEANUP_OBSERVABILITY_BOUNDARY_20260711.md',
      ),
      'utf8',
    )

    for (const phrase of [
      '`cleanupPartialPublicIntake`',
      'attempted independently',
      'accepted zero-row deletes',
      'booleans only',
      'not a database transaction',
      'No production or shared-QA access',
    ]) {
      expect(doc).toContain(phrase)
    }
  })
})
