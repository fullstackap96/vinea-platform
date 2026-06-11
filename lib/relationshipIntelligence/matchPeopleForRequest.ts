import { formatPersonDisplayName } from '@/lib/people'
import { confidenceRank } from './confidenceLabels'
import { normalizeEmail, normalizeFullName, normalizePhone } from './normalizeContact'
import type {
  ConfidenceLevel,
  ParishionerContact,
  PersonCandidate,
  PersonMatchSuggestion,
} from './types'

type MatchTier = {
  confidence: ConfidenceLevel
  reason: string
  test: (person: PersonCandidate) => boolean
}

function buildTiers(
  parishioner: ParishionerContact
): MatchTier[] {
  const parishionerId = String(parishioner.id).trim()
  const emailNorm = normalizeEmail(parishioner.email)
  const phoneNorm = normalizePhone(parishioner.phone)
  const nameNorm = normalizeFullName(parishioner.full_name)

  const tiers: MatchTier[] = []

  if (parishionerId) {
    tiers.push({
      confidence: 'certain',
      reason: 'Same intake contact (parishioner_id)',
      test: (person) =>
        person.parishioner_id != null && String(person.parishioner_id).trim() === parishionerId,
    })
  }

  if (emailNorm) {
    tiers.push({
      confidence: 'high',
      reason: 'Exact email match',
      test: (person) => normalizeEmail(person.email) === emailNorm,
    })
  }

  if (phoneNorm.length >= 7) {
    tiers.push({
      confidence: 'medium',
      reason: 'Exact phone match',
      test: (person) => {
        const personPhone = normalizePhone(person.phone)
        return personPhone.length >= 7 && personPhone === phoneNorm
      },
    })
  }

  if (nameNorm) {
    tiers.push({
      confidence: 'low',
      reason: 'Exact full name match',
      test: (person) =>
        normalizeFullName(formatPersonDisplayName(person)) === nameNorm,
    })
  }

  return tiers
}

/**
 * Tiered person matches for a request intake contact. Never auto-links.
 * Returns empty when `requestPersonId` is already set.
 */
export function matchPeopleForRequest(input: {
  requestId: string
  requestPersonId: string | null
  parishioner: ParishionerContact | null
  people: readonly PersonCandidate[]
  householdNamesByPersonId?: ReadonlyMap<string, string[]>
}): PersonMatchSuggestion[] {
  const requestId = String(input.requestId).trim()
  if (!requestId) return []

  const linkedPersonId = input.requestPersonId ? String(input.requestPersonId).trim() : ''
  if (linkedPersonId) return []

  const parishioner = input.parishioner
  if (!parishioner?.id) return []

  const tiers = buildTiers(parishioner)
  const bestByPersonId = new Map<
    string,
    { confidence: ConfidenceLevel; reason: string; person: PersonCandidate }
  >()

  for (const person of input.people) {
    const personId = String(person.id).trim()
    if (!personId || personId === linkedPersonId) continue

    for (const tier of tiers) {
      if (!tier.test(person)) continue
      const existing = bestByPersonId.get(personId)
      if (
        !existing ||
        confidenceRank(tier.confidence) < confidenceRank(existing.confidence)
      ) {
        bestByPersonId.set(personId, {
          confidence: tier.confidence,
          reason: tier.reason,
          person,
        })
      }
      break
    }
  }

  const suggestions: PersonMatchSuggestion[] = []
  for (const [personId, match] of bestByPersonId) {
    suggestions.push({
      kind: 'person_match',
      personId,
      personDisplayName: formatPersonDisplayName(match.person),
      confidence: match.confidence,
      reason: match.reason,
      requestId,
      householdNames: input.householdNamesByPersonId?.get(personId) ?? [],
    })
  }

  suggestions.sort(
    (a, b) =>
      confidenceRank(a.confidence) - confidenceRank(b.confidence) ||
      a.personDisplayName.localeCompare(b.personDisplayName)
  )

  return suggestions
}
