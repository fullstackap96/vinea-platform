'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Pencil } from 'lucide-react'
import {
  LabelValueGrid,
  LabelValueRow,
} from '@/app/dashboard/requests/[id]/_components/LabelValueGrid'
import { WorkflowSectionCard } from '@/app/dashboard/requests/[id]/_components/WorkflowSectionCard'
import { SacramentalRecordTypeBadge } from '@/app/dashboard/records/_components/SacramentalRecordTypeBadge'
import { devDashboardConsoleError } from '@/lib/dashboardSupabaseError'
import { formatRequestType } from '@/lib/formatRequestType'
import { formatHouseholdRelationship } from '@/lib/households'
import { maybeMissingValue } from '@/lib/missingValue'
import {
  formatPersonDateOfBirthDisplay,
  formatPersonDisplayName,
  parsePersonRow,
} from '@/lib/people'
import { formatSacramentDateDisplay, parseSacramentalRecordRow } from '@/lib/sacramentalRecords'
import { formatRequestStatus } from '@/lib/requestStatus'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import { supabase } from '@/lib/supabase'
import { getRequestDetailPrimaryHeading } from '@/lib/requestDetailIdentity'
import {
  dashboardRequestLinkCardP4,
} from '@/lib/cardStyles'
import { dashboardRequestOpenLabel } from '@/lib/dashboardRequestNavigation'
import { DashboardRequestNameLink } from '@/app/dashboard/_components/DashboardRequestNameLink'
import { CareTimelineSection } from '@/app/dashboard/_components/CareTimelineSection'
import { buildCareTimeline } from '@/lib/careTimeline'
import type { PersonRow } from '@/lib/types/people'
import type { SacramentalRecordRow } from '@/lib/types/sacramentalRecords'

type PersonHouseholdMembership = {
  memberId: string
  householdId: string
  householdName: string
  relationship: string
  isPrimaryContact: boolean
}

type LinkedRequest = {
  id: string
  request_type: string
  status: string
  child_name: string | null
  created_at: string
  linkSource: 'person_id' | 'parishioner_id'
}

type PersonCommunication = {
  id: string
  requestId: string
  requestLabel: string
  contacted_at: string
  method: string
  notes: string | null
}

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

