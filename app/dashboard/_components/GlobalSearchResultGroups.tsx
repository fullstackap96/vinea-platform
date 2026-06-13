import Link from 'next/link'
import type { GlobalSearchGroupedResults, GlobalSearchResultItem } from '@/lib/globalSearch/types'
import { DashboardRequestNameLink } from '@/app/dashboard/_components/DashboardRequestNameLink'
import { dashboardRequestOpenLabel } from '@/lib/dashboardRequestNavigation'

const GROUP_LABELS: { key: keyof GlobalSearchGroupedResults; label: string }[] = [
  { key: 'requests', label: 'Requests' },
  { key: 'people', label: 'People' },
  { key: 'households', label: 'Households' },
  { key: 'records', label: 'Sacramental records' },
]

function SearchResultRow({
  item,
  onNavigate,
  compact,
  isRequest,
}: {
  item: GlobalSearchResultItem
  onNavigate?: () => void
  compact?: boolean
  isRequest?: boolean
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={isRequest ? dashboardRequestOpenLabel(item.title) : undefined}
      className={`group/card block cursor-pointer rounded-xl border border-transparent transition-[background-color,border-color] hover:border-gray-300/90 hover:bg-slate-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
        compact ? 'px-3 py-2.5' : 'p-4 sm:p-5'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{item.typeLabel}</p>
      {isRequest ? (
        <div className={`mt-1 ${compact ? '' : ''}`}>
          <DashboardRequestNameLink
            name={item.title}
            embedded
            size={compact ? 'sm' : 'lg'}
          />
        </div>
      ) : (
        <p
          className={`mt-1 font-semibold text-gray-900 break-words ${
            compact ? 'text-sm' : 'text-lg'
          }`}
        >
          {item.title}
        </p>
      )}
      <p className={`mt-1 text-gray-700 break-words ${compact ? 'text-sm' : 'text-sm'}`}>
        {item.context}
      </p>
    </Link>
  )
}

export function GlobalSearchResultGroups({
  results,
  query,
  totalCount,
  loading,
  errorMessage,
  compact = false,
  onNavigate,
}: {
  results: GlobalSearchGroupedResults
  query: string
  totalCount: number
  loading?: boolean
  errorMessage?: string
  compact?: boolean
  onNavigate?: () => void
}) {
  if (loading) {
    return <p className="px-3 py-4 text-sm text-gray-600">Searching…</p>
  }

  if (errorMessage) {
    return (
      <p className="px-3 py-4 text-sm text-red-800" role="alert">
        {errorMessage}
      </p>
    )
  }

  if (query.trim().length < 2) {
    return (
      <p className="px-3 py-4 text-sm text-gray-600">Type at least 2 characters to search.</p>
    )
  }

  if (totalCount === 0) {
    return (
      <p className="px-3 py-4 text-sm text-gray-700">
        No results for &ldquo;{query}&rdquo;. Try a name, email, or household.
      </p>
    )
  }

  return (
    <div className={compact ? 'py-1' : 'space-y-6'}>
      {GROUP_LABELS.map(({ key, label }) => {
        const items = results[key]
        if (items.length === 0) return null
        const isRequestGroup = key === 'requests'

        if (compact) {
          return (
            <div key={key} className="px-2 py-1">
              <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
              </p>
              <ul>
                {items.map((item) => (
                  <li key={`${key}-${item.href}`}>
                    <SearchResultRow
                      item={item}
                      onNavigate={onNavigate}
                      compact
                      isRequest={isRequestGroup}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )
        }

        return (
          <section key={key} className="rounded-2xl border border-gray-200/90 bg-white shadow-sm ring-1 ring-gray-900/[0.03]">
            <header className="border-b border-gray-100 px-4 py-3 sm:px-5">
              <h2 className="text-sm font-semibold text-gray-900">{label}</h2>
            </header>
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={`${key}-${item.href}`}>
                  <SearchResultRow
                    item={item}
                    onNavigate={onNavigate}
                    isRequest={isRequestGroup}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
