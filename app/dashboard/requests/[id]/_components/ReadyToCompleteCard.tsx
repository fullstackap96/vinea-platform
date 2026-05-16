'use client'

import { Check, Circle, Minus } from 'lucide-react'
import { primaryButtonMd } from '@/lib/buttonStyles'
import type { ReadyToCompleteItem } from '@/lib/requestReadyToComplete'
import { scrollAndHighlightRequestSection } from './requestDetailSectionNav'

function ReadyRow({ item }: { item: ReadyToCompleteItem }) {
  const isComplete = item.state === 'complete'
  const isNA = item.state === 'not_applicable'
  const canJump = item.state === 'incomplete' && item.sectionId

  const icon = isComplete ? (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
      <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
    </span>
  ) : isNA ? (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
      <Minus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
    </span>
  ) : (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-50 text-amber-800">
      <Circle className="h-2 w-2 fill-current" aria-hidden />
    </span>
  )

  return (
    <li className="flex gap-3 py-2 first:pt-0 last:pb-0">
      {icon}
      <div className="min-w-0 flex-1 pt-0.5">
        {canJump ? (
          <a
            href={`#${item.sectionId}`}
            className="group block text-sm leading-snug font-medium text-blue-900 underline decoration-blue-800/50 underline-offset-2 hover:text-blue-950"
            onClick={(e) => {
              if (typeof window === 'undefined') return
              if (window.location.hash === `#${item.sectionId}`) {
                e.preventDefault()
                scrollAndHighlightRequestSection(item.sectionId!)
              }
            }}
          >
            {item.label}
            <span className="ml-1 text-xs font-normal text-blue-800/80 group-hover:text-blue-900">
              Go →
            </span>
          </a>
        ) : (
          <span
            className={`text-sm leading-snug ${isComplete ? 'text-gray-600' : isNA ? 'text-gray-500' : 'font-medium text-gray-900'}`}
          >
            {item.label}
          </span>
        )}
        {item.detail ? (
          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{item.detail}</p>
        ) : null}
      </div>
    </li>
  )
}

export function ReadyToCompleteCard({
  items,
  isAlreadyComplete,
  canMarkComplete,
  markCompleteDisabledReason,
  onRequestMarkComplete,
}: {
  items: ReadyToCompleteItem[]
  isAlreadyComplete: boolean
  canMarkComplete: boolean
  markCompleteDisabledReason: string
  onRequestMarkComplete: () => void
}) {
  const trackable = items.filter((i) => i.state !== 'not_applicable')
  const doneCount = trackable.filter((i) => i.state === 'complete').length
  const allFriendlyDone = doneCount === trackable.length

  return (
    <section
      id="ready-to-complete"
      className="scroll-mt-6 sm:scroll-mt-8 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/60 via-white to-white p-5 shadow-sm ring-1 ring-emerald-900/[0.04] sm:p-6"
      aria-labelledby="ready-to-complete-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="ready-to-complete-heading" className="text-base font-semibold text-gray-900">
            Ready to complete?
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">
            {isAlreadyComplete
              ? 'This request is already marked complete. You can reopen it from Request details if needed.'
              : 'A quick check before you close this intake. Assignment and other steps may still be required below.'}
          </p>
          {!isAlreadyComplete ? (
            <p className="mt-2 text-xs font-medium tabular-nums text-gray-500">
              {doneCount} of {trackable.length} ready checks done
            </p>
          ) : null}
        </div>
        <div
          className="w-full shrink-0 sm:w-auto"
          title={!canMarkComplete && !isAlreadyComplete ? markCompleteDisabledReason : undefined}
        >
          <button
            type="button"
            disabled={isAlreadyComplete || !canMarkComplete}
            onClick={() => {
              if (isAlreadyComplete || !canMarkComplete) return
              onRequestMarkComplete()
            }}
            className={`${primaryButtonMd} w-full justify-center sm:min-w-[10rem]`}
          >
            {isAlreadyComplete ? 'Completed' : 'Mark complete'}
          </button>
        </div>
      </div>

      {!isAlreadyComplete ? (
        <ul className="mt-4 divide-y divide-gray-100 border-t border-gray-100 pt-1">
          {items.map((item) => (
            <ReadyRow key={item.key} item={item} />
          ))}
        </ul>
      ) : null}

      {!isAlreadyComplete && allFriendlyDone && !canMarkComplete ? (
        <p className="mt-3 text-xs leading-relaxed text-amber-900/90">
          These items look good, but other requirements (such as assignment) must be finished
          before you can mark complete.
        </p>
      ) : null}
    </section>
  )
}
