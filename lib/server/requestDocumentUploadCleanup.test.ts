import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/server/safeErrorLogging', () => ({
  logServerError: vi.fn(),
}))

import { logServerError } from '@/lib/server/safeErrorLogging'
import { cleanupFailedRequestDocumentUpload } from './requestDocumentUploadCleanup'

const logServerErrorMock = vi.mocked(logServerError)

function storageResult(result: unknown) {
  const remove = vi.fn().mockResolvedValue(result)
  return {
    storage: { from: vi.fn(() => ({ remove })) },
    remove,
  }
}

describe('failed request document upload cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('confirms exactly one removed synthetic object', async () => {
    const { storage, remove } = storageResult({
      data: [{ name: 'synthetic-object' }],
      error: null,
    })

    await expect(
      cleanupFailedRequestDocumentUpload({
        storage: storage as never,
        bucket: 'request-documents',
        storagePath: 'private/synthetic-object',
        source: 'staff',
      }),
    ).resolves.toEqual({ ok: true, removedObjectCount: 1 })
    expect(remove).toHaveBeenCalledWith(['private/synthetic-object'])
    expect(logServerErrorMock).not.toHaveBeenCalled()
  })

  it.each([
    ['returned error', { data: null, error: new Error('synthetic remove failure') }],
    ['zero-object result', { data: [], error: null }],
    ['multi-object result', { data: [{ name: 'one' }, { name: 'two' }], error: null }],
  ])('treats %s as unconfirmed cleanup', async (_label, result) => {
    const { storage } = storageResult(result)

    const cleanup = await cleanupFailedRequestDocumentUpload({
      storage: storage as never,
      bucket: 'request-documents',
      storagePath: 'private/synthetic-object',
      source: 'family_portal',
    })

    expect(cleanup.ok).toBe(false)
    expect(logServerErrorMock).toHaveBeenCalledWith(
      '[request-document-upload] storage cleanup failed',
      expect.anything(),
      expect.objectContaining({
        source: 'family_portal',
        cleanupRequestedObjectCount: 1,
      }),
    )
  })

  it('treats a thrown remove failure as unconfirmed without exposing path context', async () => {
    const remove = vi.fn().mockRejectedValue(new Error('synthetic thrown failure'))
    const storage = { from: vi.fn(() => ({ remove })) }

    await expect(
      cleanupFailedRequestDocumentUpload({
        storage: storage as never,
        bucket: 'request-documents',
        storagePath: 'private/synthetic-object',
        source: 'staff',
      }),
    ).resolves.toEqual({ ok: false, removedObjectCount: 0 })

    const context = logServerErrorMock.mock.calls[0]?.[2]
    expect(context).not.toHaveProperty('storagePath')
    expect(context).not.toHaveProperty('bucket')
  })
})
