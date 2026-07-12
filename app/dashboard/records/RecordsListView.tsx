import Link from 'next/link'
import { AlertTriangle, ChevronRight, FileClock, Link2, Plus, Search } from 'lucide-react'
import { formatSacramentDateDisplay } from '@/lib/sacramentalRecords'
import { buildSacramentalRecordContinuityHandoff } from '@/lib/sacramentalRecordContinuityHandoff'
import type { SacramentalRecordsListResult } from '@/lib/server/loadSacramentalRecordsList'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { recordDetailHref } from '@/lib/dashboardEntityNavigation'
import { maybeMissingValue } from '@/lib/missingValue'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import { SacramentalRecordTypeBadge } from './_components/SacramentalRecordTypeBadge'
import { RecordsListFilters } from './RecordsListFilters'

function buildRecordsContinuityHref({
  searchQuery,
  typeFilter,
  continuityFilter,
}: Pick<
  SacramentalRecordsListResult,
  'searchQuery' | 'typeFilter' | 'continuityFilter'
>): string {
  const params = new URLSearchParams()
  if (searchQuery) params.set('q', searchQuery)
  if (typeFilter) params.set('type', typeFilter)
  if (continuityFilter) params.set('continuity', continuityFilter)
  const query = params.toString()
  return query ? `/dashboard/records?${query}` : '/dashboard/records'
}

function ContinuityStat({
  label,
  value,
  detail,
}: {
  label: string
  value: number
  detail: string
}) {
  return (
    <div className="py-3 sm:px-4 sm:py-0 first:sm:pl-0 last:sm:pr-0">
      <p className="text-2xl font-semibold tabular-nums text-gray-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-800">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-600">{detail}</p>
    </div>
  )
}

export function RecordsListView({
  records,
  errorMessage,
  searchQuery,
  typeFilter,
  continuityFilter,
  continuitySummary,
  activeParishName,
}: SacramentalRecordsListResult) {
  const needsReviewHref = buildRecordsContinuityHref({
    searchQuery,
    typeFilter,
    continuityFilter: 'needs_review',
  })
  const clearContinuityHref = buildRecordsContinuityHref({
    searchQuery,
    typeFilter,
    continuityFilter: '',
  })

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Sacramental records
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Parish register entries. Search by name, filter by sacrament type, or add a new record.
          </p>
          {activeParishName ? (
            <p className="mt-2 text-sm font-medium text-gray-700">
              Sacramental records are scoped to {activeParishName}.
            </p>
          ) : null}
        </div>
        <Link
          href="/dashboard/records/new"
          className={`${primaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          New record
        </Link>
      </header>

      <section
        className={`mb-6 ${vineaSectionShellClassName}`}
        aria-labelledby="records-continuity-heading"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileClock className="h-4 w-4 text-blue-800" aria-hidden />
              <h2
                id="records-continuity-heading"
                className="text-base font-semibold text-gray-950"
              >
                Request-to-record continuity
              </h2>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
              Read-only review cues for records that may need staff to compare the register entry
              with request history before certificate work.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={needsReviewHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-950 hover:bg-blue-100"
            >
              Review missing links
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
            {continuityFilter ? (
              <Link
                href={clearContinuityHref}
                className="text-sm font-medium text-blue-800 underline underline-offset-2"
              >
                Clear continuity filter
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <ContinuityStat
            value={continuitySummary.needsReviewCount}
            label="Need request review"
            detail="No originating request link is present on the record."
          />
          <ContinuityStat
            value={continuitySummary.linkedRequestCount}
            label="Linked to request"
            detail="A request link exists for staff to open and compare."
          />
          <ContinuityStat
            value={continuitySummary.certificateActivityCount}
            label="Certificate activity"
            detail="A certificate generation event is recorded for the parish."
          />
        </div>

        {continuitySummary.certificateActivityWithoutRequestLinkCount > 0 ? (
          <p className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-950">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              {continuitySummary.certificateActivityWithoutRequestLinkCount} record
              {continuitySummary.certificateActivityWithoutRequestLinkCount === 1 ? '' : 's'} with
              certificate activity do not have an originating request link. Staff should verify
              continuity manually before reissuing or replacing anything.
            </span>
          </p>
        ) : null}

        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          {continuitySummary.boundaryNote}
        </p>
      </section>

      <div className={`mb-6 ${vineaSectionShellClassName}`}>
        <RecordsListFilters
          searchQuery={searchQuery}
          typeFilter={typeFilter}
          continuityFilter={continuityFilter}
          resultCount={records.length}
        />
      </div>

      {errorMessage ? (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {records.length === 0 && !errorMessage ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-800">No records found</p>
          <p className="mt-1 text-sm text-gray-600">
            Try a different search or add your first register entry.
          </p>
          <Link
            href="/dashboard/records/new"
            className="mt-4 inline-block text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            Create a record
          </Link>
        </div>
      ) : records.length === 0 ? null : (
        <ul className="space-y-3">
          {records.map((record) => {
            const dateLabel = formatSacramentDateDisplay(record.sacrament_date)
            const handoff = buildSacramentalRecordContinuityHandoff(record)
            return (
              <li key={record.id}>
                <article
                  className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.03] transition hover:border-gray-300 hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <SacramentalRecordTypeBadge recordType={record.record_type} />
                      {record.request_id ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-950">
                          <Link2 className="h-3 w-3" aria-hidden />
                          Request linked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-950">
                          <AlertTriangle className="h-3 w-3" aria-hidden />
                          Needs request review
                        </span>
                      )}
                    </div>

                    {handoff ? (
                      <Link
                        href={handoff.searchHref}
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-950 hover:bg-blue-100 sm:shrink-0"
                      >
                        <Search className="h-4 w-4" aria-hidden />
                        Search related requests
                      </Link>
                    ) : null}
                  </div>

                  <Link
                    href={recordDetailHref(record.id)}
                    className="mt-2 inline-block text-lg font-semibold text-gray-900 underline-offset-4 break-words hover:text-blue-900 hover:underline"
                  >
                    {record.person_name}
                  </Link>

                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Date
                      </dt>
                      <dd className="mt-0.5 text-gray-800">
                        {dateLabel || maybeMissingValue('Not set')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Minister
                      </dt>
                      <dd className="mt-0.5 text-gray-800 break-words">
                        {record.minister || maybeMissingValue('Not set')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Register
                      </dt>
                      <dd className="mt-0.5 text-gray-800">
                        {[record.book, record.page, record.line].filter(Boolean).join(' · ') ||
                          maybeMissingValue('Not set')}
                      </dd>
                    </div>
                  </dl>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
