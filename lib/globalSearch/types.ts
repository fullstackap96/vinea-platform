export type GlobalSearchResultItem = {
  title: string
  typeLabel: string
  context: string
  href: string
}

export type GlobalSearchGroupedResults = {
  requests: GlobalSearchResultItem[]
  people: GlobalSearchResultItem[]
  households: GlobalSearchResultItem[]
  records: GlobalSearchResultItem[]
}

export type GlobalSearchRawRequest = {
  id: string
  request_type: string
  status: string | null
  child_name: string | null
  created_at: string
  parishioner: { full_name: string | null; email: string | null } | null
  funeral_detail?: { deceased_name?: string | null } | null
  wedding_detail?: {
    partner_one_name?: string | null
    partner_two_name?: string | null
  } | null
}

export type GlobalSearchRawPerson = {
  id: string
  first_name: string
  middle_name: string | null
  last_name: string
  email: string | null
  phone: string | null
  primaryHouseholdName: string | null
}

export type GlobalSearchRawHousehold = {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  memberCount: number
}

export type GlobalSearchRawRecord = {
  id: string
  record_type: string
  person_name: string
  sacrament_date: string | null
}

export type GlobalSearchRawData = {
  requests: GlobalSearchRawRequest[]
  people: GlobalSearchRawPerson[]
  households: GlobalSearchRawHousehold[]
  records: GlobalSearchRawRecord[]
}

export type GlobalSearchLoadResult = {
  query: string
  sanitizedQuery: string | null
  raw: GlobalSearchRawData
  errorMessage: string
  totalCount: number
}
