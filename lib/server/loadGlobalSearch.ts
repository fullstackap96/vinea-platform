import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchPrimaryParishId } from '@/lib/dashboardParishRequestScope'
import { userMessageForDashboardQueryError } from '@/lib/dashboardSupabaseError'
import {
  GLOBAL_SEARCH_MAX_PER_CATEGORY,
  GLOBAL_SEARCH_MAX_TOTAL,
} from '@/lib/globalSearch/constants'
import {
  sanitizeGlobalSearchQuery,
  toIlikePattern,
} from '@/lib/globalSearch/sanitizeGlobalSearchQuery'
import type {
  GlobalSearchLoadResult,
  GlobalSearchRawData,
  GlobalSearchRawHousehold,
  GlobalSearchRawPerson,
  GlobalSearchRawRecord,
  GlobalSearchRawRequest,
} from '@/lib/globalSearch/types'
import { parseHouseholdRow } from '@/lib/households'
import { parsePersonRow } from '@/lib/people'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import { parseSacramentalRecordRow } from '@/lib/sacramentalRecords'

function emptyRaw(): GlobalSearchRawData {
  return { requests: [], people: [], households: [], records: [] }
}

async function searchPeople(
  supabase: SupabaseClient,
  pattern: string,
  parishId: string | null
): Promise<GlobalSearchRawPerson[]> {
  let query = supabase
    .from('people')
    .select('id, first_name, middle_name, last_name, email, phone')
    .or(
      [
        `first_name.ilike.${pattern}`,
        `last_name.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `phone.ilike.${pattern}`,
      ].join(',')
    )
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .limit(GLOBAL_SEARCH_MAX_PER_CATEGORY)

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  const { data, error } = await query
  if (error || !data?.length) return []

  const rows = data.map((row) => parsePersonRow(row as Record<string, unknown>))
  const personIds = rows.map((row) => row.id)
  const primaryHouseholdByPersonId = new Map<string, string>()

  if (personIds.length > 0) {
    const { data: memberRows } = await supabase
      .from('household_members')
      .select('person_id, households(name)')
      .in('person_id', personIds)
      .eq('is_primary_contact', true)

    for (const raw of memberRows ?? []) {
      const row = raw as Record<string, unknown>
      const personId = String(row.person_id ?? '')
      if (!personId || primaryHouseholdByPersonId.has(personId)) continue

      const householdsRaw = row.households
      const householdName =
        householdsRaw != null &&
        typeof householdsRaw === 'object' &&
        !Array.isArray(householdsRaw)
          ? String((householdsRaw as Record<string, unknown>).name ?? '').trim()
          : ''

      if (householdName) {
        primaryHouseholdByPersonId.set(personId, householdName)
      }
    }
  }

  return rows.map((row) => ({
    id: row.id,
    first_name: row.first_name,
    middle_name: row.middle_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    primaryHouseholdName: primaryHouseholdByPersonId.get(row.id) ?? null,
  }))
}

async function searchHouseholds(
  supabase: SupabaseClient,
  pattern: string,
  parishId: string | null
): Promise<GlobalSearchRawHousehold[]> {
  let query = supabase
    .from('households')
    .select('id, parish_id, name, address, city, state, postal_code, created_at, updated_at')
    .or([`name.ilike.${pattern}`, `address.ilike.${pattern}`, `city.ilike.${pattern}`].join(','))
    .order('name', { ascending: true })
    .limit(GLOBAL_SEARCH_MAX_PER_CATEGORY)

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  const { data, error } = await query
  if (error || !data?.length) return []

  const rows = data.map((row) => parseHouseholdRow(row as Record<string, unknown>))
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
      memberCountByHouseholdId.set(
        householdId,
        (memberCountByHouseholdId.get(householdId) ?? 0) + 1
      )
    }
  }

  return rows.map(
    (row): GlobalSearchRawHousehold => ({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      postal_code: row.postal_code,
      memberCount: memberCountByHouseholdId.get(row.id) ?? 0,
    })
  )
}

async function searchRecords(
  supabase: SupabaseClient,
  pattern: string,
  parishId: string | null
): Promise<GlobalSearchRawRecord[]> {
  let query = supabase
    .from('sacramental_records')
    .select('id, record_type, person_name, sacrament_date')
    .ilike('person_name', pattern)
    .order('sacrament_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(GLOBAL_SEARCH_MAX_PER_CATEGORY)

  if (parishId) {
    query = query.eq('parish_id', parishId)
  }

  const { data, error } = await query
  if (error || !data?.length) return []

  return data.map((row) => {
    const parsed = parseSacramentalRecordRow(row as Record<string, unknown>)
    return {
      id: parsed.id,
      record_type: parsed.record_type,
      person_name: parsed.person_name,
      sacrament_date: parsed.sacrament_date,
    }
  })
}

async function searchRequests(
  supabase: SupabaseClient,
  pattern: string
): Promise<GlobalSearchRawRequest[]> {
  const requestIdSet = new Set<string>()

  const [childNameRes, parishionerRes, funeralRes, weddingRes] = await Promise.all([
    supabase
      .from('requests')
      .select('id')
      .ilike('child_name', pattern)
      .order('created_at', { ascending: false })
      .limit(GLOBAL_SEARCH_MAX_PER_CATEGORY),
    supabase
      .from('parishioners')
      .select('id')
      .or(`full_name.ilike.${pattern},email.ilike.${pattern}`)
      .limit(15),
    supabase
      .from('funeral_request_details')
      .select('request_id')
      .ilike('deceased_name', pattern)
      .limit(GLOBAL_SEARCH_MAX_PER_CATEGORY),
    supabase
      .from('wedding_request_details')
      .select('request_id')
      .or(`partner_one_name.ilike.${pattern},partner_two_name.ilike.${pattern}`)
      .limit(GLOBAL_SEARCH_MAX_PER_CATEGORY),
  ])

  for (const row of childNameRes.data ?? []) {
    requestIdSet.add(String((row as { id: unknown }).id))
  }

  const parishionerIds = (parishionerRes.data ?? [])
    .map((row) => String((row as { id: unknown }).id))
    .filter(Boolean)

  if (parishionerIds.length > 0) {
    const { data: byParishioner } = await supabase
      .from('requests')
      .select('id')
      .in('parishioner_id', parishionerIds)
      .order('created_at', { ascending: false })
      .limit(GLOBAL_SEARCH_MAX_PER_CATEGORY)

    for (const row of byParishioner ?? []) {
      requestIdSet.add(String((row as { id: unknown }).id))
    }
  }

  for (const row of funeralRes.data ?? []) {
    requestIdSet.add(String((row as { request_id: unknown }).request_id))
  }

  for (const row of weddingRes.data ?? []) {
    requestIdSet.add(String((row as { request_id: unknown }).request_id))
  }

  const ids = [...requestIdSet].filter(Boolean)
  if (ids.length === 0) return []

  const { data: requestsData, error: requestsError } = await supabase
    .from('requests')
    .select('id, request_type, status, child_name, created_at, parishioner_id')
    .in('id', ids)
    .order('created_at', { ascending: false })
    .limit(GLOBAL_SEARCH_MAX_PER_CATEGORY)

  if (requestsError || !requestsData?.length) return []

  const requestRows = requestsData.map((row) => ({
    ...row,
    request_type: requestTypeFromRow(row as { request_type?: unknown }),
  }))

  const parishionerIdsForRequests = requestRows
    .map((row) => row.parishioner_id)
    .filter(Boolean)
    .map(String)

  const parishionerById = new Map<string, { full_name: string | null; email: string | null }>()

  if (parishionerIdsForRequests.length > 0) {
    const { data: parishionersData } = await supabase
      .from('parishioners')
      .select('id, full_name, email')
      .in('id', parishionerIdsForRequests)

    for (const row of parishionersData ?? []) {
      const id = String((row as { id: unknown }).id)
      parishionerById.set(id, {
        full_name: (row as { full_name?: string | null }).full_name ?? null,
        email: (row as { email?: string | null }).email ?? null,
      })
    }
  }

  const funeralIds = requestRows
    .filter((row) => row.request_type === 'funeral')
    .map((row) => String(row.id))
  const weddingIds = requestRows
    .filter((row) => row.request_type === 'wedding')
    .map((row) => String(row.id))

  const funeralByRequestId = new Map<string, { deceased_name?: string | null }>()
  const weddingByRequestId = new Map<
    string,
    { partner_one_name?: string | null; partner_two_name?: string | null }
  >()

  if (funeralIds.length > 0) {
    const { data: funeralDetails } = await supabase
      .from('funeral_request_details')
      .select('request_id, deceased_name')
      .in('request_id', funeralIds)

    for (const row of funeralDetails ?? []) {
      funeralByRequestId.set(String((row as { request_id: unknown }).request_id), {
        deceased_name: (row as { deceased_name?: string | null }).deceased_name ?? null,
      })
    }
  }

  if (weddingIds.length > 0) {
    const { data: weddingDetails } = await supabase
      .from('wedding_request_details')
      .select('request_id, partner_one_name, partner_two_name')
      .in('request_id', weddingIds)

    for (const row of weddingDetails ?? []) {
      weddingByRequestId.set(String((row as { request_id: unknown }).request_id), {
        partner_one_name: (row as { partner_one_name?: string | null }).partner_one_name ?? null,
        partner_two_name: (row as { partner_two_name?: string | null }).partner_two_name ?? null,
      })
    }
  }

  return requestRows.map((row): GlobalSearchRawRequest => {
    const id = String(row.id)
    const parishionerId = row.parishioner_id != null ? String(row.parishioner_id) : ''
    return {
      id,
      request_type: String(row.request_type ?? ''),
      status: row.status != null ? String(row.status) : null,
      child_name: row.child_name != null ? String(row.child_name) : null,
      created_at: String(row.created_at ?? ''),
      parishioner: parishionerId ? parishionerById.get(parishionerId) ?? null : null,
      funeral_detail: row.request_type === 'funeral' ? funeralByRequestId.get(id) ?? null : null,
      wedding_detail: row.request_type === 'wedding' ? weddingByRequestId.get(id) ?? null : null,
    }
  })
}

function capTotalResults(raw: GlobalSearchRawData): GlobalSearchRawData {
  let remaining = GLOBAL_SEARCH_MAX_TOTAL
  const nextSlice = <T,>(items: T[]): T[] => {
    const slice = items.slice(0, Math.min(items.length, remaining))
    remaining -= slice.length
    return slice
  }

  const requests = nextSlice(raw.requests)
  const people = nextSlice(raw.people)
  const households = nextSlice(raw.households)
  const records = nextSlice(raw.records)

  return { requests, people, households, records }
}

export async function loadGlobalSearch(
  supabase: SupabaseClient,
  rawQuery: string
): Promise<GlobalSearchLoadResult> {
  const query = String(rawQuery ?? '').trim()
  const sanitizedQuery = sanitizeGlobalSearchQuery(query)

  if (!sanitizedQuery) {
    return {
      query,
      sanitizedQuery: null,
      raw: emptyRaw(),
      errorMessage: '',
      totalCount: 0,
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      query,
      sanitizedQuery,
      raw: emptyRaw(),
      errorMessage: 'Unauthorized',
      totalCount: 0,
    }
  }

  const { parishId, error: parishErr } = await fetchPrimaryParishId(supabase)
  if (parishErr) {
    return {
      query,
      sanitizedQuery,
      raw: emptyRaw(),
      errorMessage: userMessageForDashboardQueryError('parish directory', parishErr),
      totalCount: 0,
    }
  }

  const pattern = toIlikePattern(sanitizedQuery)

  const [requests, people, households, records] = await Promise.all([
    searchRequests(supabase, pattern),
    searchPeople(supabase, pattern, parishId),
    searchHouseholds(supabase, pattern, parishId),
    searchRecords(supabase, pattern, parishId),
  ])

  const raw = capTotalResults({ requests, people, households, records })
  const totalCount =
    raw.requests.length + raw.people.length + raw.households.length + raw.records.length

  return {
    query,
    sanitizedQuery,
    raw,
    errorMessage: '',
    totalCount,
  }
}
