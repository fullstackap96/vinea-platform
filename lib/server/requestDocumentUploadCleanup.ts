import 'server-only'

import { logServerError } from '@/lib/server/safeErrorLogging'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type StorageClient = ReturnType<typeof createSupabaseServiceRoleClient>['storage']

export type RequestDocumentUploadCleanupResult = {
  ok: boolean
  removedObjectCount: number
}

export async function cleanupFailedRequestDocumentUpload(input: {
  storage: StorageClient
  bucket: string
  storagePath: string
  source: 'staff' | 'family_portal'
}): Promise<RequestDocumentUploadCleanupResult> {
  try {
    const { data, error } = await input.storage
      .from(input.bucket)
      .remove([input.storagePath])
    const removedObjectCount = Array.isArray(data) ? data.length : 0

    if (error || removedObjectCount !== 1) {
      logServerError(
        '[request-document-upload] storage cleanup failed',
        error ?? new Error('Storage cleanup did not confirm one removed object.'),
        {
          source: input.source,
          cleanupRequestedObjectCount: 1,
          removedObjectCount,
        },
      )
      return { ok: false, removedObjectCount }
    }

    return { ok: true, removedObjectCount }
  } catch (error: unknown) {
    logServerError('[request-document-upload] storage cleanup failed', error, {
      source: input.source,
      cleanupRequestedObjectCount: 1,
      removedObjectCount: 0,
    })
    return { ok: false, removedObjectCount: 0 }
  }
}
