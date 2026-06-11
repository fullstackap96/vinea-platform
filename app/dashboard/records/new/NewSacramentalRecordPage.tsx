'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSacramentalRecord } from '../actions'
import {
  SacramentalRecordForm,
  formValuesToWriteInput,
  type SacramentalRecordFormValues,
} from '../_components/SacramentalRecordForm'
import { devDashboardConsoleError } from '@/lib/dashboardSupabaseError'
import { requestTypeFromRow } from '@/lib/requestTypeFromRow'
import {
  prefillRecordFormFromRequest,
  requestPersonIdFromSource,
  type RequestPrefillSource,
} from '@/lib/relationshipIntelligence/prefillRecordFromRequest'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { supabase } from '@/lib/supabase'
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

  useEffect(() => {
    if (!requestIdParam) return

    let cancelled = false

    async function loadPrefill() {
      setPrefillLoading(true)
      setPrefillNotice('')
      setMessage('')

      const { data: requestRow, error: requestError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestIdParam)
        .maybeSingle()

      if (cancelled) return

      if (requestError || !requestRow) {
        devDashboardConsoleError('records/new prefill request', requestError)
        setPrefillLoading(false)
        setMessage('Could not load the request for prefill.')
        return
      }

      const requestType = requestTypeFromRow(requestRow as { request_type?: unknown })
      let funeralDetail: RequestPrefillSource['funeralDetail'] = null
      let weddingDetail: RequestPrefillSource['weddingDetail'] = null
      let ociaDetail: RequestPrefillSource['ociaDetail'] = null

      if (requestType === 'funeral') {
        const { data } = await supabase
          .from('funeral_request_details')
          .select('deceased_name, confirmed_service_at')
          .eq('request_id', requestIdParam)
          .maybeSingle()
        funeralDetail = data as RequestPrefillSource['funeralDetail']
      } else if (requestType === 'wedding') {
        const { data } = await supabase
          .from('wedding_request_details')
          .select('partner_one_name, partner_two_name, confirmed_ceremony_at')
          .eq('request_id', requestIdParam)
          .maybeSingle()
        weddingDetail = data as RequestPrefillSource['weddingDetail']
      } else if (requestType === 'ocia') {
        const { data } = await supabase
          .from('ocia_request_details')
          .select('confirmed_session_at')
          .eq('request_id', requestIdParam)
          .maybeSingle()
        ociaDetail = data as RequestPrefillSource['ociaDetail']
      }

      if (cancelled) return

      let parishioner: RequestPrefillSource['parishioner'] = null
      const parishionerId = (requestRow as { parishioner_id?: unknown }).parishioner_id
      if (parishionerId != null) {
        const { data: parishionerRow } = await supabase
          .from('parishioners')
          .select('full_name')
          .eq('id', String(parishionerId))
          .maybeSingle()
        parishioner = parishionerRow as RequestPrefillSource['parishioner']
      }

      const source: RequestPrefillSource = {
        id: requestIdParam,
        request_type: (requestRow as { request_type?: unknown }).request_type,
        status: (requestRow as { status?: unknown }).status,
        child_name: (requestRow as { child_name?: unknown }).child_name,
        confirmed_baptism_date: (requestRow as { confirmed_baptism_date?: unknown })
          .confirmed_baptism_date,
        notes: (requestRow as { notes?: unknown }).notes,
        person_id: (requestRow as { person_id?: unknown }).person_id,
        assigned_priest_name: (requestRow as { assigned_priest_name?: unknown })
          .assigned_priest_name,
        parishioner,
        funeralDetail,
        weddingDetail,
        ociaDetail,
      }

      const prefilled = prefillRecordFormFromRequest(source)
      if (!prefilled) {
        setPrefillLoading(false)
        setMessage(
          'This request cannot be prefilled (must be complete baptism, wedding, funeral, or OCIA).'
        )
        return
      }

      const { data: existingRecord } = await supabase
        .from('sacramental_records')
        .select('id')
        .eq('request_id', requestIdParam)
        .maybeSingle()

      if (cancelled) return

      if (existingRecord?.id) {
        setPrefillLoading(false)
        setMessage('A sacramental record already exists for this request.')
        return
      }

      setValues(prefilled)
      setPrefillRequestId(requestIdParam)
      setPrefillPersonId(requestPersonIdFromSource(source))
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
    setSaving(true)
    setMessage('')

    const writeInput = formValuesToWriteInput(values)
    if (prefillRequestId) {
      writeInput.requestId = prefillRequestId
    }
    if (prefillPersonId) {
      writeInput.personId = prefillPersonId
    }

    const result = await createSacramentalRecord(writeInput)
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
                href={`/dashboard/requests/${prefillRequestId}`}
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
