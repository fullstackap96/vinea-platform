'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { updateSacramentalRecord, updateSacramentalRecordPersonLink } from '../../actions'
import {
  SacramentalRecordForm,
  formValuesToWriteInput,
  sacramentalRecordToFormValues,
} from '../../_components/SacramentalRecordForm'
import {
  PersonPickerField,
  personRowsToPickerOptions,
  type PersonPickerOption,
} from '../../_components/PersonPickerField'
import { devDashboardConsoleError } from '@/lib/dashboardSupabaseError'
import { parseSacramentalRecordRow } from '@/lib/sacramentalRecords'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { supabase } from '@/lib/supabase'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import type { SacramentalRecordFormValues } from '../../_components/SacramentalRecordForm'

export function EditSacramentalRecordPage() {
  const params = useParams()
  const router = useRouter()
  const recordId = String(params?.id ?? '')

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [values, setValues] = useState<SacramentalRecordFormValues | null>(null)
  const [personId, setPersonId] = useState<string | null>(null)
  const [peopleOptions, setPeopleOptions] = useState<PersonPickerOption[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!recordId) return

    async function load() {
      setLoading(true)
      setErrorMessage('')

      const [{ data, error }, { data: peopleRows, error: peopleError }] = await Promise.all([
        supabase.from('sacramental_records').select('*').eq('id', recordId).maybeSingle(),
        supabase
          .from('people')
          .select('id, first_name, middle_name, last_name')
          .order('last_name', { ascending: true })
          .order('first_name', { ascending: true }),
      ])

      if (error) {
        devDashboardConsoleError('sacramental_records edit load', error)
        setErrorMessage('Could not load this record.')
        setLoading(false)
        return
      }
      if (!data) {
        setErrorMessage('Record not found.')
        setLoading(false)
        return
      }

      if (peopleError) {
        devDashboardConsoleError('people (record edit picker)', peopleError)
      }

      const parsed = parseSacramentalRecordRow(data as Record<string, unknown>)
      setValues(sacramentalRecordToFormValues(parsed))
      setPersonId(parsed.person_id)
      setPeopleOptions(personRowsToPickerOptions((peopleRows ?? []) as Record<string, unknown>[]))
      setLoading(false)
    }

    void load()
  }, [recordId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values) return

    setSaving(true)
    setMessage('')

    const recordResult = await updateSacramentalRecord(recordId, formValuesToWriteInput(values))
    if (!recordResult.ok) {
      setSaving(false)
      setMessage(recordResult.error)
      return
    }

    const linkResult = await updateSacramentalRecordPersonLink(recordId, personId)
    setSaving(false)

    if (!linkResult.ok) {
      setMessage(linkResult.error)
      return
    }

    router.push(`/dashboard/records/${recordId}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4" aria-busy="true">
        <p className="text-sm font-medium text-gray-700">Loading record…</p>
      </div>
    )
  }

  if (errorMessage || !values) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/records"
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            ← Back to records
          </Link>
        </p>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950" role="alert">
          {errorMessage || 'Record not found.'}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href={`/dashboard/records/${recordId}`}
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          ← Back to record
        </Link>
      </p>

      <h1 className={sectionHeadingClassName}>Edit sacramental record</h1>
      <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-600">
        Update register information. Changes are saved to your parish records.
      </p>

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
          onCancel={() => router.push(`/dashboard/records/${recordId}`)}
          submitLabel="Save changes"
          saving={saving}
          message={message}
          idPrefix="edit-record"
        />
      </div>
    </main>
  )
}
