'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  PersonForm,
  formValuesToWriteInput,
  personToFormValues,
  type PersonFormValues,
} from '../../_components/PersonForm'
import { updatePerson } from '../../actions'
import { personDetailHref } from '@/lib/dashboardEntityNavigation'
import { coreRecordClientErrorMessage } from '@/lib/coreRecordClientMessages'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import type { PersonDetailResult } from '@/lib/server/loadPersonDetail'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

export function EditPersonPage({
  person,
  errorMessage,
  activeParishName,
}: PersonDetailResult) {
  const router = useRouter()
  const personId = person?.id ?? ''

  const [values, setValues] = useState<PersonFormValues | null>(
    person ? personToFormValues(person) : null
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const saveInFlightRef = useRef(false)

  function releaseSave() {
    saveInFlightRef.current = false
    setSaving(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saveInFlightRef.current || !values || !personId) return

    saveInFlightRef.current = true
    setSaving(true)
    setMessage('')

    let result: Awaited<ReturnType<typeof updatePerson>>
    try {
      result = await updatePerson(personId, formValuesToWriteInput(values))
    } catch (error: unknown) {
      setMessage(coreRecordClientErrorMessage('updatePerson', error))
      releaseSave()
      return
    }

    if (!result.ok) {
      setMessage(coreRecordClientErrorMessage('updatePerson', result.error))
      releaseSave()
      return
    }

    router.push(personDetailHref(personId))
  }

  if (errorMessage || !values || !person) {
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

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href={personDetailHref(personId)}
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          Back to profile
        </Link>
      </p>

      <h1 className={sectionHeadingClassName}>Edit person</h1>
      <p className="mb-2 max-w-xl text-sm leading-relaxed text-gray-600">
        Update contact details and notes for this parishioner profile.
      </p>
      {activeParishName ? (
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.08em] text-blue-900">
          Scoped to {activeParishName}.
        </p>
      ) : (
        <div className="mb-6" />
      )}

      <div className={vineaSectionShellClassName}>
        <PersonForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push(personDetailHref(personId))}
          submitLabel="Save changes"
          saving={saving}
          message={message}
          idPrefix="edit-person"
        />
      </div>
    </main>
  )
}
