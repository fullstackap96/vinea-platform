import 'server-only'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { parseHouseholdRow, sanitizeHouseholdsSearchQuery } from '@/lib/households'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { HouseholdListItem } from '@/lib/types/households'

export type HouseholdsListResult = {
  households: HouseholdListItem[]
  errorMessage: string
  searchQuery: string
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
    return { households: [], errorMessage: 'Unauthorized', searchQuery }
  }

  const { parishId, error: parishErr } = await fetchPrimaryParishId(supabase)
  if (parishErr) {
    return {
      households: [],
      errorMessage: userMessageForDashboardQueryError('parish directory', parishErr),
      searchQuery,
    }
  }

  let query = supabase.from('households').select('*').order('name', { ascending: true })

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
    }
  }

  const rows = (data ?? []).map((row) => parseHouseholdRow(row as Record<string, unknown>))
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

  return { households, errorMessage: '', searchQuery }
}
