export type HouseholdRow = {
  id: string
  parish_id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type HouseholdWriteInput = {
  name: unknown
  address: unknown
  city: unknown
  state: unknown
  postalCode: unknown
  notes: unknown
}

export type HouseholdMemberRow = {
  id: string
  parish_id: string
  household_id: string
  person_id: string
  relationship: string
  is_primary_contact: boolean
  created_at: string
}

export type HouseholdMemberWithPerson = HouseholdMemberRow & {
  person: {
    id: string
    first_name: string
    middle_name: string | null
    last_name: string
    email: string | null
    phone: string | null
  }
}

export type HouseholdListItem = HouseholdRow & {
  memberCount: number
}

export type HouseholdMemberWriteInput = {
  personId: unknown
  relationship: unknown
  isPrimaryContact: unknown
}

export type HouseholdMemberUpdateInput = {
  relationship: unknown
  isPrimaryContact: unknown
}
