import Link from 'next/link'
import { Pencil } from 'lucide-react'

import { DashboardRequestNameLink } from '@/app/dashboard/_components/DashboardRequestNameLink'
import { CareTimelineSection } from '@/app/dashboard/_components/CareTimelineSection'
import {
  LabelValueGrid,
  LabelValueRow,
} from '@/app/dashboard/requests/[id]/_components/LabelValueGrid'
import { WorkflowSectionCard } from '@/app/dashboard/requests/[id]/_components/WorkflowSectionCard'
import { SacramentalRecordTypeBadge } from '@/app/dashboard/records/_components/SacramentalRecordTypeBadge'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import { dashboardRequestLinkCardP4 } from '@/lib/cardStyles'
import { buildPersonCareTimeline } from '@/lib/careTimeline'
import {
  householdDetailHref,
  personEditHref,
  recordDetailHref,
} from '@/lib/dashboardEntityNavigation'
import { dashboardRequestOpenLabel, requestDetailHref } from '@/lib/dashboardRequestNavigation'
import { formatRequestType } from '@/lib/formatRequestType'
import { formatHouseholdRelationship } from '@/lib/households'
import { maybeMissingValue } from '@/lib/missingValue'
import { formatPersonDateOfBirthDisplay, formatPersonDisplayName } from '@/lib/people'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import { formatRequestStatus } from '@/lib/requestStatus'
import { formatSacramentDateDisplay } from '@/lib/sacramentalRecords'
import type { PersonDetailResult } from '@/lib/server/loadPersonDetail'

function displayValue(value: string | null | undefined) {
  const s = String(value ?? '').trim()
  return s ? s : maybeMissingValue('Not set')
}

function formatWhenLabel(iso: string | null | undefined) {
  if (!iso) return 'Not set'
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return 'Not set'
  return d.toLocaleString()
}

