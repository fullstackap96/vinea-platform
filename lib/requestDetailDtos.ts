import { requestTypeFromRow } from '@/lib/requestTypeFromRow'

type JsonRecord = Record<string, unknown>

export type RequestDetailRequestDto = {
  id: string
  parish_id: string
  request_type: string
  created_at: string | null
  updated_at: string | null
  status: string | null
  notes: string | null
  child_name: string | null
  preferred_dates: string | null
  parishioner_id: string | null
  person_id: string | null
  ai_summary: string | null
  reply_draft: string | null
  staff_notes: string | null
  suggested_date_1: string | null
  suggested_date_2: string | null
  suggested_date_3: string | null
  confirmed_baptism_date: string | null
  assigned_staff_name: string | null
  assigned_priest_name: string | null
  assigned_deacon_name: string | null
  last_contacted_at: string | null
  last_contact_method: string | null
  communication_notes: string | null
  next_follow_up_date: string | null
  waiting_on: string | null
  waiting_on_changed_at: string | null
  google_calendar_event_id: string | null
  google_calendar_event_html_link: string | null
}

export type RequestDetailParishionerDto = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  parish_id: string
}

export type RequestChecklistItemDto = {
  id: string
  item_name: string
  is_complete: boolean
  created_at: string | null
}

export type RequestCommunicationDto = {
  id: string
  contacted_at: string
  method: string
  notes: string | null
  created_at: string | null
}

