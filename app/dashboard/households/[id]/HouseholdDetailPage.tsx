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
import { CareTimelineSection } from '@/app/dashboard/_components/CareTimelineSection'
import { devDashboardConsoleError } from '@/lib/dashboardSupabaseError'
import {
  buildHouseholdCareTimeline,
  type CareTimelineCommunication,
  type CareTimelineRequest,
} from '@/lib/careTimeline'
import { formatRequestType } from '@/lib/formatRequestType'
import {
  formatHouseholdAddressLine,
  formatHouseholdMemberLabel,
  formatHouseholdRelationship,
  parseHouseholdMemberWithPerson,
  parseHouseholdRow,
} from '@/lib/households'
import { maybeMissingValue } from '@/lib/missingValue'
import { parseSacramentalRecordRow } from '@/lib/sacramentalRecords'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import { supabase } from '@/lib/supabase'
import type { HouseholdMemberWithPerson, HouseholdRow } from '@/lib/types/households'
import type { SacramentalRecordRow } from '@/lib/types/sacramentalRecords'

function displayValue(value: string | null | undefined) {
  const s = String(value ?? '').trim()
  return s ? s : maybeMissingValue('Not set')
}

function parseTimelineRequest(row: Record<string, unknown>): CareTimelineRequest {
  return {
    id: String(row.id),
    request_type: String(row.request_type ?? ''),
    status: String(row.status ?? ''),
    child_name: row.child_name != null ? String(row.child_name) : null,
    created_at: String(row.created_at ?? ''),
    last_contacted_at: row.last_contacted_at != null ? String(row.last_contacted_at) : null,
    next_follow_up_date:
      row.next_follow_up_date != null ? String(row.next_follow_up_date) : null,
    assigned_staff_name:
      row.assigned_staff_name != null ? String(row.assigned_staff_name) : null,
    assigned_priest_name:
      row.assigned_priest_name != null ? String(row.assigned_priest_name) : null,
    assigned_deacon_name:
      row.assigned_deacon_name != null ? String(row.assigned_deacon_name) : null,
  }
}

function membershipPersonParishionerIds(rows: readonly unknown[]): string[] {
  const ids = new Set<string>()
  for (const raw of rows) {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) continue
    const row = raw as Record<string, unknown>
    const peopleRaw = row.people
    if (peopleRaw == null || typeof peopleRaw !== 'object' || Array.isArray(peopleRaw)) continue
    const parishionerId = String(
      (peopleRaw as Record<string, unknown>).parishioner_id ?? ''
    ).trim()
    if (parishionerId) ids.add(parishionerId)
  }
  return Array.from(ids)
}

