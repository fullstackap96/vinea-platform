'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  addHouseholdMember,
  updateHousehold,
  updateHouseholdMember,
} from '../../actions'
import {
  HouseholdForm,
  formValuesToWriteInput,
  householdToFormValues,
  membersToFormRows,
  type HouseholdFormValues,
  type HouseholdMemberFormRow,
  type NewMemberDraft,
} from '../../_components/HouseholdForm'
import { devDashboardConsoleError } from '@/lib/dashboardSupabaseError'
import {
  parseHouseholdMemberWithPerson,
  parseHouseholdRow,
} from '@/lib/households'
import { formatPersonDisplayName, parsePersonRow } from '@/lib/people'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { supabase } from '@/lib/supabase'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

const initialNewMember: NewMemberDraft = {
  personId: '',
  relationship: 'head',
  isPrimaryContact: false,
}

export function EditHouseholdPage() {
  const params = useParams()
  const router = useRouter()
  const householdId = String(params?.id ?? '')

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [values, setValues] = useState<HouseholdFormValues | null>(null)
  const [members, setMembers] = useState<HouseholdMemberFormRow[]>([])
  const [peopleOptions, setPeopleOptions] = useState<{ id: string; label: string }[]>([])
  const [newMember, setNewMember] = useState<NewMemberDraft>(initialNewMember)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [addMemberMessage, setAddMemberMessage] = useState('')

  const memberPersonIds = useMemo(() => new Set(members.map((m) => m.personId)), [members])

  const availablePeopleOptions = useMemo(
    () => peopleOptions.filter((option) => !memberPersonIds.has(option.id)),
    [peopleOptions, memberPersonIds]
  )

  const reloadMembers = useCallback(async () => {
    const { data: memberRows } = await supabase
      .from('household_members')
      .select(
        'id, parish_id, household_id, person_id, relationship, is_primary_contact, created_at, people(id, first_name, middle_name, last_name, email, phone)'
      )
      .eq('household_id', householdId)
      .order('is_primary_contact', { ascending: false })

    const parsed = (memberRows ?? []).map((row) => {
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

    setMembers(membersToFormRows(parsed))
  }, [householdId])

  useEffect(() => {
    if (!householdId) return

    async function load() {
      setLoading(true)
      setErrorMessage('')

      const [{ data: householdRow, error: householdError }, { data: peopleRows, error: peopleError }] =
        await Promise.all([
          supabase.from('households').select('*').eq('id', householdId).maybeSingle(),
          supabase
            .from('people')
            .select('id, first_name, middle_name, last_name')
            .order('last_name', { ascending: true })
            .order('first_name', { ascending: true }),
        ])

      if (householdError) {
        devDashboardConsoleError('households edit load', householdError)
        setErrorMessage('Could not load this household.')
        setLoading(false)
        return
      }
      if (!householdRow) {
        setErrorMessage('Household not found.')
        setLoading(false)
        return
      }

      if (peopleError) {
        devDashboardConsoleError('people options load', peopleError)
      }

      setValues(householdToFormValues(parseHouseholdRow(householdRow as Record<string, unknown>)))
      setPeopleOptions(
        (peopleRows ?? []).map((row) => {
          const person = parsePersonRow(row as Record<string, unknown>)
          return {
            id: person.id,
            label: formatPersonDisplayName(person),
          }
        })
      )

      await reloadMembers()
      setLoading(false)
    }

    void load()
  }, [householdId, reloadMembers])

  function handleMemberChange(memberId: string, patch: Partial<HouseholdMemberFormRow>) {
    setMembers((current) =>
      current.map((member) =>
        member.memberId === memberId ? { ...member, ...patch } : member
      )
    )
  }

  async function handleAddMember() {
    setAddingMember(true)
    setAddMemberMessage('')

    const result = await addHouseholdMember(householdId, {
      personId: newMember.personId,
      relationship: newMember.relationship,
      isPrimaryContact: newMember.isPrimaryContact,
    })

    setAddingMember(false)

    if (!result.ok) {
      setAddMemberMessage(result.error)
      return
    }

    setNewMember(initialNewMember)
    await reloadMembers()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values) return

    setSaving(true)
    setMessage('')

    const householdResult = await updateHousehold(householdId, formValuesToWriteInput(values))
    if (!householdResult.ok) {
      setSaving(false)
      setMessage(householdResult.error)
      return
    }

    for (const member of members) {
      const memberResult = await updateHouseholdMember(member.memberId, householdId, {
        relationship: member.relationship,
        isPrimaryContact: member.isPrimaryContact,
      })
      if (!memberResult.ok) {
        setSaving(false)
        setMessage(memberResult.error)
        return
      }
    }

    setSaving(false)
    router.push(`/dashboard/households/${householdId}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4" aria-busy="true">
        <p className="text-sm font-medium text-gray-700">Loading household…</p>
      </div>
    )
  }

  if (errorMessage || !values) {
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

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href={`/dashboard/households/${householdId}`}
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          ← Back to household
        </Link>
      </p>

      <h1 className={sectionHeadingClassName}>Edit household</h1>
      <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-600">
        Update address details and manage household members.
      </p>

      <div className={vineaSectionShellClassName}>
        <HouseholdForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/dashboard/households/${householdId}`)}
          submitLabel="Save changes"
          saving={saving}
          message={message}
          idPrefix="edit-household"
          members={members}
          onMemberChange={handleMemberChange}
          newMember={newMember}
          onNewMemberChange={setNewMember}
          onAddMember={handleAddMember}
          addingMember={addingMember}
          addMemberMessage={addMemberMessage}
          peopleOptions={availablePeopleOptions}
        />
      </div>
    </main>
  )
}
