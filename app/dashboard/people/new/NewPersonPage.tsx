'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createPerson } from '../actions'
import {
  PersonForm,
  formValuesToWriteInput,
  type PersonFormValues,
} from '../_components/PersonForm'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

const initialValues: PersonFormValues = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  notes: '',
}

export function NewPersonPage() {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const result = await createPerson(formValuesToWriteInput(values))
    setSaving(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    router.push(`/dashboard/people/${result.personId}`)
  }

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

      <h1 className={sectionHeadingClassName}>New person</h1>
      <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-600">
        Add a parishioner profile with contact details. You can link households and requests later.
      </p>

      <div className={vineaSectionShellClassName}>
        <PersonForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/people')}
          submitLabel="Save person"
          saving={saving}
          message={message}
          idPrefix="new-person"
        />
      </div>
    </main>
  )
}
