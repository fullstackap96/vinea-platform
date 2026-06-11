import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatPersonDisplayName } from '@/lib/people'
import { formatHouseholdRelationship } from '@/lib/households'
import type { PeopleListResult } from '@/lib/server/loadPeopleList'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { maybeMissingValue } from '@/lib/missingValue'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import { PeopleListFilters } from './PeopleListFilters'

function contactLine(email: string | null, phone: string | null) {
  const parts = [email, phone].filter(Boolean)
  if (parts.length > 0) {
    return parts.join(' · ')
  }
  return maybeMissingValue('No contact info')
}

export function PeopleListView({ people, errorMessage, searchQuery }: PeopleListResult) {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">People</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Parishioner profiles. Search by name or contact info, or add someone new.
          </p>
        </div>
        <Link
          href="/dashboard/people/new"
          className={`${primaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          New person
        </Link>
      </header>

      <div className={`mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${errorMessage ? '' : 'mb-6'}`}>
        <Link
          href="/dashboard/households"
          className="font-medium text-blue-800 underline underline-offset-2 hover:text-blue-950"
        >
          View households →
        </Link>
      </div>

      <div className={`mb-6 ${vineaSectionShellClassName}`}>
        <PeopleListFilters searchQuery={searchQuery} resultCount={people.length} />
      </div>

      {errorMessage ? (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {people.length === 0 && !errorMessage ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-800">No people found</p>
          <p className="mt-1 text-sm text-gray-600">
            Try a different search or add your first parishioner profile.
          </p>
          <Link
            href="/dashboard/people/new"
            className="mt-4 inline-block text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            Add a person
          </Link>
        </div>
      ) : people.length === 0 ? null : (
        <ul className="space-y-3">
          {people.map((person) => {
            const name = formatPersonDisplayName(person)
            const householdHint =
              person.primaryHouseholdName != null
                ? `Household: ${person.primaryHouseholdName}${
                    person.primaryHouseholdRelationship
                      ? ` (${formatHouseholdRelationship(person.primaryHouseholdRelationship)})`
                      : ''
                  }`
                : null

            return (
              <li key={person.id}>
                <Link
                  href={`/dashboard/people/${person.id}`}
                  className="block rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.03] transition hover:border-gray-300 hover:shadow-md sm:p-5"
                >
                  <p className="text-lg font-semibold text-gray-900 break-words">{name}</p>
                  <p className="mt-1 text-sm text-gray-600 break-words">
                    {contactLine(person.email, person.phone)}
                  </p>
                  {householdHint ? (
                    <p className="mt-1 text-sm text-gray-500">{householdHint}</p>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
