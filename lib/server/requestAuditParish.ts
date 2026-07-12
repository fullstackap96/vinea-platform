import 'server-only'

import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type ServiceRoleClient = ReturnType<typeof createSupabaseServiceRoleClient>

export type RequestAuditParishResult =
  | { ok: true; parishId: string }
  | { ok: false; error: string; technicalDetail: string | null }

export async function resolveRequestAuditParishId(
  admin: ServiceRoleClient,
  requestId: string
): Promise<RequestAuditParishResult> {
  const id = String(requestId ?? '').trim()
  if (!id) {
    return {
      ok: false,
      error: 'Request id is required before writing request audit metadata.',
      technicalDetail: null,
    }
  }

  const { data: request, error: requestError } = await admin
    .from('requests')
    .select('id, parishioner_id')
    .eq('id', id)
    .maybeSingle()

  if (requestError) {
    return {
      ok: false,
      error: 'Could not resolve request parish for audit metadata.',
      technicalDetail: requestError.message,
    }
  }

  if (!request) {
    return {
      ok: false,
      error: 'Request not found for audit metadata.',
      technicalDetail: null,
    }
  }

  const parishionerId = String(
    (request as { parishioner_id?: unknown }).parishioner_id ?? ''
  ).trim()
  if (!parishionerId) {
    return {
      ok: false,
      error: 'Request has no intake contact for audit parish resolution.',
      technicalDetail: null,
    }
  }

  const { data: parishioner, error: parishionerError } = await admin
    .from('parishioners')
    .select('parish_id')
    .eq('id', parishionerId)
    .maybeSingle()

  if (parishionerError) {
    return {
      ok: false,
      error: 'Could not resolve intake contact parish for audit metadata.',
      technicalDetail: parishionerError.message,
    }
  }

  const parishId = String(
    (parishioner as { parish_id?: unknown } | null)?.parish_id ?? ''
  ).trim()
  if (!parishId) {
    return {
      ok: false,
      error: 'Intake contact has no parish for audit metadata.',
      technicalDetail: null,
    }
  }

  return { ok: true, parishId }
}