export function PersonDetailPage() {
  const params = useParams()
  const personId = String(params?.id ?? '')

  const [person, setPerson] = useState<PersonRow | null>(null)
  const [households, setHouseholds] = useState<PersonHouseholdMembership[]>([])
  const [records, setRecords] = useState<SacramentalRecordRow[]>([])
  const [requests, setRequests] = useState<LinkedRequest[]>([])
  const [communications, setCommunications] = useState<PersonCommunication[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!personId) return

    async function load() {
      setLoading(true)
      setErrorMessage('')

      const { data: personRow, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('id', personId)
        .maybeSingle()

      if (personError) {
        devDashboardConsoleError('people detail', personError)
        setErrorMessage('Could not load this person.')
        setLoading(false)
        return
      }
      if (!personRow) {
        setErrorMessage('Person not found.')
        setLoading(false)
        return
      }

      const parsedPerson = parsePersonRow(personRow as Record<string, unknown>)
      setPerson(parsedPerson)

      const { data: memberRows } = await supabase
        .from('household_members')
        .select('id, household_id, relationship, is_primary_contact, households(name)')
        .eq('person_id', personId)
        .order('is_primary_contact', { ascending: false })

      const membershipList: PersonHouseholdMembership[] = []
      for (const raw of memberRows ?? []) {
        const row = raw as Record<string, unknown>
        const householdsRaw = row.households
        const householdName =
          householdsRaw != null &&
          typeof householdsRaw === 'object' &&
          !Array.isArray(householdsRaw)
            ? String((householdsRaw as Record<string, unknown>).name ?? '').trim()
            : ''
        membershipList.push({
          memberId: String(row.id),
          householdId: String(row.household_id),
          householdName: householdName || 'Household',
          relationship: String(row.relationship ?? '').trim(),
          isPrimaryContact: Boolean(row.is_primary_contact),
        })
      }
      setHouseholds(membershipList)

      const { data: recordRows } = await supabase
        .from('sacramental_records')
        .select('*')
        .eq('person_id', personId)
        .order('sacrament_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      setRecords(
        (recordRows ?? []).map((row) =>
          parseSacramentalRecordRow(row as Record<string, unknown>)
        )
      )

      let requestsQuery = supabase
        .from('requests')
        .select('id, request_type, status, child_name, created_at, person_id, parishioner_id')
        .order('created_at', { ascending: false })

      if (parsedPerson.parishioner_id) {
        requestsQuery = requestsQuery.or(
          `person_id.eq.${personId},parishioner_id.eq.${parsedPerson.parishioner_id}`
        )
      } else {
        requestsQuery = requestsQuery.eq('person_id', personId)
      }

      const { data: requestRows } = await requestsQuery
      const linkedRequests: LinkedRequest[] = (requestRows ?? []).map((row) => {
        const r = row as Record<string, unknown>
        const rowPersonId = r.person_id != null ? String(r.person_id).trim() : ''
        const linkSource: LinkedRequest['linkSource'] =
          rowPersonId === personId ? 'person_id' : 'parishioner_id'
        return {
          id: String(r.id),
          request_type: String(r.request_type ?? ''),
          status: String(r.status ?? ''),
          child_name: r.child_name != null ? String(r.child_name) : null,
          created_at: String(r.created_at ?? ''),
          linkSource,
        }
      })
      setRequests(linkedRequests)

      const requestIds = linkedRequests.map((r) => r.id)
      const commList: PersonCommunication[] = []

      if (requestIds.length > 0) {
        const { data: commRows } = await supabase
          .from('request_communications')
          .select('id, request_id, contacted_at, method, notes')
          .in('request_id', requestIds)
          .order('contacted_at', { ascending: false })

        const requestLabelById = new Map(
          linkedRequests.map((r) => [
            r.id,
            `${formatRequestType(r.request_type)} · ${formatRequestStatus(r.status)}`,
          ])
        )

        for (const raw of commRows ?? []) {
          const row = raw as Record<string, unknown>
          const requestId = String(row.request_id ?? '')
          commList.push({
            id: String(row.id),
            requestId,
            requestLabel: requestLabelById.get(requestId) ?? 'Request',
            contacted_at: String(row.contacted_at ?? ''),
            method: String(row.method ?? ''),
            notes: row.notes != null ? String(row.notes) : null,
          })
        }
      }

      setCommunications(commList)
      setLoading(false)
    }

    void load()
  }, [personId])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4" aria-busy="true">
        <p className="text-sm font-medium text-gray-700">Loading profile…</p>
      </div>
    )
  }

  if (errorMessage || !person) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/people"
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            ← Back to people
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
  const careTimelineEvents = buildCareTimeline({
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
          ← Back to people
        </Link>
      </p>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl break-words">
            {displayName}
          </h1>
          {contactParts.length > 0 || dobDisplay ? (
            <p className="mt-2 text-sm text-gray-600 break-words">
              {[contactParts.join(' · '), dobDisplay ? `DOB: ${dobDisplay}` : '']
                .filter(Boolean)
                .join(' · ')}
            </p>
          ) : null}
        </div>
        <Link
          href={`/dashboard/people/${person.id}/edit`}
          className={`${secondaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        >
          <Pencil className="h-4 w-4 shrink-0" aria-hidden />
          Edit
        </Link>
      </header>

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

        <CareTimelineSection events={careTimelineEvents} />

        <WorkflowSectionCard title="Households" description="Household memberships for this person.">
          {households.length === 0 ? (
            <p className="text-sm text-gray-700">Not linked to a household yet.</p>
          ) : (
            <ul className="space-y-3">
              {households.map((membership) => (
                <li key={membership.memberId}>
                  <Link
                    href={`/dashboard/households/${membership.householdId}`}
                    className="block rounded-xl border border-gray-200/90 bg-slate-50/80 px-4 py-3 text-sm transition hover:border-gray-300 hover:bg-white"
                  >
                    <p className="font-semibold text-gray-900">{membership.householdName}</p>
                    <p className="mt-1 text-gray-600">
                      {formatHouseholdRelationship(membership.relationship)}
                      {membership.isPrimaryContact ? ' · Primary contact' : ''}
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
                    href={`/dashboard/records/${record.id}`}
                    className="block rounded-xl border border-gray-200/90 bg-slate-50/80 px-4 py-3 transition hover:border-gray-300 hover:bg-white"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <SacramentalRecordTypeBadge recordType={record.record_type} />
                    </div>
                    <p className="mt-2 font-semibold text-gray-900 break-words">
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
                  parishioner: person ? { full_name: formatPersonDisplayName(person) } : null,
                })
                return (
                  <li key={request.id}>
                    <Link
                      href={`/dashboard/requests/${request.id}`}
                      aria-label={dashboardRequestOpenLabel(requestName)}
                      className={`${dashboardRequestLinkCardP4} !rounded-xl !p-4`}
                    >
                      <DashboardRequestNameLink name={requestName} embedded />
                      <p className="mt-1 text-sm text-gray-600">
                        {formatRequestType(request.request_type)}
                        {' · '}
                        {formatRequestStatus(request.status)}
                        {submitted ? ` · Submitted ${submitted}` : ''}
                        {subtitle ? ` · ${subtitle}` : ''}
                      </p>
                      {request.linkSource === 'parishioner_id' ? (
                        <p className="mt-1.5 text-xs text-amber-900/90">
                          Linked via intake contact — open the request to set a direct person link.
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
                    <p className="mt-2 text-sm text-gray-600">{maybeMissingValue('—')}</p>
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
