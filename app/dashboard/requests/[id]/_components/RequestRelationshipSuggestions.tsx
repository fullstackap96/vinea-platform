'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { WorkflowSectionCard } from './WorkflowSectionCard'
import { secondaryButtonSm } from '@/lib/buttonStyles'
import { parsePersonRow } from '@/lib/people'
import {
  CONFIDENCE_CHIP_CLASS,
  CONFIDENCE_LABEL,
} from '@/lib/relationshipIntelligence/confidenceLabels'
import { matchPeopleForRequest } from '@/lib/relationshipIntelligence/matchPeopleForRequest'
import {
  buildHouseholdNamesByPersonId,
  suggestHouseholdsForPerson,
  type HouseholdMembershipRow,
} from '@/lib/relationshipIntelligence/suggestHouseholdsForPeople'
import type { ParishionerContact, PersonCandidate, PersonMatchSuggestion } from '@/lib/relationshipIntelligence/types'
import { supabase } from '@/lib/supabase'

const MAX_SUGGESTIONS = 5

type Props = {
  requestId: string
  personId: string | null | undefined
  parishioner: {
    id?: string
    full_name?: string
    email?: string
    phone?: string
  } | null
}

export function RequestRelationshipSuggestions({
  requestId,
  personId,
  parishioner,
}: Props) {
  const [personMatches, setPersonMatches] = useState<PersonMatchSuggestion[]>([])
  const [linkedHouseholds, setLinkedHouseholds] = useState<
    { householdId: string; householdName: string }[]
  >([])
  const [loading, setLoading] = useState(true)

  const resolvedPersonId = personId != null ? String(personId).trim() : ''
  const parishionerId = parishioner?.id != null ? String(parishioner.id).trim() : ''

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data: peopleRows } = await supabase
        .from('people')
        .select('id, parishioner_id, first_name, middle_name, last_name, email, phone')

      if (cancelled) return

      const people: PersonCandidate[] = (peopleRows ?? []).map((row) => {
        const parsed = parsePersonRow(row as Record<string, unknown>)
        return {
          id: parsed.id,
          parishioner_id: parsed.parishioner_id,
          first_name: parsed.first_name,
          middle_name: parsed.middle_name,
          last_name: parsed.last_name,
          email: parsed.email,
          phone: parsed.phone,
        }
      })

      const { data: memberRows } = await supabase
        .from('household_members')
        .select('person_id, household_id, households(name)')

      if (cancelled) return

      const householdRows: HouseholdMembershipRow[] = []
      for (const raw of memberRows ?? []) {
        const row = raw as Record<string, unknown>
        const householdsRaw = row.households
        const householdName =
          householdsRaw != null &&
          typeof householdsRaw === 'object' &&
          !Array.isArray(householdsRaw)
            ? String((householdsRaw as Record<string, unknown>).name ?? '').trim()
            : ''
        householdRows.push({
          person_id: String(row.person_id ?? ''),
          household_id: String(row.household_id ?? ''),
          household_name: householdName,
        })
      }

      const householdNamesByPersonId = buildHouseholdNamesByPersonId(householdRows)

      if (resolvedPersonId) {
        setPersonMatches([])
        setLinkedHouseholds(
          suggestHouseholdsForPerson(resolvedPersonId, householdRows).map((h) => ({
            householdId: h.householdId,
            householdName: h.householdName,
          }))
        )
        setLoading(false)
        return
      }

      const parishionerContact: ParishionerContact | null = parishionerId
        ? {
            id: parishionerId,
            full_name: String(parishioner?.full_name ?? '').trim(),
            email: String(parishioner?.email ?? '').trim() || null,
            phone: String(parishioner?.phone ?? '').trim() || null,
          }
        : null

      const matches = matchPeopleForRequest({
        requestId,
        requestPersonId: null,
        parishioner: parishionerContact,
        people,
        householdNamesByPersonId,
      })

      setPersonMatches(matches.slice(0, MAX_SUGGESTIONS))
      setLinkedHouseholds([])
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [requestId, resolvedPersonId, parishionerId, parishioner])

  const hasPersonMatches = personMatches.length > 0
  const hasLinkedHouseholds = linkedHouseholds.length > 0

  if (loading) {
    return (
      <WorkflowSectionCard
        title="Suggested connections"
        description="Review possible matches before linking anyone."
      >
        <p className="text-sm text-gray-600">Loading suggestions…</p>
      </WorkflowSectionCard>
    )
  }

  if (!resolvedPersonId && !hasPersonMatches) {
    return null
  }

  if (resolvedPersonId && !hasLinkedHouseholds) {
    return null
  }

  return (
    <WorkflowSectionCard
      title="Suggested connections"
      description="Based on intake contact — review before linking. Nothing changes until you act."
    >
      {resolvedPersonId && hasLinkedHouseholds ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Households for the linked person profile:
          </p>
          <ul className="space-y-2">
            {linkedHouseholds.map((household) => (
              <li key={household.householdId}>
                <Link
                  href={`/dashboard/households/${household.householdId}`}
                  className="text-sm font-medium text-blue-800 underline underline-offset-2 hover:text-blue-950"
                >
                  {household.householdName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasPersonMatches ? (
        <ul className="space-y-4">
          {personMatches.map((match) => (
            <li
              key={match.personId}
              className="rounded-xl border border-gray-200/90 bg-slate-50/70 px-4 py-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 break-words">
                    {match.personDisplayName}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{match.reason}</p>
                  {match.householdNames.length > 0 ? (
                    <p className="mt-1 text-sm text-gray-600">
                      Household: {match.householdNames.join(', ')}
                    </p>
                  ) : null}
                </div>
                <span className={CONFIDENCE_CHIP_CLASS[match.confidence]}>
                  {CONFIDENCE_LABEL[match.confidence]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {match.confidence === 'certain' ? (
                  <a
                    href="#people-directory"
                    className={`${secondaryButtonSm} justify-center`}
                  >
                    Review in People directory
                  </a>
                ) : (
                  <Link
                    href={`/dashboard/people/${match.personId}`}
                    className={`${secondaryButtonSm} justify-center`}
                  >
                    View person
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </WorkflowSectionCard>
  )
}
