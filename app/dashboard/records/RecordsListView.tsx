import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatSacramentDateDisplay } from '@/lib/sacramentalRecords'
import type { SacramentalRecordsListResult } from '@/lib/server/loadSacramentalRecordsList'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { maybeMissingValue } from '@/lib/missingValue'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import { SacramentalRecordTypeBadge } from './_components/SacramentalRecordTypeBadge'
import { RecordsListFilters } from './RecordsListFilters'

export function RecordsListView({
  records,
  errorMessage,
  searchQuery,
  typeFilter,
}: SacramentalRecordsListResult) {
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
        </div>
        <Link
          href="/dashboard/records/new"
          className={`${primaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          New record
        </Link>
      </header>

      <div className={`mb-6 ${vineaSectionShellClassName}`}>
        <RecordsListFilters
          searchQuery={searchQuery}
          typeFilter={typeFilter}
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
            return (
              <li key={record.id}>
                <Link
                  href={`/dashboard/records/${record.id}`}
                  className="block rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.03] transition hover:border-gray-300 hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SacramentalRecordTypeBadge recordType={record.record_type} />
                  </div>
                  <p className="mt-2 text-lg font-semibold text-gray-900 break-words">
                    {record.person_name}
                  </p>
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
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
