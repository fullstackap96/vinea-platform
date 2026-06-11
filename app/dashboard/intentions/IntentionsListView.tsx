import Link from 'next/link'
import { Plus } from 'lucide-react'
import {
  formatMassIntentionDateDisplay,
  intentionTextExcerpt,
} from '@/lib/massIntentions'
import { assignmentDisplayLabel } from '@/lib/requestAssignment'
import type { MassIntentionsListResult } from '@/lib/server/loadMassIntentionsList'
import { primaryButtonMd } from '@/lib/buttonStyles'
import { maybeMissingValue } from '@/lib/missingValue'
import { vineaSectionShellClassName } from '@/lib/vineaUi'
import { MassIntentionStatusBadge } from './_components/MassIntentionStatusBadge'
import { IntentionsListFilters } from './IntentionsListFilters'

function scheduleLine(intention: {
  requested_date: string | null
  assigned_mass_date: string | null
  assigned_priest_name: string | null
}) {
  const parts: string[] = []
  const requested = formatMassIntentionDateDisplay(intention.requested_date)
  const mass = formatMassIntentionDateDisplay(intention.assigned_mass_date)
  const priest = assignmentDisplayLabel(intention.assigned_priest_name)

  if (requested) parts.push(`Requested: ${requested}`)
  if (mass) parts.push(`Mass: ${mass}`)
  if (priest !== 'Unassigned') parts.push(priest)

  if (parts.length > 0) return parts.join(' · ')
  return maybeMissingValue('Not scheduled yet')
}

export function IntentionsListView({
  intentions,
  errorMessage,
  searchQuery,
  fulfilledFilter,
}: MassIntentionsListResult) {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-8 pt-4 text-gray-900 sm:px-6 sm:pt-5">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Mass intentions
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Track intention requests, Mass assignments, stipends, and fulfillment.
          </p>
        </div>
        <Link
          href="/dashboard/intentions/new"
          className={`${primaryButtonMd} w-full justify-center gap-2 sm:w-auto`}
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          New intention
        </Link>
      </header>

      <div className={`mb-6 ${vineaSectionShellClassName}`}>
        <IntentionsListFilters
          searchQuery={searchQuery}
          fulfilledFilter={fulfilledFilter}
          resultCount={intentions.length}
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

      {intentions.length === 0 && !errorMessage ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-800">No intentions found</p>
          <p className="mt-1 text-sm text-gray-600">
            {fulfilledFilter === 'unfulfilled'
              ? 'Nothing pending — try “All” or add a new intention.'
              : 'Try a different search or add a new intention.'}
          </p>
          <Link
            href="/dashboard/intentions/new"
            className="mt-4 inline-block text-sm font-medium text-blue-800 underline underline-offset-2"
          >
            Add an intention
          </Link>
        </div>
      ) : intentions.length === 0 ? null : (
        <ul className="space-y-3">
          {intentions.map((intention) => (
            <li key={intention.id}>
              <Link
                href={`/dashboard/intentions/${intention.id}`}
                className="block rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.03] transition hover:border-gray-300 hover:shadow-md sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <MassIntentionStatusBadge isFulfilled={intention.is_fulfilled} />
                  {intention.stipend_received ? (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200/80">
                      Stipend received
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-900 break-words">
                  {intention.requester_name}
                </p>
                <p className="mt-1 text-sm text-gray-700 break-words">
                  {intentionTextExcerpt(intention.intention_text)}
                </p>
                <p className="mt-2 text-sm text-gray-600 break-words">
                  {scheduleLine(intention)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
