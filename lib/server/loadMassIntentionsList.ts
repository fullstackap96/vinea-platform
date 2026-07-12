import 'server-only'

import { cookies } from 'next/headers'

import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import {
  parseMassIntentionFulfilledFilter,
  sanitizeMassIntentionsSearchQuery,
} from '@/lib/massIntentions'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type {
  MassIntentionFulfilledFilter,
  MassIntentionListItem,
} from '@/lib/types/massIntentions'

export type MassIntentionsListResult = {
  intentions: MassIntentionListItem[]
  errorMessage: string
  searchQuery: string
  fulfilledFilter: MassIntentionFulfilledFilter
  activeParishName: string | null
}

export const MASS_INTENTIONS_LIST_SELECT =
  'id, requester_name, intention_text, requested_date, assigned_mass_date, assigned_priest_name, stipend_received, is_fulfilled' as const

function nullableString(value: unknown): string | null {
  const normalized = String(value ?? '').trim()
  return normalized ? normalized : null
}

function dateOnly(value: unknown): string | null {
  return value != null ? String(value).slice(0, 10) : null
}

function parseMassIntentionListItem(raw: Record<string, unknown>): MassIntentionListItem {
  return {
    id: String(raw.id ?? ''),
    requester_name: String(raw.requester_name ?? '').trim(),
    intention_text: String(raw.intention_text ?? '').trim(),
    requested_date: dateOnly(raw.requested_date),
    assigned_mass_date: dateOnly(raw.assigned_mass_date),
    assigned_priest_name: nullableString(raw.assigned_priest_name),
    stipend_received: Boolean(raw.stipend_received),
    is_fulfilled: Boolean(raw.is_fulfilled),
  }
}

function parseListSearchParams(input: {
  q?: string | string[] | undefined
  fulfilled?: string | string[] | undefined
}): { searchQuery: string; fulfilledFilter: MassIntentionFulfilledFilter } {
  const searchQuery = String(Array.isArray(input.q) ? input.q[0] : input.q ?? '').trim()
  const rawFulfilled = Array.isArray(input.fulfilled) ? input.fulfilled[0] : input.fulfilled
  const fulfilledFilter = parseMassIntentionFulfilledFilter(rawFulfilled)
  return { searchQuery, fulfilledFilter }
}

export async function loadMassIntentionsList(searchParams: {
  q?: string | string[]
  fulfilled?: string | string[]
}): Promise<MassIntentionsListResult> {
  const { searchQuery, fulfilledFilter } = parseListSearchParams(searchParams)

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      intentions: [],
      errorMessage: 'Unauthorized',
      searchQuery,
      fulfilledFilter,
      activeParishName: null,
    }
  }

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })
  if (!parishContext.ok) {
    return {
      intentions: [],
      errorMessage: parishContext.error,
      searchQuery,
      fulfilledFilter,
      activeParishName: null,
    }
  }

  const parishId = parishContext.activeParishId
  const activeParishName =
    parishContext.parishes.find((parish) => parish.id === parishContext.activeParishId)?.name ??
    parishContext.activeParish.name ??
    null

  let query = supabase
    .from('mass_intentions')
    .select(MASS_INTENTIONS_LIST_SELECT)
    .order('assigned_mass_date', { ascending: true, nullsFirst: false })
    .order('requested_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  if (fulfilledFilter === 'unfulfilled') {
    query = query.eq('is_fulfilled', false)
  } else if (fulfilledFilter === 'fulfilled') {
    query = query.eq('is_fulfilled', true)
  }

  const sanitized = sanitizeMassIntentionsSearchQuery(searchQuery)
  if (sanitized) {
    const pattern = `%${sanitized}%`
    query = query.or(
      [`requester_name.ilike.${pattern}`, `intention_text.ilike.${pattern}`].join(',')
    )
  }

  const { data, error } = await query

  if (error) {
    return {
      intentions: [],
      errorMessage: userMessageForDashboardQueryError('mass intentions', error),
      searchQuery,
      fulfilledFilter,
      activeParishName,
    }
  }

  const intentions = (data ?? []).map((row) =>
    parseMassIntentionListItem(row as Record<string, unknown>)
  )

  return { intentions, errorMessage: '', searchQuery, fulfilledFilter, activeParishName }
}
