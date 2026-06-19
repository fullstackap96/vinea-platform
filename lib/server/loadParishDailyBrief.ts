import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { buildParishOpsBrief, type ParishOpsBrief } from '@/lib/parishOpsBrief'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'

export type ParishDailyBriefSettings = {
  id: string
  name: string
  default_notification_email: string | null
  daily_ops_brief_enabled?: boolean | null
  daily_ops_brief_email?: string | null
  daily_ops_brief_last_sent_on?: string | null
}

export type LoadedParishDailyBrief = {
  parish: ParishDailyBriefSettings
  toEmail: string
  brief: ParishOpsBrief
}

type SupabaseLike = SupabaseClient

function text(value: unknown): string {
  return String(value ?? '').trim()
}

function isValidEmail(value: string): boolean {
  return value.includes('@') && !/\s/.test(value)
}

export function resolveDailyBriefRecipient(parish: ParishDailyBriefSettings): string {
  const daily = text(parish.daily_ops_brief_email)
  if (daily && isValidEmail(daily)) return daily
  const fallback = text(parish.default_notification_email)
  if (fallback && isValidEmail(fallback)) return fallback
  return ''
}

export async function loadPrimaryParishDailyBrief(
  supabase: SupabaseLike,
  options?: { now?: Date }
): Promise<LoadedParishDailyBrief | null> {
  const { data: parish, error: parishErr } = await supabase
    .from('parishes')
    .select(
      'id, name, default_notification_email, daily_ops_brief_enabled, daily_ops_brief_email, daily_ops_brief_last_sent_on'
    )
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (parishErr) throw parishErr
  if (!parish?.id) return null

  const toEmail = resolveDailyBriefRecipient(parish as ParishDailyBriefSettings)
  if (!toEmail) {
    return {
      parish: parish as ParishDailyBriefSettings,
      toEmail: '',
      brief: buildParishOpsBrief([], options),
    }
  }

  const requests = await loadRequestsForParish(supabase, String(parish.id))
  return {
    parish: parish as ParishDailyBriefSettings,
    toEmail,
    brief: buildParishOpsBrief(requests, options),
  }
}

export async function loadEnabledParishDailyBriefs(
  supabase: SupabaseLike,
  options?: { now?: Date; dateYmd?: string }
): Promise<LoadedParishDailyBrief[]> {
  let query = supabase
    .from('parishes')
    .select(
      'id, name, default_notification_email, daily_ops_brief_enabled, daily_ops_brief_email, daily_ops_brief_last_sent_on'
    )
    .eq('daily_ops_brief_enabled', true)
    .order('created_at', { ascending: true })

  if (options?.dateYmd) {
    query = query.or(`daily_ops_brief_last_sent_on.is.null,daily_ops_brief_last_sent_on.neq.${options.dateYmd}`)
  }

  const { data: parishes, error } = await query
  if (error) throw error

  const loaded: LoadedParishDailyBrief[] = []
  for (const parish of parishes ?? []) {
    const toEmail = resolveDailyBriefRecipient(parish as ParishDailyBriefSettings)
    if (!toEmail) continue
    const requests = await loadRequestsForParish(supabase, String(parish.id))
    loaded.push({
      parish: parish as ParishDailyBriefSettings,
      toEmail,
      brief: buildParishOpsBrief(requests, options),
    })
  }
  return loaded
}

async function loadRequestsForParish(
  supabase: SupabaseLike,
  parishId: string
): Promise<Record<string, unknown>[]> {
  const { data: parishioners, error: parishionerErr } = await supabase
    .from('parishioners')
    .select('id, full_name, email, phone, parish_id')
    .eq('parish_id', parishId)

  if (parishionerErr) throw parishionerErr

  const parishionerRows = parishioners ?? []
  const parishionerIds = parishionerRows.map((row) => row.id).filter(Boolean)
  if (parishionerIds.length === 0) return []

  const { data: requestRowsRaw, error: requestErr } = await supabase
    .from('requests')
    .select(
      'id, request_type, status, child_name, preferred_dates, notes, reply_draft, created_at, parishioner_id, person_id, confirmed_baptism_date, last_contacted_at, assigned_staff_name, assigned_priest_name, assigned_deacon_name, next_follow_up_date, waiting_on, waiting_on_changed_at'
    )
    .in('parishioner_id', parishionerIds)
    .order('created_at', { ascending: false })

  if (requestErr) throw requestErr

  const requestRows = (requestRowsRaw ?? []).map((row) => ({
    ...row,
    request_type: requestTypeFromRow(row),
  }))
  const requestIds = requestRows.map((row) => row.id).filter(Boolean)
  const checklistIncompleteCountByRequestId = new Map<string, number>()

  if (requestIds.length > 0) {
    const { data: checklistRows, error: checklistErr } = await supabase
      .from('checklist_items')
      .select('request_id, is_complete')
      .in('request_id', requestIds)

    if (checklistErr) throw checklistErr
    for (const item of checklistRows ?? []) {
      const requestId = String(item.request_id)
      if (item.is_complete === false) {
        checklistIncompleteCountByRequestId.set(
          requestId,
          (checklistIncompleteCountByRequestId.get(requestId) ?? 0) + 1
        )
      }
    }
  }

  const parishionerById = new Map(parishionerRows.map((row) => [String(row.id), row]))
  let withDetails = requestRows.map((request) => {
    const incompleteCount = checklistIncompleteCountByRequestId.get(String(request.id)) ?? 0
    return {
      ...request,
      parishioner: parishionerById.get(String(request.parishioner_id)) ?? null,
      checklist_incomplete: incompleteCount > 0,
      checklist_incomplete_count: incompleteCount,
    }
  }) as Record<string, unknown>[]

  for (const [type, table, detailKey] of [
    ['funeral', 'funeral_request_details', 'funeral_detail'],
    ['wedding', 'wedding_request_details', 'wedding_detail'],
    ['ocia', 'ocia_request_details', 'ocia_detail'],
  ] as const) {
    const ids = withDetails
      .filter((row) => row.request_type === type)
      .map((row) => String(row.id))
    const byId = new Map<string, Record<string, unknown>>()
    if (ids.length > 0) {
      const { data, error } = await supabase.from(table).select('*').in('request_id', ids)
      if (error) throw error
      for (const row of data ?? []) {
        byId.set(String(row.request_id), row as Record<string, unknown>)
      }
    }
    withDetails = withDetails.map((row) => ({
      ...row,
      [detailKey]: row.request_type === type ? byId.get(String(row.id)) ?? null : null,
    }))
  }

  return withDetails
}
