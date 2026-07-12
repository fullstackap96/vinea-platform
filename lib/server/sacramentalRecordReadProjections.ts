import 'server-only'

import type { SacramentalRecordRow, SacramentalRecordType } from '@/lib/types/sacramentalRecords'

export const SACRAMENTAL_RECORD_DETAIL_SELECT =
  'id, parish_id, request_id, person_id, record_type, person_name, sacrament_date, place, minister, book, page, line, notes, created_by, updated_by, created_at, updated_at' as const

export const SACRAMENTAL_RECORD_SUMMARY_SELECT =
  'id, record_type, person_name, sacrament_date, created_at' as const

export type SacramentalRecordSummary = Pick<
  SacramentalRecordRow,
  'id' | 'record_type' | 'person_name' | 'sacrament_date' | 'created_at'
>

export function parseSacramentalRecordSummary(
  raw: Record<string, unknown>
): SacramentalRecordSummary {
  return {
    id: String(raw.id ?? ''),
    record_type: String(raw.record_type ?? '') as SacramentalRecordType,
    person_name: String(raw.person_name ?? '').trim(),
    sacrament_date:
      raw.sacrament_date != null ? String(raw.sacrament_date).slice(0, 10) : null,
    created_at: String(raw.created_at ?? ''),
  }
}
