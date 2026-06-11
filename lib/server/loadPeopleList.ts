import 'server-only'

import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { parsePersonRow, sanitizePeopleSearchQuery } from '@/lib/people'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PersonListItem } from '@/lib/types/people'

export type PeopleListResult = {
  people: PersonListItem[]
  errorMessage: string
  searchQuery: string
}

function parseListSearchParams(input: {
  q?: string | string[] | undefined
}): { searchQuery: string } {
  const searchQuery = String(Array.isArray(input.q) ? input.q[0] : input.q ?? '').trim()
  return { searchQuery }
}

export async function loadPeopleList(searchParams: {
  q?: string | string[]
}): Promise<PeopleListResult> {
  const { searchQuery } = parseListSearchParams(searchParams)

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { people: [], errorMessage: 'Unauthorized', searchQuery }
  }

  const { parishId, error: parishErr } = await fetchPrimaryParishId(supabase)
  if (parishErr) {
    return {
      people: [],
      errorMessage: userMessageForDashboardQueryError('parish directory', parishErr),
      searchQuery,
    }
  }

  let query = supabase
    .from('people')
    .select('*')
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  const sanitized = sanitizePeopleSearchQuery(searchQuery)
  if (sanitized) {
    const pattern = `%${sanitized}%`
    query = query.or(
      [
        `first_name.ilike.${pattern}`,
        `last_name.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `phone.ilike.${pattern}`,
      ].join(',')
    )
  }

  const { data, error } = await query

  if (error) {
    return {
      people: [],
      errorMessage: userMessageForDashboardQueryError('people', error),
      searchQuery,
    }
  }

  const rows = (data ?? []).map((row) => parsePersonRow(row as Record<string, unknown>))
  const personIds = rows.map((row) => row.id)

  const primaryByPersonId = new Map<
    string,
    { householdName: string; relationship: string }
  >()

  if (personIds.length > 0) {
    const { data: memberRows } = await supabase
      .from('household_members')
      .select('person_id, relationship, is_primary_contact, households(name)')
      .in('person_id', personIds)
      .eq('is_primary_contact', true)

    for (const raw of memberRows ?? []) {
      const row = raw as Record<string, unknown>
      const personId = String(row.person_id ?? '')
      if (!personId || primaryByPersonId.has(personId)) continue

      const householdsRaw = row.households
      const householdName =
        householdsRaw != null &&
        typeof householdsRaw === 'object' &&
        !Array.isArray(householdsRaw)
          ? String((householdsRaw as Record<string, unknown>).name ?? '').trim()
          : ''

      if (!householdName) continue

      primaryByPersonId.set(personId, {
        householdName,
        relationship: String(row.relationship ?? '').trim(),
      })
    }
  }

  const people: PersonListItem[] = rows.map((row) => {
    const primary = primaryByPersonId.get(row.id)
    return {
      ...row,
      primaryHouseholdName: primary?.householdName ?? null,
      primaryHouseholdRelationship: primary?.relationship ?? null,
    }
  })

  return { people, errorMessage: '', searchQuery }
}
