'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { updateSacramentalRecord, updateSacramentalRecordPersonLink } from '../../actions'
import {
  SacramentalRecordForm,
  formValuesToWriteInput,
  sacramentalRecordToFormValues,
  type SacramentalRecordFormValues,
} from '../../_components/SacramentalRecordForm'
import { PersonPickerField } from '../../_components/PersonPickerField'
import { recordDetailHref } from '@/lib/dashboardEntityNavigation'
import { sacramentalRecordClientErrorMessage } from '@/lib/sacramentalRecordClientMessages'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import type { SacramentalRecordDetailResult } from '@/lib/server/loadSacramentalRecordDetail'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

export function EditSacramentalRecordPage({
  record,
  peopleOptions,
  errorMessage,
  activeParishName,
}: SacramentalRecordDetailResult) {
  const router = useRouter()
  const recordId = record?.id ?? ''

  const [values, setValues] = useState<SacramentalRecordFormValues | null>(() =>
    sacramentalRecordToFormValues(record)
  )
  const [personId, setPersonId] = useState<string | null>(record?.person_id ?? null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const saveInFlightRef = useRef(false)

  function releaseSave() {
    saveInFlightRef.current = false
    setSaving(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saveInFlightRef.current || !values || !recordId) return

    saveInFlightRef.current = true
    setSaving(true)
    setMessage('')

    let recordResult: Awaited<ReturnType<typeof updateSacramentalRecord>>
    try {
      recordResult = await updateSacramentalRecord(recordId, formValuesToWriteInput(values))
    } catch (error: unknown) {
      setMessage(sacramentalRecordClientErrorMessage('updateRecord', error))
      releaseSave()
      return
    }

    if (!recordResult.ok) {
      setMessage(sacramentalRecordClientErrorMessage('updateRecord', recordResult.error))
      releaseSave()
      return
    }

    let linkResult: Awaited<ReturnType<typeof updateSacramentalRecordPersonLink>>
    try {
      linkResult = await updateSacramentalRecordPersonLink(recordId, personId)
    } catch (error: unknown) {
      setMessage(sacramentalRecordClientErrorMessage('updatePersonLink', error))
      releaseSave()
      return
    }

    if (!linkResult.ok) {
      setMessage(sacramentalRecordClientErrorMessage('updatePersonLink', linkResult.error))
      releaseSave()
      return
    }

    router.push(recordDetailHref(recordId))
  }

  if (errorMessage || !record || !values) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/records"
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            &larr; Back to records
          </Link>
        </p>
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage || 'Record not found.'}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href={recordDetailHref(recordId)}
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          &larr; Back to record
        </Link>
      </p>

      <h1 className={sectionHeadingClassName}>Edit sacramental record</h1>
      <p className="mb-2 max-w-xl text-sm leading-relaxed text-gray-600">
        Update register information. Changes are saved to your parish records.
      </p>
      {activeParishName ? (
        <p className="mb-6 text-xs font-medium uppercase tracking-wide text-gray-500">
          Editing record for {activeParishName}
        </p>
      ) : null}

      <div className={`mb-6 ${vineaSectionShellClassName}`}>
        <PersonPickerField
          value={personId}
          onChange={setPersonId}
          peopleOptions={peopleOptions}
          disabled={saving}
          idPrefix="edit-record-person"
        />
      </div>

      <div className={vineaSectionShellClassName}>
        <SacramentalRecordForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push(recordDetailHref(recordId))}
          submitLabel="Save changes"
          saving={saving}
          message={message}
          idPrefix="edit-record"
        />
      </div>
    </main>
  )
}
