'use client'

import { useState } from 'react'
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageCircle,
  PauseCircle,
  ScrollText,
} from 'lucide-react'
import {
  buildRequestTimeline,
  formatTimelineWhen,
  type BuildRequestTimelineInput,
} from '@/lib/requestTimeline/buildRequestTimeline'
import type { RequestTimelineEventKind } from '@/lib/requestTimeline/types'
import { chipBase } from '@/lib/chipStyles'

const DEFAULT_VISIBLE = 6

type Props = {
  timelineInput: BuildRequestTimelineInput
  loading?: boolean
}

function eventTone(kind: RequestTimelineEventKind): string {
  switch (kind) {
    case 'blocked':
      return 'border-amber-200 bg-amber-50 text-amber-950'
    case 'completed':
    case 'sacramental_record':
      return 'border-emerald-200 bg-emerald-50 text-emerald-950'
    case 'confirmed_date':
    case 'follow_up_set':
      return 'border-sky-200 bg-sky-50 text-sky-950'
    case 'email_sent':
    case 'communication_logged':
      return 'border-violet-200 bg-violet-50 text-violet-950'
    case 'internal_note':
      return 'border-slate-200 bg-slate-50 text-slate-900'
    case 'submitted':
    default:
      return 'border-gray-200 bg-white text-gray-800'
  }
}

function eventIcon(kind: RequestTimelineEventKind) {
  switch (kind) {
    case 'blocked':
      return <PauseCircle className="h-4 w-4" aria-hidden />
    case 'completed':
      return <CheckCircle2 className="h-4 w-4" aria-hidden />
    case 'sacramental_record':
      return <ScrollText className="h-4 w-4" aria-hidden />
    case 'confirmed_date':
    case 'follow_up_set':
      return <CalendarCheck className="h-4 w-4" aria-hidden />
    case 'email_sent':
    case 'communication_logged':
      return <MessageCircle className="h-4 w-4" aria-hidden />
    case 'internal_note':
      return <FileText className="h-4 w-4" aria-hidden />
    case 'submitted':
    default:
      return <ClipboardList className="h-4 w-4" aria-hidden />
  }
}

function eventKindLabel(kind: RequestTimelineEventKind): string {
  switch (kind) {
    case 'blocked':
      return 'Blocker'
    case 'completed':
      return 'Complete'
    case 'sacramental_record':
      return 'Record'
    case 'confirmed_date':
      return 'Schedule'
    case 'follow_up_set':
      return 'Follow-up'
    case 'email_sent':
      return 'Email'
    case 'communication_logged':
      return 'Contact'
    case 'internal_note':
      return 'Note'
    case 'submitted':
    default:
      return 'Intake'
  }
}

export function RequestTimelineSection({ timelineInput, loading }: Props) {
  const [expanded, setExpanded] = useState(false)
  const events = buildRequestTimeline(timelineInput)
  const hasMore = events.length > DEFAULT_VISIBLE
  const visibleEvents = expanded ? events : events.slice(0, DEFAULT_VISIBLE)
  const submittedEvent = events.find((event) => event.kind === 'submitted')
  const contactCount = events.filter(
    (event) => event.kind === 'communication_logged' || event.kind === 'email_sent'
  ).length
  const noteCount = events.filter((event) => event.kind === 'internal_note').length
  const hasBlocker = events.some((event) => event.kind === 'blocked')
  const hasRecord = events.some((event) => event.kind === 'sacramental_record')

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      aria-labelledby="request-timeline-heading"
    >
      <header className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Pastoral care history
          </p>
          <h2 id="request-timeline-heading" className="mt-1 text-lg font-bold text-gray-950">
            Timeline
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
            Contacts, notes, blockers, dates, and records in one sequence.
          </p>
        </div>
        {!loading && events.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <span className={`${chipBase} border border-violet-200 bg-violet-50 text-violet-950`}>
              {contactCount} contact{contactCount === 1 ? '' : 's'}
            </span>
            <span className={`${chipBase} border border-slate-200 bg-slate-50 text-slate-900`}>
              {noteCount} note{noteCount === 1 ? '' : 's'}
            </span>
            {hasBlocker ? (
              <span className={`${chipBase} border border-amber-200 bg-amber-50 text-amber-950`}>
                Blocker logged
              </span>
            ) : null}
            {hasRecord ? (
              <span className={`${chipBase} border border-emerald-200 bg-emerald-50 text-emerald-950`}>
                Record created
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      {loading ? (
        <div className="space-y-3" aria-label="Loading timeline">
          {[0, 1, 2].map((item) => (
            <div key={item} className="animate-pulse rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="h-4 w-36 rounded bg-gray-200" />
              <div className="mt-3 h-5 w-56 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-full max-w-lg rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-700">
          No activity recorded yet. Contacts, notes, dates, and records will appear here as your
          team works on this request.
        </div>
      ) : (
        <>
          <ol className="space-y-3">
            {visibleEvents.map((event, index) => {
              const isLatest = index === 0
              return (
                <li
                  key={event.key}
                  className={`relative flex gap-3 rounded-xl border px-4 py-3 ${
                    isLatest
                      ? 'border-brand/25 bg-brand-muted/30 ring-1 ring-brand/10'
                      : 'border-gray-100 bg-gray-50/80'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${eventTone(event.kind)}`}
                    aria-hidden
                  >
                    {eventIcon(event.kind)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`${chipBase} px-2 py-1 text-[10px] ${eventTone(event.kind)}`}>
                        {isLatest ? 'Latest' : eventKindLabel(event.kind)}
                      </span>
                      <p className="text-xs font-medium text-gray-500">
                        {formatTimelineWhen(event.occurredAt)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-950">{event.label}</p>
                    {event.detail ? (
                      <p className="mt-1 text-sm leading-relaxed text-gray-700">{event.detail}</p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>

          {hasMore ? (
            <div className="mt-4 border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="rounded text-sm font-semibold text-brand-foreground hover:text-brand-active focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                {expanded ? 'Show fewer events' : `View all ${events.length} timeline events`}
              </button>
            </div>
          ) : null}

          {!hasMore && events.length === 1 && submittedEvent ? (
            <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
              More activity will appear here as your team logs communication, notes, dates, and
              records.
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}
