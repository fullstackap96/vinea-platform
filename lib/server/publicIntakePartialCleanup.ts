import 'server-only'

import { logServerError } from '@/lib/server/safeErrorLogging'
import type { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type PublicIntakeCleanupAdmin = ReturnType<typeof createSupabaseServiceRoleClient>

export type PublicIntakePartialIds = {
  readonly requestId?: string
  readonly parishionerId?: string
}

export type PublicIntakePartialCleanupResult = {
  readonly ok: boolean
  readonly requestCleanupAttempted: boolean
  readonly requestCleanupFailed: boolean
  readonly parishionerCleanupAttempted: boolean
  readonly parishionerCleanupFailed: boolean
}

async function removePartialRow(
  admin: PublicIntakeCleanupAdmin,
  table: 'requests' | 'parishioners',
  id: string,
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  try {
    const { data, error } = await admin
      .from(table)
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()
    if (error) return { ok: false, error }
    if (!data?.id) {
      return { ok: false, error: new Error('Expected partial intake row was not deleted.') }
    }
    return { ok: true }
  } catch (error: unknown) {
    return { ok: false, error }
  }
}

export async function cleanupPartialPublicIntake(
  admin: PublicIntakeCleanupAdmin,
  ids: PublicIntakePartialIds,
): Promise<PublicIntakePartialCleanupResult> {
  const requestResult = ids.requestId
    ? await removePartialRow(admin, 'requests', ids.requestId)
    : null
  const parishionerResult = ids.parishionerId
    ? await removePartialRow(admin, 'parishioners', ids.parishionerId)
    : null

  const result: PublicIntakePartialCleanupResult = {
    ok: requestResult?.ok !== false && parishionerResult?.ok !== false,
    requestCleanupAttempted: Boolean(ids.requestId),
    requestCleanupFailed: requestResult?.ok === false,
    parishionerCleanupAttempted: Boolean(ids.parishionerId),
    parishionerCleanupFailed: parishionerResult?.ok === false,
  }

  if (!result.ok) {
    const failure =
      requestResult?.ok === false
        ? requestResult.error
        : parishionerResult?.ok === false
          ? parishionerResult.error
          : new Error('Partial intake cleanup did not complete.')
    logServerError('[intake] partial cleanup failed', failure, result)
  }

  return result
}