export type RequestFuneralDetailDto = JsonRecord & {
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

export type RequestWeddingDetailDto = JsonRecord & {
  request_id: string
  partner_one_name: string | null
  partner_two_name: string | null
  proposed_wedding_date: string | null
  ceremony_notes: string | null
  confirmed_ceremony_at: string | null
}

export type RequestOciaDetailDto = JsonRecord & {
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

export type RequestJoinParishDetailDto = JsonRecord & {
  request_id: string
  moving_into_parish: string | null
  address: string | null
  household_members: string | null
  baptized: string | null
  confirmed: string | null
  first_communion: string | null
  already_catholic: string | null
  interested_in_ocia: string | null
  reason: string | null
  notes: string | null
}

export type RequestLinkedSacramentalRecordDto = {
  id: string
  person_name: string | null
  created_at: string
}

export type RequestDetailAccessDto = {
  requestId: string
  parishId: string
  request: RequestDetailRequestDto
  parishioner: RequestDetailParishionerDto | null
}

export type RequestTypeSupportDto = {
  funeralDetail: RequestFuneralDetailDto | null
  weddingDetail: RequestWeddingDetailDto | null
  ociaDetail: RequestOciaDetailDto | null
  joinParishDetail: RequestJoinParishDetailDto | null
  linkedSacramentalRecord: RequestLinkedSacramentalRecordDto | null
}

function record(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : null
}

function text(value: unknown): string | null | undefined {
  if (value == null) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return undefined
}

function requiredText(value: unknown): string | null {
  const parsed = text(value)?.trim() ?? ''
  return parsed || null
}

function textFields(row: JsonRecord, fields: readonly string[]): JsonRecord | null {
  const entries: Array<[string, string | null]> = []
  for (const field of fields) {
    const value = text(row[field])
    if (value === undefined) return null
    entries.push([field, value])
  }
  return Object.fromEntries(entries)
}

const REQUEST_TEXT_FIELDS = [
  'created_at',
  'updated_at',
  'status',
  'notes',
  'child_name',
  'preferred_dates',
  'parishioner_id',
  'person_id',
  'ai_summary',
  'reply_draft',
  'staff_notes',
  'suggested_date_1',
  'suggested_date_2',
  'suggested_date_3',
  'confirmed_baptism_date',
  'assigned_staff_name',
  'assigned_priest_name',
  'assigned_deacon_name',
  'last_contacted_at',
  'last_contact_method',
  'communication_notes',
  'next_follow_up_date',
  'waiting_on',
  'waiting_on_changed_at',
  'google_calendar_event_id',
  'google_calendar_event_html_link',
] as const

export function parseRequestDetailRequest(value: unknown): RequestDetailRequestDto | null {
  const row = record(value)
  if (!row) return null
  const id = requiredText(row.id)
  const parishId = requiredText(row.parish_id)
  const fields = textFields(row, REQUEST_TEXT_FIELDS)
  if (!id || !parishId || !fields) return null

  return {
    id,
    parish_id: parishId,
    request_type: requestTypeFromRow({ request_type: row.request_type }),
    ...fields,
  } as RequestDetailRequestDto
}

export function parseRequestDetailParishioner(
  value: unknown,
): RequestDetailParishionerDto | null {
  const row = record(value)
  if (!row) return null
  const id = requiredText(row.id)
  const parishId = requiredText(row.parish_id)
  const fullName = text(row.full_name)
  const email = text(row.email)
  const phone = text(row.phone)
  if (!id || !parishId || fullName === undefined || email === undefined || phone === undefined) {
    return null
  }
  return {
    id,
    parish_id: parishId,
    full_name: fullName,
    email,
    phone,
  }
}

export function parseRequestDetailAccess(value: unknown): RequestDetailAccessDto | null {
  const payload = record(value)
  if (!payload || payload.ok !== true) return null
  const requestId = requiredText(payload.requestId)
  const parishId = requiredText(payload.parishId)
  const request = parseRequestDetailRequest(payload.request)
  const parishioner = payload.parishioner == null
    ? null
    : parseRequestDetailParishioner(payload.parishioner)
  if (!requestId || !parishId || !request || (payload.parishioner != null && !parishioner)) {
    return null
  }
  if (request.id !== requestId || request.parish_id !== parishId) return null
  if (parishioner && parishioner.parish_id !== parishId) return null
  return { requestId, parishId, request, parishioner }
}

export function parseRequestChecklistItems(value: unknown): RequestChecklistItemDto[] | null {
  if (!Array.isArray(value)) return null
  const rows: RequestChecklistItemDto[] = []
  for (const valueRow of value) {
    const row = record(valueRow)
    const id = requiredText(row?.id)
    const itemName = requiredText(row?.item_name)
    if (!row || !id || !itemName || typeof row.is_complete !== 'boolean') return null
    const createdAt = text(row.created_at)
    if (createdAt === undefined) return null
    rows.push({
      id,
      item_name: itemName,
      is_complete: row.is_complete,
      created_at: createdAt,
    })
  }
  return rows
}

export function parseRequestCommunications(value: unknown): RequestCommunicationDto[] | null {
  if (!Array.isArray(value)) return null
  const rows: RequestCommunicationDto[] = []
  for (const valueRow of value) {
    const row = record(valueRow)
    const id = requiredText(row?.id)
    const contactedAt = requiredText(row?.contacted_at)
    const method = requiredText(row?.method)
    if (!row || !id || !contactedAt || !method) return null
    const notes = text(row.notes)
    const createdAt = text(row.created_at)
    if (notes === undefined || createdAt === undefined) return null
    rows.push({
      id,
      contacted_at: contactedAt,
      method,
      notes,
      created_at: createdAt,
    })
  }
  return rows
}

function parseDetail<T extends JsonRecord>(
  value: unknown,
  fields: readonly string[],
): T | null {
  const row = record(value)
  if (!row) return null
  const requestId = requiredText(row.request_id)
  const parsedFields = textFields(row, fields)
  if (!requestId || !parsedFields) return null
  return { request_id: requestId, ...parsedFields } as unknown as T
}

export function parseRequestTypeSupport(value: unknown): RequestTypeSupportDto | null {
  const payload = record(value)
  if (!payload || payload.ok !== true) return null

  const funeralDetail = payload.funeralDetail == null
    ? null
    : parseDetail<RequestFuneralDetailDto>(payload.funeralDetail, [
        'deceased_name', 'family_relationship', 'date_of_death',
        'funeral_home_or_location', 'funeral_director_contact', 'service_location',
        'visitation_details', 'cemetery_or_committal', 'readings_music_notes',
        'obituary_program_notes', 'post_funeral_follow_up_date',
        'preferred_service_notes', 'confirmed_service_at',
      ])
  const weddingDetail = payload.weddingDetail == null
    ? null
    : parseDetail<RequestWeddingDetailDto>(payload.weddingDetail, [
        'partner_one_name', 'partner_two_name', 'proposed_wedding_date',
        'ceremony_notes', 'confirmed_ceremony_at',
      ])
  const ociaDetail = payload.ociaDetail == null
    ? null
    : parseDetail<RequestOciaDetailDto>(payload.ociaDetail, [
        'date_of_birth', 'age_or_dob_note', 'sacramental_background', 'seeking',
        'parishioner_status', 'preferred_contact_method', 'availability',
        'confirmed_session_at',
      ])
  const joinParishDetail = payload.joinParishDetail == null
    ? null
    : parseDetail<RequestJoinParishDetailDto>(payload.joinParishDetail, [
        'moving_into_parish', 'address', 'household_members', 'baptized',
        'confirmed', 'first_communion', 'already_catholic', 'interested_in_ocia',
        'reason', 'notes',
      ])

  if (
    (payload.funeralDetail != null && !funeralDetail) ||
    (payload.weddingDetail != null && !weddingDetail) ||
    (payload.ociaDetail != null && !ociaDetail) ||
    (payload.joinParishDetail != null && !joinParishDetail)
  ) return null

  let linkedSacramentalRecord: RequestLinkedSacramentalRecordDto | null = null
  if (payload.linkedSacramentalRecord != null) {
    const row = record(payload.linkedSacramentalRecord)
    const id = requiredText(row?.id)
    const createdAt = requiredText(row?.created_at)
    const personName = text(row?.person_name)
    if (!row || !id || !createdAt || personName === undefined) return null
    linkedSacramentalRecord = {
      id,
      person_name: personName,
      created_at: createdAt,
    }
  }

  return {
    funeralDetail,
    weddingDetail,
    ociaDetail,
    joinParishDetail,
    linkedSacramentalRecord,
  }
}
