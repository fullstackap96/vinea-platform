'use server'

import { normalizeMassIntentionWrite } from '@/lib/massIntentions'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { MassIntentionWriteInput } from '@/lib/types/massIntentions'
import { cookies } from 'next/headers'

export type MassIntentionMutationResult =
  | { ok: true; intentionId: string }
  | { ok: false; error: string }

export type MassIntentionUpdateResult = { ok: true } | { ok: false; error: string }

function massIntentionActionError(
  action: string,
  error: unknown,
  safeMessage: string
): { ok: false; error: string } {
  logServerError(`[mass-intention-actions] ${action}`, error)
  return { ok: false, error: safeMessage }
}

export async function createMassIntention(
  input: MassIntentionWriteInput
): Promise<MassIntentionMutationResult> {
  const normalized = normalizeMassIntentionWrite(input)
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
    fallbackReason:
      'Mass Intention creation used legacy parish context because active parish selection was not available.',
  })
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const { data, error } = await supabase
    .from('mass_intentions')
    .insert({
      parish_id: parishContext.parishId,
      ...normalized.payload,
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    return massIntentionActionError(
      'create failed',
      error ?? 'Missing inserted Mass intention id.',
      'Could not create Mass intention.'
    )
  }

  return { ok: true, intentionId: String(data.id) }
}

export async function updateMassIntention(
  intentionId: string,
  input: MassIntentionWriteInput
): Promise<MassIntentionUpdateResult> {
  const id = String(intentionId ?? '').trim()
  if (!id) {
    return { ok: false, error: 'Missing intention id.' }
  }

  const normalized = normalizeMassIntentionWrite(input)
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
    fallbackReason:
      'Mass Intention update used legacy parish context because active parish selection was not available.',
  })
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const { data, error } = await supabase
    .from('mass_intentions')
    .update(normalized.payload)
    .eq('id', id)
    .eq('parish_id', parishContext.parishId)
    .select('id')
    .maybeSingle()

  if (error) {
    return massIntentionActionError('update failed', error, 'Could not update Mass intention.')
  }

  if (!data?.id) {
    return { ok: false, error: 'Mass intention not found for the selected parish.' }
  }

  return { ok: true }
}
