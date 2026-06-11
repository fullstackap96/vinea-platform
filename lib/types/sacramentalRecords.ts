/** Values of `public.sacramental_record_type` enum. */
export type SacramentalRecordType =
  | 'baptism'
  | 'marriage'
  | 'funeral'
  | 'confirmation'
  | 'first_communion'
  | 'ocia'
  | 'rcic'

export type SacramentalRecordRow = {
  id: string
  parish_id: string
  request_id: string | null
  person_id: string | null
  record_type: SacramentalRecordType
  person_name: string
  sacrament_date: string | null
  place: string | null
  minister: string | null
  book: string | null
  page: string | null
  line: string | null
  notes: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type SacramentalRecordEventRow = {
  id: string
  parish_id: string
  sacramental_record_id: string
  action: string
  actor_id: string | null
  actor_email: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type SacramentalRecordWriteInput = {
  recordType: unknown
  personName: unknown
  sacramentDate: unknown
  place: unknown
  minister: unknown
  book: unknown
  page: unknown
  line: unknown
  notes: unknown
}
