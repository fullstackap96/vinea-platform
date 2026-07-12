import Link from 'next/link'
import { ClipboardList, Pencil, Search } from 'lucide-react'

import {
  LabelValueGrid,
  LabelValueRow,
} from '@/app/dashboard/requests/[id]/_components/LabelValueGrid'
import { secondaryButtonMd } from '@/lib/buttonStyles'
import { personDetailHref, recordEditHref } from '@/lib/dashboardEntityNavigation'
import { requestDetailHref } from '@/lib/dashboardRequestNavigation'
import { maybeMissingValue } from '@/lib/missingValue'
import { buildSacramentalRecordContinuityView } from '@/lib/sacramentalRecordContinuity'
import { buildSacramentalRecordContinuityHandoff } from '@/lib/sacramentalRecordContinuityHandoff'
import {
  formatSacramentDateDisplay,
  formatSacramentalRecordEventAction,
} from '@/lib/sacramentalRecords'
import type { SacramentalRecordDetailResult } from '@/lib/server/loadSacramentalRecordDetail'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import { SacramentalRecordTypeBadge } from '../_components/SacramentalRecordTypeBadge'
import { RecordContinuityCard } from './_components/RecordContinuityCard'
import { RecordCertificateSuggestion } from './_components/RecordCertificateSuggestion'
import { RecordCertificateDownloadButton } from './_components/RecordCertificateDownloadButton'

function displayValue(value: string | null | undefined) {
  const s = String(value ?? '').trim()
  return s ? s : maybeMissingValue('Not set')
}

export function RecordDetailPage({
  record,
  linkedPerson,
  events,
  hasCertificateEvent,
  certificateEventMetadataLoaded,
  errorMessage,
  warningMessage,
  activeParishName,
}: SacramentalRecordDetailResult) {
  if (errorMessage || !record) {
    return (
      <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-5">
        <p className="mb-3">
          <Link
            href="/dashboard/records"
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            &larr; Back to records
          </Link>
        </p>
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage || 'Record not found.'}
        </div>
      </main>
    )
  }

  const registerRef = [record.book, record.page, record.line].filter(Boolean).join(' | ')
  const continuity = buildSacramentalRecordContinuityView({ record, events })
  const continuityHandoff = buildSacramentalRecordContinuityHandoff(record)

  return (
    <main className="mx-auto max-w-2xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <p className="mb-3">
        <Link
          href="/dashboard/records"
          className="text-sm font-medium text-blue-800 underline decoration-blue-800/80 underline-offset-2 hover:text-blue-950"
        >
          &larr; Back to records
        </Link>
      </p>

      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <SacramentalRecordTypeBadge recordType={record.record_type} />
            <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {record.person_name}
            </h1>
            {activeParishName ? (
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Showing record for {activeParishName}
              </p>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            {record.record_type === 'baptism' ? (
              <RecordCertificateDownloadButton recordId={record.id} showIcon />
            ) : null}
            <Link
              href={recordEditHref(record.id)}
              className={`${secondaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
            >
              <Pencil className="h-4 w-4 shrink-0" aria-hidden />
              Edit record
            </Link>
          </div>
        </div>
      </header>

      {warningMessage ? (
        <div
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          {warningMessage}
        </div>
      ) : null}

      {certificateEventMetadataLoaded ? (
        <RecordCertificateSuggestion
          recordId={record.id}
          record_type={record.record_type}
          person_name={record.person_name}
          hasCertificateEvent={hasCertificateEvent}
        />
      ) : null}

      <RecordContinuityCard continuity={continuity} />

      {continuityHandoff ? (
        <section
          className={`mb-6 border border-blue-200/80 bg-blue-50/50 ${vineaSectionShellClassName}`}
          aria-labelledby="record-continuity-handoff-heading"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-900 ring-1 ring-blue-200">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                Review handoff
              </p>
              <h2
                id="record-continuity-handoff-heading"
                className="text-lg font-semibold text-gray-950"
              >
                {continuityHandoff.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {continuityHandoff.summary}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
              <Link
                href={continuityHandoff.searchHref}
                className={`${secondaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
              >
                <Search className="h-4 w-4 shrink-0" aria-hidden />
                Search related requests
              </Link>
              <Link
                href={continuityHandoff.reviewQueueHref}
                className="text-sm font-medium text-blue-800 underline underline-offset-2"
              >
                View review queue
              </Link>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-gray-700">
            {continuityHandoff.staffGuidance.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-gray-600">
            {continuityHandoff.boundaryNote}
          </p>
        </section>
      ) : null}

      <div className={`mb-6 ${vineaSectionShellClassName}`}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Register details
        </h2>
        <LabelValueGrid>
          <LabelValueRow
            label="Sacrament date"
            value={displayValue(formatSacramentDateDisplay(record.sacrament_date))}
          />
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
            href={personDetailHref(linkedPerson.id)}
            className="text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            {linkedPerson.displayName} - View profile &rarr;
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
            href={requestDetailHref(record.request_id)}
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
                  <span className="text-gray-600"> | {event.actor_email}</span>
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
