'use client'

import { useState } from 'react'
import {
  buildRequestTimeline,
  formatTimelineWhen,
  type BuildRequestTimelineInput,
} from '@/lib/requestTimeline/buildRequestTimeline'

const DEFAULT_VISIBLE = 6

type Props = {
  timelineInput: BuildRequestTimelineInput
  loading?: boolean
}

export function RequestTimelineSection({ timelineInput, loading }: Props) {
  const [expanded, setExpanded] = useState(false)
  const events = buildRequestTimeline(timelineInput)
  const hasMore = events.length > DEFAULT_VISIBLE
  const visibleEvents = expanded ? events : events.slice(0, DEFAULT_VISIBLE)
  const submittedEvent = events.find((event) => event.kind === 'submitted')

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      aria-labelledby="request-timeline-heading"
    >
      <header className="mb-4">
        <h2 id="request-timeline-heading" className="text-sm font-semibold text-gray-900">
          Timeline
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          What has happened with this request so far.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-gray-600">Loading timeline…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-gray-700">
          No activity recorded yet. Events will appear here as your team works on this request.
        </p>
      ) : (
        <>
          <ol className="space-y-0">
            {visibleEvents.map((event, index) => {
              const isLatest = index === 0
              return (
                <li
                  key={event.key}
                  className="relative flex gap-3 border-b border-gray-100 py-3 last:border-b-0 last:pb-0 first:pt-0"
                >
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                      isLatest ? 'bg-[#6B4E9B]' : 'bg-gray-300'
                    }`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500">
                      {formatTimelineWhen(event.occurredAt)}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">{event.label}</p>
                    {event.detail ? (
                      <p className="mt-1 text-sm leading-relaxed text-gray-700">{event.detail}</p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>

          {hasMore ? (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="text-sm font-medium text-[#6B4E9B] hover:text-[#5a4082] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B4E9B]/40 rounded"
              >
                {expanded ? 'Show less' : 'View full timeline'}
              </button>
            </div>
          ) : null}

          {!hasMore && events.length === 1 && submittedEvent ? (
            <p className="mt-3 border-t border-gray-100 pt-3 text-sm text-gray-600">
              More activity will appear here as your team logs communication and notes.
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}
