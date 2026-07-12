import Link from 'next/link'
import { buildGlobalSearchRequestScopeCue } from '@/lib/globalSearch/requestScopeCue'
import type { GlobalSearchGroupedResults } from '@/lib/globalSearch/types'
import { vineaInputFieldClassName, vineaSectionShellClassName } from '@/lib/vineaUi'
import { GlobalSearchResultGroups } from './GlobalSearchResultGroups'

export function GlobalSearchResultsView({
  query,
  results,
  totalCount,
  errorMessage,
  warningMessage,
  activeParishName,
}: {
  query: string
  results: GlobalSearchGroupedResults
  totalCount: number
  errorMessage: string
  warningMessage?: string
  activeParishName?: string | null
}) {
  const hasSearched = query.trim().length >= 2
  const requestScopeCue = buildGlobalSearchRequestScopeCue({
    activeParishName,
    hasSearched,
    requestResultCount: results.requests.length,
  })

  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Search results
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
          Find requests, people, households, and sacramental records across your parish.
        </p>
        {activeParishName ? (
          <p className="mt-2 inline-flex max-w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm">
            <span className="truncate">
              Search is using selected parish context:{' '}
              <span className="font-semibold text-gray-900">{activeParishName}</span>.
            </span>
          </p>
        ) : null}
      </header>

      <div className={`mb-6 ${vineaSectionShellClassName}`}>
        <form method="get" action="/dashboard/search" className="space-y-3">
          <label htmlFor="global-search-page-input" className="block text-sm font-medium text-gray-700">
            Search Vinea
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              id="global-search-page-input"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search Vinea..."
              className={vineaInputFieldClassName}
              autoComplete="off"
              minLength={2}
            />
            <button
              type="submit"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-slate-50 sm:shrink-0"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {errorMessage ? (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {!errorMessage && warningMessage ? (
        <div
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          {warningMessage}
        </div>
      ) : null}

      {query.trim().length >= 2 && !errorMessage ? (
        <p className="mb-4 text-sm text-gray-600">
          {totalCount === 0
            ? `No results for "${query}".`
            : `${totalCount} result${totalCount === 1 ? '' : 's'} for "${query}".`}
        </p>
      ) : null}

      {hasSearched && !errorMessage ? (
        <section
          className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm leading-relaxed text-blue-950"
          aria-labelledby="global-search-request-scope-heading"
        >
          <h2 id="global-search-request-scope-heading" className="font-semibold">
            {requestScopeCue.title}
          </h2>
          <p className="mt-1">{requestScopeCue.description}</p>
          {results.requests.length === 0 ? (
            <p className="mt-2 font-medium">{requestScopeCue.requestEmptyHint}</p>
          ) : null}
          <p className="mt-2 text-xs text-blue-900/80">{requestScopeCue.boundaryNote}</p>
        </section>
      ) : null}

      <GlobalSearchResultGroups
        results={results}
        query={query}
        totalCount={totalCount}
        errorMessage={errorMessage}
      />

      {query.trim().length >= 2 && totalCount > 0 ? (
        <p className="mt-6 text-sm text-gray-600">
          Need more detail? Open a result above, or browse{' '}
          <Link href="/dashboard/requests" className="font-medium text-blue-800 underline underline-offset-2">
            Requests
          </Link>
          ,{' '}
          <Link href="/dashboard/people" className="font-medium text-blue-800 underline underline-offset-2">
            People
          </Link>
          , and{' '}
          <Link href="/dashboard/records" className="font-medium text-blue-800 underline underline-offset-2">
            Records
          </Link>
          .
        </p>
      ) : null}
    </main>
  )
}
