export type HouseholdMembershipRow = {
  person_id: string
  household_id: string
  household_name: string
}

/** Map person id → distinct household display names. */
export function buildHouseholdNamesByPersonId(
  rows: readonly HouseholdMembershipRow[]
): Map<string, string[]> {
  const map = new Map<string, Set<string>>()

  for (const row of rows) {
    const personId = String(row.person_id ?? '').trim()
    const householdName = String(row.household_name ?? '').trim()
    if (!personId || !householdName) continue

    if (!map.has(personId)) {
      map.set(personId, new Set())
    }
    map.get(personId)!.add(householdName)
  }

  const result = new Map<string, string[]>()
  for (const [personId, names] of map) {
    result.set(personId, [...names].sort((a, b) => a.localeCompare(b)))
  }
  return result
}

export type LinkedPersonHouseholdSuggestion = {
  personId: string
  householdId: string
  householdName: string
}

/** Household memberships for a single linked person (request already has person_id). */
export function suggestHouseholdsForPerson(
  personId: string,
  rows: readonly HouseholdMembershipRow[]
): LinkedPersonHouseholdSuggestion[] {
  const id = String(personId).trim()
  if (!id) return []

  const seen = new Set<string>()
  const suggestions: LinkedPersonHouseholdSuggestion[] = []

  for (const row of rows) {
    if (String(row.person_id).trim() !== id) continue
    const householdId = String(row.household_id).trim()
    const householdName = String(row.household_name).trim()
    if (!householdId || !householdName || seen.has(householdId)) continue
    seen.add(householdId)
    suggestions.push({ personId: id, householdId, householdName })
  }

  return suggestions.sort((a, b) => a.householdName.localeCompare(b.householdName))
}
