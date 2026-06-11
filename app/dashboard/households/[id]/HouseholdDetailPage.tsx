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
import { devDashboardConsoleError } from '@/lib/dashboardSupabaseError'
import {
  formatHouseholdAddressLine,
  formatHouseholdMemberLabel,
  formatHouseholdRelationship,
  parseHouseholdMemberWithPerson,
  parseHouseholdRow,
} from '@/lib/households'
import { maybeMissingValue } from '@/lib/missingValue'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import { supabase } from '@/lib/supabase'
import type { HouseholdMemberWithPerson, HouseholdRow } from '@/lib/types/households'

function displayValue(value: string | null | undefined) {
  const s = String(value ?? '').trim()
  return s ? s : maybeMissingValue('Not set')
}

export function HouseholdDetailPage() {
  const params = useParams()
  const householdId = String(params?.id ?? '')

  const [household, setHousehold] = useState<HouseholdRow | null>(null)
  const [members, setMembers] = useState<HouseholdMemberWithPerson[]>([])
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
          'id, parish_id, household_id, person_id, relationship, is_primary_contact, created_at, people(id, first_name, middle_name, last_name, email, phone)'
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
