export type DashboardWorkHubParishioner = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  parish_id: string | null
}

export type DashboardWorkHubFuneralDetail = {
  request_id: string
  deceased_name: string | null
  family_relationship: string | null
  date_of_death: string | null
  funeral_home_or_location: string | null
  funeral_director_contact: string | null
  service_location: string | null
  visitation_details: string | null
  cemetery_or_committal: string | null
  readings_music_notes: string | null
  obituary_program_notes: string | null
  post_funeral_follow_up_date: string | null
  preferred_service_notes: string | null
  confirmed_service_at: string | null
}

export type DashboardWorkHubWeddingDetail = {
  request_id: string
  partner_one_name: string | null
  partner_two_name: string | null
  proposed_wedding_date: string | null
  ceremony_notes: string | null
  confirmed_ceremony_at: string | null
}

export type DashboardWorkHubOciaDetail = {
  request_id: string
  date_of_birth: string | null
  age_or_dob_note: string | null
  sacramental_background: string | null
  seeking: string | null
  parishioner_status: string | null
  preferred_contact_method: string | null
  availability: string | null
  confirmed_session_at: string | null
}

export type DashboardWorkHubRequest = {
  id: string
  request_type: string
  status: string | null
  child_name: string | null
  preferred_dates: string | null
  notes: string | null
  reply_draft: string | null
  created_at: string | null
  parishioner_id: string | null
  person_id: string | null
  confirmed_baptism_date: string | null
  last_contacted_at: string | null
  assigned_staff_name: string | null
  assigned_priest_name: string | null
  assigned_deacon_name: string | null
  next_follow_up_date: string | null
  waiting_on: string | null
  waiting_on_changed_at: string | null
  parishioner: DashboardWorkHubParishioner | null
  checklist_incomplete: boolean
  checklist_incomplete_count: number
  funeral_detail: DashboardWorkHubFuneralDetail | null
  wedding_detail: DashboardWorkHubWeddingDetail | null
  ocia_detail: DashboardWorkHubOciaDetail | null
}

type UnknownRecord = Record<string, unknown>

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null
}

function requiredId(value: unknown): string | null {
  const id = typeof value === 'string' ? value.trim() : ''
  return id || null
}

function optionalText(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function parishionerDto(value: unknown): DashboardWorkHubParishioner | null {
  const row = asRecord(value)
  const id = requiredId(row?.id)
  if (!row || !id) return null
  return {
    id,
    full_name: optionalText(row.full_name),
    email: optionalText(row.email),
    phone: optionalText(row.phone),
    parish_id: optionalText(row.parish_id),
  }
}

function funeralDetailDto(value: unknown): DashboardWorkHubFuneralDetail | null {
  const row = asRecord(value)
  const requestId = requiredId(row?.request_id)
  if (!row || !requestId) return null
  return {
    request_id: requestId,
    deceased_name: optionalText(row.deceased_name),
    family_relationship: optionalText(row.family_relationship),
    date_of_death: optionalText(row.date_of_death),
    funeral_home_or_location: optionalText(row.funeral_home_or_location),
    funeral_director_contact: optionalText(row.funeral_director_contact),
    service_location: optionalText(row.service_location),
    visitation_details: optionalText(row.visitation_details),
    cemetery_or_committal: optionalText(row.cemetery_or_committal),
    readings_music_notes: optionalText(row.readings_music_notes),
    obituary_program_notes: optionalText(row.obituary_program_notes),
    post_funeral_follow_up_date: optionalText(row.post_funeral_follow_up_date),
    preferred_service_notes: optionalText(row.preferred_service_notes),
    confirmed_service_at: optionalText(row.confirmed_service_at),
  }
}

function weddingDetailDto(value: unknown): DashboardWorkHubWeddingDetail | null {
  const row = asRecord(value)
  const requestId = requiredId(row?.request_id)
  if (!row || !requestId) return null
  return {
    request_id: requestId,
    partner_one_name: optionalText(row.partner_one_name),
    partner_two_name: optionalText(row.partner_two_name),
    proposed_wedding_date: optionalText(row.proposed_wedding_date),
    ceremony_notes: optionalText(row.ceremony_notes),
    confirmed_ceremony_at: optionalText(row.confirmed_ceremony_at),
  }
}

function ociaDetailDto(value: unknown): DashboardWorkHubOciaDetail | null {
  const row = asRecord(value)
  const requestId = requiredId(row?.request_id)
  if (!row || !requestId) return null
  return {
    request_id: requestId,
    date_of_birth: optionalText(row.date_of_birth),
    age_or_dob_note: optionalText(row.age_or_dob_note),
    sacramental_background: optionalText(row.sacramental_background),
    seeking: optionalText(row.seeking),
    parishioner_status: optionalText(row.parishioner_status),
    preferred_contact_method: optionalText(row.preferred_contact_method),
    availability: optionalText(row.availability),
    confirmed_session_at: optionalText(row.confirmed_session_at),
  }
}

export function parseDashboardWorkHubRequest(value: unknown): DashboardWorkHubRequest | null {
  const row = asRecord(value)
  const id = requiredId(row?.id)
  if (!row || !id) return null

  return {
    id,
    request_type: optionalText(row.request_type)?.trim().toLowerCase() || 'baptism',
    status: optionalText(row.status),
    child_name: optionalText(row.child_name),
    preferred_dates: optionalText(row.preferred_dates),
    notes: optionalText(row.notes),
    reply_draft: optionalText(row.reply_draft),
    created_at: optionalText(row.created_at),
    parishioner_id: optionalText(row.parishioner_id),
    person_id: optionalText(row.person_id),
    confirmed_baptism_date: optionalText(row.confirmed_baptism_date),
    last_contacted_at: optionalText(row.last_contacted_at),
    assigned_staff_name: optionalText(row.assigned_staff_name),
    assigned_priest_name: optionalText(row.assigned_priest_name),
    assigned_deacon_name: optionalText(row.assigned_deacon_name),
    next_follow_up_date: optionalText(row.next_follow_up_date),
    waiting_on: optionalText(row.waiting_on),
    waiting_on_changed_at: optionalText(row.waiting_on_changed_at),
    parishioner: parishionerDto(row.parishioner),
    checklist_incomplete: row.checklist_incomplete === true,
    checklist_incomplete_count:
      typeof row.checklist_incomplete_count === 'number' &&
      Number.isFinite(row.checklist_incomplete_count)
        ? Math.max(0, Math.floor(row.checklist_incomplete_count))
        : 0,
    funeral_detail: funeralDetailDto(row.funeral_detail),
    wedding_detail: weddingDetailDto(row.wedding_detail),
    ocia_detail: ociaDetailDto(row.ocia_detail),
  }
}

export function parseDashboardWorkHubRequests(value: unknown): DashboardWorkHubRequest[] | null {
  if (!Array.isArray(value)) return null
  const requests = value.map(parseDashboardWorkHubRequest)
  return requests.every((request): request is DashboardWorkHubRequest => request !== null)
    ? requests
    : null
}
