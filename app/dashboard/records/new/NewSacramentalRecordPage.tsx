'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSacramentalRecord, loadSacramentalRecordRequestPrefill } from '../actions'
import {
  SacramentalRecordForm,
  formValuesToWriteInput,
  type SacramentalRecordFormValues,
} from '../_components/SacramentalRecordForm'
import { recordDetailHref } from '@/lib/dashboardEntityNavigation'
import { requestDetailHref } from '@/lib/dashboardRequestNavigation'
import { sacramentalRecordClientErrorMessage } from '@/lib/sacramentalRecordClientMessages'
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
  const searchParams = useSearchParams()
  const requestIdParam = String(searchParams.get('requestId') ?? '').trim()

  const [values, setValues] = useState<SacramentalRecordFormValues>(initialValues)
  const [prefillRequestId, setPrefillRequestId] = useState<string | null>(null)
  const [prefillPersonId, setPrefillPersonId] = useState<string | null>(null)
  const [prefillNotice, setPrefillNotice] = useState('')
  const [prefillLoading, setPrefillLoading] = useState(Boolean(requestIdParam))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const createInFlightRef = useRef(false)

  function releaseCreate() {
    createInFlightRef.current = false
    setSaving(false)
  }

  useEffect(() => {
    if (!requestIdParam) return

    let cancelled = false

    async function loadPrefill() {
      setPrefillLoading(true)
      setPrefillNotice('')
      setMessage('')

      const result = await loadSacramentalRecordRequestPrefill(requestIdParam)

      if (cancelled) return

      if (!result.ok) {
        setMessage(sacramentalRecordClientErrorMessage('loadPrefill', result.error))
        setPrefillLoading(false)
        return
      }

      setValues(result.values)
      setPrefillRequestId(result.requestId)
      setPrefillPersonId(result.personId)
      setPrefillNotice(
        'Fields prefilled from the completed request. Review and click Save record when ready — nothing is saved until then.'
      )
      setPrefillLoading(false)
    }

    void loadPrefill()
    return () => {
      cancelled = true
    }
  }, [requestIdParam])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (createInFlightRef.current) return

    createInFlightRef.current = true
    setSaving(true)
    setMessage('')

    const writeInput = formValuesToWriteInput(values)
    if (prefillRequestId) {
      writeInput.requestId = prefillRequestId
    }
    if (prefillPersonId) {
      writeInput.personId = prefillPersonId
    }

    let result: Awaited<ReturnType<typeof createSacramentalRecord>>
    try {
      result = await createSacramentalRecord(writeInput)
    } catch (error: unknown) {
      setMessage(sacramentalRecordClientErrorMessage('createRecord', error))
      releaseCreate()
      return
    }

    if (!result.ok) {
      setMessage(sacramentalRecordClientErrorMessage('createRecord', result.error))
      releaseCreate()
      return
    }

    router.push(recordDetailHref(result.recordId))
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

      {prefillLoading ? (
        <p className="mb-4 text-sm text-gray-600" aria-busy="true">
          Loading request prefill…
        </p>
      ) : null}

      {prefillNotice ? (
        <div
          className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950"
          role="status"
        >
          {prefillNotice}
          {prefillRequestId ? (
            <p className="mt-2">
              <Link
                href={requestDetailHref(prefillRequestId)}
                className="font-medium underline underline-offset-2"
              >
                View source request
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className={vineaSectionShellClassName}>
        <SacramentalRecordForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard/records')}
          submitLabel="Save record"
          saving={saving || prefillLoading}
          message={message}
          idPrefix="new-record"
        />
      </div>
    </main>
  )
}
