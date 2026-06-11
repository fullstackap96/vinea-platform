export type PersonRow = {
  id: string
  parish_id: string
  parishioner_id: string | null
  first_name: string
  middle_name: string | null
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type PersonWriteInput = {
  firstName: unknown
  middleName: unknown
  lastName: unknown
  email: unknown
  phone: unknown
  dateOfBirth: unknown
  notes: unknown
  parishionerId?: unknown
}

export type PersonListItem = PersonRow & {
  primaryHouseholdName: string | null
  primaryHouseholdRelationship: string | null
}
