'use client'

import type { MassIntentionFulfilledFilter } from '@/lib/types/massIntentions'
import { vineaInputFieldClassName } from '@/lib/vineaUi'

export function IntentionsListFilters({
  searchQuery,
  fulfilledFilter,
  resultCount,
}: {
  searchQuery: string
  fulfilledFilter: MassIntentionFulfilledFilter
  resultCount: number
}) {
  return (
    <form
      method="get"
      action="/dashboard/intentions"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_auto] lg:items-end"
    >
      <div>
        <label
          htmlFor="intentions-search"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Search requester or intention
        </label>
        <input
          id="intentions-search"
          name="q"
          type="search"
          defaultValue={searchQuery}
          placeholder="Name or intention text…"
          className={vineaInputFieldClassName}
          autoComplete="off"
        />
      </div>
      <div>
        <label
          htmlFor="intentions-fulfilled-filter"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          id="intentions-fulfilled-filter"
          name="fulfilled"
          defaultValue={fulfilledFilter}
          className={vineaInputFieldClassName}
          onChange={(e) => {
            e.currentTarget.form?.requestSubmit()
          }}
        >
          <option value="unfulfilled">Unfulfilled only</option>
          <option value="all">All</option>
          <option value="fulfilled">Fulfilled only</option>
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
          {resultCount} intention{resultCount === 1 ? '' : 's'}
        </p>
      </div>
    </form>
  )
}
