'use server'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { normalizeMassIntentionWrite } from '@/lib/massIntentions'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import type { MassIntentionWriteInput } from '@/lib/types/massIntentions'

export type MassIntentionMutationResult =
  | { ok: true; intentionId: string }
  | { ok: false; error: string }

export type MassIntentionUpdateResult = { ok: true } | { ok: false; error: string }

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

  const { parishId, error: parishErr } = await fetchPrimaryParishId(
    createSupabaseServiceRoleClient()
  )
  if (parishErr || !parishId) {
    return { ok: false, error: parishErr?.message ?? 'Parish not found.' }
  }

  const { data, error } = await supabase
    .from('mass_intentions')
    .insert({
      parish_id: parishId,
      ...normalized.payload,
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    return { ok: false, error: error?.message ?? 'Could not create Mass intention.' }
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

  const { error } = await supabase.from('mass_intentions').update(normalized.payload).eq('id', id)

  if (error) {
    return { ok: false, error: error.message ?? 'Could not update Mass intention.' }
  }

  return { ok: true }
}
