'use server'

import { normalizeSacramentalRecordWrite } from '@/lib/sacramentalRecords'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { loadStaffScopedRequestDetailAccess } from '@/lib/server/requestDetailAccess'
import { validateSacramentalRecordCreateRelationships } from '@/lib/server/sacramentalRecordCreateRelationships'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import {
  prefillRecordFormFromRequest,
  requestPersonIdFromSource,
  type RequestPrefillSource,
} from '@/lib/relationshipIntelligence/prefillRecordFromRequest'
import { recordPrefillClientFailureMessage } from '@/lib/recordPrefillClientMessages'
import type { SacramentalRecordWriteInput } from '@/lib/types/sacramentalRecords'
import type { SacramentalRecordFormValues } from './_components/SacramentalRecordForm'
import { cookies } from 'next/headers'

export type SacramentalRecordMutationResult =
  | { ok: true; recordId: string }
  | { ok: false; error: string }

export type SacramentalRecordUpdateResult = { ok: true } | { ok: false; error: string }

export type SacramentalRecordPersonLinkResult = { ok: true } | { ok: false; error: string }

export type SacramentalRecordPrefillResult =
  | {
      ok: true
      values: SacramentalRecordFormValues
      requestId: string
      personId: string | null
    }
  | { ok: false; error: string }

export const SACRAMENTAL_RECORD_REQUEST_PREFILL_SELECT =
  'request_type, status, child_name, confirmed_baptism_date, notes, person_id, assigned_priest_name, parishioner_id' as const

function sacramentalRecordActionError(
  action: string,
  error: unknown,
  safeMessage: string
): { ok: false; error: string } {
  logServerError(`[sacramental-record-actions] ${action}`, error)
  return { ok: false, error: safeMessage }
}

function sacramentalRecordPrefillError(
  action: string,
  error: unknown,
  safeMessage: string
): SacramentalRecordPrefillResult {
  logServerError(`[sacramental-record-prefill] ${action}`, error)
  return { ok: false, error: safeMessage }
}

async function resolveSacramentalRecordWriteContext(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  fallbackReason: string
) {
  const requestedParishId = (await cookies()).get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  return resolveStaffWriteParishContext(supabase, {
    requestedParishId,
    allowPrimaryParishFallback: !requestedParishId,
    fallbackReason,
  })
}

