import Link from 'next/link'
import { Pencil } from 'lucide-react'

import { CareTimelineSection } from '@/app/dashboard/_components/CareTimelineSection'
import {
  LabelValueGrid,
  LabelValueRow,
} from '@/app/dashboard/requests/[id]/_components/LabelValueGrid'
import { WorkflowSectionCard } from '@/app/dashboard/requests/[id]/_components/WorkflowSectionCard'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import { buildHouseholdCareTimeline } from '@/lib/careTimeline'
import { householdEditHref, personDetailHref } from '@/lib/dashboardEntityNavigation'
import {
  formatHouseholdAddressLine,
  formatHouseholdMemberLabel,
  formatHouseholdRelationship,
} from '@/lib/households'
import { maybeMissingValue } from '@/lib/missingValue'
import type { HouseholdDetailResult } from '@/lib/server/loadHouseholdDetail'

function displayValue(value: string | null | undefined) {
  const s = String(value ?? '').trim()
  return s ? s : maybeMissingValue('Not set')
}

export function HouseholdDetailPage({
  household,
  members,
  requests,
  records,
  communications,
  errorMessage,
  warningMessage,
  activeParishName,
}: HouseholdDetailResult) {
  if (errorMessage || !household) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/households"
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            &larr; Back to households
          </Link>
        </p>
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage || 'Household not found.'}
        </div>
      </main>
    )
  }

  const addressLine = formatHouseholdAddressLine(household)
  const careTimeline = buildHouseholdCareTimeline({
    householdId: household.id,
    requests,
    records,
    communications,
    households: [
      {
        householdId: household.id,
        householdName: household.name,
        relationship: 'Household',
        isPrimaryContact: false,
      },
    ],
    memberCount: members.length,
    primaryContactCount: members.filter((member) => member.is_primary_contact).length,
  })

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href="/dashboard/households"
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          &larr; Back to households
        </Link>
      </p>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {household.name}
          </h1>
          {addressLine ? (
            <p className="mt-2 break-words text-sm text-gray-600">{addressLine}</p>
          ) : null}
          {activeParishName ? (
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              Showing household for {activeParishName}
            </p>
          ) : null}
        </div>
        <Link
          href={householdEditHref(household.id)}
          className={`${secondaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        >
          <Pencil className="h-4 w-4 shrink-0" aria-hidden />
          Edit
        </Link>
      </header>

      {warningMessage ? (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          {warningMessage}
        </div>
      ) : null}

      <div className="space-y-6">
        <WorkflowSectionCard title="Address" description="Mailing address on file for this household.">
          <LabelValueGrid>
            <LabelValueRow label="Address" value={displayValue(household.address)} />
            <LabelValueRow label="City" value={displayValue(household.city)} />
            <LabelValueRow label="State" value={displayValue(household.state)} />
            <LabelValueRow label="Postal code" value={displayValue(household.postal_code)} />
            <LabelValueRow label="Notes" value={displayValue(household.notes)} />
          </LabelValueGrid>
        </WorkflowSectionCard>

        <CareTimelineSection
          events={careTimeline.events}
          nextAction={careTimeline.nextAction}
          counts={careTimeline.counts}
          title="Household care timeline"
          description="Requests, records, communication, and follow-ups linked to this family."
        />

        <WorkflowSectionCard title="Members" description="People in this household.">
          {members.length === 0 ? (
            <p className="text-sm text-gray-700">
              No members yet.{' '}
              <Link
                href={householdEditHref(household.id)}
                className="font-medium text-blue-800 underline underline-offset-2"
              >
                Add members
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {members.map((member) => (
                <li key={member.id}>
                  <Link
                    href={personDetailHref(member.person_id)}
                    className="block rounded-xl border border-gray-200/90 bg-slate-50/80 px-4 py-3 transition hover:border-gray-300 hover:bg-white"
                  >
                    <p className="font-semibold text-gray-900">
                      {formatHouseholdMemberLabel(member)}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatHouseholdRelationship(member.relationship)}
                      {member.is_primary_contact ? ' · Primary contact' : ''}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </WorkflowSectionCard>
      </div>
    </main>
  )
}
