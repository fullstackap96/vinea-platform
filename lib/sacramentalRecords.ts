import { normalizeSacramentalRecordType } from '@/lib/formatSacramentalRecordType'
import type {
  SacramentalRecordEventRow,
  SacramentalRecordRow,
  SacramentalRecordType,
  SacramentalRecordWriteInput,
} from '@/lib/types/sacramentalRecords'

function trimOrNull(value: unknown): string | null {
  const s = String(value ?? '').trim()
  return s.length > 0 ? s : null
}

function normalizeDateOnly(value: unknown): string | null {
  const s = String(value ?? '').trim()
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

export function parseSacramentalRecordRow(raw: Record<string, unknown>): SacramentalRecordRow {
  return {
    id: String(raw.id),
    parish_id: String(raw.parish_id),
    request_id: raw.request_id != null ? String(raw.request_id) : null,
    record_type: normalizeSacramentalRecordType(raw.record_type) as SacramentalRecordType,
    person_name: String(raw.person_name ?? '').trim(),
    sacrament_date:
      raw.sacrament_date != null ? String(raw.sacrament_date).slice(0, 10) : null,
    place: trimOrNull(raw.place),
    minister: trimOrNull(raw.minister),
    book: trimOrNull(raw.book),
    page: trimOrNull(raw.page),
    line: trimOrNull(raw.line),
    notes: trimOrNull(raw.notes),
    created_by: raw.created_by != null ? String(raw.created_by) : null,
    updated_by: raw.updated_by != null ? String(raw.updated_by) : null,
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  }
}

export function parseSacramentalRecordEventRow(
  raw: Record<string, unknown>
): SacramentalRecordEventRow {
  const metadataRaw = raw.metadata
  const metadata =
    metadataRaw != null && typeof metadataRaw === 'object' && !Array.isArray(metadataRaw)
      ? (metadataRaw as Record<string, unknown>)
      : {}

  return {
    id: String(raw.id),
    parish_id: String(raw.parish_id),
    sacramental_record_id: String(raw.sacramental_record_id),
    action: String(raw.action ?? ''),
    actor_id: raw.actor_id != null ? String(raw.actor_id) : null,
    actor_email: trimOrNull(raw.actor_email),
    metadata,
    created_at: String(raw.created_at ?? ''),
  }
}

export function normalizeSacramentalRecordWrite(input: SacramentalRecordWriteInput): {
  ok: true
  payload: {
    record_type: SacramentalRecordType
    person_name: string
    sacrament_date: string | null
    place: string | null
    minister: string | null
    book: string | null
    page: string | null
    line: string | null
    notes: string | null
  }
} | { ok: false; error: string } {
  const person_name = String(input.personName ?? '').trim()
  if (!person_name) {
    return { ok: false, error: 'Person name is required.' }
  }

  const record_type = normalizeSacramentalRecordType(input.recordType) as SacramentalRecordType
  if (!record_type) {
    return { ok: false, error: 'Please choose a record type.' }
  }

  return {
    ok: true,
    payload: {
      record_type,
      person_name,
      sacrament_date: normalizeDateOnly(input.sacramentDate),
      place: trimOrNull(input.place),
      minister: trimOrNull(input.minister),
      book: trimOrNull(input.book),
      page: trimOrNull(input.page),
      line: trimOrNull(input.line),
      notes: trimOrNull(input.notes),
    },
  }
}

export function formatSacramentDateDisplay(value: unknown): string {
  const s = String(value ?? '').trim()
  if (!s) return ''
  const iso = s.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    if (!Number.isNaN(dt.getTime())) {
      return dt.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
  }
  return s
}

/** Staff-friendly label for sacramental_record_events.action */
export function formatSacramentalRecordEventAction(action: unknown): string {
  const key = String(action ?? '').trim().toLowerCase()
  if (key === 'created') return 'Record created'
  if (key === 'updated') return 'Record updated'
  if (key === 'certificate_generated') return 'Certificate generated'
  if (!key) return 'Activity'
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
