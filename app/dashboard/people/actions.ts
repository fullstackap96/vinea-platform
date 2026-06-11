'use server'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { normalizePersonWrite } from '@/lib/people'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import type { PersonWriteInput } from '@/lib/types/people'

export type PersonMutationResult =
  | { ok: true; personId: string }
  | { ok: false; error: string }

export type PersonUpdateResult = { ok: true } | { ok: false; error: string }

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

  const { parishId, error: parishErr } = await fetchPrimaryParishId(
    createSupabaseServiceRoleClient()
  )
  if (parishErr || !parishId) {
    return { ok: false, error: parishErr?.message ?? 'Parish not found.' }
  }

  const { data, error } = await supabase
    .from('people')
    .insert({
      parish_id: parishId,
      ...normalized.payload,
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    return { ok: false, error: error?.message ?? 'Could not create person.' }
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

  const { error } = await supabase.from('people').update(normalized.payload).eq('id', id)

  if (error) {
    return { ok: false, error: error.message ?? 'Could not update person.' }
  }

  return { ok: true }
}
