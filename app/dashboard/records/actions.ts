'use server'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { normalizeSacramentalRecordWrite } from '@/lib/sacramentalRecords'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import type { SacramentalRecordWriteInput } from '@/lib/types/sacramentalRecords'

export type SacramentalRecordMutationResult =
  | { ok: true; recordId: string }
  | { ok: false; error: string }

export type SacramentalRecordUpdateResult = { ok: true } | { ok: false; error: string }

export type SacramentalRecordPersonLinkResult = { ok: true } | { ok: false; error: string }

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

  // Parish id for insert: same ordering as `/api/parish/settings` (service role read).
  const { parishId, error: parishErr } = await fetchPrimaryParishId(
    createSupabaseServiceRoleClient()
  )
  if (parishErr || !parishId) {
    return { ok: false, error: parishErr?.message ?? 'Parish not found.' }
  }

  const requestIdRaw = input.requestId != null ? String(input.requestId).trim() : ''
  const personIdRaw = input.personId != null ? String(input.personId).trim() : ''

  const insertPayload: Record<string, unknown> = {
    parish_id: parishId,
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
    return { ok: false, error: error?.message ?? 'Could not create record.' }
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

  const { error } = await supabase.from('sacramental_records').update(normalized.payload).eq('id', id)

  if (error) {
    return { ok: false, error: error.message }
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

  const rawPersonId = personId == null ? '' : String(personId).trim()
  const nextPersonId = rawPersonId.length > 0 ? rawPersonId : null

  if (nextPersonId) {
    const { data: personRow, error: personErr } = await supabase
      .from('people')
      .select('id')
      .eq('id', nextPersonId)
      .maybeSingle()

    if (personErr) {
      return { ok: false, error: personErr.message }
    }
    if (!personRow?.id) {
      return { ok: false, error: 'Person not found in your parish.' }
    }
  }

  const { data, error } = await supabase
    .from('sacramental_records')
    .update({ person_id: nextPersonId })
    .eq('id', id)
    .select('id')

  if (error) {
    return { ok: false, error: error.message }
  }
  if (!data?.length) {
    return { ok: false, error: 'Could not update person link. Refresh and try again.' }
  }

  return { ok: true }
}
