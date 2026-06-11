'use client'

import { vineaInputFieldClassName } from '@/lib/vineaUi'

export function HouseholdsListFilters({
  searchQuery,
  resultCount,
}: {
  searchQuery: string
  resultCount: number
}) {
  return (
    <form
      method="get"
      action="/dashboard/households"
      className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
    >
      <div>
        <label
          htmlFor="households-search"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Search by name or address
        </label>
        <input
          id="households-search"
          name="q"
          type="search"
          defaultValue={searchQuery}
          placeholder="Household name or address…"
          className={vineaInputFieldClassName}
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-2 sm:pb-0.5">
        <button
          type="submit"
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-slate-50"
        >
          Search
        </button>
        <p className="text-sm text-gray-600">
          {resultCount} household{resultCount === 1 ? '' : 's'}
        </p>
      </div>
    </form>
  )
}
