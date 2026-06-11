import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatHouseholdAddressLine } from '@/lib/households'
import type { HouseholdsListResult } from '@/lib/server/loadHouseholdsList'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { maybeMissingValue } from '@/lib/missingValue'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import { HouseholdsListFilters } from './HouseholdsListFilters'

export function HouseholdsListView({
  households,
  errorMessage,
  searchQuery,
}: HouseholdsListResult) {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Households
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Household directory with address and member roster.
          </p>
        </div>
        <Link
          href="/dashboard/households/new"
          className={`${primaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          New household
        </Link>
      </header>

      <div className={`mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${errorMessage ? '' : 'mb-6'}`}>
        <Link
          href="/dashboard/people"
          className="font-medium text-blue-800 underline underline-offset-2 hover:text-blue-950"
        >
          ← People
        </Link>
      </div>

      <div className={`mb-6 ${vineaSectionShellClassName}`}>
        <HouseholdsListFilters searchQuery={searchQuery} resultCount={households.length} />
      </div>

      {errorMessage ? (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {households.length === 0 && !errorMessage ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-800">No households found</p>
          <p className="mt-1 text-sm text-gray-600">
            Try a different search or add your first household.
          </p>
          <Link
            href="/dashboard/households/new"
            className="mt-4 inline-block text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            Add a household
          </Link>
        </div>
      ) : households.length === 0 ? null : (
        <ul className="space-y-3">
          {households.map((household) => {
            const addressLine = formatHouseholdAddressLine(household)
            return (
              <li key={household.id}>
                <Link
                  href={`/dashboard/households/${household.id}`}
                  className="block rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.03] transition hover:border-gray-300 hover:shadow-md sm:p-5"
                >
                  <p className="text-lg font-semibold text-gray-900 break-words">{household.name}</p>
                  <p className="mt-1 text-sm text-gray-600 break-words">
                    {addressLine || maybeMissingValue('No address on file')}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {household.memberCount} member{household.memberCount === 1 ? '' : 's'}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