function formatSubmittedDate(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(String(iso))
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PersonDetailPage({
  person,
  households,
  records,
  requests,
  communications,
  errorMessage,
  warningMessage,
  activeParishName,
}: PersonDetailResult) {
  if (errorMessage || !person) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/people"
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            Back to people
          </Link>
        </p>
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage || 'Person not found.'}
        </div>
      </main>
    )
  }

  const displayName = formatPersonDisplayName(person)
  const dobDisplay = formatPersonDateOfBirthDisplay(person.date_of_birth)
  const contactParts = [person.email, person.phone].filter(Boolean)
  const careTimeline = buildPersonCareTimeline({
    requests,
    records,
    communications,
    households,
  })

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href="/dashboard/people"
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          Back to people
        </Link>
      </p>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {displayName}
          </h1>
          {contactParts.length > 0 || dobDisplay ? (
            <p className="mt-2 break-words text-sm text-gray-600">
              {[contactParts.join(' - '), dobDisplay ? `DOB: ${dobDisplay}` : '']
                .filter(Boolean)
                .join(' - ')}
            </p>
          ) : null}
          {activeParishName ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-blue-900">
              Scoped to {activeParishName}
            </p>
          ) : null}
        </div>
        <Link
          href={personEditHref(person.id)}
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
        <WorkflowSectionCard title="Contact" description="Profile details on file for this person.">
          <LabelValueGrid>
            <LabelValueRow label="First name" value={displayValue(person.first_name)} />
            <LabelValueRow label="Middle name" value={displayValue(person.middle_name)} />
            <LabelValueRow label="Last name" value={displayValue(person.last_name)} />
            <LabelValueRow label="Email" value={displayValue(person.email)} />
            <LabelValueRow label="Phone" value={displayValue(person.phone)} />
            <LabelValueRow
              label="Date of birth"
              value={dobDisplay ? dobDisplay : maybeMissingValue('Not set')}
            />
            <LabelValueRow label="Notes" value={displayValue(person.notes)} />
          </LabelValueGrid>
        </WorkflowSectionCard>

        <CareTimelineSection
          events={careTimeline.events}
          nextAction={careTimeline.nextAction}
          counts={careTimeline.counts}
        />

        <WorkflowSectionCard title="Households" description="Household memberships for this person.">
          {households.length === 0 ? (
            <p className="text-sm text-gray-700">Not linked to a household yet.</p>
          ) : (
            <ul className="space-y-3">
              {households.map((membership) => (
                <li key={membership.memberId}>
                  <Link
                    href={householdDetailHref(membership.householdId)}
                    className="block rounded-xl border border-gray-200/90 bg-slate-50/80 px-4 py-3 text-sm transition hover:border-gray-300 hover:bg-white"
                  >
                    <p className="font-semibold text-gray-900">{membership.householdName}</p>
                    <p className="mt-1 text-gray-600">
                      {formatHouseholdRelationship(membership.relationship)}
                      {membership.isPrimaryContact ? ' - Primary contact' : ''}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </WorkflowSectionCard>

        <WorkflowSectionCard
          title="Sacramental records"
          description="Register entries linked to this profile."
        >
          {records.length === 0 ? (
            <p className="text-sm text-gray-700">No linked records yet.</p>
          ) : (
            <ul className="space-y-3">
              {records.map((record) => (
                <li key={record.id}>
                  <Link
                    href={recordDetailHref(record.id)}
                    className="block rounded-xl border border-gray-200/90 bg-slate-50/80 px-4 py-3 transition hover:border-gray-300 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <SacramentalRecordTypeBadge recordType={record.record_type} />
                    </div>
                    <p className="mt-2 break-words font-semibold text-gray-900">
                      {record.person_name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatSacramentDateDisplay(record.sacrament_date)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </WorkflowSectionCard>

        <WorkflowSectionCard title="Requests" description="Intake requests linked to this person.">
          {requests.length === 0 ? (
            <p className="text-sm text-gray-700">No linked requests yet.</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((request) => {
                const subtitle =
                  request.child_name != null && String(request.child_name).trim()
                    ? `Child: ${String(request.child_name).trim()}`
                    : null
                const submitted = formatSubmittedDate(request.created_at)
                const requestName = getRequestDetailPrimaryHeading({
                  request_type: request.request_type,
                  child_name: request.child_name,
                  parishioner: { full_name: displayName },
                })
                return (
                  <li key={request.id}>
                    <Link
                      href={requestDetailHref(request.id)}
                      aria-label={dashboardRequestOpenLabel(requestName)}
                      className={`${dashboardRequestLinkCardP4} !rounded-xl !p-4`}
                    >
                      <DashboardRequestNameLink name={requestName} embedded />
                      <p className="mt-1 text-sm text-gray-600">
                        {formatRequestType(request.request_type)}
                        {' - '}
                        {formatRequestStatus(request.status)}
                        {submitted ? ` - Submitted ${submitted}` : ''}
                        {subtitle ? ` - ${subtitle}` : ''}
                      </p>
                      {request.linkSource === 'parishioner_id' ? (
                        <p className="mt-1.5 text-xs text-amber-900/90">
                          Linked via intake contact - open the request to set a direct person link.
                        </p>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </WorkflowSectionCard>

        <WorkflowSectionCard
          title="Communication history"
          description="Touchpoints from linked requests."
        >
          {communications.length === 0 ? (
            <p className="text-sm text-gray-700">No touchpoints logged yet.</p>
          ) : (
            <div className="divide-y divide-gray-200/80">
              {communications.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <p className="text-gray-800">
                    <strong className="text-gray-900">
                      {maybeMissingValue(formatWhenLabel(item.contacted_at))}
                    </strong>{' '}
                    <span className="text-sm text-gray-600">({item.method})</span>
                  </p>
                  <p className="mt-1 text-sm">
                    <DashboardRequestNameLink
                      requestId={item.requestId}
                      name={item.requestLabel}
                      size="sm"
                    />
                  </p>
                  {item.notes ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                      {item.notes}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">{maybeMissingValue('-')}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </WorkflowSectionCard>
      </div>
    </main>
  )
}
