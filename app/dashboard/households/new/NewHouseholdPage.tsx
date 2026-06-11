'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createHousehold } from '../actions'
import {
  HouseholdForm,
  formValuesToWriteInput,
  type HouseholdFormValues,
} from '../_components/HouseholdForm'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

const initialValues: HouseholdFormValues = {
  name: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  notes: '',
}

export function NewHouseholdPage() {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const result = await createHousehold(formValuesToWriteInput(values))
    setSaving(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    router.push(`/dashboard/households/${result.householdId}/edit`)
  }

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

      <h1 className={sectionHeadingClassName}>New household</h1>
      <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-600">
        Enter household name and address. You can add members on the next screen.
      </p>

      <div className={vineaSectionShellClassName}>
        <HouseholdForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/households')}
          submitLabel="Save household"
          saving={saving}
          message={message}
          idPrefix="new-household"
        />
      </div>
    </main>
  )
}
