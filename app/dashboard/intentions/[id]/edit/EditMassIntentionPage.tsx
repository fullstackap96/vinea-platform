'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateMassIntention } from '../../actions'
import {
  MassIntentionForm,
  formValuesToWriteInput,
  massIntentionToFormValues,
  type MassIntentionFormValues,
} from '../../_components/MassIntentionForm'
import { massIntentionDetailHref } from '@/lib/dashboardEntityNavigation'
import { coreRecordClientErrorMessage } from '@/lib/coreRecordClientMessages'
import { mergeAssigneeDirectoryOptions } from '@/lib/parishAssigneeOptions'
import { parseParishSettingsResponse } from '@/lib/parishSettingsReadModels'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import type { MassIntentionRow } from '@/lib/types/massIntentions'

const PRIEST_DIRECTORY_READ_TIMEOUT_MS = 15_000

export function EditMassIntentionPage({
  intention,
  errorMessage,
  activeParishName,
}: {
  intention: MassIntentionRow | null
  errorMessage: string
  activeParishName: string | null
}) {
  const router = useRouter()
  const intentionId = intention?.id ?? ''

  const [values, setValues] = useState<MassIntentionFormValues | null>(
    intention ? massIntentionToFormValues(intention) : null
  )
  const [priestOptions, setPriestOptions] = useState<string[]>(
    mergeAssigneeDirectoryOptions([], intention?.assigned_priest_name ?? null)
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const saveInFlightRef = useRef(false)

  function releaseSave() {
    saveInFlightRef.current = false
    setSaving(false)
  }

  useEffect(() => {
    if (!intention) return

    const assignedPriestName = intention.assigned_priest_name
    let cancelled = false
    const controller = new AbortController()
    let readTimeoutId: number | undefined

    async function loadPriests() {
      try {
        readTimeoutId = window.setTimeout(
          () => controller.abort(),
          PRIEST_DIRECTORY_READ_TIMEOUT_MS,
        )
        const settingsRes = await fetch('/api/parish/settings', {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!settingsRes.ok) return
        const settings = parseParishSettingsResponse(await settingsRes.json(), null)
        if (!settings) return
        if (cancelled) return
        setPriestOptions(
          mergeAssigneeDirectoryOptions(settings.parish.priest_names, assignedPriestName),
        )
      } catch {
        // Priest directory is optional; free-text fallback remains available.
      } finally {
        if (readTimeoutId !== undefined) window.clearTimeout(readTimeoutId)
      }
    }

    void loadPriests()
    return () => {
      cancelled = true
      controller.abort()
      if (readTimeoutId !== undefined) window.clearTimeout(readTimeoutId)
    }
  }, [intention])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saveInFlightRef.current || !values || !intentionId) return

    saveInFlightRef.current = true
    setSaving(true)
    setMessage('')

    let result: Awaited<ReturnType<typeof updateMassIntention>>
    try {
      result = await updateMassIntention(intentionId, formValuesToWriteInput(values))
    } catch (error: unknown) {
      setMessage(coreRecordClientErrorMessage('updateMassIntention', error))
      releaseSave()
      return
    }

    if (!result.ok) {
      setMessage(coreRecordClientErrorMessage('updateMassIntention', result.error))
      releaseSave()
      return
    }

    router.push(massIntentionDetailHref(intentionId))
  }

  if (errorMessage || !values || !intention) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/intentions"
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            Back to Mass intentions
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
          href={massIntentionDetailHref(intentionId)}
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          Back to intention
        </Link>
      </p>

      <h1 className={sectionHeadingClassName}>Edit Mass intention</h1>
      <p className="mb-2 max-w-xl text-sm leading-relaxed text-gray-600">
        Update scheduling, stipend status, and fulfillment for this intention.
      </p>
      {activeParishName ? (
        <p className="mb-6 text-sm font-medium text-gray-700">Scoped to {activeParishName}.</p>
      ) : (
        <div className="mb-6" />
      )}

      <div className={vineaSectionShellClassName}>
        <MassIntentionForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push(massIntentionDetailHref(intentionId))}
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
