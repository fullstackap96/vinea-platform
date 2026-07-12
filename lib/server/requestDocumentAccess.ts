import 'server-only'

import {
  resolveActiveStaffParishContext,
  type ActiveStaffParishContextResult,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServiceRoleClient } from '@/lib/supabaseServiceServer'

type AdminClient = ReturnType<typeof createSupabaseServiceRoleClient>
type StaffSupabaseClient = Parameters<typeof resolveActiveStaffParishContext>[0]

export type RequestDocumentAccess = {
  requestId: string
  parishId: string
}

export type StaffScopedRequestDocumentAccessOptions = {
  staffSupabase?: StaffSupabaseClient
  activeParishId?: string | null
  allowPrimaryParishFallback?: boolean
}

function normalizeId(value: unknown): string | null {
  const id = String(value ?? '').trim()
  return id || null
}

export async function primaryParishId(admin: AdminClient): Promise<string | null> {
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

async function resolveDocumentAccessParishId(
  admin: AdminClient,
  options: StaffScopedRequestDocumentAccessOptions
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

export async function loadStaffScopedRequestDocumentAccess(
  admin: AdminClient,
  requestId: string,
  options: StaffScopedRequestDocumentAccessOptions = {}
): Promise<RequestDocumentAccess | null> {
  const parishId = await resolveDocumentAccessParishId(admin, options)
  if (!parishId) return null

  const { data: requestRow, error: requestError } = await admin
    .from('requests')
    .select('id, parishioner_id')
    .eq('id', requestId)
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

export async function workflowStepBelongsToRequest(
  admin: AdminClient,
  input: { parishId: string; requestId: string; workflowStepId: string }
): Promise<boolean> {
  const { data, error } = await admin
    .from('request_workflow_steps')
    .select('id')
    .eq('id', input.workflowStepId)
    .eq('request_id', input.requestId)
    .eq('parish_id', input.parishId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data?.id)
}

export const requestDocumentAccessTestInternals = {
  isExactMembershipActiveParish,
  normalizeId,
  resolveDocumentAccessParishId,
}
