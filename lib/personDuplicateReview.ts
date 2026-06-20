import { formatPersonDisplayName } from '@/lib/people'
import type { PersonRow } from '@/lib/types/people'

export type PersonDuplicateConfidence = 'high' | 'medium' | 'low'

export type PersonDuplicateCandidate = {
  id: string
  confidence: PersonDuplicateConfidence
  score: number
  reasons: string[]
  people: [PersonRow, PersonRow]
}

function norm(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '')
}

function nameKey(person: PersonRow): string {
  return [person.first_name, person.last_name].map(norm).join('|')
}

function fullName(person: PersonRow): string {
  return norm(formatPersonDisplayName(person))
}

function confidenceFromScore(score: number): PersonDuplicateConfidence {
  if (score >= 90) return 'high'
  if (score >= 65) return 'medium'
  return 'low'
}

export function scorePersonDuplicatePair(a: PersonRow, b: PersonRow): {
  score: number
  reasons: string[]
} {
  const reasons: string[] = []
  let score = 0

  const aEmail = norm(a.email)
  const bEmail = norm(b.email)
  if (aEmail && bEmail && aEmail === bEmail) {
    score += 70
    reasons.push('Same email')
  }

  const aPhone = digits(a.phone)
  const bPhone = digits(b.phone)
  if (aPhone && bPhone && aPhone.length >= 7 && aPhone === bPhone) {
    score += 65
    reasons.push('Same phone')
  }

  const sameFirstLast = nameKey(a) === nameKey(b) && norm(a.first_name) && norm(a.last_name)
  if (sameFirstLast) {
    score += 45
    reasons.push('Same first and last name')
  } else if (fullName(a) && fullName(a) === fullName(b)) {
    score += 40
    reasons.push('Same full name')
  }

  if (a.date_of_birth && b.date_of_birth && a.date_of_birth === b.date_of_birth) {
    score += 35
    reasons.push('Same date of birth')
  }

  const sameLast = norm(a.last_name) && norm(a.last_name) === norm(b.last_name)
  const sameFirstInitial =
    norm(a.first_name).slice(0, 1) && norm(a.first_name).slice(0, 1) === norm(b.first_name).slice(0, 1)
  if (!sameFirstLast && sameLast && sameFirstInitial && (aEmail === bEmail || aPhone === bPhone)) {
    score += 25
    reasons.push('Similar name with matching contact information')
  }

  return { score: Math.min(score, 100), reasons }
}

export function findPersonDuplicateCandidates(
  people: PersonRow[],
  minScore = 45
): PersonDuplicateCandidate[] {
  const candidates: PersonDuplicateCandidate[] = []

  for (let i = 0; i < people.length; i += 1) {
    for (let j = i + 1; j < people.length; j += 1) {
      const a = people[i]
      const b = people[j]
      const { score, reasons } = scorePersonDuplicatePair(a, b)
      if (score < minScore) continue

      candidates.push({
        id: [a.id, b.id].sort().join(':'),
        confidence: confidenceFromScore(score),
        score,
        reasons,
        people: [a, b],
      })
    }
  }

  return candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.people[0].last_name.localeCompare(b.people[0].last_name)
  })
}

export function combinePersonNotes(primary: string | null, duplicate: string | null): string | null {
  const a = String(primary ?? '').trim()
  const b = String(duplicate ?? '').trim()
  if (!a && !b) return null
  if (a && !b) return a
  if (!a && b) return b
  if (a === b) return a
  return `${a}\n\nMerged note:\n${b}`
}
