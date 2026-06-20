import { formatHouseholdAddressLine } from '@/lib/households'
import type { HouseholdRow } from '@/lib/types/households'

export type HouseholdDuplicateConfidence = 'high' | 'medium' | 'low'

export type HouseholdDuplicateCandidate = {
  id: string
  confidence: HouseholdDuplicateConfidence
  score: number
  reasons: string[]
  households: [HouseholdRow, HouseholdRow]
}

function norm(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/[.,#]/g, '').replace(/\s+/g, ' ')
}

function postalKey(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, '')
}

function householdNameBase(value: unknown): string {
  return norm(value)
    .replace(/\b(the|family|household|home)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function confidenceFromScore(score: number): HouseholdDuplicateConfidence {
  if (score >= 90) return 'high'
  if (score >= 65) return 'medium'
  return 'low'
}

export function scoreHouseholdDuplicatePair(a: HouseholdRow, b: HouseholdRow): {
  score: number
  reasons: string[]
} {
  const reasons: string[] = []
  let score = 0

  const aName = householdNameBase(a.name)
  const bName = householdNameBase(b.name)
  if (aName && bName && aName === bName) {
    score += 45
    reasons.push('Similar household name')
  }

  const aAddress = norm(a.address)
  const bAddress = norm(b.address)
  if (aAddress && bAddress && aAddress === bAddress) {
    score += 70
    reasons.push('Same street address')
  }

  const aCity = norm(a.city)
  const bCity = norm(b.city)
  if (aCity && bCity && aCity === bCity) {
    score += 10
    reasons.push('Same city')
  }

  const aPostal = postalKey(a.postal_code)
  const bPostal = postalKey(b.postal_code)
  if (aPostal && bPostal && aPostal === bPostal) {
    score += 15
    reasons.push('Same postal code')
  }

  return { score: Math.min(score, 100), reasons }
}

export function findHouseholdDuplicateCandidates(
  households: HouseholdRow[],
  minScore = 45
): HouseholdDuplicateCandidate[] {
  const candidates: HouseholdDuplicateCandidate[] = []

  for (let i = 0; i < households.length; i += 1) {
    for (let j = i + 1; j < households.length; j += 1) {
      const a = households[i]
      const b = households[j]
      const { score, reasons } = scoreHouseholdDuplicatePair(a, b)
      if (score < minScore) continue

      candidates.push({
        id: [a.id, b.id].sort().join(':'),
        confidence: confidenceFromScore(score),
        score,
        reasons,
        households: [a, b],
      })
    }
  }

  return candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.households[0].name.localeCompare(b.households[0].name)
  })
}

export function combineHouseholdNotes(primary: string | null, duplicate: string | null): string | null {
  const a = String(primary ?? '').trim()
  const b = String(duplicate ?? '').trim()
  if (!a && !b) return null
  if (a && !b) return a
  if (!a && b) return b
  if (a === b) return a
  return `${a}\n\nMerged household note:\n${b}`
}

export function householdSummary(household: HouseholdRow): string {
  return formatHouseholdAddressLine(household) || household.name
}
