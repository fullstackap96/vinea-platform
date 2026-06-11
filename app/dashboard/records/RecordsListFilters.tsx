'use client'

import { formatSacramentalRecordType } from '@/lib/formatSacramentalRecordType'
import { SACRAMENTAL_RECORD_TYPES } from '@/lib/sacramentalRecordConstants'
import type { SacramentalRecordType } from '@/lib/types/sacramentalRecords'
import { vineaInputFieldClassName } from '@/lib/vineaUi'

export function RecordsListFilters({
  searchQuery,
  typeFilter,
  resultCount,
}: {
  searchQuery: string
  typeFilter: '' | SacramentalRecordType
  resultCount: number
}) {
  return (
    <form
      method="get"
      action="/dashboard/records"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_auto] lg:items-end"
    >
      <div>
        <label htmlFor="records-search" className="mb-1.5 block text-sm font-medium text-gray-700">
          Search by name
        </label>
        <input
          id="records-search"
          name="q"
          type="search"
          defaultValue={searchQuery}
          placeholder="Person name…"
          className={vineaInputFieldClassName}
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor="records-type-filter" className="mb-1.5 block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="records-type-filter"
          name="type"
          defaultValue={typeFilter}
          className={vineaInputFieldClassName}
          onChange={(e) => {
            e.currentTarget.form?.requestSubmit()
          }}
        >
          <option value="">All types</option>
          {SACRAMENTAL_RECORD_TYPES.map((t) => (
            <option key={t} value={t}>
              {formatSacramentalRecordType(t)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 lg:pb-0.5">
        <button
          type="submit"
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-slate-50"
        >
          Search
        </button>
        <p className="text-sm text-gray-600">
          {resultCount} record{resultCount === 1 ? '' : 's'}
        </p>
      </div>
    </form>
  )
}
