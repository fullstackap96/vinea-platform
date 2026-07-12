'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
import { householdDetailHref } from '@/lib/dashboardEntityNavigation'
import { coreRecordClientErrorMessage } from '@/lib/coreRecordClientMessages'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import type { HouseholdDetailResult } from '@/lib/server/loadHouseholdDetail'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

const initialNewMember: NewMemberDraft = {
  personId: '',
  relationship: 'head',
  isPrimaryContact: false,
}

export function EditHouseholdPage({
  household,
  members: loadedMembers,
  peopleOptions: loadedPeopleOptions,
  errorMessage,
  activeParishName,
}: HouseholdDetailResult) {
  const router = useRouter()
  const householdId = household?.id ?? ''

  const [values, setValues] = useState<HouseholdFormValues | null>(() =>
    householdToFormValues(household)
  )
  const [members, setMembers] = useState<HouseholdMemberFormRow[]>(() =>
    membersToFormRows(loadedMembers)
  )
  const [newMember, setNewMember] = useState<NewMemberDraft>(initialNewMember)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [addMemberMessage, setAddMemberMessage] = useState('')
  const mutationInFlightRef = useRef<'save' | 'add-member' | null>(null)

  function releaseMutation() {
    mutationInFlightRef.current = null
    setSaving(false)
    setAddingMember(false)
  }

  const memberPersonIds = useMemo(() => new Set(members.map((m) => m.personId)), [members])

  const availablePeopleOptions = useMemo(
    () => loadedPeopleOptions.filter((option) => !memberPersonIds.has(option.id)),
    [loadedPeopleOptions, memberPersonIds]
  )

  function handleMemberChange(memberId: string, patch: Partial<HouseholdMemberFormRow>) {
    setMembers((current) =>
      current.map((member) =>
        member.memberId === memberId ? { ...member, ...patch } : member
      )
    )
  }

  async function handleAddMember() {
    if (mutationInFlightRef.current || !householdId) return

    mutationInFlightRef.current = 'add-member'
    setAddingMember(true)
    setAddMemberMessage('')

    let result: Awaited<ReturnType<typeof addHouseholdMember>>
    try {
      result = await addHouseholdMember(householdId, {
        personId: newMember.personId,
        relationship: newMember.relationship,
        isPrimaryContact: newMember.isPrimaryContact,
      })
    } catch (error: unknown) {
      setAddMemberMessage(coreRecordClientErrorMessage('addHouseholdMember', error))
      releaseMutation()
      return
    }

    if (!result.ok) {
      setAddMemberMessage(coreRecordClientErrorMessage('addHouseholdMember', result.error))
      releaseMutation()
      return
    }

    setNewMember(initialNewMember)
    setAddMemberMessage('Member added. Refreshing household members...')
    releaseMutation()
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mutationInFlightRef.current || !values || !householdId) return

    mutationInFlightRef.current = 'save'
    setSaving(true)
    setMessage('')

    let householdResult: Awaited<ReturnType<typeof updateHousehold>>
    try {
      householdResult = await updateHousehold(householdId, formValuesToWriteInput(values))
    } catch (error: unknown) {
      setMessage(coreRecordClientErrorMessage('updateHousehold', error))
      releaseMutation()
      return
    }

    if (!householdResult.ok) {
      setMessage(coreRecordClientErrorMessage('updateHousehold', householdResult.error))
      releaseMutation()
      return
    }

    for (const member of members) {
      let memberResult: Awaited<ReturnType<typeof updateHouseholdMember>>
      try {
        memberResult = await updateHouseholdMember(member.memberId, householdId, {
          relationship: member.relationship,
          isPrimaryContact: member.isPrimaryContact,
        })
      } catch (error: unknown) {
        setMessage(coreRecordClientErrorMessage('updateHouseholdMember', error))
        releaseMutation()
        return
      }

      if (!memberResult.ok) {
        setMessage(
          coreRecordClientErrorMessage('updateHouseholdMember', memberResult.error),
        )
        releaseMutation()
        return
      }
    }

    router.push(householdDetailHref(householdId))
  }

  if (errorMessage || !household || !values) {
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

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href={householdDetailHref(householdId)}
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          &larr; Back to household
        </Link>
      </p>

      <h1 className={sectionHeadingClassName}>Edit household</h1>
      <p className="mb-2 max-w-xl text-sm leading-relaxed text-gray-600">
        Update address details and manage household members.
      </p>
      {activeParishName ? (
        <p className="mb-6 text-xs font-medium uppercase tracking-wide text-gray-500">
          Editing household for {activeParishName}
        </p>
      ) : null}

      <div className={vineaSectionShellClassName}>
        <HouseholdForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push(householdDetailHref(householdId))}
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
          operationBusy={saving || addingMember}
          addMemberMessage={addMemberMessage}
          peopleOptions={availablePeopleOptions}
        />
      </div>
    </main>
  )
}
