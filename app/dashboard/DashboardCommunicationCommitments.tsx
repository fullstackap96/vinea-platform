'use client'

import { MessageCircleReply } from 'lucide-react'
import { RequestTypeBadge } from '@/app/_components/RequestTypeBadge'
import { primaryButtonSm } from '@/lib/buttonStyles'
import { chipBase } from '@/lib/chipStyles'
import { sectionHeadingClassName } from '@/lib/sectionHeader'
import {
  type CommunicationCommitmentEvaluation,
  type CommunicationCommitmentQueue,
  type CommunicationCommitmentTone,
} from '@/lib/communicationCommitments'
import { vineaEmptyStateClassName, vineaSectionShellClassName } from '@/lib/vineaUi'

function toneClass(tone: CommunicationCommitmentTone): string {
  switch (tone) {
    case 'urgent':
      return 'border-rose-200 bg-rose-50 text-rose-950'
    case 'warning':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'steady':
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
    case 'muted':
    default:
      return 'border-gray-200 bg-slate-50 text-gray-800'
  }
}

function rowLabel(row: CommunicationCommitmentEvaluation): string {
  switch (row.status) {
    case 'staff_owes_family':
      return 'Reply owed'
    case 'internal_decision':
      return 'Internal decision'
    case 'waiting_on_family':
      return 'Waiting on family'
    case 'no_recent_contact':
      return 'No recent contact'
    case 'clear':
    default:
      return 'Clear'
  }
}

function CommitmentRow({ row }: { row: CommunicationCommitmentEvaluation }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <RequestTypeBadge requestType={row.requestType} />
            <span className={`${chipBase} text-[10px] uppercase ${toneClass(row.tone)}`}>
              {rowLabel(row)}
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-gray-950">{row.personLabel}</h3>
          <p className="mt-1 text-sm font-medium text-gray-800">{row.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{row.reason}</p>
        </div>
        <a href={row.detailHref} className={`${primaryButtonSm} shrink-0 justify-center`}>
          Open
        </a>
      </div>
    </article>
  )
}

export function DashboardCommunicationCommitments({
  queue,
  loading,
  dataUnavailable,
}: {
  queue: CommunicationCommitmentQueue
  loading: boolean
  dataUnavailable: boolean
}) {
  return (
    <section
      className={vineaSectionShellClassName}
      aria-labelledby="communication-commitments-heading"
      aria-busy={loading}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-800 ring-1 ring-sky-100"
            aria-hidden
          >
            <MessageCircleReply className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h2 id="communication-commitments-heading" className={sectionHeadingClassName}>
              Communication commitments
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
              A simple view of who owes the next reply: staff, the family, or an internal parish decision.
            </p>
          </div>
        </div>
        {!loading && !dataUnavailable ? (
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-72">
            <div className={`rounded-lg border px-3 py-2 ${toneClass('urgent')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Replies</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{queue.summary.repliesOwed}</p>
            </div>
            <div className={`rounded-lg border px-3 py-2 ${toneClass('warning')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Internal</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{queue.summary.internalDecisions}</p>
            </div>
            <div className={`rounded-lg border px-3 py-2 ${toneClass('steady')}`}>
              <p className="text-xs font-semibold uppercase tracking-wide">Family</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{queue.summary.waitingOnFamily}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          [0, 1].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="mt-3 h-5 w-48 rounded bg-gray-200" />
              <div className="mt-2 h-4 max-w-2xl rounded bg-gray-200" />
            </div>
          ))
        ) : dataUnavailable ? (
          <div className={vineaEmptyStateClassName} role="alert">
            <p className="text-base font-semibold text-gray-900">
              Communication commitments are unavailable.
            </p>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
              They will appear after request data loads successfully.
            </p>
          </div>
        ) : queue.rows.length === 0 ? (
          <div className={vineaEmptyStateClassName} role="status">
            <p className="text-base font-semibold text-gray-900">
              No open communication commitments.
            </p>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-gray-600">
              Vinea will show requests here when staff owes a reply, the family owes information,
              or an internal parish decision is needed.
            </p>
          </div>
        ) : (
          queue.rows.map((row) => <CommitmentRow key={row.requestId} row={row} />)
        )}
      </div>
    </section>
  )
}
