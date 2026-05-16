'use client'

import { Check, Circle, Minus } from 'lucide-react'
import {
  buildRequestWorkflowChecklist,
  type RequestWorkflowChecklistInput,
  type WorkflowChecklistItem,
} from '@/lib/requestWorkflowChecklist'
import { scrollAndHighlightRequestSection } from './requestDetailSectionNav'

function ChecklistRow({ item }: { item: WorkflowChecklistItem }) {
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

  const labelClass = isComplete
    ? 'text-gray-600'
    : isNA
      ? 'text-gray-500'
      : 'font-medium text-gray-900'

  const labelContent = (
    <span className={`text-sm leading-snug ${labelClass}`}>
      {item.label}
      {item.detail ? (
        <span className="mt-0.5 block text-xs font-normal text-gray-500">{item.detail}</span>
      ) : null}
    </span>
  )

  return (
    <li className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
      {icon}
      <div className="min-w-0 flex-1 pt-0.5">
        {canJump ? (
          <a
            href={`#${item.sectionId}`}
            className="group block rounded-md -mx-1 px-1 py-0.5 text-sm leading-snug font-medium text-blue-900 underline decoration-blue-800/50 underline-offset-2 hover:text-blue-950 hover:decoration-blue-950"
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
              Go to section →
            </span>
          </a>
        ) : (
          labelContent
        )}
      </div>
    </li>
  )
}

export function RequestWorkflowChecklist(props: RequestWorkflowChecklistInput) {
  const items = buildRequestWorkflowChecklist(props)
  const completeCount = items.filter((i) => i.state === 'complete').length
  const trackableCount = items.filter((i) => i.state !== 'not_applicable').length

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      aria-labelledby="request-workflow-checklist-heading"
    >
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h2 id="request-workflow-checklist-heading" className="text-sm font-semibold text-gray-900">
          Workflow checklist
        </h2>
        <p className="text-xs font-medium tabular-nums text-gray-500">
          {completeCount} of {trackableCount} done
        </p>
      </div>

      <ul className="mt-3 divide-y divide-gray-100 border-t border-gray-100">
        {items.map((item) => (
          <ChecklistRow key={item.key} item={item} />
        ))}
      </ul>
    </section>
  )
}
