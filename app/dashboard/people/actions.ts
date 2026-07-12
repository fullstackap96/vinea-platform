'use server'

import { normalizePersonWrite } from '@/lib/people'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PersonWriteInput } from '@/lib/types/people'
import { cookies } from 'next/headers'

export type PersonMutationResult =
  | { ok: true; personId: string }
  | { ok: false; error: string }

export type PersonUpdateResult = { ok: true } | { ok: false; error: string }

function personActionError(action: string, error: unknown, safeMessage: string): { ok: false; error: string } {
  logServerError(`[people-actions] ${action}`, error)
  return { ok: false, error: safeMessage }
}

export async function createPerson(input: PersonWriteInput): Promise<PersonMutationResult> {
  const normalized = normalizePersonWrite(input)
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

  const requestedParishId = (await cookies()).get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveStaffWriteParishContext(supabase, {
    requestedParishId,
    allowPrimaryParishFallback: !requestedParishId,
    fallbackReason: 'People creation used legacy parish context because active parish selection was not available.',
  })
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const { data, error } = await supabase
    .from('people')
    .insert({
      parish_id: parishContext.parishId,
      ...normalized.payload,
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    return personActionError('create failed', error ?? 'Missing inserted person id.', 'Could not create person.')
  }

  return { ok: true, personId: String(data.id) }
}

export async function updatePerson(
  personId: string,
  input: PersonWriteInput
): Promise<PersonUpdateResult> {
  const id = String(personId ?? '').trim()
  if (!id) {
    return { ok: false, error: 'Missing person id.' }
  }

  const normalized = normalizePersonWrite(input)
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

  const requestedParishId = (await cookies()).get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveStaffWriteParishContext(supabase, {
    requestedParishId,
    allowPrimaryParishFallback: !requestedParishId,
    fallbackReason: 'People update used legacy parish context because active parish selection was not available.',
  })
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const { data, error } = await supabase
    .from('people')
    .update(normalized.payload)
    .eq('id', id)
    .eq('parish_id', parishContext.parishId)
    .select('id')
    .maybeSingle()

  if (error) {
    return personActionError('update failed', error, 'Could not update person.')
  }

  if (!data?.id) {
    return { ok: false, error: 'Person not found for the selected parish.' }
  }

  return { ok: true }
}
