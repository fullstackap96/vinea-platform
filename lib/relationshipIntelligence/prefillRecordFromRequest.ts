import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import type { SacramentalRecordFormValues } from '@/app/dashboard/records/_components/SacramentalRecordForm'
import { requestTypeToRecordType } from './requestTypeToRecordType'

function isoToDateInput(value: unknown): string {
  const s = String(value ?? '').trim()
  if (!s) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export type RequestPrefillSource = {
  id: string
  request_type: unknown
  status: unknown
  child_name?: unknown
  confirmed_baptism_date?: unknown
  notes?: unknown
  person_id?: unknown
  assigned_priest_name?: unknown
  parishioner?: { full_name?: unknown } | null
  funeralDetail?: {
    deceased_name?: unknown
    confirmed_service_at?: unknown
  } | null
  weddingDetail?: {
    partner_one_name?: unknown
    partner_two_name?: unknown
    confirmed_ceremony_at?: unknown
  } | null
  ociaDetail?: {
    confirmed_session_at?: unknown
  } | null
}

export function prefillRecordFormFromRequest(
  source: RequestPrefillSource
): SacramentalRecordFormValues | null {
  const requestType = requestTypeFromRow({ request_type: source.request_type })
  const recordType = requestTypeToRecordType(requestType)
  if (!recordType) return null

  if (String(source.status ?? '').trim() !== 'complete') return null

  const personName = getRequestDetailPrimaryHeading({
    request_type: source.request_type,
    child_name: source.child_name,
    parishioner: source.parishioner,
    funeralDetail: source.funeralDetail,
    weddingDetail: source.weddingDetail,
  })

  let sacramentDate = ''
  if (requestType === 'baptism') {
    sacramentDate = isoToDateInput(source.confirmed_baptism_date)
  } else if (requestType === 'funeral') {
    sacramentDate = isoToDateInput(source.funeralDetail?.confirmed_service_at)
  } else if (requestType === 'wedding') {
    sacramentDate = isoToDateInput(source.weddingDetail?.confirmed_ceremony_at)
  } else if (requestType === 'ocia') {
    sacramentDate = isoToDateInput(source.ociaDetail?.confirmed_session_at)
  }

  const minister = String(source.assigned_priest_name ?? '').trim()
  const notes = String(source.notes ?? '').trim()

  return {
    recordType,
    personName,
    sacramentDate,
    place: '',
    minister,
    book: '',
    page: '',
    line: '',
    notes,
  }
}

export function requestPersonIdFromSource(source: RequestPrefillSource): string | null {
  const id = source.person_id != null ? String(source.person_id).trim() : ''
  return id || null
}

export function requestIdFromSource(source: RequestPrefillSource): string {
  return String(source.id).trim()
}
