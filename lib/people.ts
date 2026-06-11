import type { PersonRow, PersonWriteInput } from '@/lib/types/people'

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

export function formatPersonDisplayName(input: {
  first_name?: unknown
  middle_name?: unknown
  last_name?: unknown
}): string {
  return [input.first_name, input.middle_name, input.last_name]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(' ')
}

/** Split intake `parishioners.full_name` into people name fields (best-effort; not used for matching). */
export function parseParishionerFullName(fullName: unknown): {
  firstName: string
  middleName: string | null
  lastName: string
} {
  const parts = String(fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) {
    return { firstName: 'Unknown', middleName: null, lastName: 'Contact' }
  }
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: null, lastName: '—' }
  }
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: null, lastName: parts[1] }
  }
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  }
}

export function parsePersonRow(raw: Record<string, unknown>): PersonRow {
  return {
    id: String(raw.id),
    parish_id: String(raw.parish_id),
    parishioner_id: raw.parishioner_id != null ? String(raw.parishioner_id) : null,
    first_name: String(raw.first_name ?? '').trim(),
    middle_name: trimOrNull(raw.middle_name),
    last_name: String(raw.last_name ?? '').trim(),
    email: trimOrNull(raw.email),
    phone: trimOrNull(raw.phone),
    date_of_birth:
      raw.date_of_birth != null ? String(raw.date_of_birth).slice(0, 10) : null,
    notes: trimOrNull(raw.notes),
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  }
}

export function formatPersonDateOfBirthDisplay(dateOfBirth: string | null | undefined): string {
  const s = String(dateOfBirth ?? '').trim()
  if (!s) return ''
  const d = new Date(`${s}T12:00:00`)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function normalizePersonWrite(input: PersonWriteInput): {
  ok: true
  payload: {
    first_name: string
    middle_name: string | null
    last_name: string
    email: string | null
    phone: string | null
    date_of_birth: string | null
    notes: string | null
    parishioner_id: string | null
  }
} | { ok: false; error: string } {
  const first_name = String(input.firstName ?? '').trim()
  const last_name = String(input.lastName ?? '').trim()

  if (!first_name) {
    return { ok: false, error: 'First name is required.' }
  }
  if (!last_name) {
    return { ok: false, error: 'Last name is required.' }
  }

  const parishionerRaw = input.parishionerId
  const parishioner_id =
    parishionerRaw != null && String(parishionerRaw).trim()
      ? String(parishionerRaw).trim()
      : null

  return {
    ok: true,
    payload: {
      first_name,
      middle_name: trimOrNull(input.middleName),
      last_name,
      email: trimOrNull(input.email),
      phone: trimOrNull(input.phone),
      date_of_birth: normalizeDateOnly(input.dateOfBirth),
      notes: trimOrNull(input.notes),
      parishioner_id,
    },
  }
}

export function sanitizePeopleSearchQuery(query: string): string {
  return query.trim().replace(/[%_]/g, '')
}
