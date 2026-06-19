'use client'

import Link from 'next/link'
import { CalendarDays, HeartHandshake } from 'lucide-react'
import {
  formatCareTimelineWhen,
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
    case 'household':
    default:
      return 'border-slate-200 bg-slate-50 text-slate-900'
  }
}

function label(kind: CareTimelineEventKind): string {
  if (kind === 'communication') return 'Touchpoint'
  if (kind === 'record') return 'Record'
  if (kind === 'request') return 'Request'
  return 'Household'
}

export function CareTimelineSection({
  events,
  title = 'Care timeline',
  description = 'Requests, records, communications, and household context in one pastoral history.',
}: {
  events: CareTimelineEvent[]
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
