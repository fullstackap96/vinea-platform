'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { WorkflowSectionCard } from './WorkflowSectionCard'
import { secondaryButtonSm } from '@/lib/buttonStyles'
import {
  CONFIDENCE_CHIP_CLASS,
  CONFIDENCE_LABEL,
} from '@/lib/relationshipIntelligence/confidenceLabels'
import { householdDetailHref, personDetailHref } from '@/lib/dashboardEntityNavigation'
import type { PersonMatchSuggestion } from '@/lib/relationshipIntelligence/types'

type Props = {
  requestId: string
  personId: string | null | undefined
  requestParishId: string | null | undefined
  parishioner: {
    id?: string
    full_name?: string | null
    email?: string | null
    phone?: string | null
  } | null
}

type RelationshipSuggestionResponse =
  | {
      ok: true
      personMatches: PersonMatchSuggestion[]
      linkedHouseholds: { householdId: string; householdName: string }[]
    }
  | { ok: false; error: string }

export function RequestRelationshipSuggestions({
  requestId,
  personId,
  requestParishId,
}: Props) {
  const [personMatches, setPersonMatches] = useState<PersonMatchSuggestion[]>([])
  const [linkedHouseholds, setLinkedHouseholds] = useState<
    { householdId: string; householdName: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [loadUnavailable, setLoadUnavailable] = useState(false)

  const resolvedPersonId = personId != null ? String(personId).trim() : ''
  const resolvedRequestParishId =
    requestParishId != null ? String(requestParishId).trim() : ''

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setLoadUnavailable(false)

      if (!resolvedRequestParishId) {
        if (!cancelled) {
          setPersonMatches([])
          setLinkedHouseholds([])
          setLoading(false)
        }
        return
      }

      try {
        const response = await fetch(`/api/requests/${requestId}/relationship-suggestions`, {
          credentials: 'include',
          signal: controller.signal,
        })
        const payload = (await response.json().catch(() => null)) as
          | RelationshipSuggestionResponse
          | null

        if (cancelled || controller.signal.aborted) return

        if (!response.ok || !payload?.ok) {
          setPersonMatches([])
          setLinkedHouseholds([])
          setLoadUnavailable(true)
          return
        }

        setPersonMatches(payload.personMatches)
        setLinkedHouseholds(payload.linkedHouseholds)
      } catch {
        if (cancelled || controller.signal.aborted) return
        setPersonMatches([])
        setLinkedHouseholds([])
        setLoadUnavailable(true)
      } finally {
        if (!cancelled && !controller.signal.aborted) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [requestId, resolvedPersonId, resolvedRequestParishId])

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

  if (loadUnavailable) {
    return (
      <WorkflowSectionCard
        title="Suggested connections"
        description="Review possible matches before linking anyone."
      >
        <div
          role="alert"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-950"
        >
          Suggested connections could not be checked. Refresh this request before reviewing or
          linking a profile.
        </div>
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
                  href={householdDetailHref(household.householdId)}
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
                    href={personDetailHref(match.personId)}
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
