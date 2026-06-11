'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { updateMassIntention } from '../../actions'
import {
  MassIntentionForm,
  formValuesToWriteInput,
  massIntentionToFormValues,
  type MassIntentionFormValues,
} from '../../_components/MassIntentionForm'
import { devDashboardConsoleError } from '@/lib/dashboardSupabaseError'
import { parseMassIntentionRow } from '@/lib/massIntentions'
import { mergeAssigneeDirectoryOptions } from '@/lib/parishAssigneeOptions'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { supabase } from '@/lib/supabase'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

export function EditMassIntentionPage() {
  const params = useParams()
  const router = useRouter()
  const intentionId = String(params?.id ?? '')

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [values, setValues] = useState<MassIntentionFormValues | null>(null)
  const [priestOptions, setPriestOptions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!intentionId) return

    async function load() {
      setLoading(true)
      setErrorMessage('')

      const [intentionRes, settingsRes] = await Promise.all([
        supabase.from('mass_intentions').select('*').eq('id', intentionId).maybeSingle(),
        fetch('/api/parish/settings', { credentials: 'include' }),
      ])

      const { data, error } = intentionRes

      if (error) {
        devDashboardConsoleError('mass_intentions edit load', error)
        setErrorMessage('Could not load this intention.')
        setLoading(false)
        return
      }
      if (!data) {
        setErrorMessage('Intention not found.')
        setLoading(false)
        return
      }

      const parsed = parseMassIntentionRow(data as Record<string, unknown>)
      setValues(massIntentionToFormValues(parsed))

      if (settingsRes.ok) {
        try {
          const settings = (await settingsRes.json()) as { priest_names?: string[] }
          setPriestOptions(
            mergeAssigneeDirectoryOptions(settings.priest_names, parsed.assigned_priest_name)
          )
        } catch {
          setPriestOptions(mergeAssigneeDirectoryOptions([], parsed.assigned_priest_name))
        }
      } else {
        setPriestOptions(mergeAssigneeDirectoryOptions([], parsed.assigned_priest_name))
      }

      setLoading(false)
    }

    void load()
  }, [intentionId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values) return

    setSaving(true)
    setMessage('')

    const result = await updateMassIntention(intentionId, formValuesToWriteInput(values))
    setSaving(false)

    if (!result.ok) {
      setMessage(result.error)
      return
    }

    router.push(`/dashboard/intentions/${intentionId}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4" aria-busy="true">
        <p className="text-sm font-medium text-gray-700">Loading intention…</p>
      </div>
    )
  }

  if (errorMessage || !values) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/intentions"
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            ← Back to Mass intentions
          </Link>
        </p>
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage || 'Intention not found.'}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href={`/dashboard/intentions/${intentionId}`}
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          ← Back to intention
        </Link>
      </p>

      <h1 className={sectionHeadingClassName}>Edit Mass intention</h1>
      <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-600">
        Update scheduling, stipend status, and fulfillment for this intention.
      </p>

      <div className={vineaSectionShellClassName}>
        <MassIntentionForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/dashboard/intentions/${intentionId}`)}
          submitLabel="Save changes"
          saving={saving}
          message={message}
          priestOptions={priestOptions}
          idPrefix="edit-intention"
        />
      </div>
    </main>
  )
}
