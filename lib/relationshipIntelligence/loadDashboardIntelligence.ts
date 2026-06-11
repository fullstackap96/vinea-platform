import type { SupabaseClient } from '@supabase/supabase-js'
import { parsePersonRow } from '@/lib/people'
import { buildDashboardSuggestedActions } from './buildDashboardSuggestedActions'
import { buildHouseholdNamesByPersonId, type HouseholdMembershipRow } from './suggestHouseholdsForPeople'
import { recordIdsWithCertificateEvent } from './suggestCertificateForRecord'
import type { DashboardSuggestedAction, ParishionerContact, PersonCandidate } from './types'

export async function loadDashboardSuggestedActions(
  supabase: SupabaseClient,
  requests: readonly unknown[]
): Promise<DashboardSuggestedAction[]> {
  if (!requests.length) return []

  const parishionerIds = [
    ...new Set(
      requests
        .map((raw) => {
          const r = raw as { parishioner_id?: unknown }
          return r.parishioner_id != null ? String(r.parishioner_id).trim() : ''
        })
        .filter(Boolean)
    ),
  ]

  const requestIds = requests
    .map((raw) => String((raw as { id?: unknown }).id ?? '').trim())
    .filter(Boolean)

  const [
    { data: parishionerRows },
    { data: peopleRows },
    { data: recordsByRequest },
    { data: baptismRows },
    { data: memberRows },
    { data: certEvents },
  ] = await Promise.all([
    parishionerIds.length > 0
      ? supabase
          .from('parishioners')
          .select('id, full_name, email, phone')
          .in('id', parishionerIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    supabase
      .from('people')
      .select('id, parishioner_id, first_name, middle_name, last_name, email, phone'),
    requestIds.length > 0
      ? supabase
          .from('sacramental_records')
          .select('id, request_id, record_type, person_name')
          .in('request_id', requestIds)
      : Promise.resolve({ data: [] as Record<string, unknown>[] }),
    supabase
      .from('sacramental_records')
      .select('id, record_type, person_name')
      .eq('record_type', 'baptism'),
    supabase.from('household_members').select('person_id, household_id, households(name)'),
    supabase
      .from('sacramental_record_events')
      .select('sacramental_record_id, action')
      .eq('action', 'certificate_generated'),
  ])

  const parishionersById = new Map<string, ParishionerContact>()
  for (const raw of parishionerRows ?? []) {
    const row = raw as Record<string, unknown>
    const id = String(row.id ?? '').trim()
    if (!id) continue
    parishionersById.set(id, {
      id,
      full_name: String(row.full_name ?? '').trim(),
      email: String(row.email ?? '').trim() || null,
      phone: String(row.phone ?? '').trim() || null,
    })
  }

  const people: PersonCandidate[] = (peopleRows ?? []).map((row) => {
    const parsed = parsePersonRow(row as Record<string, unknown>)
    return {
      id: parsed.id,
      parishioner_id: parsed.parishioner_id,
      first_name: parsed.first_name,
      middle_name: parsed.middle_name,
      last_name: parsed.last_name,
      email: parsed.email,
      phone: parsed.phone,
    }
  })

  const householdRows: HouseholdMembershipRow[] = []
  for (const raw of memberRows ?? []) {
    const row = raw as Record<string, unknown>
    const householdsRaw = row.households
    const householdName =
      householdsRaw != null &&
      typeof householdsRaw === 'object' &&
      !Array.isArray(householdsRaw)
        ? String((householdsRaw as Record<string, unknown>).name ?? '').trim()
        : ''
    householdRows.push({
      person_id: String(row.person_id ?? ''),
      household_id: String(row.household_id ?? ''),
      household_name: householdName,
    })
  }

  const requestIdsWithRecords = new Set<string>()
  const recordsForDashboard: { id: string; record_type: unknown; person_name: unknown }[] = []

  for (const raw of recordsByRequest ?? []) {
    const row = raw as Record<string, unknown>
    const requestId = row.request_id != null ? String(row.request_id).trim() : ''
    if (requestId) requestIdsWithRecords.add(requestId)
  }

  for (const raw of baptismRows ?? []) {
    const row = raw as Record<string, unknown>
    const id = String(row.id ?? '').trim()
    if (!id) continue
    recordsForDashboard.push({
      id,
      record_type: row.record_type,
      person_name: row.person_name,
    })
  }

  const recordIdsWithCertificate = recordIdsWithCertificateEvent(
    (certEvents ?? []).map((e) => ({
      sacramental_record_id: String((e as { sacramental_record_id?: unknown }).sacramental_record_id ?? ''),
      action: String((e as { action?: unknown }).action ?? ''),
    }))
  )

  return buildDashboardSuggestedActions({
    requests,
    parishionersById,
    people,
    householdNamesByPersonId: buildHouseholdNamesByPersonId(householdRows),
    requestIdsWithRecords,
    records: recordsForDashboard,
    recordIdsWithCertificate,
  })
}
