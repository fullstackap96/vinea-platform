'use client'

import Link from 'next/link'
import { AlertTriangle, CalendarDays, CheckCircle2, HeartHandshake } from 'lucide-react'
import {
  formatCareTimelineWhen,
  type CareTimelineNextAction,
  type CareTimelineEvent,
  type CareTimelineEventKind,
} from '@/lib/careTimeline'
import { chipBase } from '@/lib/chipStyles'

function tone(kind: CareTimelineEventKind): string {
  switch (kind) {
    case 'communication':
      return 'border-violet-200 bg-violet-50 text-violet-950'
    case 'record':
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
    case 'request':
      return 'border-sky-200 bg-sky-50 text-sky-950'
    case 'follow_up':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'household':
    default:
      return 'border-slate-200 bg-slate-50 text-slate-900'
  }
}

function label(kind: CareTimelineEventKind): string {
  if (kind === 'communication') return 'Touchpoint'
  if (kind === 'record') return 'Record'
  if (kind === 'request') return 'Request'
  if (kind === 'follow_up') return 'Follow-up'
  return 'Household'
}

function actionTone(action: CareTimelineNextAction): string {
  if (action.tone === 'urgent') return 'border-rose-200 bg-rose-50 text-rose-950'
  if (action.tone === 'warning') return 'border-amber-200 bg-amber-50 text-amber-950'
  return 'border-emerald-200 bg-emerald-50 text-emerald-950'
}

function ActionIcon({ action }: { action: CareTimelineNextAction }) {
  if (action.tone === 'urgent') return <AlertTriangle className="h-4 w-4" aria-hidden />
  if (action.tone === 'warning') return <CalendarDays className="h-4 w-4" aria-hidden />
  return <CheckCircle2 className="h-4 w-4" aria-hidden />
}

export function CareTimelineSection({
  events,
  nextAction,
  counts,
  title = 'Care timeline',
  description = 'Requests, records, communications, and household context in one pastoral history.',
}: {
  events: CareTimelineEvent[]
  nextAction?: CareTimelineNextAction
  counts?: {
    requests: number
    openRequests: number
    records: number
    communications: number
    households: number
  }
  title?: string
  description?: string
}) {
  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="care-timeline-heading"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-muted text-brand-foreground ring-1 ring-brand/15">
          <HeartHandshake className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 id="care-timeline-heading" className="text-lg font-bold text-gray-950">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
        </div>
      </div>

      {nextAction ? (
        <div className={`mt-4 rounded-xl border px-4 py-3 ${actionTone(nextAction)}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2.5">
              <span className="mt-0.5 shrink-0">
                <ActionIcon action={nextAction} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">Recommended care action</p>
                <p className="mt-1 text-sm font-bold leading-snug">{nextAction.title}</p>
                <p className="mt-1 text-sm leading-relaxed opacity-90">{nextAction.detail}</p>
              </div>
            </div>
            {nextAction.href ? (
              <Link
                href={nextAction.href}
                className="inline-flex min-h-[2.25rem] items-center justify-center rounded-lg border border-current/20 bg-white/80 px-3 py-2 text-sm font-semibold shadow-sm transition hover:bg-white"
              >
                {nextAction.label}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {counts ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ['Open', counts.openRequests],
            ['Requests', counts.requests],
            ['Records', counts.records],
            ['Touchpoints', counts.communications],
            ['Households', counts.households],
          ].map(([labelText, value]) => (
            <div key={String(labelText)} className="rounded-xl border border-gray-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {labelText}
              </p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-gray-950">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {events.length === 0 ? (
        <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-700">
          No care history is linked yet.
        </p>
      ) : (
        <ol className="mt-4 space-y-3">
          {events.slice(0, 10).map((event) => {
            const content = (
              <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 transition hover:border-brand/30 hover:bg-brand-muted/25">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`${chipBase} px-2 py-1 text-[10px] uppercase ${tone(event.kind)}`}>
                    {label(event.kind)}
                  </span>
                  {event.occurredAt !== new Date(0).toISOString() ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      {formatCareTimelineWhen(event.occurredAt)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-950">{event.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">{event.detail}</p>
              </div>
            )
            return (
              <li key={event.key}>
                {event.href ? <Link href={event.href}>{content}</Link> : content}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
