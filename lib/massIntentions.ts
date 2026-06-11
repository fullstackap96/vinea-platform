import type {
  MassIntentionFulfilledFilter,
  MassIntentionRow,
  MassIntentionWriteInput,
} from '@/lib/types/massIntentions'

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

export function parseMassIntentionFulfilledFilter(value: unknown): MassIntentionFulfilledFilter {
  const s = String(value ?? '').trim().toLowerCase()
  if (s === 'all' || s === 'fulfilled') return s
  return 'unfulfilled'
}

export function parseMassIntentionRow(raw: Record<string, unknown>): MassIntentionRow {
  return {
    id: String(raw.id),
    parish_id: String(raw.parish_id),
    requester_name: String(raw.requester_name ?? '').trim(),
    intention_text: String(raw.intention_text ?? '').trim(),
    requested_date:
      raw.requested_date != null ? String(raw.requested_date).slice(0, 10) : null,
    assigned_mass_date:
      raw.assigned_mass_date != null ? String(raw.assigned_mass_date).slice(0, 10) : null,
    assigned_priest_name: trimOrNull(raw.assigned_priest_name),
    stipend_received: Boolean(raw.stipend_received),
    is_fulfilled: Boolean(raw.is_fulfilled),
    notes: trimOrNull(raw.notes),
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  }
}

export function sanitizeMassIntentionsSearchQuery(query: string): string {
  return query.trim().replace(/[%_]/g, '')
}

export function formatMassIntentionDateDisplay(value: unknown): string {
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

export function intentionTextExcerpt(text: string, maxLength = 120): string {
  const s = String(text ?? '').trim()
  if (s.length <= maxLength) return s
  return `${s.slice(0, maxLength).trimEnd()}…`
}

export function normalizeMassIntentionWrite(input: MassIntentionWriteInput): {
  ok: true
  payload: {
    requester_name: string
    intention_text: string
    requested_date: string | null
    assigned_mass_date: string | null
    assigned_priest_name: string | null
    stipend_received: boolean
    is_fulfilled: boolean
    notes: string | null
  }
} | { ok: false; error: string } {
  const requester_name = String(input.requesterName ?? '').trim()
  const intention_text = String(input.intentionText ?? '').trim()

  if (!requester_name) {
    return { ok: false, error: 'Requester name is required.' }
  }
  if (!intention_text) {
    return { ok: false, error: 'Intention text is required.' }
  }

  return {
    ok: true,
    payload: {
      requester_name,
      intention_text,
      requested_date: normalizeDateOnly(input.requestedDate),
      assigned_mass_date: normalizeDateOnly(input.assignedMassDate),
      assigned_priest_name: trimOrNull(input.assignedPriestName),
      stipend_received: Boolean(input.stipendReceived),
      is_fulfilled: Boolean(input.isFulfilled),
      notes: trimOrNull(input.notes),
    },
  }
}
