'use client'

import Link from 'next/link'
import { Lightbulb } from 'lucide-react'
import type { DashboardSuggestedAction } from '@/lib/relationshipIntelligence/types'
import { CONFIDENCE_CHIP_CLASS, CONFIDENCE_LABEL } from '@/lib/relationshipIntelligence/confidenceLabels'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

function actionHref(action: DashboardSuggestedAction): string {
  if (action.kind === 'record_creation') {
    return `/dashboard/records/new?requestId=${encodeURIComponent(action.requestId)}`
  }
  if (action.kind === 'certificate') {
    return `/dashboard/records/${action.recordId}`
  }
  return `/dashboard/requests/${action.requestId}`
}

function actionLabel(action: DashboardSuggestedAction): string {
  if (action.kind === 'record_creation') return action.label
  if (action.kind === 'certificate') return action.label
  return `${action.personDisplayName} — ${action.reason}`
}

type Props = {
  actions: DashboardSuggestedAction[]
  loading?: boolean
  dataUnavailable?: boolean
}

export function DashboardSuggestedActions({ actions, loading, dataUnavailable }: Props) {
  const hide = dataUnavailable && !loading

  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="suggested-actions-heading"
      aria-busy={loading}
    >
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-900"
          aria-hidden
        >
          <Lightbulb className="h-5 w-5" />
        </span>
        <div>
          <h2 id="suggested-actions-heading" className={sectionHeadingClassName}>
            Suggested actions
            {!loading && !hide && actions.length > 0 ? ` (${actions.length})` : ''}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Connect data across requests, people, and records. Nothing changes until you act.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading suggestions…</p>
      ) : hide ? (
        <p className="text-sm text-gray-600">Suggestions unavailable while requests did not load.</p>
      ) : actions.length === 0 ? (
        <div className={vineaEmptyStateClassName}>
          <p className="text-sm font-medium text-gray-800">No suggested actions right now.</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {actions.map((action, index) => (
            <li key={`${action.kind}-${index}`}>
              <Link
                href={actionHref(action)}
                className="flex flex-col gap-2 rounded-xl border border-gray-200/90 bg-slate-50/70 px-4 py-3 transition hover:border-gray-300 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="min-w-0 text-sm font-medium leading-snug text-gray-900">
                  {actionLabel(action)}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {action.kind === 'person_match' ? (
                    <span className={CONFIDENCE_CHIP_CLASS[action.confidence]}>
                      {CONFIDENCE_LABEL[action.confidence]}
                    </span>
                  ) : null}
                  <span className="text-sm font-semibold text-blue-800">Review →</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
