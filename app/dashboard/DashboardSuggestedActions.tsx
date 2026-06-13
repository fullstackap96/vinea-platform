'use client'

import Link from 'next/link'
import { Lightbulb } from 'lucide-react'
import { DashboardRequestNameLink } from '@/app/dashboard/_components/DashboardRequestNameLink'
import {
  plainSuggestedActionLabel,
  suggestedActionHref,
} from '@/lib/relationshipIntelligence/suggestedActionPresentation'
import type { DashboardSuggestedAction } from '@/lib/relationshipIntelligence/types'
import { dashboardRequestOpenLabel, isRequestDetailHref } from '@/lib/dashboardRequestNavigation'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

type Props = {
  actions: DashboardSuggestedAction[]
  loading?: boolean
  dataUnavailable?: boolean
  compact?: boolean
}

export function DashboardSuggestedActions({
  actions,
  loading,
  dataUnavailable,
  compact = false,
}: Props) {
  const hide = dataUnavailable && !loading
  const visibleActions = compact ? actions.slice(0, 5) : actions

  return (
    <section
      className={compact ? `${vineaSectionShellClassName} !py-4 sm:!py-5` : vineaSectionShellClassName}
      aria-labelledby="suggested-actions-heading"
      aria-busy={loading}
    >
      <div className={compact ? 'mb-3 flex items-start gap-2.5' : 'mb-4 flex items-start gap-3'}>
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900 ${
            compact ? 'h-8 w-8' : 'h-9 w-9'
          }`}
          aria-hidden
        >
          <Lightbulb className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </span>
        <div>
          <h2 id="suggested-actions-heading" className={sectionHeadingClassName}>
            Recommended actions
            {!loading && !hide && actions.length > 0 ? ` (${actions.length})` : ''}
          </h2>
          <p
            className={`max-w-2xl leading-relaxed text-gray-600 ${
              compact ? 'mt-0.5 text-sm' : 'mt-1 text-sm'
            }`}
          >
            Helpful next steps—link people, add records, or prepare certificates. Nothing changes
            until you review it.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading recommendations…</p>
      ) : hide ? (
        <p className="text-sm text-gray-600">
          Recommendations unavailable while requests did not load.
        </p>
      ) : actions.length === 0 ? (
        <div className={vineaEmptyStateClassName}>
          <p className="text-sm font-medium text-gray-800">No recommended actions right now.</p>
        </div>
      ) : (
        <ol className={compact ? 'space-y-2' : 'space-y-3'}>
          {visibleActions.map((action, index) => {
            const href = suggestedActionHref(action)
            const linksToRequest = isRequestDetailHref(href)
            const requestName =
              action.kind === 'person_match' ? action.personDisplayName : null

            return (
            <li key={`${action.kind}-${index}`}>
              <Link
                href={href}
                aria-label={
                  linksToRequest && requestName
                    ? dashboardRequestOpenLabel(requestName)
                    : undefined
                }
                className={`group/card flex cursor-pointer flex-col gap-2 rounded-xl border border-gray-200/90 bg-slate-50/70 transition-[background-color,border-color] hover:border-gray-300/90 hover:bg-white sm:flex-row sm:items-center sm:justify-between ${
                  compact ? 'px-3 py-2.5' : 'px-4 py-3'
                }`}
              >
                <span className="min-w-0 text-sm leading-snug text-gray-900">
                  {linksToRequest && requestName && action.kind === 'person_match' ? (
                    <>
                      <DashboardRequestNameLink name={requestName} embedded size="sm" />
                      <span className="mt-1 block text-gray-700">
                        {plainSuggestedActionLabel(action).slice(
                          `Link ${action.personDisplayName} — `.length
                        )}
                      </span>
                    </>
                  ) : (
                    <span className="font-medium">{plainSuggestedActionLabel(action)}</span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {action.kind === 'person_match' ? (
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-950">
                      Possible match found
                    </span>
                  ) : null}
                  <span className="text-sm font-semibold text-blue-800">Review →</span>
                </span>
              </Link>
            </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
