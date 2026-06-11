'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Pencil, FileText } from 'lucide-react'
import {
  LabelValueGrid,
  LabelValueRow,
} from '@/app/dashboard/requests/[id]/_components/LabelValueGrid'
import { devDashboardConsoleError } from '@/lib/dashboardSupabaseError'
import {
  formatSacramentDateDisplay,
  formatSacramentalRecordEventAction,
  parseSacramentalRecordEventRow,
  parseSacramentalRecordRow,
} from '@/lib/sacramentalRecords'
import { formatPersonDisplayName, parsePersonRow } from '@/lib/people'
import { maybeMissingValue } from '@/lib/missingValue'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import { supabase } from '@/lib/supabase'
import type {
  SacramentalRecordEventRow,
  SacramentalRecordRow,
} from '@/lib/types/sacramentalRecords'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import { SacramentalRecordTypeBadge } from '../_components/SacramentalRecordTypeBadge'

function displayValue(value: string | null | undefined) {
  const s = String(value ?? '').trim()
  return s ? s : maybeMissingValue('Not set')
}

export function RecordDetailPage() {
  const params = useParams()
  const recordId = String(params?.id ?? '')

  const [record, setRecord] = useState<SacramentalRecordRow | null>(null)
  const [linkedPerson, setLinkedPerson] = useState<{ id: string; displayName: string } | null>(
    null
  )
  const [events, setEvents] = useState<SacramentalRecordEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!recordId) return

    async function load() {
      setLoading(true)
      setErrorMessage('')

      const { data: row, error } = await supabase
        .from('sacramental_records')
        .select('*')
        .eq('id', recordId)
        .maybeSingle()

      if (error) {
        devDashboardConsoleError('sacramental_records detail', error)
        setErrorMessage('Could not load this record.')
        setLoading(false)
        return
      }
      if (!row) {
        setErrorMessage('Record not found.')
        setLoading(false)
        return
      }

      const parsed = parseSacramentalRecordRow(row as Record<string, unknown>)
      setRecord(parsed)

      if (parsed.person_id) {
        const { data: personRow } = await supabase
          .from('people')
          .select('id, first_name, middle_name, last_name')
          .eq('id', parsed.person_id)
          .maybeSingle()

        if (personRow) {
          const person = parsePersonRow(personRow as Record<string, unknown>)
          setLinkedPerson({
            id: person.id,
            displayName: formatPersonDisplayName(person),
          })
        } else {
          setLinkedPerson(null)
        }
      } else {
        setLinkedPerson(null)
      }

      const { data: eventRows } = await supabase
        .from('sacramental_record_events')
        .select('*')
        .eq('sacramental_record_id', recordId)
        .order('created_at', { ascending: false })
        .limit(20)

      setEvents(
        (eventRows ?? []).map((e) => parseSacramentalRecordEventRow(e as Record<string, unknown>))
      )
      setLoading(false)
    }

    void load()
  }, [recordId])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4" aria-busy="true">
        <p className="text-sm font-medium text-gray-700">Loading record…</p>
      </div>
    )
  }

  if (errorMessage || !record) {
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

  const registerRef = [record.book, record.page, record.line].filter(Boolean).join(' · ')

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

      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <SacramentalRecordTypeBadge recordType={record.record_type} />
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 break-words sm:text-3xl">
              {record.person_name}
            </h1>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            {record.record_type === 'baptism' ? (
              <a
                href={`/api/records/${record.id}/certificate`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${secondaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
              >
                <FileText className="h-4 w-4 shrink-0" aria-hidden />
                Generate certificate
              </a>
            ) : null}
            <Link
              href={`/dashboard/records/${record.id}/edit`}
              className={`${secondaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
            >
              <Pencil className="h-4 w-4 shrink-0" aria-hidden />
              Edit record
            </Link>
          </div>
        </div>
      </header>

      <div className={`mb-6 ${vineaSectionShellClassName}`}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Register details
        </h2>
        <LabelValueGrid>
          <LabelValueRow label="Sacrament date" value={displayValue(formatSacramentDateDisplay(record.sacrament_date))} />
          <LabelValueRow label="Place" value={displayValue(record.place)} />
          <LabelValueRow label="Minister" value={displayValue(record.minister)} />
          <LabelValueRow label="Register ref." value={displayValue(registerRef || null)} />
          <LabelValueRow label="Notes" value={displayValue(record.notes)} />
        </LabelValueGrid>
      </div>

      <div className={`mb-6 ${vineaSectionShellClassName}`}>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Linked person
        </h2>
        {linkedPerson ? (
          <Link
            href={`/dashboard/people/${linkedPerson.id}`}
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            {linkedPerson.displayName} — View profile →
          </Link>
        ) : (
          <p className="text-sm text-gray-700">Not linked to a person profile.</p>
        )}
      </div>

      {record.request_id ? (
        <div className={`mb-6 ${vineaSectionShellClassName}`}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Linked request
          </h2>
          <Link
            href={`/dashboard/requests/${record.request_id}`}
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            View original request
          </Link>
        </div>
      ) : null}

      {events.length > 0 ? (
        <div className={vineaSectionShellClassName}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Recent activity
          </h2>
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-gray-100 bg-slate-50/80 px-3 py-2.5 text-sm text-gray-700"
              >
                <span className="font-medium text-gray-900">
                  {formatSacramentalRecordEventAction(event.action)}
                </span>
                {event.actor_email ? (
                  <span className="text-gray-600"> · {event.actor_email}</span>
                ) : null}
                <span className="mt-0.5 block text-xs text-gray-500">
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </main>
  )
}
