import 'server-only'

import { cookies } from 'next/headers'

import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import { sanitizePeopleSearchQuery } from '@/lib/people'
import {
  ACTIVE_STAFF_PARISH_COOKIE,
  resolveActiveStaffParishContext,
} from '@/lib/server/activeStaffParishContext'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PersonListItem } from '@/lib/types/people'

export type PeopleListResult = {
  people: PersonListItem[]
  errorMessage: string
  searchQuery: string
  activeParishName: string | null
}

export const PEOPLE_LIST_SELECT =
  'id, first_name, middle_name, last_name, email, phone' as const

function nullableString(value: unknown): string | null {
  const normalized = String(value ?? '').trim()
  return normalized ? normalized : null
}

function parsePersonListItem(raw: Record<string, unknown>): PersonListItem {
  return {
    id: String(raw.id ?? ''),
    first_name: String(raw.first_name ?? '').trim(),
    middle_name: nullableString(raw.middle_name),
    last_name: String(raw.last_name ?? '').trim(),
    email: nullableString(raw.email),
    phone: nullableString(raw.phone),
    primaryHouseholdName: null,
    primaryHouseholdRelationship: null,
  }
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
    return { people: [], errorMessage: 'Unauthorized', searchQuery, activeParishName: null }
  }

  const cookieStore = await cookies()
  const requestedParishId = cookieStore.get(ACTIVE_STAFF_PARISH_COOKIE)?.value ?? null
  const parishContext = await resolveActiveStaffParishContext(supabase, { requestedParishId })
  if (!parishContext.ok) {
    return {
      people: [],
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
    .from('people')
    .select(PEOPLE_LIST_SELECT)
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
      activeParishName,
    }
  }

  const rows = (data ?? []).map((row) => parsePersonListItem(row as Record<string, unknown>))
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

  return { people, errorMessage: '', searchQuery, activeParishName }
}
