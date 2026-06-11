'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSacramentalRecord } from '../actions'
import {
  SacramentalRecordForm,
  formValuesToWriteInput,
  type SacramentalRecordFormValues,
} from '../_components/SacramentalRecordForm'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

const initialValues: SacramentalRecordFormValues = {
  recordType: 'baptism',
  personName: '',
  sacramentDate: '',
  place: '',
  minister: '',
  book: '',
  page: '',
  line: '',
  notes: '',
}

export function NewSacramentalRecordPage() {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const result = await createSacramentalRecord(formValuesToWriteInput(values))
    setSaving(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    router.push(`/dashboard/records/${result.recordId}`)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href="/dashboard/records"
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          ← Back to records
        </Link>
      </p>

      <h1 className={sectionHeadingClassName}>New sacramental record</h1>
      <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-600">
        Enter register information as it should appear in your parish records. You can edit this
        later.
      </p>

      <div className={vineaSectionShellClassName}>
        <SacramentalRecordForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/records')}
          submitLabel="Save record"
          saving={saving}
          message={message}
          idPrefix="new-record"
        />
      </div>
    </main>
  )
}
