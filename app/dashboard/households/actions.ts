'use server'

import {
  normalizeHouseholdMemberUpdate,
  normalizeHouseholdMemberWrite,
  normalizeHouseholdWrite,
} from '@/lib/households'
import { ACTIVE_STAFF_PARISH_COOKIE } from '@/lib/server/activeStaffParishContext'
import { logServerError } from '@/lib/server/safeErrorLogging'
import { resolveStaffWriteParishContext } from '@/lib/server/staffWriteParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type {
  HouseholdMemberUpdateInput,
  HouseholdMemberWriteInput,
  HouseholdWriteInput,
} from '@/lib/types/households'
import { cookies } from 'next/headers'

export type HouseholdMutationResult =
  | { ok: true; householdId: string }
  | { ok: false; error: string }

export type HouseholdUpdateResult = { ok: true } | { ok: false; error: string }

export type HouseholdMemberMutationResult = { ok: true } | { ok: false; error: string }

function householdActionError(
  action: string,
  error: unknown,
  safeMessage: string
): { ok: false; error: string } {
  logServerError(`[household-actions] ${action}`, error)
  return { ok: false, error: safeMessage }
}

async function clearOtherPrimaryContacts(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  householdId: string,
  parishId: string,
  exceptMemberId?: string
) {
  let query = supabase
    .from('household_members')
    .update({ is_primary_contact: false })
    .eq('household_id', householdId)
    .eq('parish_id', parishId)
    .eq('is_primary_contact', true)

  if (exceptMemberId) {
    query = query.neq('id', exceptMemberId)
  }

  const { data, error } = await query.select('id')
  if (error) return { ok: false as const, error }

  return {
    ok: true as const,
    clearedMemberIds: (data ?? [])
      .map((row) => String(row.id ?? '').trim())
      .filter(Boolean),
  }
}

async function restorePrimaryContact(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  householdId: string,
  parishId: string,
  clearedMemberIds: string[]
) {
  const memberId = clearedMemberIds[0]
  if (!memberId) return { ok: true as const }

  const { data, error } = await supabase
    .from('household_members')
    .update({ is_primary_contact: true })
    .eq('id', memberId)
    .eq('household_id', householdId)
    .eq('parish_id', parishId)
    .select('id')
    .maybeSingle()

  if (error || !data?.id) {
    return {
      ok: false as const,
      error: error ?? new Error('Previous primary contact was not restored.'),
    }
  }

  return { ok: true as const }
}

async function resolveHouseholdWriteContext(
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

  const parishContext = await resolveHouseholdWriteContext(
    supabase,
    'Household creation used legacy parish context because active parish selection was not available.'
  )
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const { data, error } = await supabase
    .from('households')
    .insert({
      parish_id: parishContext.parishId,
      ...normalized.payload,
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    return householdActionError(
      'create failed',
      error ?? 'Missing inserted household id.',
      'Could not create household.'
    )
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

  const parishContext = await resolveHouseholdWriteContext(
    supabase,
    'Household update used legacy parish context because active parish selection was not available.'
  )
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const { data, error } = await supabase
    .from('households')
    .update(normalized.payload)
    .eq('id', id)
    .eq('parish_id', parishContext.parishId)
    .select('id')
    .maybeSingle()

  if (error) {
    return householdActionError('update failed', error, 'Could not update household.')
  }
  if (!data) {
    return { ok: false, error: 'Household not found for the selected parish.' }
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

  const parishContext = await resolveHouseholdWriteContext(
    supabase,
    'Household member creation used legacy parish context because active parish selection was not available.'
  )
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const { data: householdRow, error: householdError } = await supabase
    .from('households')
    .select('id')
    .eq('id', id)
    .eq('parish_id', parishContext.parishId)
    .maybeSingle()

  if (householdError) {
    return householdActionError(
      'add member household ownership check failed',
      householdError,
      'Could not add household member.'
    )
  }
  if (!householdRow) {
    return { ok: false, error: 'Household not found for the selected parish.' }
  }

  const { data: personRow, error: personError } = await supabase
    .from('people')
    .select('id')
    .eq('id', normalized.payload.person_id)
    .eq('parish_id', parishContext.parishId)
    .maybeSingle()

  if (personError) {
    return householdActionError(
      'add member person ownership check failed',
      personError,
      'Could not add household member.'
    )
  }
  if (!personRow) {
    return { ok: false, error: 'Person not found for the selected parish.' }
  }

  let clearedPrimaryMemberIds: string[] = []
  if (normalized.payload.is_primary_contact) {
    const cleared = await clearOtherPrimaryContacts(supabase, id, parishContext.parishId)
    if (!cleared.ok) {
      return householdActionError(
        'add member clear primary failed',
        cleared.error,
        'Could not change the household primary contact.'
      )
    }
    clearedPrimaryMemberIds = cleared.clearedMemberIds
  }

  const { data: insertedMember, error } = await supabase
    .from('household_members')
    .insert({
      parish_id: parishContext.parishId,
      household_id: id,
      ...normalized.payload,
    })
    .select('id')
    .maybeSingle()

  if (error || !insertedMember?.id) {
    const restored = await restorePrimaryContact(
      supabase,
      id,
      parishContext.parishId,
      clearedPrimaryMemberIds
    )
    if (!restored.ok) {
      return householdActionError(
        'add member restore primary failed',
        restored.error,
        'The member was not saved, and the previous primary contact could not be restored. Refresh before trying again.'
      )
    }
    return error
      ? householdActionError('add member failed', error, 'Could not add household member.')
      : { ok: false, error: 'Could not add household member.' }
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

  const parishContext = await resolveHouseholdWriteContext(
    supabase,
    'Household member update used legacy parish context because active parish selection was not available.'
  )
  if (!parishContext.ok) {
    return { ok: false, error: parishContext.error }
  }

  const { data: memberRow, error: memberLookupError } = await supabase
    .from('household_members')
    .select('id')
    .eq('id', memberRowId)
    .eq('household_id', householdRowId)
    .eq('parish_id', parishContext.parishId)
    .maybeSingle()

  if (memberLookupError) {
    return householdActionError(
      'update member ownership check failed',
      memberLookupError,
      'Could not update household member.'
    )
  }
  if (!memberRow?.id) {
    return { ok: false, error: 'Household member not found for the selected parish.' }
  }

  let clearedPrimaryMemberIds: string[] = []
  if (normalized.payload.is_primary_contact) {
    const cleared = await clearOtherPrimaryContacts(
      supabase,
      householdRowId,
      parishContext.parishId,
      memberRowId
    )
    if (!cleared.ok) {
      return householdActionError(
        'update member clear primary failed',
        cleared.error,
        'Could not change the household primary contact.'
      )
    }
    clearedPrimaryMemberIds = cleared.clearedMemberIds
  }

  const { data, error } = await supabase
    .from('household_members')
    .update(normalized.payload)
    .eq('id', memberRowId)
    .eq('household_id', householdRowId)
    .eq('parish_id', parishContext.parishId)
    .select('id')
    .maybeSingle()

  if (error || !data?.id) {
    const restored = await restorePrimaryContact(
      supabase,
      householdRowId,
      parishContext.parishId,
      clearedPrimaryMemberIds
    )
    if (!restored.ok) {
      return householdActionError(
        'update member restore primary failed',
        restored.error,
        'The member was not updated, and the previous primary contact could not be restored. Refresh before trying again.'
      )
    }
    return error
      ? householdActionError('update member failed', error, 'Could not update household member.')
      : { ok: false, error: 'Household member not found for the selected parish.' }
  }

  return { ok: true }
}
