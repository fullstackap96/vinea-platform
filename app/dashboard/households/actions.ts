'use server'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import {
  normalizeHouseholdMemberUpdate,
  normalizeHouseholdMemberWrite,
  normalizeHouseholdWrite,
} from '@/lib/households'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'
import type {
  HouseholdMemberUpdateInput,
  HouseholdMemberWriteInput,
  HouseholdWriteInput,
} from '@/lib/types/households'

export type HouseholdMutationResult =
  | { ok: true; householdId: string }
  | { ok: false; error: string }

export type HouseholdUpdateResult = { ok: true } | { ok: false; error: string }

export type HouseholdMemberMutationResult = { ok: true } | { ok: false; error: string }

async function clearOtherPrimaryContacts(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  householdId: string,
  exceptMemberId?: string
) {
  let query = supabase
    .from('household_members')
    .update({ is_primary_contact: false })
    .eq('household_id', householdId)
    .eq('is_primary_contact', true)

  if (exceptMemberId) {
    query = query.neq('id', exceptMemberId)
  }

  await query
}

export async function createHousehold(
  input: HouseholdWriteInput
): Promise<HouseholdMutationResult> {
  const normalized = normalizeHouseholdWrite(input)
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
    .from('households')
    .insert({
      parish_id: parishId,
      ...normalized.payload,
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    return { ok: false, error: error?.message ?? 'Could not create household.' }
  }

  return { ok: true, householdId: String(data.id) }
}

export async function updateHousehold(
  householdId: string,
  input: HouseholdWriteInput
): Promise<HouseholdUpdateResult> {
  const id = String(householdId ?? '').trim()
  if (!id) {
    return { ok: false, error: 'Missing household id.' }
  }

  const normalized = normalizeHouseholdWrite(input)
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

  const { error } = await supabase.from('households').update(normalized.payload).eq('id', id)

  if (error) {
    return { ok: false, error: error.message ?? 'Could not update household.' }
  }

  return { ok: true }
}

export async function addHouseholdMember(
  householdId: string,
  input: HouseholdMemberWriteInput
): Promise<HouseholdMemberMutationResult> {
  const id = String(householdId ?? '').trim()
  if (!id) {
    return { ok: false, error: 'Missing household id.' }
  }

  const normalized = normalizeHouseholdMemberWrite(input)
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

  if (normalized.payload.is_primary_contact) {
    await clearOtherPrimaryContacts(supabase, id)
  }

  const { error } = await supabase.from('household_members').insert({
    household_id: id,
    ...normalized.payload,
  })

  if (error) {
    return { ok: false, error: error.message ?? 'Could not add household member.' }
  }

  return { ok: true }
}

export async function updateHouseholdMember(
  memberId: string,
  householdId: string,
  input: HouseholdMemberUpdateInput
): Promise<HouseholdMemberMutationResult> {
  const memberRowId = String(memberId ?? '').trim()
  const householdRowId = String(householdId ?? '').trim()
  if (!memberRowId || !householdRowId) {
    return { ok: false, error: 'Missing member id.' }
  }

  const normalized = normalizeHouseholdMemberUpdate(input)
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

  if (normalized.payload.is_primary_contact) {
    await clearOtherPrimaryContacts(supabase, householdRowId, memberRowId)
  }

  const { error } = await supabase
    .from('household_members')
    .update(normalized.payload)
    .eq('id', memberRowId)
    .eq('household_id', householdRowId)

  if (error) {
    return { ok: false, error: error.message ?? 'Could not update household member.' }
  }

  return { ok: true }
}
