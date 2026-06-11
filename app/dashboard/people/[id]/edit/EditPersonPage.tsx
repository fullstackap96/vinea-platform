'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { updatePerson } from '../../actions'
import {
  PersonForm,
  formValuesToWriteInput,
  personToFormValues,
  type PersonFormValues,
} from '../../_components/PersonForm'
import { devDashboardConsoleError } from '@/lib/dashboardSupabaseError'
import { parsePersonRow } from '@/lib/people'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { supabase } from '@/lib/supabase'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

export function EditPersonPage() {
  const params = useParams()
  const router = useRouter()
  const personId = String(params?.id ?? '')

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [values, setValues] = useState<PersonFormValues | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!personId) return

    async function load() {
      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', personId)
        .maybeSingle()

      if (error) {
        devDashboardConsoleError('people edit load', error)
        setErrorMessage('Could not load this person.')
        setLoading(false)
        return
      }
      if (!data) {
        setErrorMessage('Person not found.')
        setLoading(false)
        return
      }

      setValues(personToFormValues(parsePersonRow(data as Record<string, unknown>)))
      setLoading(false)
    }

    void load()
  }, [personId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values) return

    setSaving(true)
    setMessage('')

    const result = await updatePerson(personId, formValuesToWriteInput(values))
    setSaving(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    router.push(`/dashboard/people/${personId}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4" aria-busy="true">
        <p className="text-sm font-medium text-gray-700">Loading person…</p>
      </div>
    )
  }

  if (errorMessage || !values) {
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

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href={`/dashboard/people/${personId}`}
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          ← Back to profile
        </Link>
      </p>

      <h1 className={sectionHeadingClassName}>Edit person</h1>
      <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-600">
        Update contact details and notes for this parishioner profile.
      </p>

      <div className={vineaSectionShellClassName}>
        <PersonForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/dashboard/people/${personId}`)}
          submitLabel="Save changes"
          saving={saving}
          message={message}
          idPrefix="edit-person"
        />
      </div>
    </main>
  )
}