export async function loadSacramentalRecordRequestPrefill(
  requestId: string
): Promise<SacramentalRecordPrefillResult> {
  const id = String(requestId ?? '').trim()
  if (!id) {
    return { ok: false, error: recordPrefillClientFailureMessage('loadSourceRequest') }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const activeParishId = (await cookies()).get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const admin = createSupabaseServiceRoleClient()

  try {
    const access = await loadStaffScopedRequestDetailAccess(admin, id, {
      staffSupabase: supabase,
      activeParishId,
      allowPrimaryParishFallback: !activeParishId,
    })

    if (!access) {
      return { ok: false, error: 'Request not found.' }
    }

    const { data: requestRow, error: requestError } = await admin
      .from('requests')
      .select(SACRAMENTAL_RECORD_REQUEST_PREFILL_SELECT)
      .eq('id', access.requestId)
      .maybeSingle()

    if (requestError || !requestRow) {
      return sacramentalRecordPrefillError(
        'source request load failed',
        requestError ?? 'Missing request row after access verification.',
        recordPrefillClientFailureMessage('loadSourceRequest')
      )
    }

    const requestType = requestTypeFromRow(requestRow as { request_type?: unknown })
    let funeralDetail: RequestPrefillSource['funeralDetail'] = null
    let weddingDetail: RequestPrefillSource['weddingDetail'] = null
    let ociaDetail: RequestPrefillSource['ociaDetail'] = null

    if (requestType === 'funeral') {
      const { data, error } = await admin
        .from('funeral_request_details')
        .select('deceased_name, confirmed_service_at')
        .eq('request_id', access.requestId)
        .maybeSingle()
      if (error) {
        return sacramentalRecordPrefillError(
          'funeral detail load failed',
          error,
          recordPrefillClientFailureMessage('loadSupportingDetails')
        )
      }
      funeralDetail = data as RequestPrefillSource['funeralDetail']
    } else if (requestType === 'wedding') {
      const { data, error } = await admin
        .from('wedding_request_details')
        .select('partner_one_name, partner_two_name, confirmed_ceremony_at')
        .eq('request_id', access.requestId)
        .maybeSingle()
      if (error) {
        return sacramentalRecordPrefillError(
          'wedding detail load failed',
          error,
          recordPrefillClientFailureMessage('loadSupportingDetails')
        )
      }
      weddingDetail = data as RequestPrefillSource['weddingDetail']
    } else if (requestType === 'ocia') {
      const { data, error } = await admin
        .from('ocia_request_details')
        .select('confirmed_session_at')
        .eq('request_id', access.requestId)
        .maybeSingle()
      if (error) {
        return sacramentalRecordPrefillError(
          'ocia detail load failed',
          error,
          recordPrefillClientFailureMessage('loadSupportingDetails')
        )
      }
      ociaDetail = data as RequestPrefillSource['ociaDetail']
    }

    let parishioner: RequestPrefillSource['parishioner'] = null
    const parishionerId = (requestRow as { parishioner_id?: unknown }).parishioner_id
    if (parishionerId != null) {
      const { data: parishionerRow, error: parishionerError } = await admin
        .from('parishioners')
        .select('full_name')
        .eq('id', String(parishionerId))
        .maybeSingle()
      if (parishionerError) {
        return sacramentalRecordPrefillError(
          'parishioner detail load failed',
          parishionerError,
          recordPrefillClientFailureMessage('loadSupportingDetails')
        )
      }
      parishioner = parishionerRow as RequestPrefillSource['parishioner']
    }

    const source: RequestPrefillSource = {
      id: access.requestId,
      request_type: (requestRow as { request_type?: unknown }).request_type,
      status: (requestRow as { status?: unknown }).status,
      child_name: (requestRow as { child_name?: unknown }).child_name,
      confirmed_baptism_date: (requestRow as { confirmed_baptism_date?: unknown })
        .confirmed_baptism_date,
      notes: (requestRow as { notes?: unknown }).notes,
      person_id: (requestRow as { person_id?: unknown }).person_id,
      assigned_priest_name: (requestRow as { assigned_priest_name?: unknown })
        .assigned_priest_name,
      parishioner,
      funeralDetail,
      weddingDetail,
      ociaDetail,
    }

    const values = prefillRecordFormFromRequest(source)
    if (!values) {
      return {
        ok: false,
        error:
          'This request cannot be prefilled (must be complete baptism, wedding, funeral, or OCIA).',
      }
    }

    const { data: existingRecord, error: existingRecordError } = await admin
      .from('sacramental_records')
      .select('id')
      .eq('request_id', access.requestId)
      .maybeSingle()

    if (existingRecordError) {
      return sacramentalRecordPrefillError(
        'existing record check failed',
        existingRecordError,
        recordPrefillClientFailureMessage('checkExistingRecord')
      )
    }

    if (existingRecord?.id) {
      return { ok: false, error: 'A sacramental record already exists for this request.' }
    }

    return {
      ok: true,
      values,
      requestId: access.requestId,
      personId: requestPersonIdFromSource(source),
    }
  } catch (error: unknown) {
    return sacramentalRecordPrefillError(
      'unexpected prefill failure',
      error,
      recordPrefillClientFailureMessage('loadSupportingDetails')
    )
  }
}

export async function createSacramentalRecord(
  input: SacramentalRecordWriteInput
): Promise<SacramentalRecordMutationResult> {
  const normalized = normalizeSacramentalRecordWrite(input)
  if (!normalized.ok) {
    return { ok: false, error: normalized.error }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const parishContext = await resolveSacramentalRecordWriteContext(
    supabase,
    'Sacramental Record creation used legacy parish context because active parish selection was not available.'
  )
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const requestIdRaw = input.requestId != null ? String(input.requestId).trim() : ''
  const personIdRaw = input.personId != null ? String(input.personId).trim() : ''

  if (requestIdRaw || personIdRaw) {
    try {
      const relationshipValidation = await validateSacramentalRecordCreateRelationships(
        createSupabaseServiceRoleClient(),
        {
          parishId: parishContext.parishId,
          requestId: requestIdRaw || null,
          personId: personIdRaw || null,
        }
      )

      if (!relationshipValidation.ok) {
        if (relationshipValidation.reason === 'request_not_found') {
          return { ok: false, error: 'Request not found for the selected parish.' }
        }
        if (relationshipValidation.reason === 'request_already_linked') {
          return { ok: false, error: 'A sacramental record already exists for this request.' }
        }
        return { ok: false, error: 'Person not found for the selected parish.' }
      }
    } catch (error: unknown) {
      return sacramentalRecordActionError(
        'create relationship validation failed',
        error,
        'Could not verify the linked request or person.'
      )
    }
  }

  const insertPayload: Record<string, unknown> = {
    parish_id: parishContext.parishId,
    ...normalized.payload,
  }
  if (requestIdRaw) {
    insertPayload.request_id = requestIdRaw
  }
  if (personIdRaw) {
    insertPayload.person_id = personIdRaw
  }

  const { data, error } = await supabase
    .from('sacramental_records')
    .insert(insertPayload)
    .select('id')
    .single()

  if (error || !data?.id) {
    return sacramentalRecordActionError(
      'create failed',
      error ?? 'Missing inserted sacramental record id.',
      'Could not create record.'
    )
  }

  return { ok: true, recordId: String(data.id) }
}

export async function updateSacramentalRecord(
  recordId: string,
  input: SacramentalRecordWriteInput
): Promise<SacramentalRecordUpdateResult> {
  const id = String(recordId ?? '').trim()
  if (!id) {
    return { ok: false, error: 'Missing record id.' }
  }

  const normalized = normalizeSacramentalRecordWrite(input)
  if (!normalized.ok) {
    return { ok: false, error: normalized.error }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const parishContext = await resolveSacramentalRecordWriteContext(
    supabase,
    'Sacramental Record update used legacy parish context because active parish selection was not available.'
  )
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const { data, error } = await supabase
    .from('sacramental_records')
    .update(normalized.payload)
    .eq('id', id)
    .eq('parish_id', parishContext.parishId)
    .select('id')
    .maybeSingle()

  if (error) {
    return sacramentalRecordActionError('update failed', error, 'Could not update record.')
  }
  if (!data) {
    return { ok: false, error: 'Record not found for the selected parish.' }
  }

  return { ok: true }
}

/** Set or clear `sacramental_records.person_id` without changing register `person_name`. */
export async function updateSacramentalRecordPersonLink(
  recordId: string,
  personId: unknown
): Promise<SacramentalRecordPersonLinkResult> {
  const id = String(recordId ?? '').trim()
  if (!id) {
    return { ok: false, error: 'Missing record id.' }
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const parishContext = await resolveSacramentalRecordWriteContext(
    supabase,
    'Sacramental Record person link update used legacy parish context because active parish selection was not available.'
  )
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const rawPersonId = personId == null ? '' : String(personId).trim()
  const nextPersonId = rawPersonId.length > 0 ? rawPersonId : null

  if (nextPersonId) {
    const { data: personRow, error: personErr } = await supabase
      .from('people')
      .select('id')
      .eq('id', nextPersonId)
      .eq('parish_id', parishContext.parishId)
      .maybeSingle()

    if (personErr) {
      return sacramentalRecordActionError(
        'person lookup failed',
        personErr,
        'Could not verify selected person.'
      )
    }
    if (!personRow?.id) {
      return { ok: false, error: 'Person not found for the selected parish.' }
    }
  }

  const { data, error } = await supabase
    .from('sacramental_records')
    .update({ person_id: nextPersonId })
    .eq('id', id)
    .eq('parish_id', parishContext.parishId)
    .select('id')
    .maybeSingle()

  if (error) {
    return sacramentalRecordActionError(
      'person link update failed',
      error,
      'Could not update person link. Refresh and try again.'
    )
  }
  if (!data) {
    return { ok: false, error: 'Record not found for the selected parish.' }
  }

  return { ok: true }
}
