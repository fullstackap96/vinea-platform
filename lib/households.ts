import { formatPersonDisplayName } from '@/lib/people'
import type {
  HouseholdMemberRow,
  HouseholdMemberWithPerson,
  HouseholdMemberWriteInput,
  HouseholdMemberUpdateInput,
  HouseholdRow,
  HouseholdWriteInput,
} from '@/lib/types/households'

export const HOUSEHOLD_RELATIONSHIP_OPTIONS = [
  'head',
  'spouse',
  'child',
  'parent',
  'sibling',
  'other',
] as const

function trimOrNull(value: unknown): string | null {
  const s = String(value ?? '').trim()
  return s.length > 0 ? s : null
}

export function parseHouseholdRow(raw: Record<string, unknown>): HouseholdRow {
  return {
    id: String(raw.id),
    parish_id: String(raw.parish_id),
    name: String(raw.name ?? '').trim(),
    address: trimOrNull(raw.address),
    city: trimOrNull(raw.city),
    state: trimOrNull(raw.state),
    postal_code: trimOrNull(raw.postal_code),
    notes: trimOrNull(raw.notes),
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  }
}

export function parseHouseholdMemberRow(raw: Record<string, unknown>): HouseholdMemberRow {
  return {
    id: String(raw.id),
    parish_id: String(raw.parish_id),
    household_id: String(raw.household_id),
    person_id: String(raw.person_id),
    relationship: String(raw.relationship ?? 'member').trim(),
    is_primary_contact: Boolean(raw.is_primary_contact),
    created_at: String(raw.created_at ?? ''),
  }
}

export function parseHouseholdMemberWithPerson(raw: Record<string, unknown>): HouseholdMemberWithPerson {
  const member = parseHouseholdMemberRow(raw)
  const personRaw = raw.person
  const personObj =
    personRaw != null && typeof personRaw === 'object' && !Array.isArray(personRaw)
      ? (personRaw as Record<string, unknown>)
      : {}

  return {
    ...member,
    person: {
      id: String(personObj.id ?? member.person_id),
      first_name: String(personObj.first_name ?? '').trim(),
      middle_name: trimOrNull(personObj.middle_name),
      last_name: String(personObj.last_name ?? '').trim(),
      email: trimOrNull(personObj.email),
      phone: trimOrNull(personObj.phone),
    },
  }
}

export function formatHouseholdAddressLine(household: {
  address?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
}): string {
  const street = String(household.address ?? '').trim()
  const city = String(household.city ?? '').trim()
  const state = String(household.state ?? '').trim()
  const postal = String(household.postal_code ?? '').trim()

  const cityLine = [city, state].filter(Boolean).join(', ')
  const cityPostal = [cityLine, postal].filter(Boolean).join(' ')

  return [street, cityPostal].filter(Boolean).join(' · ')
}

export function formatHouseholdMemberLabel(member: HouseholdMemberWithPerson): string {
  return formatPersonDisplayName(member.person)
}

export function normalizeHouseholdWrite(input: HouseholdWriteInput): {
  ok: true
  payload: {
    name: string
    address: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    notes: string | null
  }
} | { ok: false; error: string } {
  const name = String(input.name ?? '').trim()
  if (!name) {
    return { ok: false, error: 'Household name is required.' }
  }

  return {
    ok: true,
    payload: {
      name,
      address: trimOrNull(input.address),
      city: trimOrNull(input.city),
      state: trimOrNull(input.state),
      postal_code: trimOrNull(input.postalCode),
      notes: trimOrNull(input.notes),
    },
  }
}

export function normalizeHouseholdMemberWrite(input: HouseholdMemberWriteInput): {
  ok: true
  payload: {
    person_id: string
    relationship: string
    is_primary_contact: boolean
  }
} | { ok: false; error: string } {
  const person_id = String(input.personId ?? '').trim()
  if (!person_id) {
    return { ok: false, error: 'Select a person to add.' }
  }

  const relationship = String(input.relationship ?? 'member').trim() || 'member'

  return {
    ok: true,
    payload: {
      person_id,
      relationship,
      is_primary_contact: Boolean(input.isPrimaryContact),
    },
  }
}

export function normalizeHouseholdMemberUpdate(input: HouseholdMemberUpdateInput): {
  ok: true
  payload: {
    relationship: string
    is_primary_contact: boolean
  }
} | { ok: false; error: string } {
  const relationship = String(input.relationship ?? 'member').trim() || 'member'

  return {
    ok: true,
    payload: {
      relationship,
      is_primary_contact: Boolean(input.isPrimaryContact),
    },
  }
}

export function sanitizeHouseholdsSearchQuery(query: string): string {
  return query.trim().replace(/[%_]/g, '')
}

export function formatHouseholdRelationship(value: string | null | undefined): string {
  const s = String(value ?? '').trim()
  if (!s) return 'Member'
  return s.slice(0, 1).toUpperCase() + s.slice(1)
}
