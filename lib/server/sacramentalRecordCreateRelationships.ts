import 'server-only'

import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>

export type SacramentalRecordCreateRelationshipInput = {
  parishId: string
  requestId: string | null
  personId: string | null
}

export type SacramentalRecordCreateRelationshipResult =
  | { ok: true }
  | {
      ok: false
      reason: 'request_not_found' | 'request_already_linked' | 'person_not_found'
    }

/**
 * Validates optional continuity links before a sacramental register row is created.
 * The service client is safe here only because every lookup is compared with the
 * staff member's already-authorized parish context before the insert can proceed.
 */
export async function validateSacramentalRecordCreateRelationships(
  admin: AdminClient,
  input: SacramentalRecordCreateRelationshipInput
): Promise<SacramentalRecordCreateRelationshipResult> {
  if (input.requestId) {
    const { data: requestRow, error: requestError } = await admin
      .from('requests')
      .select('id, parishioner_id')
      .eq('id', input.requestId)
      .maybeSingle()

    if (requestError) throw requestError
    if (!requestRow?.id || !requestRow.parishioner_id) {
      return { ok: false, reason: 'request_not_found' }
    }

    const { data: parishionerRow, error: parishionerError } = await admin
      .from('parishioners')
      .select('parish_id')
      .eq('id', requestRow.parishioner_id)
      .maybeSingle()

    if (parishionerError) throw parishionerError
    if (String(parishionerRow?.parish_id ?? '') !== input.parishId) {
      return { ok: false, reason: 'request_not_found' }
    }

    const { data: existingRecord, error: existingRecordError } = await admin
      .from('sacramental_records')
      .select('id')
      .eq('request_id', input.requestId)
      .maybeSingle()

    if (existingRecordError) throw existingRecordError
    if (existingRecord?.id) {
      return { ok: false, reason: 'request_already_linked' }
    }
  }

  if (input.personId) {
    const { data: personRow, error: personError } = await admin
      .from('people')
      .select('id')
      .eq('id', input.personId)
      .eq('parish_id', input.parishId)
      .maybeSingle()

    if (personError) throw personError
    if (!personRow?.id) {
      return { ok: false, reason: 'person_not_found' }
    }
  }

  return { ok: true }
}
