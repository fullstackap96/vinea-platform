import 'server-only'

import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

import { redactSensitiveLogText } from '@/lib/server/safeErrorLogging'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

export type StaffParishContextSource = 'membership' | 'primary_parish_fallback'

export type StaffParishContextParish = {
  id: string
  name: string | null
}

export type StaffParishContextResult =
  | {
      ok: true
      source: StaffParishContextSource
      parishIds: string[]
      primaryParishId: string
      parishes: StaffParishContextParish[]
      fallbackReason?: string
    }
  | {
      ok: false
      source: StaffParishContextSource
      error: string
      technicalDetail: string | null
    }

type MinimalSupabaseClient = Pick<SupabaseClient, 'from' | 'rpc'>

function normalizeId(value: unknown): string | null {
  const id = String(value ?? '').trim()
  return id || null
}

function normalizeRpcParishIds(data: unknown): string[] {
  if (data == null) return []

  const values = Array.isArray(data) ? data : [data]
  const ids = values
    .map((value) => {
      if (typeof value === 'string') return normalizeId(value)
      if (value && typeof value === 'object') {
        const row = value as Record<string, unknown>
        return (
          normalizeId(row.current_staff_parish_ids) ??
          normalizeId(row.parish_id) ??
          normalizeId(row.id)
        )
      }
      return null
    })
    .filter((value): value is string => Boolean(value))

  return Array.from(new Set(ids))
}

function parishFallback(id: string): StaffParishContextParish {
  return { id, name: null }
}

function mergeMembershipParishes(
  membershipIds: string[],
  visibleParishes: StaffParishContextParish[]
): StaffParishContextParish[] {
  const visibleById = new Map(visibleParishes.map((parish) => [parish.id, parish]))
  return membershipIds.map((id) => visibleById.get(id) ?? parishFallback(id))
}

function isMissingMembershipFoundation(error: PostgrestError | null): boolean {
  if (!error) return false
  const message = String(error.message ?? '').toLowerCase()
  return (
    error.code === 'PGRST202' ||
    error.code === 'PGRST205' ||
    message.includes('current_staff_parish_ids') ||
    message.includes('parish_memberships') ||
    message.includes('schema cache') ||
    message.includes('could not find the function') ||
    message.includes('could not find the table')
  )
}

function safeTechnicalDetail(error: Pick<PostgrestError, 'message'> | null | undefined): string | null {
  return error?.message ? redactSensitiveLogText(error.message) : null
}

async function loadParishesByIds(
  supabase: MinimalSupabaseClient,
  parishIds: string[]
): Promise<{ parishes: StaffParishContextParish[]; error: PostgrestError | null }> {
  if (parishIds.length === 0) return { parishes: [], error: null }

  const { data, error } = await supabase
    .from('parishes')
    .select('id, name, public_display_name, created_at')
    .in('id', parishIds)
    .order('created_at', { ascending: true })

  if (error) return { parishes: [], error }

  const parishes = (data ?? [])
    .map((row) => {
      const id = normalizeId((row as { id?: unknown }).id)
      if (!id) return null
      const name =
        normalizeId((row as { name?: unknown }).name) ??
        normalizeId((row as { public_display_name?: unknown }).public_display_name)
      return {
        id,
        name,
      }
    })
    .filter((row): row is StaffParishContextParish => Boolean(row))

  return { parishes, error: null }
}

async function loadParishesByIdsWithDisplayFallback(
  supabase: MinimalSupabaseClient,
  parishIds: string[]
): Promise<{ parishes: StaffParishContextParish[]; error: PostgrestError | null }> {
  const staffScopedResult = await loadParishesByIds(supabase, parishIds)
  const staffScopedById = new Map(staffScopedResult.parishes.map((parish) => [parish.id, parish]))
  const hasAllDisplayNames = parishIds.every((id) => Boolean(staffScopedById.get(id)?.name))

  if (!staffScopedResult.error && hasAllDisplayNames) {
    return staffScopedResult
  }

  try {
    const serviceRoleResult = await loadParishesByIds(createSupabaseServiceRoleClient(), parishIds)

    if (serviceRoleResult.error || serviceRoleResult.parishes.length === 0) {
      return staffScopedResult
    }

    const serviceRoleById = new Map(serviceRoleResult.parishes.map((parish) => [parish.id, parish]))
    const parishes = parishIds
      .map((id) => {
        const staffScopedParish = staffScopedById.get(id)
        const serviceRoleParish = serviceRoleById.get(id)

        if (staffScopedParish?.name) return staffScopedParish
        if (serviceRoleParish?.name) return serviceRoleParish
        return staffScopedParish ?? serviceRoleParish ?? parishFallback(id)
      })
      .filter((row): row is StaffParishContextParish => Boolean(row))

    return { parishes, error: null }
  } catch {
    return staffScopedResult
  }
}

async function loadPrimaryParishFallback(
  supabase: MinimalSupabaseClient,
  fallbackReason?: string
): Promise<StaffParishContextResult> {
  const { data, error } = await supabase.rpc('primary_parish_id')
  if (error) {
    return {
      ok: false,
      source: 'primary_parish_fallback',
      error: 'Could not resolve parish context.',
      technicalDetail: safeTechnicalDetail(error),
    }
  }

  const primaryParishId = normalizeId(data)
  if (!primaryParishId) {
    return {
      ok: false,
      source: 'primary_parish_fallback',
      error: 'Parish is not configured.',
      technicalDetail: null,
    }
  }

  const { parishes, error: parishError } = await loadParishesByIdsWithDisplayFallback(supabase, [
    primaryParishId,
  ])
  if (parishError) {
    return {
      ok: false,
      source: 'primary_parish_fallback',
      error: 'Could not load parish context.',
      technicalDetail: safeTechnicalDetail(parishError),
    }
  }

  return {
    ok: true,
    source: 'primary_parish_fallback',
    parishIds: [primaryParishId],
    primaryParishId,
    parishes: parishes.length > 0 ? parishes : [parishFallback(primaryParishId)],
    fallbackReason,
  }
}

export async function resolveStaffParishContext(
  supabase: MinimalSupabaseClient
): Promise<StaffParishContextResult> {
  const { data, error } = await supabase.rpc('current_staff_parish_ids')
  const membershipIds = normalizeRpcParishIds(data)

  if (!error && membershipIds.length > 0) {
    const { parishes, error: parishError } = await loadParishesByIdsWithDisplayFallback(
      supabase,
      membershipIds
    )

    if (parishError) {
      return {
        ok: true,
        source: 'membership',
        parishIds: membershipIds,
        primaryParishId: membershipIds[0],
        parishes: mergeMembershipParishes(membershipIds, []),
        fallbackReason: `Parish display rows were not loaded: ${safeTechnicalDetail(parishError) ?? 'Unknown error'}`,
      }
    }

    return {
      ok: true,
      source: 'membership',
      parishIds: membershipIds,
      primaryParishId: membershipIds[0],
      parishes: mergeMembershipParishes(membershipIds, parishes),
      fallbackReason:
        parishes.length === 0 ? 'Parish display rows were not visible to the staff session.' : undefined,
    }
  }

  return loadPrimaryParishFallback(
    supabase,
    error
      ? isMissingMembershipFoundation(error)
        ? 'Membership foundation is not deployed.'
        : (safeTechnicalDetail(error) ?? 'Membership lookup failed.')
      : 'No active parish memberships found.'
  )
}

export const staffParishContextTestInternals = {
  mergeMembershipParishes,
  normalizeRpcParishIds,
}