export function HouseholdDetailPage() {
  const params = useParams()
  const householdId = String(params?.id ?? '')

  const [household, setHousehold] = useState<HouseholdRow | null>(null)
  const [members, setMembers] = useState<HouseholdMemberWithPerson[]>([])
  const [requests, setRequests] = useState<CareTimelineRequest[]>([])
  const [records, setRecords] = useState<SacramentalRecordRow[]>([])
  const [communications, setCommunications] = useState<CareTimelineCommunication[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!householdId) return

    async function load() {
      setLoading(true)
      setErrorMessage('')

      const { data: householdRow, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', householdId)
        .maybeSingle()

      if (householdError) {
        devDashboardConsoleError('households detail', householdError)
        setErrorMessage('Could not load this household.')
        setLoading(false)
        return
      }
      if (!householdRow) {
        setErrorMessage('Household not found.')
        setLoading(false)
        return
      }

      setHousehold(parseHouseholdRow(householdRow as Record<string, unknown>))

      const { data: memberRows } = await supabase
        .from('household_members')
        .select(
          'id, parish_id, household_id, person_id, relationship, is_primary_contact, created_at, people(id, parishioner_id, first_name, middle_name, last_name, email, phone)'
        )
        .eq('household_id', householdId)
        .order('is_primary_contact', { ascending: false })

      setMembers(
        (memberRows ?? []).map((row) => {
          const raw = row as Record<string, unknown>
          const peopleRaw = raw.people
          const personObj =
            peopleRaw != null && typeof peopleRaw === 'object' && !Array.isArray(peopleRaw)
              ? (peopleRaw as Record<string, unknown>)
              : {}
          return parseHouseholdMemberWithPerson({
            ...raw,
            person: personObj,
          })
        })
      )

      const personIds = (memberRows ?? [])
        .map((row) => String((row as Record<string, unknown>).person_id ?? '').trim())
        .filter(Boolean)
      const parishionerIds = membershipPersonParishionerIds(memberRows ?? [])

      if (personIds.length > 0) {
        const requestById = new Map<string, CareTimelineRequest>()
        const requestSelect =
          'id, request_type, status, child_name, created_at, last_contacted_at, next_follow_up_date, assigned_staff_name, assigned_priest_name, assigned_deacon_name, person_id, parishioner_id'

        const { data: directRequestRows } = await supabase
          .from('requests')
          .select(requestSelect)
          .in('person_id', personIds)
          .order('created_at', { ascending: false })

        for (const row of directRequestRows ?? []) {
          const parsed = parseTimelineRequest(row as Record<string, unknown>)
          requestById.set(parsed.id, parsed)
        }

        if (parishionerIds.length > 0) {
          const { data: contactRequestRows } = await supabase
            .from('requests')
            .select(requestSelect)
            .in('parishioner_id', parishionerIds)
            .order('created_at', { ascending: false })

          for (const row of contactRequestRows ?? []) {
            const parsed = parseTimelineRequest(row as Record<string, unknown>)
            requestById.set(parsed.id, parsed)
          }
        }

        const householdRequests = Array.from(requestById.values()).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setRequests(householdRequests)

        const { data: recordRows } = await supabase
          .from('sacramental_records')
          .select('*')
          .in('person_id', personIds)
          .order('sacrament_date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })

        setRecords(
          (recordRows ?? []).map((row) =>
            parseSacramentalRecordRow(row as Record<string, unknown>)
          )
        )

        const requestIds = householdRequests.map((request) => request.id)
        if (requestIds.length > 0) {
          const { data: commRows } = await supabase
            .from('request_communications')
            .select('id, request_id, contacted_at, method, notes')
            .in('request_id', requestIds)
            .order('contacted_at', { ascending: false })

          const labelByRequestId = new Map(
            householdRequests.map((request) => [request.id, formatRequestType(request.request_type)])
          )
          setCommunications(
            (commRows ?? []).map((row) => {
              const raw = row as Record<string, unknown>
              const requestId = String(raw.request_id ?? '')
              return {
                id: String(raw.id),
                requestId,
                requestLabel: labelByRequestId.get(requestId) ?? 'Request',
                contacted_at: String(raw.contacted_at ?? ''),
                method: String(raw.method ?? ''),
                notes: raw.notes != null ? String(raw.notes) : null,
              }
            })
          )
        } else {
          setCommunications([])
        }
      } else {
        setRequests([])
        setRecords([])
        setCommunications([])
      }

      setLoading(false)
    }

    void load()
  }, [householdId])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4" aria-busy="true">
        <p className="text-sm font-medium text-gray-700">Loading household…</p>
      </div>
    )
  }

  if (errorMessage || !household) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/households"
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            ← Back to households
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
          ← Back to households
        </Link>
      </p>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl break-words">
            {household.name}
          </h1>
          {addressLine ? (
            <p className="mt-2 text-sm text-gray-600 break-words">{addressLine}</p>
          ) : null}
        </div>
        <Link
          href={`/dashboard/households/${household.id}/edit`}
          className={`${secondaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        >
          <Pencil className="h-4 w-4 shrink-0" aria-hidden />
          Edit
        </Link>
      </header>

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
                href={`/dashboard/households/${household.id}/edit`}
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
                    href={`/dashboard/people/${member.person_id}`}
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
