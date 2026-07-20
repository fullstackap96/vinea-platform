'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createMassIntention } from '../actions'
import {
  MassIntentionForm,
  formValuesToWriteInput,
  type MassIntentionFormValues,
} from '../_components/MassIntentionForm'
import { massIntentionDetailHref } from '@/lib/dashboardEntityNavigation'
import { coreRecordClientErrorMessage } from '@/lib/coreRecordClientMessages'
import { mergeAssigneeDirectoryOptions } from '@/lib/parishAssigneeOptions'
import { parseParishSettingsResponse } from '@/lib/parishSettingsReadModels'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaSectionShellClassName } from '@/lib/vineaUi'

const PRIEST_DIRECTORY_READ_TIMEOUT_MS = 15_000

const initialValues: MassIntentionFormValues = {
  requesterName: '',
  intentionText: '',
  requestedDate: '',
  assignedMassDate: '',
  assignedPriestName: '',
  stipendReceived: false,
  isFulfilled: false,
  notes: '',
}

export function NewMassIntentionPage() {
  const router = useRouter()
  const [values, setValues] = useState(initialValues)
  const [priestOptions, setPriestOptions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const createInFlightRef = useRef(false)

  function releaseCreate() {
    createInFlightRef.current = false
    setSaving(false)
  }

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    let readTimeoutId: number | undefined

    async function loadPriests() {
      try {
        readTimeoutId = window.setTimeout(
          () => controller.abort(),
          PRIEST_DIRECTORY_READ_TIMEOUT_MS,
        )
        const res = await fetch('/api/parish/settings', {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!res.ok) return
        const parsed = parseParishSettingsResponse(await res.json(), null)
        if (!parsed) return
        if (cancelled) return
        setPriestOptions(mergeAssigneeDirectoryOptions(parsed.parish.priest_names))
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
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (createInFlightRef.current) return

    createInFlightRef.current = true
    setSaving(true)
    setMessage('')

    let result: Awaited<ReturnType<typeof createMassIntention>>
    try {
      result = await createMassIntention(formValuesToWriteInput(values))
    } catch (error: unknown) {
      setMessage(coreRecordClientErrorMessage('createMassIntention', error))
      releaseCreate()
      return
    }

    if (!result.ok) {
      setMessage(coreRecordClientErrorMessage('createMassIntention', result.error))
      releaseCreate()
      return
    }

    router.push(massIntentionDetailHref(result.intentionId))
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href="/dashboard/intentions"
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          ← Back to Mass intentions
        </Link>
      </p>

      <h1 className={sectionHeadingClassName}>New Mass intention</h1>
      <p className="mb-6 max-w-xl text-sm leading-relaxed text-gray-600">
        Record a Mass intention request from the parish office or mail.
      </p>

      <div className={vineaSectionShellClassName}>
        <MassIntentionForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/intentions')}
          submitLabel="Save intention"
          saving={saving}
          message={message}
          priestOptions={priestOptions}
          idPrefix="new-intention"
        />
      </div>
    </main>
  )
}
