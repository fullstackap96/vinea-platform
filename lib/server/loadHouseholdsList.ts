import 'server-only'

import { cookies } from 'next/headers'

import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { sanitizeHouseholdsSearchQuery } from '@/lib/households'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { HouseholdListItem } from '@/lib/types/households'

export type HouseholdsListResult = {
  households: HouseholdListItem[]
  errorMessage: string
  searchQuery: string
  activeParishName: string | null
}

export const HOUSEHOLDS_LIST_SELECT =
  'id, name, address, city, state, postal_code' as const

function nullableString(value: unknown): string | null {
  const normalized = String(value ?? '').trim()
  return normalized ? normalized : null
}

function parseHouseholdListItem(raw: Record<string, unknown>): HouseholdListItem {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? '').trim(),
    address: nullableString(raw.address),
    city: nullableString(raw.city),
    state: nullableString(raw.state),
    postal_code: nullableString(raw.postal_code),
    memberCount: 0,
  }
}

function parseListSearchParams(input: {
  q?: string | string[] | undefined
}): { searchQuery: string } {
  const searchQuery = String(Array.isArray(input.q) ? input.q[0] : input.q ?? '').trim()
  return { searchQuery }
}

export async function loadHouseholdsList(searchParams: {
  q?: string | string[]
}): Promise<HouseholdsListResult> {
  const { searchQuery } = parseListSearchParams(searchParams)

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { households: [], errorMessage: 'Unauthorized', searchQuery, activeParishName: null }
  }

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })
  if (!parishContext.ok) {
    return {
      households: [],
      errorMessage: parishContext.error,
      searchQuery,
      activeParishName: null,
    }
  }

  const parishId = parishContext.activeParishId
  const activeParishName =
    parishContext.parishes.find((parish) => parish.id === parishContext.activeParishId)?.name ??
    parishContext.activeParish.name ??
    null

  let query = supabase
    .from('households')
    .select(HOUSEHOLDS_LIST_SELECT)
    .order('name', { ascending: true })

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  const sanitized = sanitizeHouseholdsSearchQuery(searchQuery)
  if (sanitized) {
    const pattern = `%${sanitized}%`
    query = query.or(
      [`name.ilike.${pattern}`, `address.ilike.${pattern}`, `city.ilike.${pattern}`].join(',')
    )
  }

  const { data, error } = await query

  if (error) {
    return {
      households: [],
      errorMessage: userMessageForDashboardQueryError('households', error),
      searchQuery,
      activeParishName,
    }
  }

  const rows = (data ?? []).map((row) => parseHouseholdListItem(row as Record<string, unknown>))
  const householdIds = rows.map((row) => row.id)

  const memberCountByHouseholdId = new Map<string, number>()

  if (householdIds.length > 0) {
    const { data: memberRows } = await supabase
      .from('household_members')
      .select('household_id')
      .in('household_id', householdIds)

    for (const raw of memberRows ?? []) {
      const householdId = String((raw as { household_id?: unknown }).household_id ?? '')
      if (!householdId) continue
      memberCountByHouseholdId.set(householdId, (memberCountByHouseholdId.get(householdId) ?? 0) + 1)
    }
  }

  const households: HouseholdListItem[] = rows.map((row) => ({
    ...row,
    memberCount: memberCountByHouseholdId.get(row.id) ?? 0,
  }))

  return { households, errorMessage: '', searchQuery, activeParishName }
}
