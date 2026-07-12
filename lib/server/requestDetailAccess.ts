import 'server-only'

import {
  resolveActiveStaffParishContext,
  type ActiveStaffParishContextResult,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>
type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

export type RequestDetailAccess = {
  requestId: string
  parishId: string
}

export type StaffScopedRequestDetailAccessOptions = {
  staffSupabase?: StaffSupabaseClient
  activeParishId?: string | null
  allowPrimaryParishFallback?: boolean
}

function normalizeId(value: unknown): string | null {
  const id = String(value ?? '').trim()
  return id || null
}

async function primaryParishId(admin: AdminClient): Promise<string | null> {
  const { data, error } = await admin
    .from('parishes')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data?.id ? String(data.id) : null
}

function isExactMembershipActiveParish(
  context: ActiveStaffParishContextResult,
  requestedParishId: string
): context is Extract<ActiveStaffParishContextResult, { ok: true }> {
  return (
    context.ok &&
    context.source === 'membership' &&
    context.activeParishId === requestedParishId &&
    !context.ignoredRequestedParishReason
  )
}

async function resolveRequestDetailAccessParishId(
  admin: AdminClient,
  options: StaffScopedRequestDetailAccessOptions
): Promise<string | null> {
  const activeParishId = normalizeId(options.activeParishId)

  if (activeParishId) {
    if (!options.staffSupabase) return null

    const context = await resolveActiveStaffParishContext(options.staffSupabase, {
      requestedParishId: activeParishId,
    })

    return isExactMembershipActiveParish(context, activeParishId) ? context.activeParishId : null
  }

  if (options.allowPrimaryParishFallback === true) {
    return primaryParishId(admin)
  }

  return null
}

export async function loadStaffScopedRequestDetailAccess(
  admin: AdminClient,
  requestId: string,
  options: StaffScopedRequestDetailAccessOptions = {}
): Promise<RequestDetailAccess | null> {
  const parishId = await resolveRequestDetailAccessParishId(admin, options)
  if (!parishId) return null

  const id = normalizeId(requestId)
  if (!id) return null

  const { data: requestRow, error: requestError } = await admin
    .from('requests')
    .select('id, parishioner_id')
    .eq('id', id)
    .maybeSingle()

  if (requestError) throw requestError
  if (!requestRow?.id || !requestRow.parishioner_id) return null

  const { data: parishioner, error: parishionerError } = await admin
    .from('parishioners')
    .select('parish_id')
    .eq('id', requestRow.parishioner_id)
    .maybeSingle()

  if (parishionerError) throw parishionerError
  if (String(parishioner?.parish_id ?? '') !== parishId) return null

  return { requestId: String(requestRow.id), parishId }
}

export const requestDetailAccessTestInternals = {
  isExactMembershipActiveParish,
  normalizeId,
  resolveRequestDetailAccessParishId,
}
